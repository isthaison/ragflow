#data valid
q = {
    "component_id": "begin@begin_name",
}

if "@" in q["component_id"] and q["component_id"].split("@")[0].lower().find("begin") >= 0:
    cpn_id, key = q["component_id"].split("@")
    print(f"line 8: cpn_id: {cpn_id} , key:{key}")

if q["component_id"].split("@")[0].lower().find("begin") >= 0:
    cpn_id, key = q["component_id"].split("@")
    print(f"line 12: cpn_id: {cpn_id} , key:{key}")
# data not valid
q = {
    "component_id": "begin_name",
}

if "@" in q["component_id"] and q["component_id"].split("@")[0].lower().find("begin") >= 0:
    cpn_id, key = q["component_id"].split("@")
    print(f"line 20: cpn_id: {cpn_id} , key:{key}")
else:
    print(f"line 20: no valid")


if q["component_id"].split("@")[0].lower().find("begin") >= 0:
    cpn_id, key = q["component_id"].split("@")
    print(f"cpn_id: {cpn_id} , key:{key}")