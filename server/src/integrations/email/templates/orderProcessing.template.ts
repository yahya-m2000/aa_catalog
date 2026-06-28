import type { OrderEmailData, RenderedEmail } from '../email.types';
import { renderCustomerDetails, renderLineItemsTable, renderOrderMeta, renderPaymentNote, renderTotals } from './emailParts';

export function orderProcessingTemplate(order: OrderEmailData): RenderedEmail {
  return {
    subject: `Order to process — ${order.reference}`,
    html: `
      <div style="font-family:sans-serif; max-width:640px; margin:0 auto;">
        <h2>Order ready for processing</h2>
        ${renderOrderMeta(order)}
        <h3>Shipping details</h3>
        ${renderCustomerDetails(order)}
        <h3>Items to fulfill</h3>
        ${renderLineItemsTable(order)}
        <h3>Totals</h3>
        ${renderTotals(order)}
        ${renderPaymentNote()}
      </div>
    `,
  };
}
