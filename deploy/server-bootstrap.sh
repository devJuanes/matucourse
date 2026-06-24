#!/usr/bin/env bash
# Clona MatuCourse desde GitHub y despliega (primera vez o reinstalación limpia).
# Ejecutar EN EL SERVIDOR como root:
#   bash deploy/server-bootstrap.sh
#
# O desde la raíz del repo ya clonado:
#   bash deploy/server-bootstrap.sh --reinstall
set -euo pipefail

REPO_URL="${MATUCOURSE_REPO:-https://github.com/devJuanes/matucourse.git}"
APP_DIR="${MATUCOURSE_APP_DIR:-/root/apps/matucourse}"
REINSTALL=false

for arg in "$@"; do
  case "$arg" in
    --reinstall) REINSTALL=true ;;
  esac
done

BACKUP_ENV=""
if [[ -f "$APP_DIR/.env" ]]; then
  BACKUP_ENV="$(mktemp)"
  cp "$APP_DIR/.env" "$BACKUP_ENV"
  echo "→ Respaldo .env en $BACKUP_ENV"
fi

if [[ "$REINSTALL" == true ]] || [[ ! -d "$APP_DIR/.git" ]]; then
  echo "→ Eliminando $APP_DIR y clonando $REPO_URL"
  rm -rf "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
else
  echo "→ Actualizando repo en $APP_DIR"
  cd "$APP_DIR"
  git fetch origin
  git checkout main
  git pull origin main
fi

cd "$APP_DIR"

if [[ -n "$BACKUP_ENV" ]] && [[ -f "$BACKUP_ENV" ]]; then
  cp "$BACKUP_ENV" .env
  rm -f "$BACKUP_ENV"
elif [[ ! -f .env ]]; then
  if [[ -f .env.production ]]; then
    cp .env.production .env
  elif [[ -f .env.example ]]; then
    echo "WARN: Crea .env desde .env.example con Firebase y PayMatuByte"
    cp .env.example .env
  else
    echo "ERROR: No hay .env — copia .env.example y configura variables"
    exit 1
  fi
fi

chmod +x deploy/*.sh 2>/dev/null || true
bash deploy/deploy.sh

echo "✓ MatuCourse listo desde GitHub — https://matucourse.matubyte.com"
