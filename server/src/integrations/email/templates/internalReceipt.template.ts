import type { OrderEmailData, RenderedEmail } from '../email.types';
import { renderCustomerDetails, renderLineItemsTable, renderOrderMeta, renderPaymentNote, renderTotals } from './emailParts';

export function internalReceiptTemplate(order: OrderEmailData): RenderedEmail {
  return {
    subject: `New order received — ${order.reference}`,
    html: `
      <div style="font-family:sans-serif; max-width:640px; margin:0 auto;">
        <h2>New order received</h2>
        ${renderOrderMeta(order)}
        <h3>Customer</h3>
        ${renderCustomerDetails(order)}
        <h3>Items</h3>
        ${renderLineItemsTable(order)}
        <h3>Totals</h3>
        ${renderTotals(order)}
        ${renderPaymentNote()}
      </div>
    `,
  };
}
