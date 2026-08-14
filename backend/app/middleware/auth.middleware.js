import { verifyAccessToken } from "../utils/auth";
import { AUTH_ERROR, AUTH_ERROR_STATUS } from "../constants/errors";

export function verifyUserAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const decoded = verifyAccessToken(authHeader);

    // id, role, email → JWT 발급 시 항상 존재
    // stripe_customer_id → JWT 갱신 전에는 없을 수 있음
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      stripe_customer_id: decoded.stripe_customer_id || null,
    };

    next();
  } catch (err) {
    if (
      err.message === AUTH_ERROR.SESSION_EXPIRED ||
      err.message === AUTH_ERROR.INVALID_ACCESS_TOKEN
    ) {
      const status = AUTH_ERROR_STATUS[err.message] ?? 401;
      return res.status(status).json({
        error: "Your session has expired. Please sign in again.",
      });
    }

    return next(err);
  }
}

export function verifyAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const decoded = verifyAccessToken(authHeader);

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Admins only" });
    } // 관리자 권한 확인

    req.user = {
      id: decoded.id,
      role: decoded.role,
    }; // 관리자 정보 req.user에 주입

    next();
  } catch (err) {
    if (
      err.message === AUTH_ERROR.SESSION_EXPIRED ||
      err.message === AUTH_ERROR.INVALID_ACCESS_TOKEN
    ) {
      console.warn("Admin auth failed (expired/invalid token)");
      const status = AUTH_ERROR_STATUS[err.message] ?? 401;
      return res.status(status).json({
        error: "Invalid or expired token. Please log in again.",
      });
    }

    console.error("Unexpected admin auth error:", err);
    return next(err); // 전역 에러 핸들러로 넘김
  }
}
