import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatPhone } from "../../../../utils/format";
import useAddressBook from "../../../../hooks/useAddressBook";

export default function AddressSelectableCard({
  address,
  handleEditClick,
  selectedAddressId,
  handleRadioChange,
}) {
  const { deleteAddress, isDeleting } = useAddressBook();

  return (
    <div className="flex justify-between items-start">
      <label
        key={address.id}
        className="flex items-start gap-3 p-2 cursor-pointer"
      >
        <input
          type="radio"
          name="savedAddress"
          value={address.id}
          checked={selectedAddressId === address.id}
          onChange={() => handleRadioChange(address.id)}
          className="mt-2"
        />

        <div className="">
          <div className="flex items-start justify-start">
            <p className="font-semibold text-gray-900">{address.full_name}</p>
            {address.is_default && (
              <span className="ml-2 inline-block text-xs mt-1 px-2 bg-gray-200 text-gray-700 rounded-full">
                default
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            {address.street}, {address.city} | {address.postal_code} |{" "}
            {formatPhone(address.phone)}
          </p>
        </div>
      </label>

      <div className="ml-4 mt-1 inline-flex items-center gap-x-2 px-2 py-1 font-medium text-gray-600">
        <button
          className={`w-5 h-5 flex items-center justify-center cursor-pointer`}
        >
          <PencilIcon
            className="size-5 stroke-current"
            onClick={() => handleEditClick(address)}
          />
        </button>
        <button
          disabled={isDeleting}
          onClick={() => deleteAddress(address.id)}
          className={`w-5 h-5 flex items-center justify-center cursor-pointer`}
        >
          <TrashIcon className="size-5 stroke-current" />
        </button>
      </div>
    </div>
  );
}
