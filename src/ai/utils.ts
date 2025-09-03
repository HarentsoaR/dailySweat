export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  factor?: number;
  maxDelayMs?: number;
  isRetryableError?: (error: unknown) => boolean;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runWithRetries<T>(
  operation: () => Promise<T>,
  {
    retries = 3,
    baseDelayMs = 400,
    factor = 2,
    maxDelayMs = 4000,
    isRetryableError = defaultIsRetryable,
  }: RetryOptions = {}
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= retries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRetryableError(error)) break;
      const backoff = Math.min(baseDelayMs * Math.pow(factor, attempt), maxDelayMs);
      const jitter = backoff * (0.2 + Math.random() * 0.3);
      await sleep(backoff + jitter);
      attempt += 1;
    }
  }
  throw lastError;
}

function defaultIsRetryable(error: unknown): boolean {
  const message = typeof error === 'object' && error && 'message' in error ? String((error as any).message || '') : String(error || '');
  if (/503/.test(message)) return true;
  if (/overloaded/i.test(message)) return true;
  if (/temporarily unavailable/i.test(message)) return true;
  if (/ECONNRESET|ETIMEDOUT|ENOTFOUND|network/i.test(message)) return true;
  if (/429/.test(message)) return true;
  return false;
}
