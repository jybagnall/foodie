import { Outlet } from "react-router-dom";
import Sidebar from "../pages/userDashboard/Sidebar";

export default function UserLayout() {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
