import os
import re

directory = r'c:\Users\maart\Documents\htdocs\Veterinarian\ViteView\src'
# Buscamos cualquier variante de localhost:8000/api/ y la quitamos para dejar solo la ruta relativa
target_pattern = r'http://localhost:8000/api/'

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if "http://localhost:8000" in content:
                print(f"Cleaning links in {file}...")
                # Reemplazar la URL completa por una ruta relativa que use la instancia 'api'
                # Ej: api.post('http://localhost:8000/api/pets') -> api.post('/pets')
                content = content.replace("http://localhost:8000/api", "")
                # También corrección para lo que no lleva /api/ si existiera
                content = content.replace("http://localhost:8000", "") 
                
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)

print("Final cleanup done.")
