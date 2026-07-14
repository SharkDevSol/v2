// AI Rate Limiter — per-teacher rate limiting for AI endpoints
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many AI requests. Please wait a moment before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
});

const aiUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { error: 'Upload limit reached. Try again later.' },
  validate: { xForwardedForHeader: false }
});

module.exports = { aiLimiter, aiUploadLimiter };
