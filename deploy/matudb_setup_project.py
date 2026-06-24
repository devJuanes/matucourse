"""Create MatuCourse project in MatuDB and get API credentials."""
import sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko

HOST = '13.140.160.248'
USER = 'root'
PASSWORD = 'Jesteban9091'
BASE_DIR = '/root/apps/matucourse'


def run(ssh, cmd):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return (out + '\n' + err).strip()

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

# Step 1: Login to get fresh token
print("[1] Logging in to MatuDB API...")
login_resp = run(client,
    'curl -s -X POST http://localhost:3004/api/auth/login '
    '-H "Content-Type: application/json" '
    '-d \'{"email":"juanlandazuri@gmail.com","password":"Jesteban9091"}\' 2>/dev/null'
)
print(f"Login response: {login_resp[:300]}")

try:
    login_data = json.loads(login_resp)
    token = login_data.get('data', {}).get('token', '') or login_data.get('token', '')
except:
    token = ''

if not token:
    print("Login failed, trying to extract token manually...")
    import re
    m = re.search(r'"token"\s*:\s*"([^"]+)"', login_resp)
    token = m.group(1) if m else ''

print(f"Token: {token[:50]}...")

# Step 2: Create project
print("\n[2] Creating MatuCourse project...")
create_resp = run(client,
    f'curl -s -X POST http://localhost:3004/api/projects '
    f'-H "Content-Type: application/json" '
    f'-H "Authorization: Bearer {token}" '
    f"-d '{{\"name\":\"matucourse\",\"description\":\"MatuCourse - Plataforma de cursos en vivo por MatuByte S.A.S.\"}}' "
    f'2>/dev/null'
)
print(f"Create response: {create_resp[:500]}")

# Extract project ID
try:
    create_data = json.loads(create_resp)
    project_id = (create_data.get('data', {}) or {}).get('id', '') or \
                 (create_data.get('data', {}) or {}).get('project', {}).get('id', '') or \
                 create_data.get('id', '')
except:
    project_id = ''

import re
if not project_id:
    m = re.search(r'"id"\s*:\s*"([a-f0-9-]{36})"', create_resp)
    project_id = m.group(1) if m else ''

print(f"Project ID: {project_id}")

# Step 3: Get API keys for the project
if project_id:
    print(f"\n[3] Getting API keys for project {project_id}...")
    keys_resp = run(client,
        f'curl -s http://localhost:3004/api/projects/{project_id}/keys '
        f'-H "Authorization: Bearer {token}" 2>/dev/null'
    )
    print(f"Keys response: {keys_resp[:600]}")

    # Also try to get full project info
    proj_resp = run(client,
        f'curl -s http://localhost:3004/api/projects/{project_id} '
        f'-H "Authorization: Bearer {token}" 2>/dev/null'
    )
    print(f"\nProject info: {proj_resp[:600]}")

# Step 4: List all projects
print("\n[4] All projects:")
all_proj = run(client,
    f'curl -s http://localhost:3004/api/projects '
    f'-H "Authorization: Bearer {token}" 2>/dev/null'
)
print(all_proj[:800])

client.close()
