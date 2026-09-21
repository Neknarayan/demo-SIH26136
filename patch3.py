import re

with open('backend/tests/test_workflow.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'challenge_id = c_res.json()["id"]',
    'challenge_id = c_res.json()["id"]\n    client.patch(f"/challenges/{challenge_id}/status", headers=client.auth_headers(1), json={"status": "published"})'
)

# For those without challenge_id = ...
# e.g. json={"challenge_id": c_res.json()["id"]
def patch_inline(match):
    return match.group(0) + '\n    client.patch(f"/challenges/{c_res.json()[\'id\']}/status", headers=client.auth_headers(1), json={"status": "published"})\n'

# Find lines with app_res = client.post("/applications"...
# and add the patch BEFORE it
content = re.sub(
    r'(c_res = client\.post\("/challenges"[^)]+\))',
    r'\1\n    client.patch(f"/challenges/{c_res.json()[\'id\']}/status", headers=client.auth_headers(1), json={"status": "published"})',
    content
)

with open('backend/tests/test_workflow.py', 'w', encoding='utf-8') as f:
    f.write(content)
