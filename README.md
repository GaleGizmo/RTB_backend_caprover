# ROCK THE BARRIO — BACKEND

Backend de la API REST de [Rock The Barrio](https://www.rockthebarrio.es), construido con Node.js + Express y MongoDB.

## Descripción

API REST que da soporte a la plataforma Rock The Barrio. Gestiona eventos de música en directo, usuarios, comentarios, festivales, localizaciones y borradores, incluyendo envío de emails automáticos mediante cron jobs y generación de vistas previas para redes sociales (Open Graph).

---

## Entidades y rutas

### Eventos — `/evento`

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/` | Público |
| GET | `/eventosDesdeHoy` | Público |
| GET | `/eventosParaCalendar` | Público |
| POST | `/eventosEntreFechas` | Público |
| GET | `/getbyid/:idEvento` | Público |
| POST | `/` | Admin |
| PUT | `/:idEvento` | Admin |
| DELETE | `/:idEvento` | Admin |
| GET | `/sendEventosSemanales` | Interno (cron) |
| GET | `/remindEvento` | Interno (cron) |
| GET | `/sendEventosDiarios` | Admin |
| POST | `/correccion` | Admin |
| POST | `/updateSiteField` | Admin |

### Usuarios — `/usuario`

| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/register` | Público |
| POST | `/login` | Público |
| POST | `/recuperar-password` | Público |
| POST | `/reset-password` | Público |
| POST | `/message` | Público |
| PUT | `/:idUsuario` | Propietario / Admin |
| PUT | `/reset-password/unsubscribe/:idUsuario` | Propietario / Admin |
| DELETE | `/:idUsuario` | Propietario / Admin |
| PATCH | `/add-favorite` | Autenticado |

### Comentarios — `/comentario`

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/` | Público |
| GET | `/getbyevent/:eventId` | Público |
| GET | `/getbyuser/:userId` | Autenticado |
| POST | `/` | Autenticado |
| PUT | `/:idComentario` | Propietario / Admin |
| DELETE | `/:idComentario` | Propietario / Admin |

### Festivales — `/festival`

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/toDisplay` | Público |
| GET | `/nextFestivals` | Público |
| GET | `/getFestival/:id` | Público |
| GET | `/getFestivalEventos/:id` | Público |
| POST | `/createFestival` | Admin |

### Localizaciones — `/localizacion`

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/` | Público |
| POST | `/` | Admin |

### Borradores — `/borrador`

| Método | Ruta | Acceso |
|--------|------|--------|
| GET | `/` | Admin |
| GET | `/getbyid/:idBorrador` | Admin |
| POST | `/` | Admin |
| PUT | `/:idBorrador` | Admin |
| DELETE | `/:idBorrador` | Admin |

### Compartir — `/:shortURL`

Genera una respuesta con etiquetas Open Graph para bots de redes sociales (Facebook, Twitter, etc.) y redirige al frontend a los usuarios normales.

### Sitemap — `/sitemap.xml`

Genera el sitemap XML dinámico del sitio.

---

## Cron jobs

Se ejecutan únicamente en entornos no serverless (excluido Vercel):

- **Lunes** — Envío de la lista de eventos de la semana por email.
- **Periódico** — Recordatorio de eventos favoritos próximos a los usuarios suscritos.

---

## Variables de entorno

Crear un archivo `.env` en la raíz con las siguientes variables:

```env
PORT=3000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
CLOUD_NAME=...
API_KEY=...
API_SECRET=...
# Nodemailer / Gmail OAuth2
EMAIL_USER=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
```

---

## Instalación y desarrollo

```bash
npm install
npm run dev      # Servidor con nodemon
npm run start    # Servidor en producción
```

---

## Dependencias principales

| Librería | Uso |
|----------|-----|
| `express` | Framework HTTP |
| `mongoose` | ODM para MongoDB |
| `bcryptjs` | Hash de contraseñas |
| `jsonwebtoken` | Autenticación JWT |
| `cloudinary` + `multer` | Subida de imágenes |
| `nodemailer` + `googleapis` | Envío de emails (Gmail OAuth2) |
| `cron` | Tareas programadas |
| `luxon` | Manejo de fechas |
| `nanoid` | Generación de URLs cortas |
| `cors` | Política de CORS |
| `dotenv` | Variables de entorno |
| `concurrently` | Ejecución paralela de scripts |

---

## Despliegue

Desplegado en **CapRover** con Node.js 22 (`captain-definition`).

