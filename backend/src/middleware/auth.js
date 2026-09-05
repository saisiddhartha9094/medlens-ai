import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "medlens-clinical-secret-sih-2026-key";

/**
 * Middleware to authenticate requests using Bearer JWT tokens.
 * Optional flag allows guest browsing while still attaching user if token is provided.
 */
export function authenticateToken(optional = false) {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      if (optional) {
        req.user = null;
        return next();
      }
      return res.status(401).json({ success: false, error: "Access Denied: Authentication token required" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        if (optional) {
          req.user = null;
          return next();
        }
        return res.status(403).json({ success: false, error: "Forbidden: Invalid or expired authentication token" });
      }
      req.user = user;
      next();
    });
  };
}

/**
 * Middleware to enforce role-based access control (e.g. CLINICIAN vs PATIENT)
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: This action requires the '${role}' role privilege.`
      });
    }
    next();
  };
}
