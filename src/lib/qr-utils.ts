import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Genera un código QR único para un aprendiz
 * @param usuarioId ID del usuario
 * @param nombre Nombre del aprendiz
 * @param apellido Apellido del aprendiz
 * @returns Código QR único
 */
export function generarCodigoQR(usuarioId: number, nombre: string, apellido: string): string {
  // Crear un identificador único basado en el ID, nombre y timestamp
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const qrData = `SAA-${usuarioId}-${nombre.toUpperCase()}-${apellido.toUpperCase()}-${timestamp}-${randomString}`;
  
  return qrData;
}

/**
 * Genera la imagen QR como base64
 * @param qrData Datos del QR
 * @returns Imagen QR en base64
 */
export async function generarImagenQR(qrData: string): Promise<string> {
  try {
    const qrImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
    
    return qrImage;
  } catch (error) {
    console.error('Error generando QR:', error);
    throw new Error('Error al generar el código QR');
  }
}

/**
 * Valida que un código QR sea válido para el sistema SAA
 * @param qrData Código QR a validar
 * @returns true si es válido, false si no
 */
export function validarCodigoQR(qrData: string): boolean {
  // Verificar que el código QR tenga el formato correcto
  const qrPattern = /^SAA-\d+-[A-Z]+-[A-Z]+-\d+-[a-f0-9]+$/;
  return qrPattern.test(qrData);
}

/**
 * Extrae información del código QR
 * @param qrData Código QR
 * @returns Objeto con la información extraída
 */
export function extraerInfoQR(qrData: string): { usuarioId: number; nombre: string; apellido: string } | null {
  if (!validarCodigoQR(qrData)) {
    return null;
  }
  
  const parts = qrData.split('-');
  if (parts.length !== 6) {
    return null;
  }
  
  return {
    usuarioId: parseInt(parts[1]),
    nombre: parts[2],
    apellido: parts[3]
  };
}
