import nodemailer, { type Transporter } from 'nodemailer';

import { env } from '../../config/env';
import type { EmailMessage } from './email.types';

let transporter: Transporter | null = null;

function isSmtpConfigured(): boolean {
  return Boolean(env.smtp.host && env.smtp.port && env.smtp.user && env.smtp.pass);
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log(`[email.service] SMTP not configured — logging email instead of sending.
To: ${message.to}
Subject: ${message.subject}
---
${message.html}
---`);
    return;
  }

  try {
    await getTransporter().sendMail({
      from: env.smtp.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });
  } catch (error) {
    console.error(`[email.service] Failed to send email to ${message.to}:`, error);
  }
}
