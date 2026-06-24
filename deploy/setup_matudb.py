"""Check and create MatuDB project for MatuCourse."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko

HOST = '13.140.160.248'
USER = 'root'
PASSWORD = 'Jesteban9091'


def run(ssh, cmd, check=False):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    combined = (out + '\n' + err).strip()
    return combined


client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

print("=== MatuDB Projects (via psql) ===")
projects = run(client, 'PGPASSWORD=Jesteban9091 psql -U matubyte -d matudb -c "SELECT id, name, api_key_anon, api_key_service FROM projects LIMIT 20;" 2>/dev/null || echo "psql_failed"')
print(projects)

print("\n=== MatuDB tables ===")
tables = run(client, 'PGPASSWORD=Jesteban9091 psql -U matubyte -d matudb -c "\\dt" 2>/dev/null | head -30')
print(tables)

print("\n=== MatuDB projects table columns ===")
cols = run(client, 'PGPASSWORD=Jesteban9091 psql -U matubyte -d matudb -c "\\d projects" 2>/dev/null')
print(cols)

print("\n=== MatuDB local API endpoints ===")
endpoints = run(client, 'curl -s http://localhost:3004/api/projects 2>/dev/null | head -200 || curl -s http://localhost:3004/ 2>/dev/null | head -100')
print(endpoints)

print("\n=== Try MatuDB API auth ===")
auth_response = run(client, 'curl -s -X POST http://localhost:3004/api/auth/login -H "Content-Type: application/json" -d \'{"email":"admin@matudb.com","password":"Jesteban9091"}\' 2>/dev/null')
print(f'auth attempt: {auth_response[:300]}')

client.close()
