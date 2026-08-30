import { PASSWORD_REQUIREMENTS } from "../../constants/passwordRules";
import Input from "./Input";
import PasswordStrengthBar from "./PasswordStrengthBar";

export default function PasswordField({ register, errors, watch, getValues }) {
  const password = watch("password", "");

  const passwordValidationRules = Object.fromEntries(
    PASSWORD_REQUIREMENTS.map((rule) => [
      rule.key,
      (value) => rule.validate(value) || rule.message,
    ]),
  );

  return (
    <>
      <Input
        label="Password"
        type="password"
        id="password"
        register={register("password", {
          required: "Please enter password.",
          validate: passwordValidationRules,
        })}
        error={errors.password}
      />

      {password && (
        <p className="text-sm font-small text-gray-400">
          Use at least 8 characters, including uppercase, lowercase, a number,
          and a special character. No spaces.
        </p>
      )}
      {password && <PasswordStrengthBar password={password} />}

      <Input
        label="Re-enter Password"
        type="password"
        id="confirmPassword"
        register={register("confirmPassword", {
          required: "Please confirm your password.",
          validate: (value) => {
            if (/\s/.test(value)) {
              return "Password cannot contain spaces.";
            }

            return value === getValues("password") || "Passwords do not match.";
          },
        })}
        error={errors.confirmPassword}
      />
    </>
  );
}
