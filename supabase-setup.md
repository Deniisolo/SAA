# 🐘 Configuración con Supabase

## Paso 1: Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Regístrate con GitHub
3. Crea un nuevo proyecto
4. Elige la región más cercana

## Paso 2: Obtener credenciales
1. Ve a Settings → Database
2. Copia la cadena de conexión
3. Formato: `postgresql://postgres:[password]@[host]:5432/postgres`

## Paso 3: Actualizar Prisma Schema
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Paso 4: Configurar en Vercel
```
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

## Paso 5: Ejecutar migraciones
```bash
npx prisma db push
node setup-production.js
```
