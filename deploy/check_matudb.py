"""Check MatuDB credentials and PM2 final status."""
import sys, io, os, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko

HOST = '13.140.160.248'
USER = 'root'
PASSWORD = 'Jesteban9091'


def run(ssh, cmd, check=False):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return (out + '\n' + err).strip()


client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)

print("=== PM2 STATUS ===")
print(run(client, 'pm2 list --no-color'))

print("\n=== Port 3030 check ===")
print(run(client, 'curl -sI http://localhost:3030 | head -3'))

print("\n=== matucourse process detail ===")
print(run(client, 'pm2 show matucourse --no-color 2>/dev/null | head -30'))

print("\n=== MatuDB API .env ===")
print(run(client, 'cat /root/apps/matu-db-api/.env 2>/dev/null | grep -v "^#" | grep -v "^$"'))

print("\n=== MatuDB projects listing ===")
print(run(client, 'cat /root/apps/matu-db/.env 2>/dev/null | grep -v "^#" | grep -v "^$"'))

print("\n=== PayMatuByte matucourse.yaml on server ===")
print(run(client, 'cat /root/apps/pay/config/apps/matucourse.yaml'))

print("\n=== Nginx matucourse config ===")
print(run(client, 'cat /etc/nginx/sites-available/matucourse.matubyte.com 2>/dev/null | head -20'))

client.close()
