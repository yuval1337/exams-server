import secrets
import os

# Generate a random 256-bit (32-byte) secret key
secret_key = secrets.token_bytes(32).hex()

# Read existing lines from the .env file
lines = []
if os.path.exists('.env'):
    with open('.env', 'r') as env_file:
        lines = env_file.readlines()

# Find the JWT_SECRET line index
jwt_secret_index = None
for i, line in enumerate(lines):
    if line.startswith("JWT_SECRET="):
        jwt_secret_index = i
        break

# Update or append JWT_SECRET line
if jwt_secret_index is not None:
    lines[jwt_secret_index] = f"JWT_SECRET={secret_key}\n"
else:
    lines.insert(0, f"JWT_SECRET={secret_key}\n")

# Write the updated lines back to the .env file
with open('.env', 'w') as env_file:
    env_file.writelines(lines)

print("Secret key written to .env file.")
