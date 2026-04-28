const test = require('node:test');
const assert = require('node:assert/strict');

function createLimiter() {
  const buckets = new Map();
  return (key, limit, windowMs) => {
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }

    if (existing.count >= limit) return true;
    existing.count += 1;
    return false;
  };
}

test('rate limits after threshold', () => {
  const isRateLimited = createLimiter();
  assert.equal(isRateLimited('k', 2, 10000), false);
  assert.equal(isRateLimited('k', 2, 10000), false);
  assert.equal(isRateLimited('k', 2, 10000), true);
});
