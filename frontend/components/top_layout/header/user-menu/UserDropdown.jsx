import { Link } from "react-router-dom";
import {
  ArrowRightStartOnRectangleIcon,
  UserIcon,
  BookOpenIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "My Account", to: "/my-account", icon: UserIcon },
  {
    name: "Orders",
    to: "/my-account/orders",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Address Book",
    to: "/my-account/address",
    icon: BookOpenIcon,
  },
  {
    name: "Payment Methods",
    to: "/my-account/payment-methods",
    icon: CreditCardIcon,
  },
];

export default function UserDropdown({ onLogout }) {
  return (
    <div className="absolute top-0 right-0 w-48 shadow-lg rounded-md mt-7 z-50 bg-gray-500">
      <nav aria-label="Sidebar" className="flex flex-1 flex-col">
        <ul role="list" className="mx-2 space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.to}
                className="text-yellow-400 hover:bg-gray-700 hover:text-yellow-400, group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
              >
                <item.icon
                  aria-hidden="true"
                  className="text-yellow-400 group-hover:text-yellow-400 size-6 shrink-0"
                />
                {item.name}
              </Link>
            </li>
          ))}
          <div className="my-1 border-t border-white/50" />
          <div className="my-1 rounded-md">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-x-3 rounded-md p-2 text-sm text-yellow-400 transition-colors font-semibold cursor-pointer"
            >
              <ArrowRightStartOnRectangleIcon className="size-6 text-yellow-400" />
              Logout
            </button>
          </div>
        </ul>
      </nav>
    </div>
  );
}
