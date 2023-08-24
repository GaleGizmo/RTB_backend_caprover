# ROCK_DE_BARRIO_BACKEND
Backend del proyecto Rock The Barrio.

## Descripción
Backend de la API de Rock The Barrio, programada en Node y atacando a una base de datos en MongoDb. En la carpeta api tenemos rutas y controladores para las siguientes entidades:

### Eventos

-Ver lista de eventos: cualquier usuario
-Ver detalles de eventos: cualquier usuario
-Crear evento:  admin
-Editar evento:  admin
-Borrar evento:  admin

Rutas asociadas a eventos Cron:
-Enviar lista de eventos semanales cada lunes
-Enviar recordatorio de eventos favoritos próximos
### Usuarios

-Crear usuario
-Loguearse
-Añadir/eliminar evento de favoritos:  usuarios logueados
-Borrar cuenta:  propietario o admin
-Enviar email de recuperación de contraseña
-Editar datos de usuario:  propietario o admin
-Editar suscripciones a notificaciones de eventos:  propietario o admin

### Comentarios

-Ver comentarios: cualquier usuario
-Añadir comentario/valoración: usuario logueado
-Editar comentario/valoración: propietario o admin
-Borrar comentario/valoración: propietario o admin


## LIBRERIAS.

En este backend se utilizan:
### Bcrypt
### Cloudinary
### Cors
### Dotenv
### express
### googleapis
### jasonwebtoken
### mongoose
### multer
### node-cron
### nodemailer
### nodemon

## DESPLIEGUE EN VERCEL:
[Backend](https://rock-de-barrio-backend.vercel.app/)

