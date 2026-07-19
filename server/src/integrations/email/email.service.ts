import { env } from '../../config/env';
import { sendEmailViaGraph } from './graphMail.service';
import type { EmailMessage } from './email.types';

function isGraphMailConfigured(): boolean {
  const { tenantId, clientId, clientSecret, sendMailUserId } = env.graph;
  return Boolean(tenantId && clientId && clientSecret && sendMailUserId);
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (!isGraphMailConfigured()) {
    console.log(`[email.service] Microsoft Graph mail not configured — logging email instead of sending.
To: ${message.to}
Subject: ${message.subject}
---
${message.html}
---`);
    return;
  }

  await sendEmailViaGraph(message);
}
