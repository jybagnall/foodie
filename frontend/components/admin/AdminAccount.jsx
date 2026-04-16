import { useEffect } from "react";

export default function AdminAccount() {
  useEffect(() => {
    document.title = "Admin Profile | Foodie";
  }, []);

  return (
    <div>
      <h2>admin account</h2>
    </div>
  );
}
