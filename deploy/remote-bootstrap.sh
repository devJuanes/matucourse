#!/usr/bin/env bash
# Desde tu PC (Git Bash / WSL): ejecuta bootstrap en el VPS vía SSH.
# Requiere: ssh root@IP sin contraseña, o export MATUCOURSE_SSH_PASSWORD
set -euo pipefail

HOST="${MATUCOURSE_SSH_HOST:-13.140.160.248}"
USER="${MATUCOURSE_SSH_USER:-root}"
APP_DIR="${MATUCOURSE_APP_DIR:-/root/apps/matucourse}"
REPO_URL="${MATUCOURSE_REPO:-https://github.com/devJuanes/matucourse.git}"

SSH_OPTS=(-o StrictHostKeyChecking=accept-new)

run_remote() {
  if [[ -n "${MATUCOURSE_SSH_PASSWORD:-}" ]]; then
    command -v sshpass &>/dev/null || { echo "Instala sshpass o usa clave SSH"; exit 1; }
    sshpass -p "$MATUCOURSE_SSH_PASSWORD" ssh "$SSH_OPTS" "${USER}@${HOST}" "$@"
  else
    ssh "$SSH_OPTS" "${USER}@${HOST}" "$@"
  fi
}

echo "→ Bootstrap MatuCourse en ${USER}@${HOST}"

run_remote "set -euo pipefail
BACKUP_ENV=''
if [[ -f ${APP_DIR}/.env ]]; then
  BACKUP_ENV=\$(mktemp)
  cp ${APP_DIR}/.env \"\$BACKUP_ENV\"
fi
rm -rf ${APP_DIR}
git clone ${REPO_URL} ${APP_DIR}
cd ${APP_DIR}
if [[ -n \"\$BACKUP_ENV\" ]] && [[ -f \"\$BACKUP_ENV\" ]]; then
  cp \"\$BACKUP_ENV\" .env
  rm -f \"\$BACKUP_ENV\"
fi
chmod +x deploy/*.sh
bash deploy/deploy.sh
"

echo "✓ Servidor actualizado desde GitHub"
