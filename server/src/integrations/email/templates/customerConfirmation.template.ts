import type { OrderEmailData, RenderedEmail } from '../email.types';
import { escapeHtml, renderLineItemsTable, renderOrderMeta, renderPaymentNote, renderTotals } from './emailParts';

export function customerConfirmationTemplate(order: OrderEmailData): RenderedEmail {
  return {
    subject: `Your order confirmation — ${order.reference}`,
    html: `
      <div style="font-family:sans-serif; max-width:640px; margin:0 auto;">
        <h2>Thank you for your order, ${escapeHtml(order.customer.fullName)}</h2>
        <p>We've received your order and will be in touch shortly with payment and shipping details.</p>
        ${renderOrderMeta(order)}
        <h3>Your items</h3>
        ${renderLineItemsTable(order)}
        <h3>Order total</h3>
        ${renderTotals(order)}
        ${renderPaymentNote()}
      </div>
    `,
  };
}
