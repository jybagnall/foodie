import { useEffect } from "react";
import useAdmins from "../../hooks/useAdmins";
import BackToDash from "../UI/BackToDash";
import Spinner from "../user_feedback/Spinner";
import ErrorAlert from "../user_feedback/ErrorAlert";
import { formatDateTime } from "../../utils/format";

export default function AdminManagement() {
  const { admins, isError, isFetching } = useAdmins();

  useEffect(() => {
    document.title = "Admin Management| Foodie";
  }, []);

  if (isFetching) {
    return <Spinner />;
  }

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-4">
          <BackToDash url="/admin" dashboardName="Back to admin dashboard" />
        </div>
        {isError && (
          <div className="mb-4">
            <ErrorAlert
              title="There was a problem with your request"
              message="Something went wrong while loading data."
            />
          </div>
        )}

        <section className="w-full max-w-lg bg-gray-700 shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-200 mb-6 border-b pb-3">
            Admin Management
          </h2>

          <div className="flex flex-col gap-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="rounded-lg border border-gray-600 bg-gray-800 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">
                    {admin.name}
                  </h3>

                  <span className="text-xs text-gray-400">ID #{admin.id}</span>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-gray-400">Email:</span>{" "}
                    {admin.email}
                  </p>

                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-gray-400">Created:</span>{" "}
                    {formatDateTime(admin.created_at)}
                  </p>

                  <p className="text-sm text-gray-300">
                    <span className="font-medium text-gray-400">
                      Last login:
                    </span>{" "}
                    {formatDateTime(admin.last_login_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
