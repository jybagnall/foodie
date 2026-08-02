import { PlusIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";
import AddressFields from "../../../UI/AddressFields";
import AddressSelectableCard from "../../userDashboard/address/AddressSelectableCard";
import { ADDRESS_SELECTOR_HEADINGS, EMPTY_ADDRESS } from "./address.constants";

export default function AddressSelector({
  addresses,
  onAddressSubmit,
  mode,
  selectedAddressId,
  editAddress,
  createAddress,
  selectAddress,
  isEditing,
  isCreating,
}) {
  const { handleSubmit, reset } = useFormContext();

  const sortedAddresses = [...addresses].sort(
    (a, b) => Number(b.is_default) - Number(a.is_default),
  );

  const handleEditClick = (address) => {
    reset(address);
    editAddress(address.id);
  };

  const handleNewAddressClick = () => {
    reset(EMPTY_ADDRESS);
    createAddress();
  };

  const handleRadioChange = (addressId) => {
    reset(EMPTY_ADDRESS);
    selectAddress(addressId);
  };

  return (
    <div className="space-y-3 mb-3">
      <h2 className="font-semibold text-lg text-gray-300">
        {ADDRESS_SELECTOR_HEADINGS[mode]}
      </h2>
      {sortedAddresses.map((address) => (
        <div
          key={address.id}
          className={`cursor-pointer border rounded-lg p-2 transition ${address.id === selectedAddressId ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200"}`}
        >
          {isEditing && selectedAddressId === address.id ? (
            <div
              className={`border rounded-lg p-4 transition border-gray-200 flex flex-col gap-5`}
            >
              <AddressFields />
            </div>
          ) : (
            <AddressSelectableCard
              address={address}
              handleEditClick={handleEditClick}
              selectedAddressId={selectedAddressId}
              handleRadioChange={handleRadioChange}
            />
          )}
        </div>
      ))}

      {/* 새 주소 입력창 무조건 보여줌 */}
      {!isCreating && (
        <div
          onClick={handleNewAddressClick}
          className="flex items-center gap-2 text-md text-gray-300 cursor-pointer mt-5"
        >
          <PlusIcon className="w-4 h-4 mr-3" />
          <p>Enter a new address</p>
        </div>
      )}
      {isCreating && (
        <form
          onSubmit={handleSubmit(onAddressSubmit)}
          className={`border rounded-lg p-4 transition border-blue-600 ring-2 ring-blue-100 flex flex-col gap-5`}
        >
          <AddressFields />
        </form>
      )}
    </div>
  );
}
