#!/bin/bash

file_path="cjs/index.js"

# Reemplazar "await" por un string vacío en el archivo index.js
sed -i 's/await//g' "$file_path"

echo "Replacement completed."