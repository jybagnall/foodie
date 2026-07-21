import { PASSWORD_RULES } from "../../constants/passwordRules";
import { getPasswordStrength } from "../../utils/password";

export default function PasswordStrengthBar({ password }) {
  if (!password) return null;

  const { score, label, barColor, textColor } = getPasswordStrength(password);

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {PASSWORD_RULES.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              i < score ? barColor : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <p className={`text-xs font-medium ${textColor}`}>
        Password Strength: {label}
      </p>
    </div>
  );
}
