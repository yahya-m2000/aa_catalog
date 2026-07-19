import { apiGet } from './client';

export interface PaymentInstructions {
  zaadNumber: string;
  zaadAccountName: string;
  cashContactNumber: string;
  paymentDeadlineDays: number;
  instructionsEn: string;
}

export function getPaymentInstructions(reference?: string): Promise<PaymentInstructions> {
  return apiGet<PaymentInstructions>('/api/payment/instructions', reference ? { reference } : undefined);
}
