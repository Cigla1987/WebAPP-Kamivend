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
