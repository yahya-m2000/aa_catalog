import { paymentConfig } from '../config/payment.config';
import { pricingConfig } from '../config/pricing.config';
import { getCurrencyRates } from '../integrations/currency/rates.service';
import { GraphRequestError } from '../integrations/graph/graph.client';
import { createOrderItem, updateEmailStatus } from '../integrations/graph/orders.repository';
import type { CreateOrderItemInput, GraphListItem } from '../integrations/graph/orders.types';
import { sendOrderEmails } from '../integrations/email/sendOrderEmails';
import { getProductAdapter, getRevalidationProductAdapter } from '../integrations/taobao/adapter.factory';
import type { CreateOrderInput } from '../schemas/checkout.schema';
import type { BasketTotals } from '../types/basket';
import type { Order, OrderLineItem } from '../types/order';
import { applyPricingToProduct } from '../utils/applyPricingToProduct';
import { getDeliveryFeeUsd } from '../utils/deliveryZone';
import { logEmailDelivery } from '../utils/logger';
import { generateOrderReference } from '../utils/orderReference';
import { assessPriceChange, calculateBasketTotals, roundToPrecision } from './pricing.service';

const PRICING_POLICY_VERSION = '2026-07-19';

export class OrderItemNotFoundError extends Error {
  constructor(productId: string, skuId?: string) {
    super(skuId ? `SKU "${skuId}" not found on product "${productId}"` : `Product "${productId}" not found`);
    this.name = 'OrderItemNotFoundError';
  }
}

interface ResolvedLineItem {
  lineItem: OrderLineItem;
  priceChangeFlag?: string;
}

function pickPrice(product: import('../types/product').NormalizedProduct, skuId: string | undefined) {
  return skuId ? product.skus.find((sku) => sku.skuId === skuId)?.price : product.price;
}

/**
 * Resolves one order line's authoritative price. Compares the currently-cached
 * (what the customer likely saw while browsing) price against a fresh, uncached
 * fetch (plan §6's revalidation step) via assessPriceChange — reading both through
 * the same cache would compare a quote against itself whenever the cache hasn't
 * expired yet, so the fresh fetch deliberately bypasses CachedProductAdapter.
 */
async function resolveLineItem(
  item: CreateOrderInput['items'][number],
  rates: Awaited<ReturnType<typeof getCurrencyRates>>['rates'],
): Promise<ResolvedLineItem> {
  const cachedAdapter = getProductAdapter();
  const revalidationAdapter = getRevalidationProductAdapter();

  const [cachedProduct, freshProduct] = await Promise.all([
    cachedAdapter.getById(item.productId),
    revalidationAdapter.getById(item.productId),
  ]);

  if (!freshProduct) {
    throw new OrderItemNotFoundError(item.productId);
  }

  const pricedProduct = applyPricingToProduct(freshProduct, rates);
  const price = pickPrice(pricedProduct, item.skuId);

  if (!price) {
    throw new OrderItemNotFoundError(item.productId, item.skuId);
  }

  const sku = item.skuId ? pricedProduct.skus.find((s) => s.skuId === item.skuId) : undefined;

  const lineItem: OrderLineItem = {
    productId: pricedProduct.id,
    productTitle: pricedProduct.title,
    skuId: item.skuId,
    variantOptions: sku?.options,
    quantity: item.quantity,
    originalAmount: price.amount,
    originalCurrency: price.currency,
    usdAmount: price.usdAmount,
    markupAmount: price.finalAmount - price.usdAmount,
    finalAmount: price.finalAmount,
    sourceProductId: pricedProduct.sourceProductId,
  };

  let priceChangeFlag: string | undefined;
  if (cachedProduct) {
    const cachedPrice = pickPrice(applyPricingToProduct(cachedProduct, rates), item.skuId);
    if (cachedPrice) {
      const assessment = assessPriceChange(cachedPrice.finalAmount, price.finalAmount);
      if (!assessment.withinThreshold) {
        priceChangeFlag = `${pricedProduct.title}${item.skuId ? ` (SKU ${item.skuId})` : ''}: quoted $${cachedPrice.finalAmount.toFixed(2)} -> revalidated $${price.finalAmount.toFixed(2)} (+${assessment.deltaPercent.toFixed(1)}%, exceeds absorb threshold — contact customer before proceeding)`;
      }
    }
  }

  return { lineItem, priceChangeFlag };
}

function totalsFromLineItems(lineItems: OrderLineItem[]): BasketTotals {
  const basketItems = lineItems.map((line) => ({
    productId: line.productId,
    productTitle: line.productTitle,
    productImageUrl: '',
    quantity: line.quantity,
    unitPrice: {
      amount: line.originalAmount,
      currency: line.originalCurrency,
      usdAmount: line.usdAmount,
      finalAmount: line.finalAmount,
    },
  }));
  return calculateBasketTotals(basketItems);
}

