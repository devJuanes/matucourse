# Despliegue MatuCourse — matucourse.matubyte.com

Repositorio: `c:\MatuStudio\matucourse` (servidor: `/root/apps/matucourse`)

## Arquitectura

```text
Usuario → Nginx (443) → /root/apps/matucourse/dist (SPA estática)
Backend: Firebase Auth + Firestore (VITE_USE_FIREBASE=true)
Pagos: PayMatuByte → pay.matubyte.com
```

| URL | Uso |
|-----|-----|
| `https://matucourse.matubyte.com` | App Vue (SPA) |
| `/root/apps/matucourse/dist` | Build de producción (Nginx `root`) |

---

## 1. DNS

Registro **A**:

```text
matucourse.matubyte.com  →  IP del VPS
```

---

## 2. Clonar en el servidor

```bash
cd ~/apps
git clone <repo-matucourse> matucourse
cd matucourse
cp .env.production .env   # o edita .env con Firebase + PayMatuByte
```

---

## 3. Primera vez (nginx + SSL)

```bash
chmod +x deploy/*.sh
bash deploy/install-nginx.sh
sudo bash deploy/setup-ssl.sh   # cuando DNS ya apunta al VPS
```

---

## 4. Deploy habitual (en el servidor)

```bash
cd ~/apps/matucourse
git pull
bash deploy/deploy.sh
```

El script hace: `npm ci` → `npm run build` → `pm2 restart matucourse`.

---

## 5. Deploy desde tu PC (build local + servidor)

Con Python y `paramiko` (contraseña por variable de entorno):

```bash
cd c:\MatuStudio\matucourse
npm run build
set MATUCOURSE_SSH_PASSWORD=tu_password
python deploy/remote-deploy.py
```

O solo subir `dist/` ya compilado:

```bash
python deploy/remote-deploy.py --skip-build
```

---

## 6. Variables de entorno (.env en servidor)

Obligatorias en producción:

- `VITE_USE_FIREBASE=true`
- `VITE_FIREBASE_*` (API key, project id, etc.)
- `VITE_PAYMATUBYTE_URL=https://pay.matubyte.com`
- `VITE_PAYMATUBYTE_API_KEY=pk_matucourse_live_...`

---

## 7. Comandos útiles

```bash
pm2 list
pm2 logs matucourse
curl -I http://127.0.0.1:3030
sudo nginx -t && sudo systemctl reload nginx
```

---

## Nota: Firebase Hosting vs VPS

- **VPS** (`deploy.sh`): sirve la SPA con `serve` + Nginx → `matucourse.matubyte.com`
- **Firebase Hosting** (`firebase deploy`): alternativa; no reemplaza el VPS si el dominio apunta al servidor

Para producción en el dominio principal, usa **`bash deploy/deploy.sh`** en el VPS.
