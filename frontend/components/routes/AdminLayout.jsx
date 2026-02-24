import { Outlet } from "react-router-dom";
import StripeErrorBanner from "../admin/StripeErrorBanner";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-8">
        <StripeErrorBanner />
        <Outlet />
      </main>
    </div>
  );
}
