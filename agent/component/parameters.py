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
import logging
import re
from agent.component.base import ComponentBase, ComponentParamBase
class ParametersParam(ComponentParamBase):
    """
    Define the Parameters component parameters.
    """

    def __init__(self):
        super().__init__()
        self.variables = []
    def check(self):
        return True
 


class Parameters(ComponentBase, ABC):
    component_name = "Parameters"

    def _run(self, history, **kwargs):
        args = {}
        global_params = {}
        invalid_values = {"unknown", "none", "invalid", "not found", "not available", "not applicable", "", "null"}

        for para in self._param.variables:
            key = para.get("key", "")
            key = re.sub(r".*begin@\s*", "", key, flags=re.DOTALL).strip()
            logging.info(f"key: {key}")
            
            value = para.get("value", "")
            if value and self._canvas.check_is_component(value):
                component = self._canvas.get_component(value)
                if component is not None:
                    cpn = component["obj"]
                    if cpn.component_name.lower() == "answer":
                        args[key] = self._canvas.get_history(1)[0]["content"]
                        continue
                    
                    _, out = cpn.output(allow_partial=False)
                    if not out.empty:
                        args[key] = "\n".join(out["content"])
            elif value:
                args[key] = value
            else:
                args[key] = ""
        
        for k, v in args.items():
            # Convert non-primitive types to string
            if not isinstance(v, (str, int, float)):
                v = str(v)
            
            data = v.strip() if isinstance(v, str) else str(v)
            if data.lower() not in invalid_values and data:
                global_params[k] = data
                self._canvas.add_item_global_param(key=k, value=data, description=f"Parameters set: {k}")
        
        self._canvas.set_global_param(**global_params)
        return Parameters.be_output("")