async function persistOrderToSharePoint(
  input: CreateOrderInput,
  reference: string,
  lineItems: OrderLineItem[],
  totals: BasketTotals,
  deliveryUsd: number,
  serviceFeeUsd: number,
  fxRate: number,
  now: Date,
  internalNotes: string | undefined,
): Promise<GraphListItem> {
  const nowIso = now.toISOString();
  const expiresAt = new Date(
    now.getTime() + paymentConfig.paymentDeadlineDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const graphInput: CreateOrderItemInput = {
    reference,
    customer: {
      fullName: input.customer.fullName,
      email: input.customer.email,
      phone: input.customer.phone,
      shippingAddress: input.customer.shippingAddress,
      city: input.customer.city,
      postcode: input.customer.postcode,
      country: input.customer.country,
    },
    paymentMethod: input.paymentMethod,
    lineItems,
    totals: {
      subtotalUsd: roundToPrecision(totals.subtotalUSD),
      deliveryUsd: roundToPrecision(deliveryUsd),
      serviceFeeUsd: roundToPrecision(serviceFeeUsd),
      markupUsd: roundToPrecision(totals.markupTotalUSD - serviceFeeUsd),
      totalUsd: roundToPrecision(totals.finalTotalUSD + deliveryUsd),
    },
    pricingPolicyVersion: PRICING_POLICY_VERSION,
    fxRate,
    fxRateAt: nowIso,
    priceValidatedAt: nowIso,
    createdAt: nowIso,
    expiresAt,
    internalNotes,
  };

  return createOrderItem(graphInput);
}

/**
 * §8a: SharePoint write is the only step that determines checkout success. Email is
 * best-effort afterward and can never un-succeed an already-created order — its outcome
 * is instead recorded back onto the order item so staff can see delivery failures in the List.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const currencyRates = await getCurrencyRates();
  const resolved = await Promise.all(input.items.map((item) => resolveLineItem(item, currencyRates.rates)));
  const lineItems = resolved.map((r) => r.lineItem);
  const priceChangeFlags = resolved.map((r) => r.priceChangeFlag).filter((flag): flag is string => Boolean(flag));

  const totals = totalsFromLineItems(lineItems);
  const totalQuantity = lineItems.reduce((sum, line) => sum + line.quantity, 0);
  const deliveryUsd = getDeliveryFeeUsd(input.customer.country);
  const serviceFeeUsd = pricingConfig.serviceFeeFixedUSD * totalQuantity;

  const reference = generateOrderReference();
  const now = new Date();

  const fxRate = currencyRates.rates.CNY ?? 1;
  const internalNotes =
    priceChangeFlags.length > 0
      ? `PRICE CHANGE FLAGGED AT SUBMISSION:\n${priceChangeFlags.join('\n')}`
      : undefined;

  const totalWithDelivery: Order['totals'] = {
    subtotalUSD: totals.subtotalUSD,
    markupTotalUSD: totals.markupTotalUSD,
    finalTotalUSD: totals.finalTotalUSD + deliveryUsd,
  };

  const createdItem = await persistOrderToSharePoint(
    input,
    reference,
    lineItems,
    totals,
    deliveryUsd,
    serviceFeeUsd,
    fxRate,
    now,
    internalNotes,
  );

  const order: Order = {
    reference,
    customer: input.customer,
    items: lineItems,
    totals: totalWithDelivery,
    createdAt: now.toISOString(),
  };

  void deliverOrderEmails(order, createdItem);

  return order;
}

async function deliverOrderEmails(order: Order, item: GraphListItem): Promise<void> {
  let etag = item['@odata.etag'];

  try {
    await sendOrderEmails(order);
    etag = await recordEmailStatus(item.id, etag, 'CustomerEmailStatus', 'Sent');
    await recordEmailStatus(item.id, etag, 'InternalEmailStatus', 'Sent');
    logEmailDelivery(order.reference, 'customer', 'sent');
    logEmailDelivery(order.reference, 'internal', 'sent');
  } catch (error) {
    // Order reference only — never the recipient address, subject, or email body (plan §12).
    console.error(`[order.service] Email delivery failed for order ${order.reference}:`, error);
    logEmailDelivery(order.reference, 'customer', 'failed');
    try {
      await recordEmailStatus(item.id, etag, 'CustomerEmailStatus', 'Failed');
    } catch (statusError) {
      console.error(
        `[order.service] Failed to record email failure status for order ${order.reference}:`,
        statusError,
      );
    }
  }
}

async function recordEmailStatus(
  itemId: string,
  etag: string,
  field: 'CustomerEmailStatus' | 'InternalEmailStatus',
  status: 'Sent' | 'Failed' | 'Pending Retry',
): Promise<string> {
  try {
    return await updateEmailStatus(itemId, etag, field, status);
  } catch (error) {
    if (error instanceof GraphRequestError) {
      console.error(`[order.service] Failed to record ${field}=${status} on item ${itemId}:`, error.message);
      return etag;
    }
    throw error;
  }
}
