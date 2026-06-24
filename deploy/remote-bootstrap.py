"""
Reinstala MatuCourse en el VPS clonando desde GitHub.
Uso: python deploy/remote-bootstrap.py
"""
from __future__ import annotations

import io
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import paramiko

HOST = os.environ.get('MATUCOURSE_SSH_HOST', '13.140.160.248')
USER = os.environ.get('MATUCOURSE_SSH_USER', 'root')
PASSWORD = os.environ.get('MATUCOURSE_SSH_PASSWORD', '')
APP_DIR = os.environ.get('MATUCOURSE_APP_DIR', '/root/apps/matucourse')
REPO = os.environ.get('MATUCOURSE_REPO', 'https://github.com/devJuanes/matucourse.git')


def get_password() -> str:
    if PASSWORD:
        return PASSWORD
    legacy = os.path.join(os.path.dirname(__file__), 'deploy.py')
    if os.path.isfile(legacy):
        with open(legacy, encoding='utf-8') as f:
            for line in f:
                if line.strip().startswith('PASSWORD ='):
                    return line.split('=', 1)[1].strip().strip("'\"")
    print('ERROR: define MATUCOURSE_SSH_PASSWORD')
    sys.exit(1)


def run(ssh, cmd: str, timeout: int = 900) -> str:
    print(f'  $ {cmd[:120]}...' if len(cmd) > 120 else f'  $ {cmd}')
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    code = stdout.channel.recv_exit_status()
    combined = (out + err).strip()
    if combined:
        print(combined[-2000:] if len(combined) > 2000 else combined)
    if code != 0:
        raise RuntimeError(f'Failed ({code})')
    return out


def main():
    pw = get_password()
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=pw, timeout=30)

    script = f"""
set -euo pipefail
BACKUP_ENV=""
if [[ -f {APP_DIR}/.env ]]; then
  BACKUP_ENV=$(mktemp)
  cp {APP_DIR}/.env "$BACKUP_ENV"
  echo "→ .env respaldado"
fi
echo "→ rm -rf {APP_DIR}"
rm -rf {APP_DIR}
echo "→ git clone {REPO}"
git clone {REPO} {APP_DIR}
cd {APP_DIR}
if [[ -n "$BACKUP_ENV" ]] && [[ -f "$BACKUP_ENV" ]]; then
  cp "$BACKUP_ENV" .env
  rm -f "$BACKUP_ENV"
fi
sed -i 's/\\r$//' deploy/*.sh 2>/dev/null || true
chmod +x deploy/*.sh
bash deploy/deploy.sh
curl -sL https://matucourse.matubyte.com/ | head -30
"""

    print('=' * 60)
    print(f'Bootstrap {REPO} → {APP_DIR}')
    print('=' * 60)
    run(client, script, timeout=1200)
    client.close()
    print('✓ Listo — https://matucourse.matubyte.com')


if __name__ == '__main__':
    main()
