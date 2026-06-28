import type { OrderEmailData } from '../email.types';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatVariant(variantOptions: OrderEmailData['items'][number]['variantOptions']): string {
  if (!variantOptions || variantOptions.length === 0) return '-';
  return escapeHtml(variantOptions.map((option) => `${option.name}: ${option.value}`).join(', '));
}

export function renderCustomerDetails(order: OrderEmailData): string {
  const { customer } = order;
  return `
    <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
      <tr><td style="padding:4px 0; color:#666;">Name</td><td style="padding:4px 0;">${escapeHtml(customer.fullName)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">Email</td><td style="padding:4px 0;">${escapeHtml(customer.email)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">Phone</td><td style="padding:4px 0;">${escapeHtml(customer.phone)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">Address</td><td style="padding:4px 0;">${escapeHtml(customer.shippingAddress)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">City</td><td style="padding:4px 0;">${escapeHtml(customer.city)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">Postcode</td><td style="padding:4px 0;">${escapeHtml(customer.postcode)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">Country</td><td style="padding:4px 0;">${escapeHtml(customer.country)}</td></tr>
    </table>
  `;
}

export function renderLineItemsTable(order: OrderEmailData): string {
  const rows = order.items
    .map((item) => {
      const skuSuffix = item.skuId ? ` / SKU: ${escapeHtml(item.skuId)}` : '';
      return `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #eee;">${escapeHtml(item.productTitle)}<br/><span style="color:#999; font-size:12px;">ID: ${escapeHtml(item.productId)}${skuSuffix}</span></td>
        <td style="padding:8px; border-bottom:1px solid #eee;">${formatVariant(item.variantOptions)}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">${item.originalAmount.toFixed(2)} ${escapeHtml(item.originalCurrency)}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">${formatUSD(item.usdAmount)}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">${formatUSD(item.markupAmount)}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:right; font-weight:bold;">${formatUSD(item.finalAmount)}</td>
      </tr>
    `;
    })
    .join('');

  return `
    <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px; text-align:left;">Item</th>
          <th style="padding:8px; text-align:left;">Variant</th>
          <th style="padding:8px; text-align:center;">Qty</th>
          <th style="padding:8px; text-align:right;">Original</th>
          <th style="padding:8px; text-align:right;">USD</th>
          <th style="padding:8px; text-align:right;">Markup</th>
          <th style="padding:8px; text-align:right;">Final</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export function renderTotals(order: OrderEmailData): string {
  const { totals } = order;
  return `
    <table style="width:100%; border-collapse:collapse;">
      <tr><td style="padding:4px 0; color:#666;">Subtotal</td><td style="padding:4px 0; text-align:right;">${formatUSD(totals.subtotalUSD)}</td></tr>
      <tr><td style="padding:4px 0; color:#666;">Markup / service fee</td><td style="padding:4px 0; text-align:right;">${formatUSD(totals.markupTotalUSD)}</td></tr>
      <tr><td style="padding:8px 0; font-weight:bold; border-top:1px solid #ddd;">Total</td><td style="padding:8px 0; text-align:right; font-weight:bold; border-top:1px solid #ddd;">${formatUSD(totals.finalTotalUSD)}</td></tr>
    </table>
  `;
}

export function renderPaymentNote(): string {
  return `
    <p style="color:#666; font-size:13px; margin-top:24px;">
      Payment is handled separately, outside this app, by the business directly with the customer.
    </p>
  `;
}

export function renderOrderMeta(order: OrderEmailData): string {
  return `
    <p style="margin-bottom:16px;">
      <strong>Order reference:</strong> ${escapeHtml(order.reference)}<br/>
      <strong>Date/time:</strong> ${escapeHtml(new Date(order.createdAt).toLocaleString('en-US'))}
    </p>
  `;
}
