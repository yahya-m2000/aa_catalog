// Chinese domestic receiver address required by HIOBuy's orders/preview and orders/create
// (plan §1, §2 — verified against https://hiobuy.com/en/api-docs/order-preview 2026-07-20:
// receiver.{name,mobile,province,city,address} required; district required only for 1688
// without address_id — this app only ever uses the taobao channel, so district is omitted).
// This is HIOBuy's own fulfilment-routing address in China, unrelated to the customer's
// Somaliland shipping address stored on the order itself.

export interface ReceiverConfig {
  name: string;
  mobile: string;
  province: string;
  city: string;
  address: string;
}

export const receiverConfig: ReceiverConfig = {
  name: process.env.HIOBUY_RECEIVER_NAME ?? '',
  mobile: process.env.HIOBUY_RECEIVER_MOBILE ?? '',
  province: process.env.HIOBUY_RECEIVER_PROVINCE ?? '',
  city: process.env.HIOBUY_RECEIVER_CITY ?? '',
  address: process.env.HIOBUY_RECEIVER_ADDRESS ?? '',
};

export function assertReceiverConfigured(config: ReceiverConfig = receiverConfig): void {
  const missing = (Object.keys(config) as Array<keyof ReceiverConfig>).filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(
      `HIOBuy receiver address is not configured: HIOBUY_RECEIVER_${missing.join(', HIOBUY_RECEIVER_').toUpperCase()} must be set in server/.env before procurement can run.`,
    );
  }
}
