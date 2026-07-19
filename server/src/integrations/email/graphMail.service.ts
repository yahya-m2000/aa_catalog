import { assertGraphMailConfigured, env } from '../../config/env';
import { getGraphClient } from '../graph/graph.client';
import type { EmailMessage } from './email.types';

export async function sendEmailViaGraph(message: EmailMessage): Promise<void> {
  assertGraphMailConfigured();

  const client = getGraphClient();
  await client.api(`/users/${env.graph.sendMailUserId}/sendMail`).post({
    message: {
      subject: message.subject,
      body: { contentType: 'HTML', content: message.html },
      toRecipients: [{ emailAddress: { address: message.to } }],
    },
    saveToSentItems: true,
  });
}
