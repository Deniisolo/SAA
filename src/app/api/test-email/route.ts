import { NextRequest, NextResponse } from 'next/server';
import { enviarEmailPrueba, verificarConfiguracionEmail } from '../../../lib/email-utils';

export async function GET(request: NextRequest) {
  const ok = await verificarConfiguracionEmail();
  return NextResponse.json({ ok, smtpHost: process.env.SMTP_HOST || null, user: process.env.SMTP_USER ? '***' : null });
}

export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();
    if (!to) {
      return NextResponse.json({ ok: false, error: 'Falta parámetro to' }, { status: 400 });
    }
    const result = await enviarEmailPrueba(to);
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }
}


