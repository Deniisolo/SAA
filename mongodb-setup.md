# 🍃 Configuración con MongoDB Atlas

## Paso 1: Crear cuenta en MongoDB Atlas
1. Ve a [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Regístrate gratis
3. Crea un cluster gratuito (M0)
4. Elige la región más cercana

## Paso 2: Configurar acceso
1. Crea un usuario de base de datos
2. Configura IP whitelist (0.0.0.0/0 para desarrollo)
3. Obtén la cadena de conexión

## Paso 3: Actualizar Prisma Schema
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

## Paso 4: Configurar en Vercel
```
DATABASE_URL=mongodb+srv://[username]:[password]@[cluster].mongodb.net/saa_database
```

## Paso 5: Ejecutar migraciones
```bash
npx prisma db push
node setup-production.js
```
