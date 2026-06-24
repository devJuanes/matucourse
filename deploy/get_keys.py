"""Get full MatuDB API keys for matucourse project."""
import sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko

HOST = '13.140.160.248'
USER = 'root'
PASSWORD = 'Jesteban9091'
PROJECT_ID = '163b9207-974b-495f-a757-1d1d92ceabd9'


def run(ssh, cmd):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return (out + '\n' + err).strip()

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

# Get full keys from database
print("=== Full API keys from DB ===")
keys_sql = f"SELECT type, key_hash, key_preview FROM api_keys WHERE project_id='{PROJECT_ID}';"
keys_out = run(client, f'PGPASSWORD=Jesteban9091 psql -U matubyte -d matudb -h localhost -c "{keys_sql}" 2>&1')
print(keys_out)

# The key_hash stores the raw key (MatuDB stores hash, preview)
# Let's check if there's a way to get the actual key
print("\n=== api_keys full columns ===")
schema_out = run(client, 'PGPASSWORD=Jesteban9091 psql -U matubyte -d matudb -h localhost -c "\\d api_keys" 2>&1')
print(schema_out)

# Try API with fresh login
print("\n=== Login fresh ===")
login = run(client,
    'curl -s -X POST http://localhost:3004/api/auth/login '
    '-H "Content-Type: application/json" '
    '-d \'{"email":"juanlandazuri@gmail.com","password":"Jesteban9091"}\' 2>/dev/null')
token = json.loads(login)['data']['token']

# Get fresh API keys (sometimes the create response has them)
print(f"\n=== Rolling/generating new API keys ===")
roll_resp = run(client,
    f'curl -s -X POST http://localhost:3004/api/projects/{PROJECT_ID}/keys/generate '
    f'-H "Authorization: Bearer {token}" '
    f'-H "Content-Type: application/json" '
    f"-d '{{\"type\":\"anon\"}}' 2>/dev/null")
print(f"Roll anon: {roll_resp[:400]}")

# Try to get existing keys
existing = run(client,
    f'curl -s -X GET "http://localhost:3004/api/projects/{PROJECT_ID}/keys/reveal" '
    f'-H "Authorization: Bearer {token}" 2>/dev/null')
print(f"\nReveal keys: {existing[:400]}")

# Check the initial create response had the full keys
print("\n=== Check create_user.js for key generation ===")
print(run(client, 'head -50 /root/apps/matu-db-api/create_user.js 2>/dev/null'))

# Get project name/id
print("\n=== Project details ===")
proj = run(client,
    f'curl -s http://localhost:3004/api/projects/{PROJECT_ID} '
    f'-H "Authorization: Bearer {token}" 2>/dev/null')
print(proj[:400])

client.close()
