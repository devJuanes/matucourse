"""Find MatuDB credentials via multiple approaches."""
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

print("=== Test psql connection ===")
print(run(client, 'psql --version 2>&1'))
print(run(client, 'which psql 2>&1'))

print("\n=== psql as matubyte ===")
print(run(client, 'PGPASSWORD=Jesteban9091 psql -U matubyte -d matudb -h localhost -c "SELECT current_user, current_database();" 2>&1'))

print("\n=== list_projects.js output ===")
r = run(client, 'cd /root/apps/matu-db-api && node list_projects.js 2>&1 | head -40')
print(r if r else "(empty)")

print("\n=== find_project_by_key.js ===")
print(run(client, 'cd /root/apps/matu-db-api && node get_project_id.js 2>&1 | head -20'))

print("\n=== Direct DB query ===")
q = """PGPASSWORD=Jesteban9091 psql -U matubyte -d matudb -h localhost -c "SELECT id, name, substring(api_key_anon,1,30) as anon_key FROM projects LIMIT 10;" 2>&1"""
print(run(client, q))

print("\n=== Create project inline ===")
create = """PGPASSWORD=Jesteban9091 psql -U matubyte -d matudb -h localhost -c "INSERT INTO projects (name, description, api_key_anon, api_key_service) VALUES ('matucourse','MatuCourse Platform', 'anon_matucourse_live_x7k2p9m4r8q', 'service_matucourse_live_z3j6n1w5t8v') ON CONFLICT (name) DO UPDATE SET description=EXCLUDED.description RETURNING id, name, api_key_anon, api_key_service;" 2>&1"""
print(run(client, create))

client.close()
