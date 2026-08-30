export const PASSWORD_RULES = [
  {
    key: "minLength",
    label: "8 characters minimum",
    validate: (value) => value.length >= 8,
    message: "At least 8 characters.",
  },
  {
    key: "hasUppercase",
    label: "Uppercase letter",
    validate: (value) => /[A-Z]/.test(value),
    message: "At least one uppercase letter.",
  },
  {
    key: "hasLowercase",
    label: "Lowercase letter",
    validate: (value) => /[a-z]/.test(value),
    message: "At least one lowercase letter.",
  },
  {
    key: "hasNumber",
    label: "Number",
    validate: (value) => /\d/.test(value),
    message: "At least one number.",
  },
  {
    key: "hasSpecial",
    label: "Special character",
    validate: (value) => /[@$!%*?&]/.test(value),
    message: "At least one special character (@$!%*?&).",
  },
];

export const PASSWORD_REQUIREMENTS = [
  ...PASSWORD_RULES,
  {
    key: "noWhitespace",
    label: "No spaces",
    validate: (value) => !/\s/.test(value),
    message: "Password cannot contain spaces.",
  },
];

export const PASSWORD_STRENGTH_CONFIG = [
  {
    label: "",
    textColor: "text-gray-400",
    barColor: "bg-gray-300",
  },
  {
    label: "Very Weak",
    textColor: "text-red-400",
    barColor: "bg-red-400",
  },
  {
    label: "Weak",
    textColor: "text-orange-400",
    barColor: "bg-orange-400",
  },
  {
    label: "Fair",
    textColor: "text-yellow-400",
    barColor: "bg-yellow-400",
  },
  {
    label: "Almost there",
    textColor: "text-blue-400",
    barColor: "bg-blue-400",
  },
  {
    label: "Strong",
    textColor: "text-green-400",
    barColor: "bg-green-400",
  },
];
