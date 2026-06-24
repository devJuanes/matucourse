"""
Finalize MatuCourse deployment: PM2 + SSL + PayMatuByte config.
"""
import sys
import io
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import paramiko

HOST = '13.140.160.248'
USER = 'root'
PASSWORD = 'Jesteban9091'
REMOTE_APP_DIR = '/root/apps/matucourse'
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def run(ssh, cmd, check=True, timeout=120):
    print(f'  $ {cmd}')
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    exit_code = stdout.channel.recv_exit_status()
    combined = (out + '\n' + err).strip()
    if combined:
        print(f'    {combined[:600]}')
    if check and exit_code != 0:
        raise RuntimeError(f'Command failed ({exit_code}): {cmd}\n{combined}')
    return out


def upload_file(sftp, local, remote):
    print(f'  Uploading {os.path.basename(local)} -> {remote}')
    sftp.put(local, remote)


def main():
    print('=' * 60)
    print('MatuCourse — Finalize Deployment')
    print('=' * 60)

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f'\n[1] Connecting to {HOST}...')
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    print('    Connected!')

    sftp = client.open_sftp()

    # Find global serve path
    print(f'\n[2] Finding serve binary...')
    serve_path = run(client, 'which serve 2>/dev/null || npm bin -g 2>/dev/null', check=False)
    if not serve_path or '\n' in serve_path:
        serve_path = run(client, 'ls /usr/local/bin/serve /usr/bin/serve 2>/dev/null | head -1', check=False)
    if not serve_path:
        serve_path = run(client, 'npm install -g serve 2>&1 | tail -2; which serve', check=False)

    global_serve = serve_path.strip().split('\n')[-1].strip()
    print(f'    serve found at: {global_serve}')

    # Install serve locally in app dir too (creates node_modules/.bin/serve symlink)
    print(f'\n[3] Installing serve locally in app dir...')
    run(client, f'cd {REMOTE_APP_DIR} && npm install --save serve 2>&1 | tail -5', check=False)
    run(client, f'ls {REMOTE_APP_DIR}/node_modules/.bin/serve 2>/dev/null && echo "serve symlink OK" || echo "NO symlink"', check=False)

    print(f'\n[4] Starting PM2...')
    run(client, f'cd {REMOTE_APP_DIR} && pm2 stop matucourse 2>/dev/null || true', check=False)
    run(client, f'cd {REMOTE_APP_DIR} && pm2 delete matucourse 2>/dev/null || true', check=False)
    run(client, f'cd {REMOTE_APP_DIR} && pm2 start ecosystem.config.cjs')
    run(client, 'pm2 save')

    print(f'\n[5] PM2 status:')
    run(client, 'pm2 list --no-color')

    print(f'\n[6] Test app on port 3030...')
    import time
    time.sleep(3)
    http_code = run(client, 'curl -s -o /dev/null -w "%{http_code}" http://localhost:3030 2>&1 || echo "FAIL"', check=False)
    print(f'    HTTP status on :3030 = {http_code}')

    print(f'\n[7] PayMatuByte config...')
    pay_files = run(client, 'ls /root/apps/pay/config/apps/ 2>/dev/null', check=False)
    print(f'    Existing pay app configs: {pay_files}')
    if pay_files and 'cannot' not in pay_files.lower():
        local_yaml = os.path.join(BASE, '..', 'PayMatuByte', 'config', 'apps', 'matucourse.yaml')
        norm = os.path.normpath(local_yaml)
        if os.path.exists(norm):
            upload_file(sftp, norm, '/root/apps/pay/config/apps/matucourse.yaml')
            run(client, 'pm2 list --no-color | grep -i pay', check=False)
            pm2_pay = run(client, 'pm2 list --no-color 2>/dev/null', check=False)
            pay_names = [line.split('│')[2].strip() for line in pm2_pay.split('\n') if '│' in line and 'pay' in line.lower()]
            if pay_names:
                run(client, f'pm2 restart {pay_names[0]} 2>/dev/null || true', check=False)
            else:
                run(client, 'pm2 restart paymatubyte 2>/dev/null || pm2 restart pay 2>/dev/null || true', check=False)
            print('    PayMatuByte config deployed!')
        else:
            print(f'    Local yaml not found at: {norm}')
    else:
        alt = run(client, 'find /root/apps/pay -name "*.yaml" 2>/dev/null | head -5', check=False)
        print(f'    Found yaml files: {alt}')

    print(f'\n[8] SSL Certificate...')
    certbot = run(client,
        'certbot --nginx -d matucourse.matubyte.com --non-interactive --agree-tos '
        '--email juanlandazuri@gmail.com 2>&1 | tail -10',
        check=False)
    print(f'    certbot output:\n{certbot[:500]}')

    if any(x in certbot for x in ['Congratulations', 'Certificate not yet due', 'Successfully received']):
        print('    SSL obtained! Reloading nginx...')
        run(client, 'systemctl reload nginx', check=False)
        final_url = 'https://matucourse.matubyte.com'
    elif any(x in certbot for x in ['DNS', 'resolve', 'Connection refused', 'Timeout']):
        print('    SSL skipped — DNS not yet pointing to this server')
        final_url = 'http://matucourse.matubyte.com'
    else:
        print('    SSL status unclear, continuing...')
        final_url = 'http://matucourse.matubyte.com'

    print(f'\n[9] Final nginx test...')
    run(client, 'nginx -t 2>&1', check=False)

    sftp.close()
    client.close()

    print('\n' + '=' * 60)
    print('DEPLOYMENT COMPLETE')
    print(f'  URL: {final_url}')
    print(f'  Internal: http://localhost:3030')
    print('=' * 60)


if __name__ == '__main__':
    main()
