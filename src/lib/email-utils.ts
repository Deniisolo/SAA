import nodemailer from 'nodemailer';
import { generarImagenQR } from './qr-utils';

// Configuración del transporter de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER || 'saa.sistema.test@gmail.com',
    pass: process.env.SMTP_PASS || 'test-password'
  }
});

/**
 * Envía un email de bienvenida al aprendiz con su código QR
 * @param correo Correo electrónico del aprendiz
 * @param nombre Nombre del aprendiz
 * @param apellido Apellido del aprendiz
 * @param qrData Código QR del aprendiz
 * @param qrImage Imagen QR en base64
 * @returns Promise<boolean> true si se envió correctamente
 */
export async function enviarEmailBienvenida(
  correo: string,
  nombre: string,
  apellido: string,
  qrData: string,
  qrImage: string
): Promise<boolean> {
  try {
    // Generar la imagen QR si no se proporciona
    const qrImageData = qrImage || await generarImagenQR(qrData);
    
    const mailOptions = {
      from: `"Software de Asistencia para Aprendices" <${process.env.SMTP_USER || 'noreply@saa.com'}>`,
      to: correo,
      subject: `¡Bienvenido al Software de Asistencia para Aprendices, ${nombre}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido al Software de Asistencia para Aprendices</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              margin-bottom: 30px;
            }
            .qr-section {
              text-align: center;
              background-color: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
            }
            .qr-code {
              max-width: 200px;
              height: auto;
              border: 3px solid #667eea;
              border-radius: 10px;
              margin: 15px 0;
            }
            .qr-data {
              background-color: #e9ecef;
              padding: 10px;
              border-radius: 5px;
              font-family: monospace;
              font-size: 12px;
              word-break: break-all;
              margin: 10px 0;
        }
            .instructions {
              background-color: #e7f3ff;
              border-left: 4px solid #2196F3;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 14px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
            .highlight {
              color: #667eea;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Software de Asistencia para Aprendices</h1>
              <p>Sistema de Asistencia y Aprendizaje</p>
            </div>
            
            <div class="content">
              <h2>¡Hola ${nombre} ${apellido}!</h2>
              
              <p>Te damos la bienvenida al <span class="highlight">Software de Asistencia para Aprendices</span>. Tu registro ha sido exitoso y ahora formas parte de nuestra comunidad educativa.</p>
              
              <div class="qr-section">
                <h3>🔐 Tu Código QR Personal</h3>
                <p>Este es tu código QR único que te identificará en el sistema:</p>
                <img src="cid:qr-image" alt="Código QR de ${nombre}" class="qr-code">
                <p><strong>Código:</strong></p>
                <div class="qr-data">${qrData}</div>
                <p><em>También encontrarás el código QR como archivo adjunto en este correo.</em></p>
              </div>
              
              <div class="instructions">
                <h3>📋 Instrucciones Importantes:</h3>
                <ul>
                  <li><strong>Guarda este código QR:</strong> Es tu identificador único en el sistema</li>
                  <li><strong>Úsalo para marcar asistencia:</strong> Presenta este QR cuando llegues a clase</li>
                  <li><strong>No lo compartas:</strong> Es personal e intransferible</li>
                  <li><strong>Contraseña temporal:</strong> Tu contraseña inicial es <code>123456</code></li>
                </ul>
              </div>
              
              <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar a tu instructor.</p>
              
              <p>¡Esperamos verte pronto en clase!</p>
            </div>
            
            <div class="footer">
              <p>Este es un mensaje automático del Software de Asistencia para Aprendices</p>
              <p>Por favor, no respondas a este correo</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `qr-${nombre}-${apellido}.png`,
          content: qrImageData.split(',')[1], // Remover el prefijo data:image/png;base64,
          encoding: 'base64',
          cid: 'qr-image' // Content-ID para referenciar en el HTML
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
}

/**
 * Verifica la configuración del email
 * @returns Promise<boolean> true si la configuración es válida
 */
export async function verificarConfiguracionEmail(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Error en configuración de email:', error);
    return false;
  }
}

/**
 * Envía un correo de prueba para validar la configuración SMTP
 */
export async function enviarEmailPrueba(destinatario: string): Promise<{ ok: boolean; message: string }> {
  try {
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `SAA <${process.env.SMTP_USER || 'noreply@saa.com'}>`,
      to: destinatario,
      subject: 'Prueba SMTP - SAA',
      text: 'Este es un correo de prueba para verificar la configuración SMTP de SAA.',
    });

    return { ok: true, message: `Correo de prueba enviado: ${info.messageId}` };
  } catch (error: any) {
    console.error('Fallo al enviar correo de prueba:', error);
    return { ok: false, message: error?.message || 'Error desconocido enviando correo de prueba' };
  }
}
