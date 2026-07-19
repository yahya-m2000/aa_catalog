export interface PaymentConfig {
  zaadNumber: string;
  zaadAccountName: string;
  cashContactNumber: string;
  paymentDeadlineDays: number;
}

export const paymentConfig: PaymentConfig = {
  zaadNumber: process.env.ZAAD_NUMBER ?? '',
  zaadAccountName: process.env.ZAAD_ACCOUNT_NAME ?? '',
  cashContactNumber: process.env.CASH_CONTACT_NUMBER ?? '',
  paymentDeadlineDays: Number(process.env.PAYMENT_DEADLINE_DAYS ?? 7),
};

// Exact copy per plan §11 — placeholders interpolated at render time, never hardcoded in screens.
export function buildPaymentInstructions(
  orderReference: string,
  config: PaymentConfig = paymentConfig,
): { en: string; so: string } {
  const en =
    `Your order has been received and is awaiting payment. To pay by Zaad, send the total amount to ` +
    `${config.zaadNumber}, account name ${config.zaadAccountName}. Use your order reference ${orderReference} ` +
    `as the payment reference. For cash payments, contact us at ${config.cashContactNumber} for payment ` +
    `instructions. We will confirm your order after payment is verified.`;

  const so =
    `Dalabkaaga waa la helay, wuxuuna sugayaa lacag-bixin. Si aad ugu bixiso Zaad, lacagta guud ugu dir ` +
    `${config.zaadNumber}, magaca akoonka ${config.zaadAccountName}. Tixraac ahaan u isticmaal lambarka ` +
    `dalabkaaga ${orderReference}. Haddii aad lacag caddaan ah ku bixinayso, nagala soo xiriir ` +
    `${config.cashContactNumber} si aad u hesho tilmaamaha lacag-bixinta. Dalabkaaga waan xaqiijin doonaa ` +
    `marka lacagta la hubiyo.`;

  return { en, so };
}
