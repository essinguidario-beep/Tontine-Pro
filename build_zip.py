#!/usr/bin/env python3
"""
Archive builder for TontinePro Lite.
Generates public/tontinepro-lite.zip containing clean source files.
"""

import os
import zipfile

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUTPUT_ZIP = os.path.join(ROOT_DIR, 'public', 'tontinepro-lite.zip')

EXCLUDE_DIRS = {
    'node_modules',
    'dist',
    '.git',
    '.cache',
    '.vite',
    '__pycache__',
    '.vscode',
    '.idea',
    '.aistudio'
}

EXCLUDE_FILES = {
    'tontinepro-lite.zip',
    '.DS_Store',
    'Thumbs.db'
}

def create_archive():
    os.makedirs(os.path.dirname(OUTPUT_ZIP), exist_ok=True)
    
    file_count = 0
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zip_out:
        for root, dirs, files in os.walk(ROOT_DIR):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]
            
            for f in files:
                if f in EXCLUDE_FILES or f.endswith('.pyc') or f.endswith('.zip'):
                    continue
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, ROOT_DIR)
                
                # Add to zip under tontinepro-lite folder
                archive_name = os.path.join('tontinepro-lite', rel_path)
                zip_out.write(full_path, archive_name)
                file_count += 1

    size_kb = os.path.getsize(OUTPUT_ZIP) / 1024
    print(f"Archive successfully generated: {OUTPUT_ZIP}")
    print(f"Total files: {file_count}, Size: {size_kb:.2f} KB")

if __name__ == '__main__':
    create_archive()
