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
import logging
import re
from abc import ABC
from api.db import LLMType
from api.db.services.llm_service import LLMBundle
from agent.component import GenerateParam, Generate


class KeywordExtractParam(GenerateParam):
    """
    Define the KeywordExtract component parameters.
    """

    def __init__(self):
        super().__init__()
        self.top_n = 1

    def check(self):
        super().check()
        self.check_positive_integer(self.top_n, "Top N")

    def resub(self,ans=""):
        ans = re.sub(r"^.*</think>\s*", "", ans, flags=re.DOTALL)
        if "keyword:" not in ans:
            return ans
        ans = re.sub(r".*keyword:\s*", "", ans, flags=re.DOTALL).strip()
        return ans
    
    def get_prompt(self):
        self.prompt = f"""
- Role: You're a question analyzer.
- Requirements:
  - Summarize the user's question and give the top {self.top_n} important keyword/phrase.
  - Provide the keywords/phrases in the same language as the user's question.
  - Use commas to separate the keywords/phrases.
  - Example: keyword: keyword1, keyword2, keyword3, …, keyword{self.top_n}
- Answer format:
  keyword:
"""
        return self.prompt


class KeywordExtract(Generate, ABC):
    component_name = "KeywordExtract"
   

    def _run(self, history, **kwargs):
        query = self.get_input()

        if hasattr(query, "to_dict") and "content" in query:
            query = ", ".join(map(str, query["content"].dropna()))
        else:
            query = str(query)



        chat_mdl = LLMBundle(self._canvas.get_tenant_id(), LLMType.CHAT, self._param.llm_id)
        self._canvas.set_component_infor(self._id, {"prompt":self._param.get_prompt(),"messages":  [{"role": "user", "content": query}],"conf": self._param.gen_conf()})

        ans = chat_mdl.chat(self._param.get_prompt(), [{"role": "user", "content": query}],
                            self._param.gen_conf())

        ans = self._param.resub(ans)
     
        logging.debug(f"ans: {ans}")
        return KeywordExtract.be_output(ans)

    def debug(self, **kwargs):
        return self._run([], **kwargs)