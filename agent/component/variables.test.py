import re
import json


ans = "```json\n{\n  \"TaskType\": \"absence_application\",\n  \"TaskID\": \"3EA7F9B2-2F8A-48FD-AB7E-94A95A39CABD\",\n  \"start_date\": null,\n  \"start_time\": null,\n  \"absence_type\": null,\n  \"end_date\": null,\n  \"end_time\": null,\n  \"user_code\": null\n}\n```"
ans = re.sub(r"\s+", " ", ans)
match = re.search(r"```json\s*(.*?)\s*```", ans, re.DOTALL)
if match:
    ans = match.group(1)

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
        
print(ans)
print(f"{kwargs}")
