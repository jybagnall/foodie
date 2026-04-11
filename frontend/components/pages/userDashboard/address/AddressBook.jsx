import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import useAddressBook from "../../../..//hooks/useAddressBook";
import ErrorAlert from "../../../user_feedback/ErrorAlert";
import AddressCard from "../../userDashboard/address/AddressCard";
import Spinner from "../../../user_feedback/Spinner";

export default function AddressBook() {
  const {
    addresses,
    setDefaultAddress,
    deleteAddress,
    isFetching,
    isDeleting,
    fetchingError,
    isUpdatingDefaultAddress,
    isDefaultUpdateError,
    isDeleteError,
  } = useAddressBook();

  const errorProps = [
    {
      condition: isDefaultUpdateError,
      errorMsg:
        "We couldn't update your default address. Please try again later.",
      title: "Update failed",
    },
    {
      condition: fetchingError,
      errorMsg:
        "We couldn't load your addresses due to a network issue. Please try again.",
      title: "Connection issue",
    },
    {
      condition: isDeleteError,
      errorMsg: "We couldn't delete the address. Please try again later.",
      title: "Delete failed",
    },
  ];

  const currentError = errorProps.find(({ condition }) => condition);

  if (isFetching || isUpdatingDefaultAddress) return <Spinner />;

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4 space-y-6">
      <p className="font-bold text-xl">Address Book</p>
      {currentError && (
        <div className="w-full max-w-2xl">
          <ErrorAlert
            title={currentError.title}
            message={currentError.errorMsg}
          />
        </div>
      )}

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/my-account/address/new"
          className="w-full rounded-lg border-2 border-dashed border-gray-400 p-12 text-center hover:border-gray-300 cursor-pointer"
        >
          <PlusIcon className="h-7 w-7 mx-auto text-gray-400 mt-3" />
          <span className="mt-2 block text-sm font-semibold text-gray-50">
            Add New Address
          </span>
        </Link>

        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            info={address}
            setDefaultAddress={setDefaultAddress}
            deleteAddress={deleteAddress}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </main>
  );
}
