import os

directory = r'c:\Users\maart\Documents\htdocs\Veterinarian\ViteView\src'
target_str = "http://localhost:8000/storage"
new_str = "https://veterinaria.martinezyelamosabogados.es/storage"

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if target_str in content:
                print(f"Refactoring storage in {file}...")
                content = content.replace(target_str, new_str)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)

print("Done storage refactoring.")
