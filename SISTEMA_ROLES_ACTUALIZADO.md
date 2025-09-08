# Sistema de Roles Actualizado - SAA

## Descripción General

El sistema SAA ha sido actualizado para manejar únicamente 2 roles principales:
- **Admin**: Gestión completa del sistema
- **Instructor**: Gestión de clases y asistencia

## Roles y Funcionalidades

### Rol Admin
El administrador tiene acceso a las siguientes funcionalidades:

#### 1. Gestión de Usuarios (`/admin/usuarios`)
- Ver lista de todos los usuarios
- Crear nuevos usuarios
- Editar usuarios existentes
- Eliminar usuarios (con validaciones)

#### 2. Gestión de Fichas (`/admin/fichas`)
- Ver lista de fichas de formación
- Crear nuevas fichas
- Editar fichas existentes
- Eliminar fichas (con validaciones)

#### 3. Gestión de Competencias (`/admin/competencias`)
- Ver lista de competencias
- Crear nuevas competencias
- Editar competencias existentes
- Eliminar competencias (con validaciones)

#### 4. Asociaciones (`/admin/asociaciones`)
- Ver asociaciones entre competencias y fichas
- Crear nuevas asociaciones
- Eliminar asociaciones existentes

### Rol Instructor
El instructor tiene acceso a las siguientes funcionalidades:

#### 1. Gestión de Clases (`/instructor/clases`)
- Ver lista de clases asignadas
- Crear nuevas clases
- Editar clases existentes
- Eliminar clases (con validaciones)

#### 2. Asistencia con QR (`/instructor/asistencia`)
- Seleccionar clase para registrar asistencia
- Activar escáner QR
- Registrar asistencia automáticamente
- Ver lista de asistencias por clase

## Estructura de Base de Datos

### Nuevas Entidades

#### Competencia
```sql
- id_competencia (PK)
- nombre_competencia
- descripcion
- codigo_competencia
```

#### CompetenciaFicha (Tabla Intermedia)
```sql
- id_competencia_ficha (PK)
- id_competencia (FK)
- id_ficha (FK)
```

#### Clase
```sql
- id_clase (PK)
- nombre_clase
- descripcion
- fecha_clase
- hora_inicio
- hora_fin
- id_competencia (FK)
- id_instructor (FK)
```

#### Asistencia
```sql
- id_asistencia (PK)
- fecha_asistencia
- id_usuario (FK)
- id_clase (FK)
- estado_asistencia
```

## API Endpoints

### Competencias
- `GET /api/competencias` - Listar competencias
- `POST /api/competencias` - Crear competencia
- `GET /api/competencias/[id]` - Obtener competencia
- `PUT /api/competencias/[id]` - Actualizar competencia
- `DELETE /api/competencias/[id]` - Eliminar competencia

### Competencias-Ficha
- `GET /api/competencias-ficha` - Listar asociaciones
- `POST /api/competencias-ficha` - Crear asociación
- `DELETE /api/competencias-ficha/[id]` - Eliminar asociación

### Clases
- `GET /api/clases` - Listar clases
- `POST /api/clases` - Crear clase
- `GET /api/clases/[id]` - Obtener clase
- `PUT /api/clases/[id]` - Actualizar clase
- `DELETE /api/clases/[id]` - Eliminar clase

### Asistencias
- `GET /api/asistencias` - Listar asistencias
- `POST /api/asistencias` - Registrar asistencia
- `GET /api/asistencias/clase/[id]` - Asistencias por clase

## Usuarios de Prueba

### Admin
- **Username**: admin
- **Password**: 123456
- **Código QR**: ADMIN001

### Instructor
- **Username**: instructor
- **Password**: 123456
- **Código QR**: INST001

### Aprendiz (para pruebas)
- **Username**: aprendiz
- **Password**: 123456
- **Código QR**: APR001

## Instrucciones de Instalación

1. **Actualizar la base de datos**:
   ```bash
   npx prisma db push
   ```

2. **Poblar con datos de prueba**:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

3. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```

## Navegación

### Menú Admin
- Inicio
- Gestión de Usuarios
- Gestión de Fichas
- Gestión de Competencias
- Asociaciones

### Menú Instructor
- Inicio
- Gestión de Clases
- Asistencia con QR

## Características Técnicas

- **Autenticación**: JWT con roles
- **Base de datos**: MySQL con Prisma ORM
- **Frontend**: Next.js 14 con TypeScript
- **Estilos**: Tailwind CSS
- **Escáner QR**: Componente personalizado

## Validaciones de Seguridad

- Solo usuarios con roles válidos pueden acceder
- Validación de permisos en cada endpoint
- Prevención de eliminación de datos con dependencias
- Verificación de unicidad en códigos y nombres

## Flujo de Asistencia

1. El instructor selecciona una clase
2. Activa el escáner QR
3. El aprendiz escanea su código QR
4. Se registra automáticamente la asistencia
5. Se muestra confirmación y se actualiza la lista

## Notas de Desarrollo

- El sistema redirige automáticamente según el rol del usuario
- Todas las operaciones CRUD incluyen validaciones
- Los códigos QR son únicos por usuario
- Las fechas y horas se manejan en formato local
- El sistema es responsive y funciona en dispositivos móviles
