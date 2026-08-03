import AddressFields from "../../../UI/AddressFields";
import AddressSelectableCard from "./AddressSelectableCard";

export default function AddressOption({
  address,
  selectedAddressId,
  showEditForm,
  handleEditClick,
  handleRadioChange,
}) {
  if (showEditForm) {
    return (
      <div
        className={`border rounded-lg p-4 transition border-gray-200 flex flex-col gap-5`}
      >
        <AddressFields />
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer border rounded-lg p-2 transition ${address.id === selectedAddressId ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200"}`}
    >
      <AddressSelectableCard
        address={address}
        handleEditClick={handleEditClick}
        selectedAddressId={selectedAddressId}
        handleRadioChange={handleRadioChange}
      />
    </div>
  );
}
