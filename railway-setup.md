# 🗄️ Configuración con Railway

## Paso 1: Crear cuenta en Railway
1. Ve a [https://railway.app](https://railway.app)
2. Regístrate con GitHub
3. Crea un nuevo proyecto
4. Añade una base de datos MySQL

## Paso 2: Obtener credenciales
1. Ve a tu base de datos
2. Copia la cadena de conexión
3. Formato: `mysql://[user]:[password]@[host]:[port]/[database]`

## Paso 3: Configurar en Vercel
```
DATABASE_URL=mysql://[user]:[password]@[host]:[port]/[database]
```

## Paso 4: Ejecutar migraciones
```bash
npx prisma db push
node setup-production.js
```
