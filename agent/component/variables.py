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
import re
from abc import ABC
from api.db import LLMType
from api.db.services.llm_service import LLMBundle
from agent.component import GenerateParam, Generate
import json
import logging

class VariablesExtractParam(GenerateParam):
    """
    Define the VariablesExtract component parameters.
    """

    def __init__(self):
        super().__init__()
        self.temperature = 0.4
        self.prompt = ""


    def check(self):
        super().check()



    def get_prompt(self, conv:str, params:dict):
        prompt = f"""

Task: You are a data expert extracting information. DON'T generate anything except the information extracted with flat JSON (no nested JSON or Array). 
"""
        if params:
            key_strings = [f"'{k}'" for k in params.keys()]
            joined_key_strings = ", ".join(key_strings)
            prompt += f"Get {joined_key_strings} and any fields\n"
        prompt += f"{conv}"
        return prompt


class VariablesExtract(Generate, ABC):
    component_name = "VariablesExtract"

    def _run(self, history, **kwargs):
        args = {}
        for para in self._param.variables:
            if para.get("key"):
                if 'begin@' in para["key"]:
                    field = para["key"].split('@')[1]
                    field = field.strip()
                    if field:
                        args[field] = ""

        inputs = self.get_input()
        logging.info(f"VariablesExtract inputs: {inputs}")

        def get_query_line(i, idx):
            if hasattr(inputs, "iloc"):
                row = inputs.iloc[idx]
                content = row["content"]
                label = row.get("name")
                is_use_label = row.get("is_use_label")
            else:
                content = i
                label = None
                is_use_label = None
            if is_use_label:
                if label:
                    return f"{label}: {content}"
            return content

        if hasattr(inputs, "shape") and len(inputs) > 0:
            query = "\n".join(
                get_query_line(inputs.iloc[idx]["content"], idx)
                if "content" in inputs.iloc[idx] else ""
                for idx in range(len(inputs))
                if str(inputs.iloc[idx].get("content", "")).strip()
            )
        else:
            # fallback
            query = "\n".join(i.strip() for i in inputs["content"] if i.strip())

        hist = self._canvas.get_history(self._param.message_history_window_size)
        # replace content thinking in item message to empty string
        # this is used to remove the thinking content in the assistant message
        for i in range(len(hist)):
            if hist[i]["role"] == "assistant" and "think" in hist[i]["content"]:
                # ans = re.sub(r"^.*</think>\s*", "", ans, flags=re.DOTALL)
                hist[i]["content"] = re.sub(r"^.*</think>\s*", "", hist[i]["content"], flags=re.DOTALL).strip()
        initquestion = ""
        if query:
            conv = ["{}\n {}".format("# The information need to extract below:", query)]
        else:
            conv = []
        for m in hist:
            if m["role"] not in ["user"]:
                continue
            initquestion = m["content"]
            conv.append("{}: {}".format(m["role"].upper(), m["content"]))
        conv = "\n".join(conv)
        chat_mdl = LLMBundle(self._canvas.get_tenant_id(), LLMType.CHAT, self._param.llm_id)

        ans = chat_mdl.chat(self._param.get_prompt(conv, args),
                            [{"role": "user", "content": "Output:"}], self._param.gen_conf())
        ans = re.sub(r"\s+", " ", ans)
        match = re.search(r"```json\s*(.*?)\s*```", ans, re.DOTALL)
        if match:
            ans = match.group(1)
        if not ans:
            self._canvas.set_component_infor(self._id, {
                "prompt":self._param.get_prompt(conv, args) ,
                "messages":     [
                                    {"role": "user", "content": "Output:"},
                                    {"role": "assistant", "content": "no match JSON"},
                                ],
                "conf":  self._param.gen_conf()})
            return VariablesExtract.be_output(initquestion)
        
        self._canvas.set_component_infor(self._id, {
            "prompt":self._param.get_prompt(conv, args) ,
            "messages":         [
                                    {"role": "user", "content": "Output:"},
                                    {"role": "assistant", "content": ans},
                                ],
            "conf":  self._param.gen_conf()})

        try:
            kwargs = {}
            ans_json = json.loads(ans)
    
            for v in ans_json:
                invalid_values = {"unknown", "none", "invalid", "not found", "not available", "not applicable", "", "null"}
                if not isinstance(ans_json[v], (str, int, float)):
                    ans_json[v] = str(ans_json[v])
                data = f"{ans_json[v]}"
                if data.lower() in invalid_values:
                    continue
                if data:
                    kwargs[v] = data.strip()
                    self._canvas.add_item_global_param(key=v, value=data.strip(), description=f"Extracted variable: {v}")
            self._canvas.set_global_param(**kwargs)


            return VariablesExtract.be_output(query)
        except json.JSONDecodeError:
            return VariablesExtract.be_output(query)

    def debug(self, **kwargs):
        return self._run([], **kwargs)