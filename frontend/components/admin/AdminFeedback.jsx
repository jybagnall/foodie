import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminFeedback({ msg }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/admin");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="p-4 bg-green-100 border border-green-100 rounded-lg text-green-800 shadow-sm">
      <p className="font-medium">{msg}</p>
      <p className="text-sm mt-1">Redirecting to admin dashboard...</p>
    </div>
  );
}
