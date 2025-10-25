#!/usr/bin/env python3
"""
Hugging Face Spaces launcher for Express backend API
This file will be called by Hugging Face to start the Node.js server
"""

import subprocess
import sys
import os

# Build the Node.js app first
print("Building the application...")
try:
    subprocess.run(["npm", "ci"], check=True)
    subprocess.run(["npm", "run", "build"], check=True)
except subprocess.CalledProcessError as e:
    print(f"Build failed: {e}")
    sys.exit(1)

# Start the server
print("Starting the server on port 7860 (Hugging Face's default port)...")
port = int(os.getenv("PORT", "7860"))

# Run the Node.js server
os.execvp("node", ["node", "dist/index.js"])
