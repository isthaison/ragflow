#
#  Copyright 2024 The InfiniFlow Authors. All Rights Reserved.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
from abc import ABC
import re
from copy import deepcopy
import json
import pandas as pd
import pymysql
import psycopg2
from agent.component import GenerateParam, Generate
import pyodbc


class ExeSQLParam(GenerateParam):
    """
    Define the ExeSQL component parameters.
    """

    def __init__(self):
        super().__init__()
        self.db_type = "mysql"
        self.database = ""
        self.username = ""
        self.host = ""
        self.port = 3306
        self.password = ""
        self.loop = 3
        self.top_n = 30
        self.output_type = "markdown"  # Add output_type param

    def check(self):
        super().check()
        self.check_valid_value(self.db_type, "Choose DB type", ['mysql', 'postgresql', 'mariadb', 'mssql'])
        self.check_empty(self.database, "Database name")
        self.check_empty(self.username, "database username")
        self.check_empty(self.host, "IP Address")
        self.check_positive_integer(self.port, "IP Port")
        self.check_empty(self.password, "Database password")
        self.check_positive_integer(self.top_n, "Number of records")
        self.check_valid_value(self.output_type, "Output type", ['markdown', 'json', 'text_list'])  # Validate output_type
        if self.database == "rag_flow":
            if self.host == "ragflow-mysql":
                raise ValueError("For the security reason, it dose not support database named rag_flow.")
            if self.password == "infini_rag_flow":
                raise ValueError("For the security reason, it dose not support database named rag_flow.")


