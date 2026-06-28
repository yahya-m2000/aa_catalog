import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  businessEmail: process.env.BUSINESS_EMAIL ?? 'business@example.com',
  ordersEmail: process.env.ORDERS_EMAIL ?? 'orders@example.com',
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? 'no-reply@example.com',
  },
};
