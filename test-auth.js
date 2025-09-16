#!/usr/bin/env node

/**
 * Script para probar la autenticación
 */

const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testAuth() {
  try {
    console.log('🔐 Probando sistema de autenticación...')
    
    await prisma.$connect()
    console.log('✅ Conexión a base de datos establecida')
    
    // Buscar un usuario admin
    const adminUser = await prisma.usuario.findFirst({
      where: {
        rol: {
          nombre_rol: 'admin'
        }
      },
      include: {
        rol: true
      }
    })
    
    if (!adminUser) {
      console.log('❌ No se encontró usuario admin')
      return
    }
    
    console.log(`✅ Usuario admin encontrado: ${adminUser.nombre} ${adminUser.apellido}`)
    console.log(`   - Rol: ${adminUser.rol.nombre_rol}`)
    console.log(`   - Usemame: ${adminUser.usemame}`)
    
    // Generar token JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro'
    const token = jwt.sign(
      {
        id: adminUser.id_usuario,
        usuario: adminUser.usemame,
        rol: adminUser.rol.nombre_rol
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    console.log(`✅ Token JWT generado: ${token.substring(0, 50)}...`)
    
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log(`✅ Token verificado:`, decoded)
    
    // Probar login API
    console.log('\n🌐 Probando API de login...')
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usemame: adminUser.usemame,
        Contrasenia: adminUser.Contrasenia
      })
    })
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('✅ Login exitoso:', loginData)
    } else {
      const errorData = await loginResponse.json()
      console.log('❌ Error en login:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testAuth()
}
