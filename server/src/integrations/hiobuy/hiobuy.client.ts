import { env } from '../../config/env';
import { logHiobuyQuota, recordHiobuyCall } from '../../utils/logger';
import type { HiobuyErrorEnvelope, HiobuyQuotaHeaders } from './hiobuy.types';

const BASE_URL = 'https://api.hiobuy.com';
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 300;

export class HiobuyRequestError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
    public readonly category?: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'HiobuyRequestError';
  }
}

let lastQuota: HiobuyQuotaHeaders = {};

export function getLastKnownQuota(): HiobuyQuotaHeaders {
  return lastQuota;
}

function apiKey(): string {
  const key = env.hiobuy.env === 'live' ? env.hiobuy.liveApiKey : env.hiobuy.testApiKey;
  if (!key) {
    throw new Error(
      `HIOBuy is not configured: HIO_${env.hiobuy.env === 'live' ? 'LIVE' : 'TEST'}_API_KEY must be set in server/.env.`,
    );
  }
  return key;
}

function captureQuotaHeaders(headers: Headers): void {
  lastQuota = {
    quotaBillableUnits: headers.get('x-quota-billable-units') ?? undefined,
    quotaChannel: headers.get('x-quota-channel') ?? undefined,
    quotaRemainingDay: headers.get('x-quota-remaining-day') ?? undefined,
    quotaPackRemaining: headers.get('x-quota-pack-remaining') ?? undefined,
    requestId: headers.get('x-request-id') ?? undefined,
  };
  // Quota headers only — no auth/key material, no request/response bodies (plan §12).
  logHiobuyQuota(lastQuota);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(status: number, attempt: number): boolean {
  if (attempt >= MAX_RETRIES) return false;
  if (status === 429 || status >= 500) {
    return status !== 502 || attempt === 0; // 502 retried once only
  }
  return false;
}

export async function hiobuyPost<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const url = `${BASE_URL}${path}`;
  let attempt = 0;

  for (;;) {
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey()}`,
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
        attempt += 1;
        continue;
      }
      recordHiobuyCall(path, false);
      throw new HiobuyRequestError(
        error instanceof Error ? error.message : 'Network error calling HIOBuy',
        0,
      );
    }

    captureQuotaHeaders(response.headers);

    if (response.ok) {
      recordHiobuyCall(path, true);
      return (await response.json()) as TResponse;
    }

    if (shouldRetry(response.status, attempt)) {
      await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
      attempt += 1;
      continue;
    }

    recordHiobuyCall(path, false);

    let envelope: HiobuyErrorEnvelope | null = null;
    try {
      envelope = (await response.json()) as HiobuyErrorEnvelope;
    } catch {
      envelope = null;
    }

    throw new HiobuyRequestError(
      envelope?.error?.message ?? `HIOBuy request failed with status ${response.status}`,
      response.status,
      envelope?.error?.code,
      envelope?.error?.category,
      envelope?.error?.request_id,
    );
  }
}
