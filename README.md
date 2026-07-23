# Monitor Meteorológico Interactivo

Aplicación fullstack para mostrar datos meteorológicos en un monitor de hall con carrusel automático de pantallas informativas.

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL 15
- **Gráficas**: Recharts
- **Orquestación**: Docker Compose

## Requisitos

- Docker
- Docker Compose
- Git

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd meteo
```

### 2. Configurar variables de entorno

```bash
# El archivo .env ya está configurado con valores de desarrollo
# Para producción, actualizar .env con valores seguros
```

### 3. Levantar los servicios

```bash
docker-compose up -d
```

Los servicios estarán disponibles en:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **PostgreSQL**: localhost:5432

### 4. Acceder a la aplicación

- **Pantalla Monitor**: http://localhost:3000
- **Panel Admin**: http://localhost:3000/admin
  - Usuario: `admin`
  - Contraseña: `admin123`

## Estructura del Proyecto

```
meteo/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── scripts/
│   │   └── init.sql
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml
├── .env
└── README.md
```

## Desarrollo Local

### Detener servicios
```bash
docker-compose down
```

### Ver logs
```bash
docker-compose logs -f <service-name>
# Ej: docker-compose logs -f backend
```

### Eliminar datos (reiniciar BD)
```bash
docker-compose down -v
docker-compose up -d
```

## Pantallas Planeadas

### Pantalla 1: Meteorológica
- **Izquierda**: Datos numéricos (temperatura máx/mín, humedad, presión, precipitación)
- **Derecha**: Gráficas históricas (temperatura lineal, precipitación barras, humedad/presión área)
- **Rotación**: Cada 10 segundos

### Pantalla 2: (Próximamente)

## API Endpoints

### Públicos
- `GET /api/weather/current` - Último registro meteorológico
- `GET /api/weather/monthly` - Histórico últimos 30 días

### Protegidos (Admin)
- `POST /api/admin/weather` - Crear nuevo registro
- `GET /api/admin/weather/history` - Ver todos los registros
- `PUT /api/admin/weather/:id` - Actualizar registro
- `DELETE /api/admin/weather/:id` - Eliminar registro

### Autenticación
- `POST /api/auth/login` - Login admin (retorna JWT)

## Notas de Desarrollo

- Los cambios en `src/` se reflejan en vivo (HMR habilitado en frontend, nodemon en backend)
- JWT se almacena en `localStorage` en el navegador
- Tokens expiran después de 24 horas (configurable)
- Base de datos persiste en volumen Docker `postgres_data`

## Próximos Pasos

1. Implementar endpoints REST backend
2. Crear componentes frontend (WeatherCard, WeatherChart, Carousel)
3. Configurar autenticación JWT
4. Implementar panel admin
5. Testing y validación

## Soporte

Para reportar problemas, crear un issue en el repositorio.
