import re

with open('backend/tests/test_workflow.py', 'r', encoding='utf-8') as f:
    content = f.read()

def replacer(match):
    return match.group(0) + '\n    client.patch(f"/challenges/{c_res.json()[\'id\']}/status", headers=client.auth_headers(1), json={"status": "published"})\n'

# Find c_res = client.post("/challenges", ... json={ ... })
content = re.sub(
    r'(c_res = client\.post\("/challenges", headers=client\.auth_headers\(1\), json=\{[^}]+\}\n\s*\))',
    replacer,
    content
)

with open('backend/tests/test_workflow.py', 'w', encoding='utf-8') as f:
    f.write(content)
