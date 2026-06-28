import { useLocalSearchParams } from 'expo-router';

import { CheckoutSuccessScreen } from '@/screens/CheckoutSuccessScreen';

export default function CheckoutSuccessRoute() {
  const { reference } = useLocalSearchParams<{ reference: string }>();
  return <CheckoutSuccessScreen reference={reference} />;
}
