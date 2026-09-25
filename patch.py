import re
with open('backend/tests/test_workflow.py', 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r'headers=\{\"X-User-Id\":\s*\"(\d+)\"\}', r'headers=client.auth_headers(\1)', content)
with open('backend/tests/test_workflow.py', 'w', encoding='utf-8') as f:
    f.write(content)
