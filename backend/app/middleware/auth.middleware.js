import jwt from "jsonwebtoken";

export function verifyUserAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Your session has expired. Please sign in again." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.tokenType !== "access") {
      return res
        .status(401)
        .json({ error: "Your session has expired. Please sign in again." });
    }

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
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Your session has expired. Please sign in again.",
      });
    }

    return next(err);
  }
}

export function verifyAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not defined");

    const decoded = jwt.verify(token, secret); // JWT 검증

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Admins only" });
    } // 관리자 권한 확인

    req.user = {
      id: decoded.id,
      role: decoded.role,
    }; // 관리자 정보 req.user에 주입

    next();
  } catch (err) {
    console.error("Admin auth failed:", err);

    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid or expired token. Please log in again.",
      });
    }
    return next(err); // 전역 에러 핸들러로 넘김
  }
}
