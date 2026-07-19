import { useLocalSearchParams } from 'expo-router';

import { PaymentInstructionsScreen } from '@/screens/PaymentInstructionsScreen';

export default function CheckoutPaymentRoute() {
  const { reference } = useLocalSearchParams<{ reference?: string }>();
  return <PaymentInstructionsScreen reference={reference} />;
}
