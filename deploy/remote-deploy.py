"""
Despliegue remoto MatuCourse → VPS /root/apps/matucourse
Uso:
  npm run build
  set MATUCOURSE_SSH_PASSWORD=...   (Windows)
  python deploy/remote-deploy.py

Opciones:
  --skip-build   No compila en local; sube dist/ existente y --skip-build en servidor
  --skip-deps    No npm ci en servidor
"""
from __future__ import annotations

import argparse
import io
import os
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import paramiko

HOST = os.environ.get('MATUCOURSE_SSH_HOST', '13.140.160.248')
USER = os.environ.get('MATUCOURSE_SSH_USER', 'root')
PASSWORD = os.environ.get('MATUCOURSE_SSH_PASSWORD', '')
REMOTE_APP_DIR = os.environ.get('MATUCOURSE_DEPLOY_DIR', '/root/apps/matucourse')

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

UPLOAD_FILES = [
    'package.json',
    'package-lock.json',
    'ecosystem.config.cjs',
    'vite.config.ts',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'env.d.ts',
    '.env.production',
]

UPLOAD_DIRS = ['src', 'public', 'deploy']


def run(ssh, cmd: str, check: bool = True, timeout: int = 600) -> str:
    print(f'  $ {cmd}')
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    code = stdout.channel.recv_exit_status()
    combined = (out + '\n' + err).strip()
    if combined:
        print(f'    {combined[:800]}')
    if check and code != 0:
        raise RuntimeError(f'Command failed ({code}): {cmd}')
    return out


def upload_file(sftp, local: str, remote: str):
    print(f'  ↑ {os.path.basename(local)}')
    sftp.put(local, remote)


def upload_dir(sftp, local_dir: str, remote_dir: str):
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f'{remote_dir}/{item}'
        if os.path.isdir(local_path):
            try:
                sftp.mkdir(remote_path)
            except OSError:
                pass
            upload_dir(sftp, local_path, remote_path)
        else:
            sftp.put(local_path, remote_path)


def get_password() -> str:
    if PASSWORD:
        return PASSWORD
    legacy = os.path.join(BASE, 'deploy', 'deploy.py')
    if os.path.isfile(legacy):
        with open(legacy, encoding='utf-8') as f:
            for line in f:
                if line.strip().startswith('PASSWORD ='):
                    return line.split('=', 1)[1].strip().strip("'\"")
    print('ERROR: define MATUCOURSE_SSH_PASSWORD')
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--skip-build', action='store_true')
    parser.add_argument('--skip-deps', action='store_true')
    args = parser.parse_args()

    if not args.skip_build:
        print('→ Build local...')
        import subprocess
        import shutil
        npm = shutil.which('npm') or 'npm.cmd'
        subprocess.run([npm, 'run', 'build'], cwd=BASE, check=True, shell=(os.name == 'nt'))

    password = get_password()

    print('=' * 60)
    print(f'MatuCourse remote deploy → {USER}@{HOST}:{REMOTE_APP_DIR}')
    print('=' * 60)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=password, timeout=30)
    sftp = client.open_sftp()

    run(client, f'mkdir -p {REMOTE_APP_DIR}')

    print('\n→ Subiendo archivos...')
    for fname in UPLOAD_FILES:
        local = os.path.join(BASE, fname)
        if os.path.isfile(local):
            upload_file(sftp, local, f'{REMOTE_APP_DIR}/{fname}')

    for dirname in UPLOAD_DIRS:
        local = os.path.join(BASE, dirname)
        remote = f'{REMOTE_APP_DIR}/{dirname}'
        if os.path.isdir(local):
            print(f'  ↑ {dirname}/')
            try:
                sftp.mkdir(remote)
            except OSError:
                pass
            upload_dir(sftp, local, remote)

    if args.skip_build and os.path.isdir(os.path.join(BASE, 'dist')):
        print('  ↑ dist/ (pre-built)')
        dist_remote = f'{REMOTE_APP_DIR}/dist'
        try:
            sftp.mkdir(dist_remote)
        except OSError:
            pass
        upload_dir(sftp, os.path.join(BASE, 'dist'), dist_remote)

    deploy_flags = []
    if args.skip_build:
        deploy_flags.append('--skip-build')
    if args.skip_deps:
        deploy_flags.append('--skip-deps')
    flag_str = ' '.join(deploy_flags)

    print('\n→ Ejecutando deploy.sh en servidor...')
    run(client, f'cd {REMOTE_APP_DIR} && sed -i "s/\\r$//" deploy/*.sh 2>/dev/null || true')
    run(
        client,
        f'cd {REMOTE_APP_DIR} && chmod +x deploy/deploy.sh && bash deploy/deploy.sh {flag_str}',
        timeout=900,
    )

    sftp.close()
    client.close()

    print('\n' + '=' * 60)
    print('✓ Deploy completo — https://matucourse.matubyte.com')
    print('=' * 60)


if __name__ == '__main__':
    main()
