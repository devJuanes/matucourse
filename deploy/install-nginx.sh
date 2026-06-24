#!/usr/bin/env bash
# Primera instalación de Nginx para matucourse.matubyte.com
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -f /etc/letsencrypt/live/matucourse.matubyte.com/fullchain.pem ]]; then
  SRC="$ROOT/deploy/nginx/matucourse.matubyte.com.conf"
else
  SRC="$ROOT/deploy/nginx/matucourse.matubyte.com.http.conf"
fi

echo "→ Instalando nginx site desde $SRC"
sudo cp "$SRC" /etc/nginx/sites-available/matucourse.matubyte.com
sudo ln -sf /etc/nginx/sites-available/matucourse.matubyte.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
echo "✓ Nginx listo para matucourse.matubyte.com"
