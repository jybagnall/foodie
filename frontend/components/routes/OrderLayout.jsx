import { Outlet } from "react-router-dom";

export default function OrderLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}
