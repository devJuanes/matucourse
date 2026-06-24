"""Diagnóstico rápido matucourse en VPS."""
import io, os, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import paramiko

def pw():
    with open(os.path.join(os.path.dirname(__file__), 'deploy.py'), encoding='utf-8') as f:
        for line in f:
            if line.strip().startswith('PASSWORD ='):
                return line.split('=', 1)[1].strip().strip("'\"")
    return os.environ.get('MATUCOURSE_SSH_PASSWORD', '')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('13.140.160.248', username='root', password=pw(), timeout=30)
cmds = [
    'grep script /root/apps/matucourse/dist/index.html',
    'curl -sL http://127.0.0.1/ -H Host:matucourse.matubyte.com | grep script',
    'ls -la /root/apps/matucourse/dist/assets/index*.js 2>/dev/null | head -2',
]
for cmd in cmds:
    _, o, e = c.exec_command(cmd)
    print(cmd)
    print(o.read().decode() + e.read().decode())
c.close()
