"""Re-upload rebuilt dist and restart PM2."""
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko

HOST = '13.140.160.248'
USER = 'root'
PASSWORD = 'Jesteban9091'
REMOTE_APP_DIR = '/root/apps/matucourse'
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def run(ssh, cmd):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=60)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    combined = (out + '\n' + err).strip()
    if combined:
        print(f'  {combined[:400]}')
    return out


def upload_dir(sftp, local_dir, remote_dir):
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = remote_dir + '/' + item
        if os.path.isdir(local_path):
            try:
                sftp.mkdir(remote_path)
            except OSError:
                pass
            upload_dir(sftp, local_path, remote_path)
        else:
            sftp.put(local_path, remote_path)


client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=30)
sftp = client.open_sftp()

print("[1] Clearing old dist on server...")
run(client, f'rm -rf {REMOTE_APP_DIR}/dist && mkdir -p {REMOTE_APP_DIR}/dist')

print("[2] Uploading new dist/...")
upload_dir(sftp, os.path.join(BASE, 'dist'), REMOTE_APP_DIR + '/dist')
print("  dist/ uploaded!")

print("[3] Restarting PM2...")
run(client, 'pm2 restart matucourse')

import time; time.sleep(2)

print("[4] Checking status...")
run(client, 'pm2 show matucourse --no-color 2>/dev/null | grep -E "status|restarts|uptime"')
run(client, 'curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3030 2>&1')

sftp.close()
client.close()
print("\nDone! MatuCourse redeployed with real MatuDB credentials.")
