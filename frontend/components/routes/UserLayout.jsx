import { useContext } from "react";
import { Outlet } from "react-router-dom";

import AuthContext from "../../contexts/AuthContext";
import Sidebar from "../sidebar_layout/Sidebar";

export default function UserLayout() {
  const { accessToken } = useContext(AuthContext);

  if (!accessToken) return null; // 로그인 안된 상태면 아무것도 안 보이게

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
