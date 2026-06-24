# Deploy — CarConfig monorepo

Backend su **Render** (Laravel) e frontend su **Vercel** (React/Vite), stesso repository GitHub con **Root Directory** diversa per servizio.

## Ordine di deploy

1. **Backend** su Render (API + PostgreSQL)
2. **Frontend** su Vercel
3. Aggiorna **`FRONTEND_URL`** su Render con l’URL Vercel definitivo e ridistribuisci il backend

## Backend — Render

### Collegare il repository

1. [Render Dashboard](https://dashboard.render.com) → **New** → **PostgreSQL** (o usa il blueprint `render.yaml` in root)
2. **New** → **Web Service** → connetti il repo GitHub
3. Impostazioni principali:
   - **Root Directory:** `carconfig_backend`
   - **Build Command:**
     ```bash
     php artisan config:cache && php artisan route:cache && php artisan migrate --force && php artisan storage:link
     ```
   - **Start Command:**
     ```bash
     php artisan serve --host=0.0.0.0 --port=$PORT
     ```
   - **Health Check Path:** `/up`

### Runtime PHP su Render

Render **non** supporta un runtime PHP nativo. Il repo include `carconfig_backend/Dockerfile` per il deploy Docker.

Impostazioni Render:
- **Root Directory:** `carconfig_backend`
- **Dockerfile Path:** `./Dockerfile`
- **Runtime:** Docker

### Variabili d’ambiente (Render)

| Variabile | Esempio / note |
|-----------|----------------|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | `php artisan key:generate --show` (locale) |
| `APP_URL` | `https://tuo-api.onrender.com` (URL pubblico Render) |
| `FRONTEND_URL` | `https://tuo-app.vercel.app` (URL Vercel, senza slash finale) |
| `DB_CONNECTION` | `pgsql` |
| `DB_URL` | Internal Database URL da Render Postgres |
| `LOG_CHANNEL` | `stderr` (consigliato su Render) |
| `MAIL_MAILER` | es. `smtp` |
| `MAIL_HOST` | host SMTP |
| `MAIL_PORT` | es. `587` |
| `MAIL_USERNAME` | utente SMTP |
| `MAIL_PASSWORD` | password SMTP |
| `MAIL_ENCRYPTION` | es. `tls` |
| `MAIL_FROM_ADDRESS` | email mittente verificata |
| `MAIL_FROM_NAME` | `${APP_NAME}` |

`FRONTEND_URL` è usato da CORS (`config/cors.php`), link email verify/reset e redirect post-verifica.

### Storage e upload

`php artisan storage:link` crea il symlink `public/storage` → `storage/app/public` e permette di servire file via `{APP_URL}/storage/...`.

Su Render il **filesystem è effimero**: file caricati in `storage/app/public` si perdono ai redeploy. Per upload persistenti (immagini veicoli, optional, ecc.) serve storage esterno (es. **S3**) — non configurato in questo repo.

### Test backend

- Health check: `GET https://tuo-api.onrender.com/up` → `200 OK`

---

## Frontend — Vercel

### Collegare il repository

1. [Vercel Dashboard](https://vercel.com) → **Add New** → **Project** → importa il repo GitHub
2. Impostazioni:
   - **Root Directory:** `carconfig_frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist`

`vercel.json` configura il rewrite SPA per React Router (tutte le route → `/index.html`).

### Variabili d’ambiente (Vercel)

| Variabile | Esempio |
|-----------|---------|
| `VITE_BACKEND_URL` | `https://tuo-api.onrender.com` (senza slash finale) |

Il client API usa `VITE_BACKEND_URL + '/api'` (vedi `src/lib/env.ts`).

### Ignored Build Step (opzionale)

Per evitare build quando cambia solo il backend, in **Project Settings → Git → Ignored Build Step**:

```bash
git diff HEAD^ HEAD --quiet carconfig_frontend/
```

Exit `0` = nessuna modifica in `carconfig_frontend/` → Vercel salta la build.

### Test frontend

- Apri l’URL Vercel e prova **login** / **register**
- Verifica che le chiamate API vadano al dominio Render (Network tab)

---

## Blueprint Render (`render.yaml`)

Il file in root definisce database PostgreSQL e web service con `rootDir: carconfig_backend`. Dopo il primo deploy manuale puoi sincronizzare il Blueprint da Render se aggiungi un `Dockerfile` per PHP (requisito Render per Laravel).
