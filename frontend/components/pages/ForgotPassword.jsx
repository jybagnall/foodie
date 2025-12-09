import { useEffect } from "react";

export default function ForgotPassword() {
  useEffect(() => {
    document.title = "Password reset | Foodie";
  }, []);
  return <div></div>;
}
