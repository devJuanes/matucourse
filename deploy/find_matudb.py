"""Find MatuDB database and credentials."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko

HOST = '13.140.160.248'
USER = 'root'
PASSWORD = 'Jesteban9091'


def run(ssh, cmd):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return (out + '\n' + err).strip()


client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

# Try different DB names and users
print("=== psql databases ===")
dbs = run(client, 'PGPASSWORD=Jesteban9091 psql -U postgres -c "\\l" 2>/dev/null || PGPASSWORD=Jesteban9091 psql -U matubyte -c "\\l" 2>/dev/null || sudo -u postgres psql -c "\\l" 2>/dev/null | head -30')
print(dbs)

print("\n=== matu-db-api structure ===")
api_files = run(client, 'ls /root/apps/matu-db-api/ 2>/dev/null')
print(api_files)

print("\n=== matu-db-api .env actual ===")
env = run(client, 'cat /root/apps/matu-db-api/.env 2>/dev/null')
print(env)

print("\n=== List projects via API with admin token ===")
# Try common admin emails
for email in ['admin@matubyte.com', 'juanlandazuri@gmail.com', 'devjuanes@gmail.com', 'admin@matudb.com']:
    result = run(client, f'curl -s -X POST http://localhost:3004/api/auth/login -H "Content-Type: application/json" -d \'{{"email":"{email}","password":"Jesteban9091"}}\' 2>/dev/null | head -200')
    print(f'  {email}: {result[:150]}')
    if '"token"' in result or '"access_token"' in result:
        print('  *** FOUND VALID CREDENTIALS ***')
        break

print("\n=== MatuDB API v1 projects (no auth) ===")
print(run(client, 'curl -s http://localhost:3004/api/v1/projects 2>/dev/null | head -200'))

print("\n=== MatuDB port ===")
print(run(client, 'ss -tlnp | grep -E "3001|3002|3003|3004|3005" 2>/dev/null'))

client.close()
