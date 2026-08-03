import { PlusIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";
import AddressFields from "../../../UI/AddressFields";
import { ADDRESS_SELECTOR_HEADINGS, EMPTY_ADDRESS } from "./address.constants";
import AddressOption from "./AddressOption";

export default function AddressSelector({
  addresses,
  onAddressSubmit,
  addressMode,
}) {
  const { handleSubmit, reset } = useFormContext();
  const { mode, selectedAddressId, isEditing, isCreating } = addressMode;

  const sortedAddresses = [...addresses].sort(
    (a, b) => Number(b.is_default) - Number(a.is_default),
  );

  const handleEditClick = (address) => {
    reset(address);
    addressMode.editAddress(address.id);
  };

  const handleNewAddressClick = () => {
    reset(EMPTY_ADDRESS);
    addressMode.createAddress();
  };

  const handleRadioChange = (addressId) => {
    reset(EMPTY_ADDRESS);
    addressMode.selectAddress(addressId);
  };

  return (
    <div className="space-y-3 mb-3">
      <h2 className="font-semibold text-lg text-gray-300">
        {ADDRESS_SELECTOR_HEADINGS[mode]}
      </h2>

      {sortedAddresses.map((address) => (
        <AddressOption
          key={address.id}
          address={address}
          selectedAddressId={selectedAddressId}
          showEditForm={isEditing && selectedAddressId === address.id}
          handleEditClick={handleEditClick}
          handleRadioChange={handleRadioChange}
        />
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
