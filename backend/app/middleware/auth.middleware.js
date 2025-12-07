import jwt from "jsonwebtoken";

export function veryfyUserAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.accountId || decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
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
      id: decoded.accountId || decoded.id,
      role: decoded.role,
    }; // 관리자 정보 req.user에 주입

    next();
  } catch (err) {
    console.error("Admin auth failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
