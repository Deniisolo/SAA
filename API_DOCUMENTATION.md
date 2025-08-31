# API de Prueba - Documentación

Este proyecto incluye APIs de prueba para desarrollo y testing.

## Endpoints Disponibles

### 1. `/api/hello`

**GET** - Endpoint simple de Hello World
- **URL**: `http://localhost:3000/api/hello`
- **Método**: GET
- **Respuesta**:
```json
{
  "message": "Hello World!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success"
}
```

**POST** - Endpoint POST de Hello World
- **URL**: `http://localhost:3000/api/hello`
- **Método**: POST
- **Respuesta**:
```json
{
  "message": "Hello World desde POST!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success"
}
```

### 2. `/api/test`

**GET** - Obtener datos con parámetros
- **URL**: `http://localhost:3000/api/test?name=TuNombre`
- **Método**: GET
- **Parámetros**:
  - `name` (opcional): Nombre del usuario
- **Respuesta**:
```json
{
  "message": "¡Hola TuNombre!",
  "method": "GET",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success",
  "data": {
    "id": 1,
    "name": "TuNombre",
    "description": "Esta es una API de prueba"
  }
}
```

**POST** - Enviar datos
- **URL**: `http://localhost:3000/api/test`
- **Método**: POST
- **Body** (JSON):
```json
{
  "nombre": "Juan",
  "edad": 25,
  "ciudad": "Madrid"
}
```
- **Respuesta**:
```json
{
  "message": "Datos recibidos correctamente",
  "method": "POST",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success",
  "receivedData": {
    "nombre": "Juan",
    "edad": 25,
    "ciudad": "Madrid"
  }
}
```

**PUT** - Actualizar datos
- **URL**: `http://localhost:3000/api/test`
- **Método**: PUT
- **Body** (JSON):
```json
{
  "id": 1,
  "nombre": "Juan Actualizado",
  "edad": 26
}
```
- **Respuesta**:
```json
{
  "message": "Datos actualizados correctamente",
  "method": "PUT",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success",
  "updatedData": {
    "id": 1,
    "nombre": "Juan Actualizado",
    "edad": 26
  }
}
```

**DELETE** - Eliminar datos
- **URL**: `http://localhost:3000/api/test?id=123`
- **Método**: DELETE
- **Parámetros**:
  - `id`: ID del elemento a eliminar
- **Respuesta**:
```json
{
  "message": "Elemento con ID 123 eliminado correctamente",
  "method": "DELETE",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success"
}
```

## Cómo Probar las APIs

### 1. Con el navegador
Simplemente visita `http://localhost:3000/api/hello` en tu navegador para probar el endpoint GET.

### 2. Con curl
```bash
# GET request
curl http://localhost:3000/api/hello

# GET con parámetros
curl "http://localhost:3000/api/test?name=Denis"

# POST request
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan", "edad": 25}'

# PUT request
curl -X PUT http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "nombre": "Juan Actualizado"}'

# DELETE request
curl -X DELETE "http://localhost:3000/api/test?id=123"
```

### 3. Con Postman o similar
Importa las URLs y métodos correspondientes en tu cliente HTTP preferido.

### 3. `/api/database`

**GET** - Verificar conexión a MySQL
- **URL**: `http://localhost:3000/api/database`
- **Método**: GET
- **Respuesta**:
```json
{
  "message": "Estado de la conexión a MySQL",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "connected",
  "details": "Base de datos conectada"
}
```

**POST** - Crear usuario
- **URL**: `http://localhost:3000/api/database`
- **Método**: POST
- **Body** (JSON):
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```
- **Respuesta**:
```json
{
  "message": "Usuario creado correctamente",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "USER",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**PUT** - Actualizar usuario
- **URL**: `http://localhost:3000/api/database`
- **Método**: PUT
- **Body** (JSON):
```json
{
  "id": 1,
  "name": "Juan Pérez Actualizado",
  "email": "juan.nuevo@example.com"
}
```

**DELETE** - Eliminar usuario
- **URL**: `http://localhost:3000/api/database?id=1`
- **Método**: DELETE

### 4. `/api/users`

**GET** - Listar usuarios con paginación
- **URL**: `http://localhost:3000/api/users?page=1&limit=10&search=juan&role=USER`
- **Método**: GET
- **Parámetros**:
  - `page` (opcional): Número de página
  - `limit` (opcional): Elementos por página
  - `search` (opcional): Buscar por nombre o email
  - `role` (opcional): Filtrar por rol
- **Respuesta**:
```json
{
  "message": "Usuarios obtenidos correctamente",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success",
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**POST** - Crear múltiples usuarios
- **URL**: `http://localhost:3000/api/users`
- **Método**: POST
- **Body** (JSON):
```json
{
  "users": [
    {
      "name": "Usuario 1",
      "email": "user1@example.com",
      "password": "password123",
      "role": "USER"
    },
    {
      "name": "Usuario 2",
      "email": "user2@example.com",
      "password": "password123",
      "role": "ADMIN"
    }
  ]
}
```

## Cómo Probar las APIs

### 1. Con el navegador
Simplemente visita `http://localhost:3000/api/hello` en tu navegador para probar el endpoint GET.

### 2. Con curl
```bash
# GET request
curl http://localhost:3000/api/hello

# GET con parámetros
curl "http://localhost:3000/api/test?name=Denis"

# POST request
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Juan", "edad": 25}'

# PUT request
curl -X PUT http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "nombre": "Juan Actualizado"}'

# DELETE request
curl -X DELETE "http://localhost:3000/api/test?id=123"

# Verificar conexión a MySQL
curl http://localhost:3000/api/database

# Crear usuario
curl -X POST http://localhost:3000/api/database \
  -H "Content-Type: application/json" \
  -d '{"name": "Usuario Prueba", "email": "test@example.com", "password": "password123"}'

# Listar usuarios
curl http://localhost:3000/api/users
```

### 3. Con Postman o similar
Importa las URLs y métodos correspondientes en tu cliente HTTP preferido.

## Notas Importantes

- Asegúrate de que el servidor esté corriendo con `npm run dev`
- Las APIs están disponibles en `http://localhost:3000/api/`
- Todas las respuestas incluyen timestamp y status
- Los errores se manejan apropiadamente con códigos de estado HTTP
- **Para las APIs de base de datos**: Asegúrate de tener MySQL configurado y corriendo
- **Configuración de MySQL**: Sigue las instrucciones en `setup-mysql.md`
