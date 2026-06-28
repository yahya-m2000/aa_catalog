import { getCurrencyRates } from '../integrations/currency/rates.service';
import { sendOrderEmails } from '../integrations/email/sendOrderEmails';
import { getProductAdapter } from '../integrations/taobao/adapter.factory';
import type { CreateOrderInput } from '../schemas/checkout.schema';
import type { BasketTotals } from '../types/basket';
import type { Order, OrderLineItem } from '../types/order';
import { applyPricingToProduct } from '../utils/applyPricingToProduct';
import { generateOrderReference } from '../utils/orderReference';
import { calculateBasketTotals } from './pricing.service';

export class OrderItemNotFoundError extends Error {
  constructor(productId: string, skuId?: string) {
    super(skuId ? `SKU "${skuId}" not found on product "${productId}"` : `Product "${productId}" not found`);
    this.name = 'OrderItemNotFoundError';
  }
}

async function resolveLineItem(
  item: CreateOrderInput['items'][number],
  rates: Awaited<ReturnType<typeof getCurrencyRates>>['rates'],
): Promise<OrderLineItem> {
  const adapter = getProductAdapter();
  const product = await adapter.getById(item.productId);
  if (!product) {
    throw new OrderItemNotFoundError(item.productId);
  }

  const pricedProduct = applyPricingToProduct(product, rates);

  const price = item.skuId
    ? pricedProduct.skus.find((sku) => sku.skuId === item.skuId)?.price
    : pricedProduct.price;

  if (!price) {
    throw new OrderItemNotFoundError(item.productId, item.skuId);
  }

  const sku = item.skuId ? pricedProduct.skus.find((s) => s.skuId === item.skuId) : undefined;

  return {
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
  };
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

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const currencyRates = await getCurrencyRates();
  const lineItems = await Promise.all(input.items.map((item) => resolveLineItem(item, currencyRates.rates)));
  const totals = totalsFromLineItems(lineItems);
  const reference = generateOrderReference();

  const order: Order = {
    reference,
    customer: input.customer,
    items: lineItems,
    totals,
    createdAt: new Date().toISOString(),
  };

  await sendOrderEmails(order);

  return order;
}
