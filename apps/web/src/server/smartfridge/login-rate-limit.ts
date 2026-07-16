type Attempt = {
  failures: number;
  resetAt: number;
};

const attempts = new Map<string, Attempt>();
const WINDOW_MS = 15 * 60 * 1000;

function cleanup(now: number) {
  for (const [key, value] of attempts) {
    if (value.resetAt <= now) attempts.delete(key);
  }
}

export function assertLoginAllowed(key: string, limit: number) {
  const now = Date.now();
  cleanup(now);
  const current = attempts.get(key);
  if (current && current.failures >= limit && current.resetAt > now) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    throw new Response('Too many login attempts.', {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    });
  }
}

export function recordLoginFailure(key: string) {
  const now = Date.now();
  cleanup(now);
  const current = attempts.get(key);
  attempts.set(key, {
    failures: current ? current.failures + 1 : 1,
    resetAt: current?.resetAt && current.resetAt > now ? current.resetAt : now + WINDOW_MS,
  });
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
