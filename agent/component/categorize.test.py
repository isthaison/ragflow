def get_prompt(chat_hist):
    category_description= {
            "Unknown": {
              "description": "Nếu không xác định lĩnh vực thì sẽ là Unknown",
              "index": 4,
              "to": "Generate:SweetDancersTease"
            },
            "Zone HR": {
              "description": "Content related to human resource management (leave time, working days,...) and documents from suggested zone",
              "index": 0,
              "to": "Template:ThickOnionsDoubt"
            },
            "Zone MR": {
              "description": "Content related to order management and documents from suggested zone",
              "index": 3,
              "to": "Template:SillyAliensFlash"
            },
            "Zone QC": {
              "description": "Content related to the results of quality inspection of finished products, semi-finished products or raw materials and documents from suggested zone",
              "index": 1,
              "to": "Template:TallFalconsOpen"
            },
            "Zone WH": {
              "description": "Content to warehouse management and documents from suggested zones",
              "index": 2,
              "to": "Template:HipCyclesType"
            }
        }   
    cate_lines = []
    for c, desc in category_description.items():
        c=c.strip()
        for line in desc.get("examples", "").split("\n"):
            line=line.strip()
            if not line:
                continue
            cate_lines.append("Category: {} - USER: {}".format(c,line))
    descriptions = []
    for c, desc in category_description.items():
        if desc.get("description"):
            descriptions.append(
                "\nCategory: {}\nDescription: {}".format(c, desc["description"]))

    examples_section = ""
    if cate_lines:
        examples_section = """
You could learn from the following examples:
- {}
You could learn from the above examples.
""".format("\n- ".join(cate_lines))

    prompt = """
Role: You're a text classifier. 
Task: You need to categorize the user’s questions into {} categories, namely: {}

Here's description of each category:
{}
{}Requirements:
- Just mention the category names, no need for any additional words.

---- Real Data ----
USER: {}\n
        """.format(
            len(category_description.keys()),
            "/".join(list(category_description.keys())),
            "\n".join(descriptions),
            examples_section,
            chat_hist
        )
    return prompt

print(get_prompt("What is the leave time policy?"))