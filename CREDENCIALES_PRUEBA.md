# 🔐 Credenciales de Prueba - Sistema SAA

## Usuarios Disponibles

### 👨‍🏫 Instructor
- **Usuario**: `instructor`
- **Contraseña**: `123456`
- **Nombre**: Fabian Hernandez
- **Rol**: Instructor
- **Acceso**: Puede acceder a todas las funcionalidades del sistema

### 👩‍💼 Coordinador
- **Usuario**: `coordinador`
- **Contraseña**: `123456`
- **Rol**: Coordinador
- **Acceso**: Puede acceder a todas las funcionalidades del sistema

### 👨‍🎓 Aprendiz (Solo para pruebas)
- **Usuario**: `aprendiz`
- **Contraseña**: `123456`
- **Rol**: Aprendiz
- **Acceso**: No puede acceder al sistema (solo instructores y coordinadores)

## 🚀 Cómo Probar el Sistema

### 1. Poblar la Base de Datos
```bash
curl -X POST http://localhost:3000/api/seed
```

### 2. Iniciar el Servidor
```bash
npm run dev
```

### 3. Acceder al Login
- Ir a: `http://localhost:3000/login`
- Usar las credenciales de instructor o coordinador

### 4. Probar la API de Login
```bash
# Login como instructor
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usemame": "instructor", "Contrasenia": "123456"}'

# Login como coordinador
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usemame": "coordinador", "Contrasenia": "123456"}'
```

## 🔒 Características de Seguridad

- ✅ Autenticación con JWT
- ✅ Protección de rutas por roles
- ✅ Middleware de autenticación
- ✅ Solo instructores y coordinadores pueden acceder
- ✅ Tokens con expiración (24 horas)
- ✅ Redirección automática al login

## 📋 Rutas Protegidas

- `/admin` - Panel de administración
- `/estadisticas` - Estadísticas del sistema
- `/crear-aprendiz` - Crear nuevos aprendices
- `/modificar-aprendiz` - Modificar aprendices

## 🛠️ Endpoints de API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/login` - Verificar token

### Base de Datos
- `GET /api/database` - Verificar conexión
- `POST /api/seed` - Poblar base de datos

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuarios

## 🔧 Configuración

### Variables de Entorno (.env)
```env
DATABASE_URL="mysql://root:123456789@localhost:3306/saa_database"
JWT_SECRET="mi-secreto-super-seguro-para-jwt-cambiar-en-produccion"
NODE_ENV=development
```

## 📝 Notas Importantes

- En producción, cambiar el JWT_SECRET por uno más seguro
- Las contraseñas están en texto plano (implementar bcrypt en producción)
- Los tokens expiran en 24 horas
- El sistema redirige automáticamente al login si no hay autenticación
