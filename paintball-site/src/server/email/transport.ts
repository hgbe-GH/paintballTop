import nodemailer, { Transporter } from 'nodemailer';

import { logger } from '@/lib/logger';

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
    void logger.warn('[EMAIL]', 'SMTP configuration is incomplete. Email transport is disabled.');
    return null;
  }

  const port = Number(portString);

  if (Number.isNaN(port)) {
    void logger.warn('[EMAIL]', 'SMTP_PORT is not a valid number. Email transport is disabled.');
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
    void logger.warn('[EMAIL]', 'MAIL_FROM is not configured. Email sending is disabled.');
    return;
  }

  const transport = getTransport();

  if (!transport) {
    void logger.warn('[EMAIL]', 'Email transport unavailable. Skipping email send.');
    return;
  }

  const info = await transport.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  void logger.info('[EMAIL]', 'Email sent', {
    messageId: info.messageId,
    to,
    subject,
  });
}
