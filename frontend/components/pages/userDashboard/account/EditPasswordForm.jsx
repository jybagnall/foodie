import { useEffect } from "react";

export default function EditPasswordForm() {
  useEffect(() => {
    document.title = "Change Password | Foodie";
  }, []);

  return (
    <div>
      <h2>password form</h2>
    </div>
  );
}
