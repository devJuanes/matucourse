"""Create MatuDB project for MatuCourse."""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko, uuid

HOST = '13.140.160.248'
USER = 'root'
PASSWORD = 'Jesteban9091'


def run(ssh, cmd):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return (out + '\n' + err).strip()

def pg(ssh, sql):
    safe = sql.replace('"', '\\"')
    return run(ssh, f'PGPASSWORD=Jesteban9091 psql -U matubyte -d matudb -h localhost -c "{safe}" 2>&1')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

print("=== api_keys table ===")
print(pg(client, "\\d api_keys"))

print("\n=== users table (check admin) ===")
print(pg(client, "SELECT id, email, role FROM users LIMIT 10;"))

print("\n=== tenants table ===")
print(pg(client, "SELECT id, name FROM tenants LIMIT 5;"))

# Check if there's any admin user
users_out = pg(client, "SELECT id, email FROM users WHERE role='admin' OR role='superadmin' LIMIT 5;")
print(f"\nAdmin users: {users_out}")

# Also check for any user
any_user = pg(client, "SELECT id, email FROM users LIMIT 3;")
print(f"Any users: {any_user}")

print("\n=== Try create via API (register + create project) ===")
# First register an admin user
reg = run(client,
    'curl -s -X POST http://localhost:3004/api/auth/register '
    '-H "Content-Type: application/json" '
    '-d \'{"name":"Juan E. Landazuri","email":"juanlandazuri@gmail.com","password":"Jesteban9091"}\' '
    '2>/dev/null'
)
print(f"Register attempt: {reg[:400]}")

client.close()
