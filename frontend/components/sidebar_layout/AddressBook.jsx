import { useContext } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AuthContext from "../../contexts/AuthContext";
import useAddressBook from "../../hooks/useAddressBook";
import ErrorAlert from "../user_feedback/ErrorAlert";
import AddressCard from "./AddressCard";
import Spinner from "../user_feedback/Spinner";

export default function AddressBook() {
  const { accessToken } = useContext(AuthContext);
  const { addresses, isFetching, fetchingError } = useAddressBook(accessToken);

  if (isFetching) return <Spinner />;

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4 space-y-6">
      {fetchingError && (
        <div className="w-full max-w-2xl">
          <ErrorAlert
            title="Connection error"
            message="We couldn’t load your addresses due to a network issue"
          />
        </div>
      )}

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          className="w-full rounded-lg border-2 border-dashed border-gray-400 p-12 text-center hover:border-gray-300 cursor-pointer"
        >
          <PlusIcon className="h-7 w-7 mx-auto text-gray-400 mt-3" />
          <span className="mt-2 block text-sm font-semibold text-gray-50">
            Add New Address
          </span>
        </button>

        {addresses.map((address) => (
          <AddressCard key={address.id} info={address} />
        ))}
      </div>
    </main>
  );
}
