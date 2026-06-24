"""
MatuCourse deployment script using paramiko.
Deploys to root@13.140.160.248:/root/apps/matucourse
"""

import paramiko
import os
import sys

HOST = '13.140.160.248'
USER = 'root'
PASSWORD = 'Jesteban9091'
REMOTE_APP_DIR = '/root/apps/matucourse'

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def safe_print(s: str):
    try:
        print(s)
    except UnicodeEncodeError:
        print(s.encode('ascii', errors='replace').decode('ascii'))


def run(ssh: paramiko.SSHClient, cmd: str, check: bool = True) -> str:
    safe_print(f'  $ {cmd}')
    _, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    exit_code = stdout.channel.recv_exit_status()
    if out:
        safe_print(f'    {out[:500]}')
    if err:
        safe_print(f'    ERR: {err[:500]}')
    if check and exit_code != 0:
        raise RuntimeError(f'Command failed ({exit_code}): {cmd}')
    return out


def upload_file(sftp: paramiko.SFTPClient, local: str, remote: str):
    safe_print(f'  Uploading {os.path.basename(local)} -> {remote}')
    sftp.put(local, remote)


def upload_dir(sftp: paramiko.SFTPClient, local_dir: str, remote_dir: str):
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


def main():
    print('=' * 60)
    print('MatuCourse Deployment')
    print('=' * 60)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print(f'\n[1/6] Connecting to {HOST}...')
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print('      Connected!')

    sftp = client.open_sftp()

    print(f'\n[2/6] Preparing server directory...')
    run(client, f'mkdir -p {REMOTE_APP_DIR}')
    run(client, f'mkdir -p {REMOTE_APP_DIR}/dist')

    print(f'\n[3/6] Uploading dist/ folder...')
    dist_local = os.path.join(BASE, 'dist')
    dist_remote = REMOTE_APP_DIR + '/dist'
    upload_dir(sftp, dist_local, dist_remote)
    print(f'      dist/ uploaded!')

    print(f'\n[4/6] Uploading config files...')
    for fname in ['ecosystem.config.cjs', 'package.json']:
        local_f = os.path.join(BASE, fname)
        if os.path.exists(local_f):
            upload_file(sftp, local_f, f'{REMOTE_APP_DIR}/{fname}')

    print(f'\n[5/6] Setting up nginx...')
    nginx_http = os.path.join(BASE, 'deploy', 'nginx', 'matucourse.matubyte.com.http.conf')
    nginx_ssl = os.path.join(BASE, 'deploy', 'nginx', 'matucourse.matubyte.com.conf')

    # First put HTTP-only config (safe before SSL)
    try:
        sftp.mkdir('/etc/nginx/sites-available')
    except OSError:
        pass

    upload_file(sftp, nginx_http, '/etc/nginx/sites-available/matucourse.matubyte.com')
    run(client, 'ln -sf /etc/nginx/sites-available/matucourse.matubyte.com /etc/nginx/sites-enabled/', check=False)

    nginx_test = run(client, 'nginx -t 2>&1', check=False)
    print(f'      nginx -t result: {nginx_test[:100]}')

    reload_out = run(client, 'systemctl reload nginx 2>&1 || service nginx reload 2>&1', check=False)
    print(f'      nginx reload: {reload_out[:100] if reload_out else "ok"}')

    print(f'\n[6/6] Starting app with PM2...')
    # Install serve if not available
    run(client, 'npm list -g serve 2>/dev/null || npm install -g serve', check=False)

    # Stop existing process if running
    run(client, f'cd {REMOTE_APP_DIR} && pm2 stop matucourse 2>/dev/null || true', check=False)
    run(client, f'cd {REMOTE_APP_DIR} && pm2 delete matucourse 2>/dev/null || true', check=False)

    # Start fresh
    run(client, f'cd {REMOTE_APP_DIR} && pm2 start ecosystem.config.cjs')
    run(client, 'pm2 save')

    pm2_status = run(client, 'pm2 list --no-color')
    print(f'\n  PM2 Status:\n{pm2_status}')

    # Check if PayMatuByte config directory exists
    print(f'\n[+] Deploying PayMatuByte matucourse config...')
    pay_dirs = run(client, 'ls /root/apps/pay/config/apps/ 2>/dev/null | head -5 || echo "NOT_FOUND"', check=False)
    if 'NOT_FOUND' not in pay_dirs:
        upload_file(sftp, os.path.join(BASE, '..', 'PayMatuByte', 'config', 'apps', 'matucourse.yaml'),
                    '/root/apps/pay/config/apps/matucourse.yaml')
        run(client, 'pm2 restart paymatubyte 2>/dev/null || pm2 restart pay 2>/dev/null || true', check=False)
        print('      PayMatuByte config deployed and restarted!')
    else:
        print(f'      PayMatuByte apps dir not found at /root/apps/pay/config/apps/ — skipping')
        print(f'      Existing dirs: {pay_dirs}')

    # Try SSL certificate
    print(f'\n[+] Attempting SSL certificate (certbot)...')
    certbot_out = run(client,
        'certbot --nginx -d matucourse.matubyte.com --non-interactive --agree-tos '
        '--email juanlandazuri@gmail.com 2>&1 | tail -5',
        check=False)
    print(f'      certbot: {certbot_out[:200]}')

    if 'Congratulations' in certbot_out or 'Successfully' in certbot_out or 'Certificate not yet due' in certbot_out:
        print('      SSL certificate obtained! Reloading nginx...')
        run(client, 'systemctl reload nginx 2>&1', check=False)
    elif 'DNS' in certbot_out or 'resolve' in certbot_out or 'Connection' in certbot_out:
        print('      SSL skipped — DNS not yet pointing to this server')
        print('      App available at http://matucourse.matubyte.com (HTTP only for now)')
    else:
        print(f'      certbot output: {certbot_out[:300]}')

    # Test the app is serving
    print(f'\n[+] Verifying app is running...')
    curl_out = run(client, 'curl -s -o /dev/null -w "%{http_code}" http://localhost:3030 2>&1 || echo "curl_failed"', check=False)
    print(f'      HTTP status on port 3030: {curl_out}')

    sftp.close()
    client.close()

    print('\n' + '=' * 60)
    print('Deployment complete!')
    print(f'  App dir: {REMOTE_APP_DIR}')
    print(f'  Port:    3030')
    print(f'  URL:     https://matucourse.matubyte.com (or http if SSL pending)')
    print('=' * 60)


if __name__ == '__main__':
    main()
