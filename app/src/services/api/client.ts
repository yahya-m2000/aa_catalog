import { t } from '@/i18n';
import type { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export class ApiClientError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
  }
}

function networkError(): ApiClientError {
  return new ApiClientError('NETWORK_ERROR', t('common.networkError'));
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  let body: ApiResponse<T>;
  try {
    body = await response.json();
  } catch {
    throw new ApiClientError('INVALID_RESPONSE', t('common.unexpectedResponse'));
  }

  if (!response.ok || !body.success || body.data === undefined) {
    throw new ApiClientError(body.error?.code ?? 'UNKNOWN_ERROR', body.error?.message ?? t('common.somethingWentWrong'));
  }

  return body.data;
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch {
    throw networkError();
  }

  return parseApiResponse<T>(response);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = new URL(path, API_BASE_URL);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw networkError();
  }

  return parseApiResponse<T>(response);
}
