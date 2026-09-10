/**
 * Role-Based Access Control Middleware
 */

const authorize = (...roles) => {
  const normalizedRoles = roles.map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: No role assigned to authenticated user.",
      });
    }

    const userRole = String(req.user.role).toLowerCase();

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Insufficient role permissions.",
      });
    }

    next();
  };
};

/**
 * Strict Server-Side Admin Authorization Middleware
 * Verifies that the authenticated user possesses the 'admin' role.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.role || String(req.user.role).toLowerCase() !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access Denied: Administrative privileges required.",
    });
  }

  next();
};

module.exports = {
  authorize,
  requireAdmin,
};