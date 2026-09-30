import os
import re

def check_imports(root_dir):
    for dirpath, _, filenames in os.walk(root_dir):
        for f in filenames:
            if not f.endswith(('.ts', '.tsx')): continue
            filepath = os.path.join(dirpath, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                
            matches = re.findall(r'''import.*?from\s+['"](.*?)['"]''', content)
            for m in matches:
                if m.startswith('.'): 
                    target = os.path.normpath(os.path.join(dirpath, m))
                    found = False
                    for ext in ['', '.ts', '.tsx', '.json', '.jpeg', '.jpg', '.png', '.css', '.svg']:
                        if os.path.exists(target + ext):
                            dir_part = os.path.dirname(target + ext)
                            base_part = os.path.basename(target + ext)
                            if os.path.exists(dir_part):
                                actual_files = os.listdir(dir_part)
                                if base_part in actual_files:
                                    found = True
                                    break
                                elif base_part.lower() in [x.lower() for x in actual_files]:
                                    actual_name = [x for x in actual_files if x.lower() == base_part.lower()][0]
                                    print(f'CASE MISMATCH in {filepath}: imported {m}, but file is {actual_name}')
                                    found = True
                                    break
                    if not found:
                        print(f'MISSING in {filepath}: {m}')

check_imports('frontend/src')
