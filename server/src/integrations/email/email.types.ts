import type { Order } from '../../types/order';

export type OrderEmailData = Order;

export interface RenderedEmail {
  subject: string;
  html: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}
