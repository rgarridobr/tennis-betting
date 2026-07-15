import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const EMAIL_COPY = {
  pt: {
    subject: 'Seu código de recuperação de senha',
    text: (code: string) =>
      `Seu código de recuperação de senha é: ${code}. Ele expira em 15 minutos.`,
    title: 'Recuperação de Senha',
    intro: 'Você solicitou a recuperação de sua senha no TennisPool.',
    codeLabel: 'Seu código de 5 dígitos é:',
    expires: 'Este código expira em 15 minutos.',
    ignore: 'Se você não solicitou isso, por favor ignore este e-mail.',
    footer: 'TennisPool - Todos os direitos reservados.',
  },
  en: {
    subject: 'Your password recovery code',
    text: (code: string) =>
      `Your password recovery code is: ${code}. It expires in 15 minutes.`,
    title: 'Password recovery',
    intro: 'You requested a password reset on TennisPool.',
    codeLabel: 'Your 5-digit code is:',
    expires: 'This code expires in 15 minutes.',
    ignore: 'If you did not request this, please ignore this email.',
    footer: 'TennisPool - All rights reserved.',
  },
} as const;

export async function sendResetCodeEmail(
  email: string,
  code: string,
  locale: string = 'pt',
) {
  const copy = locale.startsWith('en') ? EMAIL_COPY.en : EMAIL_COPY.pt;

  const mailOptions = {
    from: '"Tennis Pool" <' + process.env.SMTP_USER + '>',
    to: email,
    subject: copy.subject,
    text: copy.text(code),
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #041a16;">${copy.title}</h2>
        <p>${copy.intro}</p>
        <p>${copy.codeLabel}</p>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #D32D18;">${code}</span>
        </div>
        <p style="margin-top: 20px;">${copy.expires}</p>
        <p>${copy.ignore}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">${copy.footer}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send recovery email.');
  }
}
