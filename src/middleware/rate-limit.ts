import rateLimit from "express-rate-limit";

/**
 * Rate limit: 60 requests per minute per IP.
 * This is applied at the Express level, before MCP routing.
 * IPs are held in memory only (not persisted).
 */
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please wait a moment and try again.",
  },
  // Skip logging the IP in the message
  skipSuccessfulRequests: false,
});
