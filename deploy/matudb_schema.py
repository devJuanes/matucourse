"""Inspect MatuDB schema and create matucourse project."""
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

def pg(ssh, sql):
    return run(ssh, f'PGPASSWORD=Jesteban9091 psql -U matubyte -d matudb -h localhost -c "{sql}" 2>&1')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

print("=== projects table columns ===")
print(pg(client, "\\d projects"))

print("\n=== all tables in matudb ===")
print(pg(client, "\\dt"))

print("\n=== existing projects ===")
print(pg(client, "SELECT * FROM projects LIMIT 5;"))

client.close()
