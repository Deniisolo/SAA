const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupProduction() {
  try {
    console.log('🚀 Configurando base de datos para producción...')
    
    // Verificar conexión
    await prisma.$connect()
    console.log('✅ Conexión a la base de datos establecida')
    
    // Crear roles si no existen
    const roles = await prisma.rol.createMany({
      data: [
        { nombre_rol: 'admin' },
        { nombre_rol: 'instructor' }
      ],
      skipDuplicates: true
    })
    console.log('✅ Roles creados:', roles)
    
    // Crear competencias de química
    const competencias = await prisma.competencia.createMany({
      data: [
        { 
          nombre_competencia: 'Análisis Químico', 
          descripcion: 'Competencia para realizar análisis químicos básicos y avanzados', 
          codigo_competencia: 'QUIM001' 
        },
        { 
          nombre_competencia: 'Razonamiento Cuantitativo', 
          descripcion: 'Competencia para aplicar razonamiento matemático en problemas químicos', 
          codigo_competencia: 'QUIM002' 
        },
        { 
          nombre_competencia: 'Ciencias Naturales', 
          descripcion: 'Competencia en fundamentos de ciencias naturales aplicadas a la química', 
          codigo_competencia: 'QUIM003' 
        },
        { 
          nombre_competencia: 'Análisis Orgánico', 
          descripcion: 'Competencia para realizar análisis de compuestos orgánicos', 
          codigo_competencia: 'QUIM004' 
        },
        { 
          nombre_competencia: 'Análisis Químico Instrumental', 
          descripcion: 'Competencia para utilizar instrumentos de análisis químico', 
          codigo_competencia: 'QUIM005' 
        }
      ],
      skipDuplicates: true
    })
    console.log('✅ Competencias creadas:', competencias)
    
    // Crear usuarios de prueba
    const usuarios = await prisma.usuario.createMany({
      data: [
        {
          nombre: 'Admin',
          apellido: 'Sistema',
          numero_documento: '12345678',
          email: 'admin@saa.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          id_rol: 1
        },
        {
          nombre: 'Instructor',
          apellido: 'Química',
          numero_documento: '87654321',
          email: 'instructor@saa.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          id_rol: 2
        }
      ],
      skipDuplicates: true
    })
    console.log('✅ Usuarios creados:', usuarios)
    
    console.log('🎉 Configuración de producción completada!')
    
  } catch (error) {
    console.error('❌ Error en la configuración:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupProduction()
