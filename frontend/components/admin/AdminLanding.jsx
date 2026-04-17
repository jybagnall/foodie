import { Link } from "react-router-dom";
import {
  CameraIcon,
  UserIcon,
  ArrowUpRightIcon,
  EnvelopeIcon,
  HomeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useEffect } from "react";

const actions = [
  {
    title: "Upload a new menu",
    to: "/admin/new-menu",
    icon: CameraIcon,
    iconForeground: "text-purple-700",
    iconBackground: "bg-purple-200",
  },
  {
    title: "View menu",
    to: "/admin/menu-preview",
    icon: HomeIcon,
    iconForeground: "text-orange-700",
    iconBackground: "bg-orange-200",
  },
  {
    title: "Manage your admin account",
    to: "/admin/account",
    icon: UserIcon,
    iconForeground: "text-sky-700",
    iconBackground: "bg-sky-200",
  },
  {
    title: "Invite a new admin",
    to: "/admin/invite",
    icon: EnvelopeIcon,
    iconForeground: "text-green-700",
    iconBackground: "bg-green-200",
  },
  {
    title: "Monitor Errored Stripe Events",
    to: "/admin/events-monitor",
    icon: ExclamationTriangleIcon,
    iconForeground: "text-pink-700",
    iconBackground: "bg-pink-200",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminLanding() {
  useEffect(() => {
    document.title = "Admin Dashboard | Foodie";
  }, []);

  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-700 shadow-sm sm:grid sm:grid-cols-2 sm:divide-y-0">
      {actions.map((action, actionIdx) => (
        <div
          key={action.title}
          className={classNames(
            actionIdx === 0
              ? "rounded-tl-lg rounded-tr-lg sm:rounded-tr-none"
              : "",
            actionIdx === 1 ? "sm:rounded-tr-lg" : "",
            actionIdx === actions.length - 2 ? "sm:rounded-bl-lg" : "",
            actionIdx === actions.length - 1
              ? "rounded-br-lg rounded-bl-lg sm:rounded-bl-none"
              : "",
            "group relative border-gray-700 bg-gray-600 p-6 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 sm:odd:not-nth-last-2:border-b sm:even:border-l sm:even:not-last:border-b",
          )}
        >
          <div>
            <span
              className={classNames(
                action.iconBackground,
                action.iconForeground,
                "inline-flex rounded-lg p-3",
              )}
            >
              <action.icon aria-hidden="true" className="size-6" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-base font-semibold text-gray-300">
              <Link to={action.to} className="focus:outline-hidden">
                <span aria-hidden="true" className="absolute inset-0" />
                {action.title}
              </Link>
            </h3>
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-6 right-6 text-gray-200 group-hover:text-yellow-500"
          >
            <ArrowUpRightIcon className="size-6" />
          </span>
        </div>
      ))}
    </div>
  );
}