class ExeSQL(Generate, ABC):
    component_name = "ExeSQL"

    def _split_sql_top_level(self, sql_block):
        stmts = []
        current = []
        paren = 0
        in_single = False
        in_double = False
        prev = ''
        for c in sql_block:
            if c == "'" and not in_double and prev != '\\':
                in_single = not in_single
            elif c == '"' and not in_single and prev != '\\':
                in_double = not in_double
            elif not in_single and not in_double:
                if c == '(':
                    paren += 1
                elif c == ')':
                    paren -= 1
                elif c == ';' and paren == 0:
                    stmt = ''.join(current).strip()
                    if stmt:
                        stmts.append(stmt)
                    current = []
                    prev = c
                    continue
            current.append(c)
            prev = c
        # Add last statement
        stmt = ''.join(current).strip()
        if stmt:
            stmts.append(stmt)
        return stmts

    def _refactor(self, ans):
        # Loại bỏ phần trước </think>
        ans = re.sub(r"^.*</think>", "", ans, flags=re.DOTALL)
        # Lấy tất cả các block ```sql ... ```
        sql_blocks = re.findall(r"```sql\s*(.*?)\s*```", ans, re.DOTALL | re.IGNORECASE)
        sqls = []
        if sql_blocks:
            for block in sql_blocks:
                block = block.strip()
                if block:
                    stmts = self._split_sql_top_level(block)
                    sqls.extend(stmts)
        else:
            # Nếu không có markdown, lấy phần sau SELECT đầu tiên
            select_match = re.search(r"(SELECT\s.*)", ans, re.IGNORECASE | re.DOTALL)
            if select_match:
                sqls.append(select_match.group(1).strip())
        if not sqls:
            raise Exception("SQL statement not found!")
        # Ghép lại thành 1 chuỗi, phân tách bằng ;
        return ";".join(sqls)

    def _run(self, history, **kwargs):
        ans = self.get_input()
        ans = "".join([str(a) for a in ans["content"]]) if "content" in ans else ""
        ans = self._refactor(ans)
        if self._param.db_type in ["mysql", "mariadb"]:
            db = pymysql.connect(db=self._param.database, user=self._param.username, host=self._param.host,
                                 port=self._param.port, password=self._param.password)
        elif self._param.db_type == 'postgresql':
            db = psycopg2.connect(dbname=self._param.database, user=self._param.username, host=self._param.host,
                                  port=self._param.port, password=self._param.password)
        elif self._param.db_type == 'mssql':
            conn_str = (
                    r'DRIVER={ODBC Driver 17 for SQL Server};'
                    r'SERVER=' + self._param.host + ',' + str(self._param.port) + ';'
                    r'DATABASE=' + self._param.database + ';'
                    r'UID=' + self._param.username + ';'
                    r'PWD=' + self._param.password
            )
            db = pyodbc.connect(conn_str)
        try:
            cursor = db.cursor()
        except Exception as e:
            raise Exception("Database Connection Failed! \n" + str(e))
        if not hasattr(self, "_loop"):
            setattr(self, "_loop", 0)
            self._loop += 1
        input_list = re.split(r';', ans.replace(r"\n", " "))
        sql_res = []
        table_results = []  # List to store each table result
        for i in range(len(input_list)):
            single_sql = input_list[i]
            single_sql = single_sql.replace('```','')
            while self._loop <= self._param.loop:
                self._loop += 1
                if not single_sql.strip():
                    break
                try:
                    cursor.execute(single_sql)
                    if cursor.rowcount == 0 or cursor.description is None:
                        table_results.append(pd.DataFrame())  # Empty DataFrame for no result
                        break
                    if self._param.db_type == 'mssql':
                        single_res = pd.DataFrame.from_records(cursor.fetchmany(self._param.top_n),
                                                               columns=[desc[0] for desc in cursor.description])
                    else:
                        single_res = pd.DataFrame([i for i in cursor.fetchmany(self._param.top_n)])
                        single_res.columns = [i[0] for i in cursor.description]
                    table_results.append(single_res)
                    break
                except Exception as e:
                    single_sql = self._regenerate_sql(single_sql, str(e), **kwargs)
                    single_sql = self._refactor(single_sql)
                    if self._loop > self._param.loop:
                        table_results.append(pd.DataFrame([{"content": "Can't query the correct data via SQL statement."}]))
        db.close()
        if not table_results:
            return ExeSQL.be_output("")
        # Output formatting for multiple tables
        output_type = getattr(self._param, "output_type", "markdown")
        if output_type == "json":
            json_tables = [df.to_dict(orient="records") for df in table_results]
            return pd.DataFrame([{"content": json.dumps(json_tables, default=str)}])
        elif output_type == "text_list":
            def escape(val):
                s = str(val)
                return s.replace('\t', '\\t').replace('\n', '\\n')
            text_tables = []
            for df in table_results:
                if df.empty:
                    text_tables.append("No record in the database!")
                else:
                    header = "\t".join(escape(col) for col in df.columns)
                    rows = ["\t".join(escape(v) for v in row) for row in df.values.tolist()]
                    text_tables.append("\n".join([header] + rows))
            return pd.DataFrame([{"content": "\n---\n".join(text_tables)}])
        else:  # markdown
            md_tables = []
            for df in table_results:
                if df.empty:
                    md_tables.append("No record in the database!")
                else:
                    md_tables.append(df.to_markdown(index=False))
            return pd.DataFrame([{"content": "\n\n---\n\n".join(md_tables)}])

    def _regenerate_sql(self, failed_sql, error_message, **kwargs):
        prompt = f'''
        ## You are the Repair SQL Statement Helper, please modify the original SQL statement based on the SQL query error report.
        ## The original SQL statement is as follows:{failed_sql}.
        ## The contents of the SQL query error report is as follows:{error_message}.
        ## Answer only the modified SQL statement. Please do not give any explanation, just answer the code.
'''
        self._param.prompt = prompt
        kwargs_ = deepcopy(kwargs)
        kwargs_["stream"] = False
        response = Generate._run(self, [], **kwargs_)
        try:
            regenerated_sql = response.loc[0, "content"]
            return regenerated_sql
        except Exception as e:
            return None

    def debug(self, **kwargs):
        return self._run([], **kwargs)
