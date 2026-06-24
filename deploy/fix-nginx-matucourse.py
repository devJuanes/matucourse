"""Lista y corrige configs nginx duplicadas de matucourse."""
from __future__ import annotations

import io
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import paramiko

HOST = os.environ.get('MATUCOURSE_SSH_HOST', '13.140.160.248')
USER = os.environ.get('MATUCOURSE_SSH_USER', 'root')


def get_password() -> str:
    pw = os.environ.get('MATUCOURSE_SSH_PASSWORD', '')
    if pw:
        return pw
    with open(os.path.join(os.path.dirname(__file__), 'deploy.py'), encoding='utf-8') as f:
        for line in f:
            if line.strip().startswith('PASSWORD ='):
                return line.split('=', 1)[1].strip().strip("'\"")
    sys.exit(1)


def run(ssh, cmd: str) -> str:
    print(f'$ {cmd}')
    _, stdout, stderr = ssh.exec_command(cmd, timeout=120)
    out = stdout.read().decode()
    err = stderr.read().decode()
    code = stdout.channel.recv_exit_status()
    text = (out + err).strip()
    if text:
        print(text)
    if code != 0:
        raise RuntimeError(code)
    return out


client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=get_password(), timeout=30)

run(client, 'grep -r matucourse /etc/nginx/sites-enabled/ /etc/nginx/sites-available/ 2>/dev/null | head -40')
run(client, 'ls -la /etc/nginx/sites-enabled/ | grep matucourse')

fix = r"""
set -euo pipefail
APP=/root/apps/matucourse
# Quitar duplicados en sites-enabled (solo un enlace matucourse)
for f in /etc/nginx/sites-enabled/*; do
  if grep -q 'matucourse.matubyte.com' "$f" 2>/dev/null && [[ "$(basename "$f")" != "matucourse.matubyte.com" ]]; then
    echo "DISABLE duplicate: $f"
    rm -f "$f"
  fi
done
CONF=$APP/deploy/nginx/matucourse.matubyte.com.conf
if [[ -f /etc/letsencrypt/live/matucourse.matubyte.com/fullchain.pem ]]; then
  cp "$CONF" /etc/nginx/sites-available/matucourse.matubyte.com
else
  cp "$APP/deploy/nginx/matucourse.matubyte.com.http.conf" /etc/nginx/sites-available/matucourse.matubyte.com
fi
ln -sf /etc/nginx/sites-available/matucourse.matubyte.com /etc/nginx/sites-enabled/matucourse.matubyte.com
nginx -t && systemctl reload nginx
curl -sL https://matucourse.matubyte.com/ | grep -E 'script|assets/' | head -3
"""

run(client, fix)
client.close()
