import { Outlet } from "react-router-dom";

export default function OrderLayout() {
  return (
    <div className="min-h-screen">
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}
