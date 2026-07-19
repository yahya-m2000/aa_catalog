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
  hiobuy: {
    env: process.env.HIOBUY_ENV === 'live' ? 'live' as const : 'test' as const,
    testApiKey: process.env.HIO_TEST_API_KEY,
    liveApiKey: process.env.HIO_LIVE_API_KEY,
  },
  graph: {
    tenantId: process.env.GRAPH_TENANT_ID,
    clientId: process.env.GRAPH_CLIENT_ID,
    clientSecret: process.env.GRAPH_CLIENT_SECRET,
    siteId: process.env.GRAPH_SITE_ID,
    ordersListId: process.env.GRAPH_ORDERS_LIST_ID,
    sendMailUserId: process.env.GRAPH_SENDMAIL_USER_ID,
  },
};

export function assertGraphConfigured(): void {
  const { tenantId, clientId, clientSecret, siteId, ordersListId } = env.graph;
  if (!tenantId || !clientId || !clientSecret || !siteId || !ordersListId) {
    throw new Error(
      'Microsoft Graph is not configured: GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, GRAPH_SITE_ID, and GRAPH_ORDERS_LIST_ID must all be set in server/.env.',
    );
  }
}

export function assertGraphMailConfigured(): void {
  assertGraphConfigured();
  if (!env.graph.sendMailUserId) {
    throw new Error(
      'Microsoft Graph mail sending is not configured: GRAPH_SENDMAIL_USER_ID must be set in server/.env.',
    );
  }
}
