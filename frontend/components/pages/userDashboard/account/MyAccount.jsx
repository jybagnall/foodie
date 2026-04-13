import {
  PencilIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import PageError from "../../../user_feedback/PageError";
import Spinner from "../../../user_feedback/Spinner";
import useMyProfile from "../../../../hooks/useMyProfile";

// user: id, created_at, name, email
export default function MyAccount() {
  const { user, isFetching, userFetchingError } = useMyProfile();

  if (isFetching || !user) return <Spinner />;
  if (!user) return <PageError />;
  if (userFetchingError) return <PageError />;

  const fields = [
    { label: "Email", path: "", value: user.email, icon: EnvelopeIcon },
    { label: "Full Name", path: "name", value: user.name, icon: UserIcon },
    {
      label: "Password",
      path: "password",
      value: "••••••••",
      icon: LockClosedIcon,
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="font-bold text-xl">My Account</p>
        <div className="w-full p-6 text-left mt-5">
          {fields.map((f) => (
            <div
              key={f.path}
              className={`flex items-center justify-between py-3 border-b`}
            >
              {/* Left side */}
              <div className="flex items-center gap-3 mb-1">
                {/* Field Icon */}
                <f.icon className="w-7 h-7 text-gray-400" />

                {/* Text */}
                <div className="flex flex-col">
                  <span className="text-sm text-gray-300 mb-1">{f.label}</span>
                  <span className="text-base font-medium">{f.value}</span>
                </div>
              </div>
              {f.value !== user.email && (
                <Link
                  to={`/my-account/edit/${f.path}`}
                  className="text-gray-300"
                >
                  <PencilIcon className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}

          <Link
            to="/my-account/account-deletion"
            className="block text-red-400 hover:text-red-500 mt-5"
          >
            Delete your Foodie account
          </Link>
        </div>
      </div>
    </div>
  );
}
