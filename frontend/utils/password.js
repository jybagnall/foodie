import {
  PASSWORD_RULES,
  PASSWORD_STRENGTH_CONFIG,
} from "../constants/passwordRules";

export function getPasswordStrength(password) {
  const score = PASSWORD_RULES.filter((rule) => rule.validate(password)).length;

  const { label, textColor, barColor } = PASSWORD_STRENGTH_CONFIG[score];

  return { score, label, textColor, barColor };
}
