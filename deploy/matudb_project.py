"""Create/find MatuDB project for MatuCourse using existing utility scripts."""
import sys, io, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko

HOST = '13.140.160.248'
USER = 'root'
PASSWORD = 'Jesteban9091'
BASE_DIR = '/root/apps/matu-db-api'


def run(ssh, cmd):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=60)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return (out + '\n' + err).strip()


client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

print("=== List existing MatuDB projects ===")
projects = run(client, f'cd {BASE_DIR} && node list_projects.js 2>/dev/null | head -60')
print(projects)

print("\n=== Query projects table directly via psql ===")
psql = run(client,
    "sudo -u postgres psql -d matudb -c "
    "\"SELECT id, name, api_key_anon, api_key_service FROM projects LIMIT 20;\" 2>/dev/null"
)
print(psql)

print("\n=== Check if matucourse project exists ===")
psql2 = run(client,
    "sudo -u postgres psql -d matudb -c "
    "\"SELECT id, name, api_key_anon FROM projects WHERE name ILIKE '%matucourse%' OR name ILIKE '%course%';\" 2>/dev/null"
)
print(psql2)

# If no matucourse project, create one
if 'matucourse' not in psql2.lower() and 'course' not in psql2.lower():
    print("\n=== Creating matucourse project ===")
    create_sql = """
    INSERT INTO projects (name, description, api_key_anon, api_key_service, status)
    VALUES (
        'matucourse',
        'MatuCourse - Plataforma de cursos en vivo por MatuByte S.A.S.',
        'anon_matucourse_' || substr(md5(random()::text), 1, 24),
        'service_matucourse_' || substr(md5(random()::text), 1, 24),
        'active'
    )
    RETURNING id, name, api_key_anon, api_key_service;
    """
    result = run(client,
        f"sudo -u postgres psql -d matudb -c \"{create_sql.strip()}\" 2>/dev/null"
    )
    print(result)
else:
    print("Project already exists!")

print("\n=== Final: All projects ===")
final = run(client,
    "sudo -u postgres psql -d matudb -c "
    "\"SELECT id, name, api_key_anon FROM projects ORDER BY created_at DESC NULLS LAST LIMIT 10;\" 2>/dev/null"
)
print(final)

print("\n=== MatuDB admin users ===")
admins = run(client,
    "sudo -u postgres psql -d matudb -c "
    "\"SELECT email, role FROM users WHERE role IN ('admin', 'superadmin') LIMIT 5;\" 2>/dev/null"
    " || "
    "sudo -u postgres psql -d matudb -c "
    "\"SELECT email FROM admins LIMIT 5;\" 2>/dev/null"
)
print(admins)

client.close()
