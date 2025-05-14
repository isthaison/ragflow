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

import requests
from agent.component.base import ComponentBase, ComponentParamBase
from api.db import LLMType
from api.db.services.llm_service import LLMBundle
from rag.prompts import message_fit_in


class ClassifyFaissParam(ComponentParamBase):

    """
    Define the ClassifyFaiss component parameters.
    """
    def __init__(self):
        super().__init__()
        self.category_description = {}
        self.url = ""
        self.k = 5
        self.keyword_weight = 0.1
        self.similarity_threshold = 0.1
        self.deep_zone = False

    def check(self):
        self.check_empty(self.category_description, "[ClassifyFaiss] Category examples")
        for k, v in self.category_description.items():
            if not k:
                raise ValueError("[ClassifyFaiss] Category name can not be empty!")
            if not v.get("to"):
                raise ValueError(f"[ClassifyFaiss] 'To' of category {k} can not be empty!")
        self.check_decimal_float(self.similarity_threshold, "[ClassifyFaiss] Similarity threshold")
        self.check_decimal_float(self.keyword_weight, "[ClassifyFaiss] Keyword similarity weight")
        self.check_positive_number(self.k, "[ClassifyFaiss] K")



class ClassifyFaiss(ComponentBase, ABC):
    component_name = "ClassifyFaiss"

    def _run(self, history, **kwargs):
        query = self.get_input()
        if hasattr(query, "to_dict") and "content" in query:
            query = ", ".join(map(str, query["content"].dropna()))
        else:
            query = str(query)
        config = {  
            "query": query,
            "k": self._param.k,
            "keyword_weight": self._param.keyword_weight,
            "similarity_threshold": self._param.similarity_threshold,
            "deep_zone": self._param.deep_zone
        }

        msg = self._canvas.get_history(self._param.message_history_window_size)
        msg = [m for m in msg if m["role"] == "user"]
        query +=  ", ".join(map(str, [m["content"] for m in msg]))
        
        self._canvas.set_component_infor(self._id, {
            "prompt":query,
            "messages": [],
            "conf": self._param.gen_conf()
            })

        url = self._param.url.strip()
        if url.find("http") != 0:
            url = "http://" + url
        response = requests.post(   url=url,
                                    json=config,
                                    headers={"Content-Type": "application/json"},
                                )
        ans = response.text
        

   

        # Count the number of times each category appears in the answer.
        category_counts = {}
        for c in self._param.category_description.keys():
            count = ans.lower().count(c.lower())
            category_counts[c] = count
            
        # If a category is found, return the category with the highest count.
        if any(category_counts.values()):
            max_category = max(category_counts.items(), key=lambda x: x[1])
            return ClassifyFaiss.be_output(self._param.category_description[max_category[0]]["to"])

        return ClassifyFaiss.be_output(list(self._param.category_description.items())[-1][1]["to"])

    def debug(self, **kwargs):
        df = self._run([], **kwargs)
        cpn_id = df.iloc[0, 0]
        return ClassifyFaiss.be_output(self._canvas.get_component_name(cpn_id))

