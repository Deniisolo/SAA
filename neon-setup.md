# 🐘 Configuración con Neon

## Paso 1: Crear cuenta en Neon
1. Ve a [https://neon.tech](https://neon.tech)
2. Regístrate con GitHub
3. Crea un nuevo proyecto
4. Elige la región más cercana

## Paso 2: Obtener credenciales
1. Ve a Dashboard → Connection Details
2. Copia la cadena de conexión
3. Formato: `postgresql://[user]:[password]@[host]/[database]`

## Paso 3: Actualizar Prisma Schema
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Paso 4: Configurar en Vercel
```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
```

## Paso 5: Ejecutar migraciones
```bash
npx prisma db push
node setup-production.js
```
