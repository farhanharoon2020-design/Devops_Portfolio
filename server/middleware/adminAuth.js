/**
 * middleware/adminAuth.js
 * Checks for the X-Admin-Key header.
 * Set ADMIN_KEY in your .env to enable the admin endpoints.
 */

module.exports = function adminAuth(req, res, next) {
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey) {
    return res.status(503).json({
      error: 'Admin functionality is not configured on this server.',
    });
  }

  const provided = req.headers['x-admin-key'];

  if (!provided || provided !== adminKey) {
    return res.status(401).json({
      error: 'Unauthorized. Provide a valid X-Admin-Key header.',
    });
  }

  next();
};
