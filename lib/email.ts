import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Helps with "self-signed certificate" errors
  },
});

export async function sendResetCodeEmail(email: string, code: string) {
  const mailOptions = {
    from: '"Tennis Pool" <' + process.env.SMTP_USER + '>',
    to: email,
    subject: 'Seu código de recuperação de senha',
    text: `Seu código de recuperação de senha é: ${code}. Ele expira em 15 minutos.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #041a16;">Recuperação de Senha</h2>
        <p>Você solicitou a recuperação de sua senha no TennisPool.</p>
        <p>Seu código de 5 dígitos é:</p>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #D32D18;">${code}</span>
        </div>
        <p style="margin-top: 20px;">Este código expira em 15 minutos.</p>
        <p>Se você não solicitou isso, por favor ignore este e-mail.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">TenNis Pool - Todos os direitos reservados.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Falha ao enviar e-mail de recuperação.');
  }
}
