import nodemailer, { Transporter } from 'nodemailer';

type MailOptions = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

let cachedTransport: Transporter | null = null;

function createTransport(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const portString = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !portString || !user || !pass) {
    console.warn('SMTP configuration is incomplete. Email transport is disabled.');
    return null;
  }

  const port = Number(portString);

  if (Number.isNaN(port)) {
    console.warn('SMTP_PORT is not a valid number. Email transport is disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user,
      pass,
    },
  });
}

export function getTransport(): Transporter | null {
  if (!cachedTransport) {
    cachedTransport = createTransport();
  }

  return cachedTransport;
}

export async function sendMail({ to, subject, html, text }: MailOptions): Promise<void> {
  const from = process.env.MAIL_FROM;

  if (!from) {
    console.warn('MAIL_FROM is not configured. Email sending is disabled.');
    return;
  }

  const transport = getTransport();

  if (!transport) {
    console.warn('Email transport unavailable. Skipping email send.');
    return;
  }

  const info = await transport.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  console.log(`Email sent with message id: ${info.messageId}`);
}
