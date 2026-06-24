"""Check MatuDB API route to understand projectId format."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko

HOST = '13.140.160.248'
USER = 'root'
PASSWORD = 'Jesteban9091'

def run(ssh, cmd):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=20)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return (out + '\n' + err).strip()

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

# Check how the API resolves projectId (name or uuid)
print("=== MatuDB API - project auth middleware ===")
print(run(client, 'grep -r "projectId\\|project_id\\|x-project\\|projectKey" /root/apps/matu-db-api/src --include="*.js" -l 2>/dev/null | head -10'))

print("\n=== Auth middleware for project resolution ===")
print(run(client, 'grep -rn "projectId\\|project_id\\|project-id\\|findOne.*project" /root/apps/matu-db-api/src/middleware -A2 --include="*.js" 2>/dev/null | head -50'))

# The key pattern - find how API keys are validated
print("\n=== Key validation ===")
print(run(client, 'grep -rn "api_key\\|apiKey\\|key_hash\\|resolveProject" /root/apps/matu-db-api/src --include="*.js" -l 2>/dev/null | head -10'))

# Test directly with the anon key
ANON_KEY = 'mb_a7570ab8345ae503c9ea9663df04d4ce05506c7c4ff16675a2cf47d8fbe8de63'
PROJECT_ID = '163b9207-974b-495f-a757-1d1d92ceabd9'

print(f"\n=== Test API with anon key + project UUID ===")
test1 = run(client,
    f'curl -s http://localhost:3004/api/data/matucourse/users '
    f'-H "apikey: {ANON_KEY}" '
    f'-H "x-project-id: {PROJECT_ID}" 2>/dev/null | head -200'
)
print(f"UUID: {test1[:200]}")

print(f"\n=== Test API with anon key + project name ===")
test2 = run(client,
    f'curl -s http://localhost:3004/api/data/matucourse/users '
    f'-H "apikey: {ANON_KEY}" '
    f'-H "x-project-id: matucourse" 2>/dev/null | head -200'
)
print(f"name: {test2[:200]}")

# Check how existing app uses it
print(f"\n=== Check other app .env for MATUDB format ===")
print(run(client, 'cat /root/apps/MatuCashBakend/.env 2>/dev/null | grep -i matu | head -10'))
print(run(client, 'cat /root/apps/CMR/.env 2>/dev/null | grep -i matu | head -10'))

client.close()
