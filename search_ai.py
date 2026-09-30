import os, re
pattern = re.compile(r'openai|huggingface|ml |ai |llama|transformers|model', re.I)
for root, _, files in os.walk('backend'):
    if '.venv' in root: continue
    for f in files:
        if f.endswith('.py'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                for i, line in enumerate(file):
                    if pattern.search(line):
                        print(f'{filepath}:{i+1}: {line.strip()}')
