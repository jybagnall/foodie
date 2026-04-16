import { useEffect } from "react";

export default function DeleteAccount() {
  useEffect(() => {
    document.title = "Delete Account | Foodie";
  }, []);

  return (
    <div>
      <h2>delete account</h2>
    </div>
  );
}
