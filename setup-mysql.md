# Configuración de MySQL con Prisma

## 📋 Pasos para configurar MySQL

### 1. Instalar MySQL

#### En macOS (usando Homebrew):
```bash
brew install mysql
brew services start mysql
```

#### En Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### En Windows:
Descarga e instala MySQL desde: https://dev.mysql.com/downloads/mysql/

### 2. Configurar MySQL

```bash
# Acceder a MySQL como root
mysql -u root -p

# Crear base de datos
CREATE DATABASE saa_database;

# Crear usuario (opcional)
CREATE USER 'saa_user'@'localhost' IDENTIFIED BY 'tu_contraseña';
GRANT ALL PRIVILEGES ON saa_database.* TO 'saa_user'@'localhost';
FLUSH PRIVILEGES;

# Salir de MySQL
EXIT;
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Database Configuration
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/saa_database"

# Ejemplos:
# Para usuario root: DATABASE_URL="mysql://root:tu_password@localhost:3306/saa_database"
# Para usuario personalizado: DATABASE_URL="mysql://saa_user:tu_contraseña@localhost:3306/saa_database"

# Variables de entorno adicionales
NODE_ENV=development
```

### 4. Instalar dependencias de Prisma

```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear las tablas en la base de datos
npx prisma db push

# (Opcional) Ver la base de datos en el navegador
npx prisma studio
```

### 5. Verificar la conexión

```bash
# Verificar el estado de la conexión
curl http://localhost:3000/api/database

# Crear un usuario de prueba
curl -X POST http://localhost:3000/api/database \
  -H "Content-Type: application/json" \
  -d '{"name": "Usuario Prueba", "email": "test@example.com", "password": "password123"}'

# Listar usuarios
curl http://localhost:3000/api/users
```

## 🔧 Comandos útiles de Prisma

```bash
# Generar cliente de Prisma
npx prisma generate

# Sincronizar schema con la base de datos
npx prisma db push

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones
npx prisma migrate deploy

# Ver base de datos en navegador
npx prisma studio

# Resetear base de datos
npx prisma migrate reset

# Ver logs de Prisma
npx prisma db seed
```

## 📊 Estructura de la base de datos

El schema incluye los siguientes modelos:

### User (Usuarios)
- `id`: ID único
- `email`: Email único
- `name`: Nombre del usuario
- `password`: Contraseña (hashear en producción)
- `role`: Rol (USER, ADMIN, MODERATOR)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización

### Post (Publicaciones)
- `id`: ID único
- `title`: Título del post
- `content`: Contenido del post
- `published`: Estado de publicación
- `authorId`: ID del autor
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización

### Comment (Comentarios)
- `id`: ID único
- `content`: Contenido del comentario
- `postId`: ID del post
- `authorId`: ID del autor
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización

## 🚨 Solución de problemas

### Error de conexión
- Verificar que MySQL esté corriendo
- Verificar credenciales en DATABASE_URL
- Verificar que la base de datos exista

### Error de permisos
- Verificar que el usuario tenga permisos en la base de datos
- Ejecutar `GRANT ALL PRIVILEGES ON database_name.* TO 'user'@'localhost';`

### Error de puerto
- Verificar que MySQL esté corriendo en el puerto 3306
- Cambiar puerto en DATABASE_URL si es necesario

## 📝 Notas importantes

- En producción, siempre hashear las contraseñas
- Usar variables de entorno para las credenciales
- Configurar backups regulares de la base de datos
- Monitorear el rendimiento de las consultas
