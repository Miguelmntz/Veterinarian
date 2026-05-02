import os
import re

directory = r'c:\Users\maart\Documents\htdocs\Veterinarian\ViteView\src'
target_str = "http://localhost:8000/api"

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if target_str in content or 'import axios from \'axios\'' in content or 'import axios from "axios"' in content:
                print(f"Refactoring {file}...")
                
                # Replace import
                content = content.replace("import axios from 'axios';", "import api from '../api';")
                content = content.replace('import axios from "axios";', 'import api from "../api";')
                # Handle App.jsx which is in src
                if file == 'App.jsx':
                    content = content.replace("import api from '../api';", "import api from './api';")
                
                # Replace calls
                content = content.replace(f"axios.get('{target_str}", "api.get('")
                content = content.replace(f'axios.get("{target_str}', 'api.get("')
                content = content.replace(f"axios.post('{target_str}", "api.post('")
                content = content.replace(f'axios.post("{target_str}', 'api.post("')
                content = content.replace(f"axios.put('{target_str}", "api.put('")
                content = content.replace(f'axios.put("{target_str}', 'api.put("')
                content = content.replace(f"axios.delete('{target_str}", "api.delete('")
                content = content.replace(f'axios.delete("{target_str}', 'api.delete("')
                
                # Replace any remaining axios calls to api
                content = content.replace('axios.get(', 'api.get(')
                content = content.replace('axios.post(', 'api.post(')
                content = content.replace('axios.put(', 'api.put(')
                content = content.replace('axios.delete(', 'api.delete(')
                
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)

print("Done refactoring.")
