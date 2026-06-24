#!/usr/bin/env bash
# Despliegue MatuCourse en ~/apps/matucourse (matucourse.matubyte.com)
# Ejecutar EN EL SERVIDOR: bash deploy/deploy.sh
# Desde tu PC: python deploy/remote-deploy.py
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SKIP_BUILD=false
SKIP_DEPS=false
for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=true ;;
    --skip-deps) SKIP_DEPS=true ;;
  esac
done

echo "→ MatuCourse deploy en $ROOT"

if [[ ! -f .env ]]; then
  if [[ -f .env.production ]]; then
    echo "→ Copiando .env.production → .env"
    cp .env.production .env
  else
    echo "ERROR: Crea .env (copia .env.production)"
    exit 1
  fi
fi

export npm_config_fetch_retries=5
export npm_config_fetch_retry_mintimeout=20000
export npm_config_fetch_retry_maxtimeout=120000

run_retry() {
  local label="$1"
  shift
  local max=4
  local n=1
  while [[ $n -le $max ]]; do
    echo "→ $label (intento $n/$max)"
    if "$@"; then
      return 0
    fi
    if [[ $n -eq $max ]]; then
      echo "ERROR: $label falló tras $max intentos"
      return 1
    fi
    echo "   Reintentando en 8s..."
    sleep 8
    n=$((n + 1))
  done
}

if [[ "$SKIP_DEPS" == false ]]; then
  if [[ -d node_modules ]]; then
    echo "→ node_modules OK"
  else
    run_retry "npm ci" npm ci || run_retry "npm ci --ignore-scripts" npm ci --ignore-scripts
  fi
fi

if [[ "$SKIP_BUILD" == false ]]; then
  echo "→ build"
  npm run build
fi

if [[ ! -f dist/index.html ]]; then
  echo "ERROR: dist/index.html no existe. Ejecuta npm run build."
  exit 1
fi

if grep -q '/src/main.ts' dist/index.html; then
  echo "ERROR: dist/index.html es de desarrollo (contiene /src/main.ts). Revisa npm run build."
  exit 1
fi

# Producción: Nginx sirve dist/ directamente (no PM2 serve)
if [[ -f /etc/nginx/sites-available/matucourse.matubyte.com ]] || [[ -d /etc/nginx/sites-enabled ]]; then
  NGINX_CONF="$ROOT/deploy/nginx/matucourse.matubyte.com.conf"
  if [[ ! -f /etc/letsencrypt/live/matucourse.matubyte.com/fullchain.pem ]]; then
    NGINX_CONF="$ROOT/deploy/nginx/matucourse.matubyte.com.http.conf"
  fi
  echo "→ Nginx: $NGINX_CONF"
  sudo cp "$NGINX_CONF" /etc/nginx/sites-available/matucourse.matubyte.com
  sudo ln -sf /etc/nginx/sites-available/matucourse.matubyte.com /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl reload nginx
  # PM2 serve ya no se usa; evita que siga sirviendo index.html de desarrollo
  pm2 stop matucourse 2>/dev/null || true
  pm2 delete matucourse 2>/dev/null || true
  pm2 save 2>/dev/null || true
else
  echo "→ Nginx no configurado; fallback PM2 serve (solo desarrollo en servidor)"
  if [[ ! -x node_modules/.bin/serve ]]; then
    npm install serve --no-save
  fi
  if pm2 describe matucourse &>/dev/null; then
    pm2 restart matucourse --update-env
  else
    pm2 start ecosystem.config.cjs
  fi
  pm2 save
fi

HTTP_CODE="000"
if command -v curl &>/dev/null; then
  HTTP_CODE="$(curl -s -o /dev/null -w '%{http_code}' -k https://matucourse.matubyte.com/ 2>/dev/null || curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/ 2>/dev/null || echo '000')"
fi
echo "→ Health https://matucourse.matubyte.com → HTTP $HTTP_CODE"

PAY_DIR="${PAYMATUBYTE_DIR:-/root/apps/pay}"
if [[ -d "$PAY_DIR/config/apps" ]]; then
  for yaml in "$ROOT/deploy/matucourse-pay.yaml" "$ROOT/../PayMatuByte/config/apps/matucourse.yaml"; do
    if [[ -f "$yaml" ]]; then
      echo "→ PayMatuByte config"
      cp "$yaml" "$PAY_DIR/config/apps/matucourse.yaml"
      pm2 restart paymatubyte 2>/dev/null || pm2 restart pay 2>/dev/null || true
      break
    fi
  done
fi

echo "✓ MatuCourse desplegado — https://matucourse.matubyte.com"
echo "  Archivos: $ROOT/dist"
