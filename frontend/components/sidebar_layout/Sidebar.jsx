import {
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  BookOpenIcon,
  CreditCardIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import { Link } from "react-router-dom";
import SidebarContext from "../../contexts/SidebarContext";

const navigation = [
  { name: "My Account", to: "#", icon: UserIcon, current: true },
  { name: "Orders", to: "#", icon: TicketIcon, current: false },
  { name: "Address Book", to: "#", icon: BookOpenIcon, current: false },
  { name: "Payment Methods", to: "#", icon: CreditCardIcon, current: false },
];

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);

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
        <nav className="flex flex-col h-full overflow-y-auto px-4 py-6 space-y-2">
          <div className="flex-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                  item.current
                    ? "bg-gray-800 text-yellow-400"
                    : "text-gray-300 hover:bg-gray-800 hover:text-yellow-300"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="mt-auto px-4">
          <Link
            to="#"
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-300 text-sm font-medium"
          >
            <ArrowRightStartOnRectangleIcon
              aria-hidden="true"
              className="size-6 shrink-0"
            />
            Logout
          </Link>
        </div>
      </div>
    </>
  );
}
