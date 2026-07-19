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
  internalTaskSecret: process.env.INTERNAL_TASK_SECRET,
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

export function assertHiobuyConfigured(): void {
  const key = env.hiobuy.env === 'live' ? env.hiobuy.liveApiKey : env.hiobuy.testApiKey;
  if (!key) {
    throw new Error(
      `HIOBuy is not configured: HIO_${env.hiobuy.env === 'live' ? 'LIVE' : 'TEST'}_API_KEY must be set in server/.env (or leave both unset to run in mock mode).`,
    );
  }
}

/**
 * Non-throwing startup check (plan §12/Run 16): logs a single redacted warning line per
 * missing-but-expected-in-production var, without ever printing the var's value. Safe to
 * call unconditionally at boot — mock/dev mode intentionally leaves HIOBuy/Graph unset, so
 * this only warns, it never exits the process.
 */
export function warnOnMissingProductionEnv(): void {
  const missing: string[] = [];

  if (!env.hiobuy.testApiKey && !env.hiobuy.liveApiKey) missing.push('HIO_TEST_API_KEY/HIO_LIVE_API_KEY');
  if (env.hiobuy.env === 'live' && !env.hiobuy.liveApiKey) missing.push('HIO_LIVE_API_KEY');

  const graphVars: Array<[string, unknown]> = [
    ['GRAPH_TENANT_ID', env.graph.tenantId],
    ['GRAPH_CLIENT_ID', env.graph.clientId],
    ['GRAPH_CLIENT_SECRET', env.graph.clientSecret],
    ['GRAPH_SITE_ID', env.graph.siteId],
    ['GRAPH_ORDERS_LIST_ID', env.graph.ordersListId],
    ['GRAPH_SENDMAIL_USER_ID', env.graph.sendMailUserId],
  ];
  const missingGraphVars = graphVars.filter(([, value]) => !value).map(([name]) => name);
  if (missingGraphVars.length > 0 && missingGraphVars.length < graphVars.length) {
    // Partially configured is more likely a mistake than "intentionally unset for mock mode".
    missing.push(`Graph (partially set): ${missingGraphVars.join(', ')}`);
  } else if (missingGraphVars.length === graphVars.length) {
    missing.push('GRAPH_* (all unset — order persistence/email will fail at runtime)');
  }

  if (missing.length > 0) {
    // Names only — never values (plan §12: never log secrets).
    console.log(JSON.stringify({ event: 'env_check', status: 'incomplete', missing, ts: new Date().toISOString() }));
  } else {
    console.log(JSON.stringify({ event: 'env_check', status: 'ok', ts: new Date().toISOString() }));
  }
}
