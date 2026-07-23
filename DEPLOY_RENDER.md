# Guía de Despliegue en Render

## Pasos para desplegar tu aplicación Meteo en Render

### 1. Preparar el repositorio GitHub

```bash
cd /home/jpalacios/other_projects/meteo

# Inicializar git si no lo has hecho
git init
git add .
git commit -m "Initial commit: meteo app"

# Crear repositorio en GitHub y subir
git remote add origin https://github.com/TU_USUARIO/meteo.git
git branch -M main
git push -u origin main
```

### 2. Crear servicios en Render (en orden)

#### A. PostgreSQL Database
1. Ve a https://dashboard.render.com
2. Clic en **"New +"** → **"PostgreSQL"**
3. Completa los datos:
   - **Name**: `meteo-db`
   - **Database**: `meteo_db`
   - **User**: `meteo_user`
   - Render genera contraseña automáticamente ✓
4. **GUARDAR** la `Internal Database URL` (formato: `postgres://user:pass@host:5432/db`)

#### B. Backend (Node.js + Express)
1. Clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio GitHub (`meteo`)
3. Completa:
   - **Name**: `meteo-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`

4. Ve a **"Environment"** y añade estas variables:
   ```
   NODE_ENV=production
   API_PORT=10000
   DB_HOST=<host desde Internal Database URL>
   DB_PORT=5432
   DB_USER=meteo_user
   DB_PASSWORD=<password desde Internal Database URL>
   DB_NAME=meteo_db
   JWT_SECRET=<genera un string seguro, ej: openssl rand -base64 32>
   FRONTEND_URL=https://meteo-frontend.onrender.com
   ```

5. Deploy (espera a que termine)

#### C. Frontend (React + Vite)
1. Clic en **"New +"** → **"Static Site"**
2. Conecta tu repositorio GitHub
3. Completa:
   - **Name**: `meteo-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/dist`

4. Ve a **"Environment"** y añade:
   ```
   VITE_API_URL=https://meteo-backend.onrender.com
   ```

5. Deploy ✓

### 3. Variables de Entorno - Referencias

| Variable | Backend | Frontend | Valor |
|----------|---------|----------|-------|
| `NODE_ENV` | ✓ | | `production` |
| `API_PORT` | ✓ | | `10000` |
| `DB_HOST` | ✓ | | Desde Render PostgreSQL |
| `DB_PORT` | ✓ | | `5432` |
| `DB_USER` | ✓ | | `meteo_user` |
| `DB_PASSWORD` | ✓ | | Contraseña de BD |
| `DB_NAME` | ✓ | | `meteo_db` |
| `JWT_SECRET` | ✓ | | String seguro |
| `FRONTEND_URL` | ✓ | | `https://meteo-frontend.onrender.com` |
| `VITE_API_URL` | | ✓ | `https://meteo-backend.onrender.com` |

### 4. URLs de tu aplicación desplegada

Una vez completes el despliegue:
- **Frontend**: `https://meteo-frontend.onrender.com`
- **Backend**: `https://meteo-backend.onrender.com`
- **API**: `https://meteo-backend.onrender.com/api`

### 5. Prueba la aplicación

- Accede a https://meteo-frontend.onrender.com
- Panel Admin: `/admin` (usuario: `admin`, contraseña: `admin123`)
- Health check: `https://meteo-backend.onrender.com/health`

### 6. Solución de problemas

**Si el frontend no se conecta al backend:**
- Verifica que `VITE_API_URL` esté configurado correctamente en el frontend
- Revisa los logs del backend: `https://dashboard.render.com` → tu servicio → "Logs"

**Si hay error de base de datos:**
- Verifica las credenciales en el backend
- Comprueba que la BD esté corriendo (status en Render)
- Revisa que `DB_HOST` sea correcto (copy-paste desde "Internal Database URL")

**Reiniciar servicios:**
- Dashboard Render → tu servicio → "Reconnect" o "Redeploy"

---

**¿Ya no quieres usar Docker localmente?**
Puedes eliminar `docker-compose.yml` en Render, ya que cada servicio está separado. Pero es útil mantenerlo para desarrollo local.
