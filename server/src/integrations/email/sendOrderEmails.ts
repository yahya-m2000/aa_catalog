import { env } from '../../config/env';
import { sendEmail } from './email.service';
import type { OrderEmailData } from './email.types';
import { customerConfirmationTemplate } from './templates/customerConfirmation.template';
import { internalReceiptTemplate } from './templates/internalReceipt.template';
import { orderProcessingTemplate } from './templates/orderProcessing.template';

export async function sendOrderEmails(order: OrderEmailData): Promise<void> {
  const internalReceipt = internalReceiptTemplate(order);
  const orderProcessing = orderProcessingTemplate(order);
  const customerConfirmation = customerConfirmationTemplate(order);

  await Promise.all([
    sendEmail({ to: env.businessEmail, subject: internalReceipt.subject, html: internalReceipt.html }),
    sendEmail({ to: env.ordersEmail, subject: orderProcessing.subject, html: orderProcessing.html }),
    sendEmail({ to: order.customer.email, subject: customerConfirmation.subject, html: customerConfirmation.html }),
  ]);
}
