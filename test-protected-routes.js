#!/usr/bin/env node

/**
 * Script para probar las rutas protegidas
 */

async function testProtectedRoutes() {
  try {
    console.log('🛡️  Probando rutas protegidas...')
    
    const protectedRoutes = [
      '/',
      '/admin',
      '/estadisticas',
      '/crear-aprendiz',
      '/modificar-aprendiz',
      '/instructor/asistencia',
      '/qr'
    ]
    
    console.log('\n📋 Probando rutas sin autenticación:')
    
    for (const route of protectedRoutes) {
      try {
        const response = await fetch(`http://localhost:3000${route}`, {
          method: 'GET',
          redirect: 'manual' // No seguir redirects automáticamente
        })
        
        console.log(`\n🔗 ${route}:`)
        console.log(`   - Status: ${response.status}`)
        console.log(`   - Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`)
        
        if (response.status === 302 || response.status === 307) {
          const location = response.headers.get('location')
          console.log(`   - Redirect a: ${location}`)
          
          if (location && location.includes('/login')) {
            console.log(`   ✅ Correctamente redirigido al login`)
          } else {
            console.log(`   ❌ No redirigido al login`)
          }
        } else if (response.status === 200) {
          console.log(`   ⚠️  Acceso permitido sin autenticación`)
        } else {
          console.log(`   ❓ Status inesperado: ${response.status}`)
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
      }
    }
    
    console.log('\n🔐 Probando login:')
    
    // Probar login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usemame: 'admin',
        Contrasenia: 'admin123'
      })
    })
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      const token = loginData.data.token
      
      console.log('✅ Login exitoso')
      console.log(`   - Token: ${token.substring(0, 50)}...`)
      
      console.log('\n📋 Probando rutas con autenticación:')
      
      // Probar rutas con token
      for (const route of protectedRoutes) {
        try {
          const response = await fetch(`http://localhost:3000${route}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            redirect: 'manual'
          })
          
          console.log(`\n🔗 ${route} (con token):`)
          console.log(`   - Status: ${response.status}`)
          
          if (response.status === 200) {
            console.log(`   ✅ Acceso permitido`)
          } else if (response.status === 302 || response.status === 307) {
            const location = response.headers.get('location')
            console.log(`   - Redirect a: ${location}`)
          } else {
            console.log(`   ❓ Status: ${response.status}`)
          }
          
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`)
        }
      }
      
    } else {
      const errorData = await loginResponse.json()
      console.log('❌ Error en login:', errorData)
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

if (require.main === module) {
  testProtectedRoutes()
}
