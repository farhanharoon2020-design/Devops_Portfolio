/**
 * utils/cache.js
 * Simple in-memory TTL cache — no external dependencies.
 * Usage:
 *   cache.set('key', data, 300);   // store for 300 seconds
 *   cache.get('key');               // returns data or null if expired
 */

const store = new Map();

/**
 * Store a value with a TTL (seconds).
 */
function set(key, value, ttlSeconds = 60) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Retrieve a value. Returns null if not found or expired.
 */
function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Delete a specific key.
 */
function del(key) {
  store.delete(key);
}

/**
 * Clear all cached values.
 */
function clear() {
  store.clear();
}

/**
 * Return cache stats for the admin dashboard.
 */
function stats() {
  const now = Date.now();
  let active = 0;
  let expired = 0;
  for (const [, entry] of store) {
    if (now > entry.expiresAt) expired++;
    else active++;
  }
  return { total: store.size, active, expired };
}

module.exports = { set, get, del, clear, stats };
