import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatPhone } from "../../utils/format";
import AddressFields from "../UI/AddressFields";

export default function AddressSelector({
  register,
  errors,
  addresses,
  selectedAddressId,
  showNewAddressForm,
  setSelectedAddressId,
  setShowNewAddressForm,
}) {
  return (
    <div className="space-y-3 mb-3">
      <h2 className="font-semibold text-lg">Select a shipping address</h2>
      {addresses.map((address) => (
        <div
          className={`cursor-pointer border border-gray-200 rounded-lg p-4 transition`}
        >
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
                onChange={() => {
                  setSelectedAddressId(address.id);
                  setShowNewAddressForm(false); // 기존 주소 선택하면 새 폼 닫기?
                }}
                className="mt-2"
              />

              <div className="">
                <p className="font-semibold text-gray-900">
                  {address.full_name}
                </p>
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
                <PencilIcon className="size-5 stroke-current" />
              </button>
              <button
                className={`w-5 h-5 flex items-center justify-center cursor-pointer`}
              >
                <TrashIcon className="size-5 stroke-current" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {!showNewAddressForm && (
        <div
          onClick={() => {
            setShowNewAddressForm((prev) => !prev);
            setSelectedAddressId(null); // 새 주소 입력 시 기존 선택 해제
          }}
          className="flex items-center gap-2 text-md text-gray-600 mb-4"
        >
          <PlusIcon className="w-4 h-4 mr-3" />
          {showNewAddressForm ? "Cancel new address" : "Enter a new address"}
        </div>
      )}

      {showNewAddressForm && (
        <div className="border border-gray-200 rounded-lg p-4 transition">
          <AddressFields register={register} errors={errors} />
        </div>
      )}
    </div>
  );
}
