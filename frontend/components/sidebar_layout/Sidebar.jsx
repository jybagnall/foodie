import {
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  BookOpenIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import SidebarContext from "../../contexts/SidebarContext";
import AuthContext from "../../contexts/AuthContext";

const navigation = [
  { name: "My Account", to: "#", icon: UserIcon, current: true },
  { name: "Orders", to: "#", icon: ClipboardDocumentListIcon, current: false },
  { name: "Address Book", to: "#", icon: BookOpenIcon, current: false },
  { name: "Payment Methods", to: "#", icon: CreditCardIcon, current: false },
];

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const authContext = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("refreshToken");
    Cookies.remove("accessToken");
    authContext.setDecodedUser(null);
    authContext.setAccessToken(null);
    navigate("/login");
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`fixed left-0 top-[5.5rem] md:top-[5.5rem] h-[calc(100vh-5.5rem)] md:h-[calc(100vh-5.5rem)] w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block z-30`}
      >
        <nav className="flex flex-col h-full px-4 py-6">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors
          ${
            item.current
              ? "bg-gray-800 text-yellow-400"
              : "text-gray-300 hover:bg-gray-800/60 hover:text-yellow-300"
          }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="fixed bottom-16 left-0 w-64 px-4">
          <div
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-300 text-sm font-medium transition-colors cursor-pointer"
          >
            <ArrowRightStartOnRectangleIcon
              aria-hidden="true"
              className="size-6 shrink-0"
            />
            Logout
          </div>
        </div>
      </div>
    </>
  );
}
