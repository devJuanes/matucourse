#!/usr/bin/env bash
# SSL Let's Encrypt para matucourse.matubyte.com
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

sudo cp "$ROOT/deploy/nginx/matucourse.matubyte.com.http.conf" /etc/nginx/sites-available/matucourse.matubyte.com
sudo ln -sf /etc/nginx/sites-available/matucourse.matubyte.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d matucourse.matubyte.com \
  --non-interactive --agree-tos \
  --email "${CERTBOT_EMAIL:-juanlandazuri@gmail.com}"

sudo cp "$ROOT/deploy/nginx/matucourse.matubyte.com.conf" /etc/nginx/sites-available/matucourse.matubyte.com
sudo nginx -t && sudo systemctl reload nginx

echo "✓ SSL activo — https://matucourse.matubyte.com"
