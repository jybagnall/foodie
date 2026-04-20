// rules.name === rules["name"]

const rules = {
  name: (v) => {
    if (!v || typeof v !== "string") return "Name is required.";
    if (v.length < 5 || v.length > 20) return "Name must be 5–20 characters.";
  },
  email: (v) => {
    if (!v || typeof v !== "string") return "Email is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v)) return "Valid email is required.";
  },
  password: (v) => {
    if (!v || typeof v !== "string") return "Password is required.";
    if (v.length < 6) return "Password must be at least 6 characters.";
  },
  full_name: (v) => {
    if (!v || typeof v !== "string" || v.length < 2)
      return "Full name is required.";
  },
  street: (v) => {
    if (!v || typeof v !== "string" || v.length < 2)
      return "Street is required.";
  },
  city: (v) => {
    if (!v || typeof v !== "string" || v.length < 2) return "City is required.";
  },
  postal_code: (v) => {
    if (!v || typeof v !== "string") return "Postal code is required.";
  },
  phone: (v) => {
    if (!v || typeof v !== "string") return "Phone is required.";
  },
  is_default: (v) => {
    if (v !== undefined && typeof v !== "boolean")
      return "is_default must be a boolean.";
  },
};

// return (req, res, next) => { ... 미들웨어를 생성함
export function validateBody(...fields) {
  return (req, res, next) => {
    try {
      const errors = {};

      for (const field of fields) {
        let value = req.body[field]; // "Jiyoung"

        if (typeof value === "string") {
          value = value.trim();
          if (field === "email") value = value.toLowerCase();
          req.body[field] = value; // req.body 값을 수정
        }

        if (!rules[field]) {
          throw new Error(`No validation rule for field: ${field}`);
        } // catch에서 잡음

        const error = rules[field](value);
        if (error) {
          errors[field] = error; // 에러 모음 모음
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      } // 모든 검사 끝난 후 한 번에 반환

      next();
    } catch (err) {
      console.error("Validation error:", err.message);
      res
        .status(500)
        .json({ error: "Something went wrong while validating your request." });
    }
  };
}
