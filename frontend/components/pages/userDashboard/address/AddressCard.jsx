import { Link } from "react-router-dom";
import { useState } from "react";
import { formatPhone } from "../../../../utils/format";
import AlertModal from "../../../UI/AlertModal";

export default function AddressCard({
  info,
  setDefaultAddress,
  deleteAddress,
  isDeleting,
}) {
  const { id, full_name, street, city, postal_code, phone, is_default } = info;

  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="w-full rounded-lg border-2 border-gray-400 p-6 text-left hover:border-gray-300">
      <div className="flex justify-between items-center mb-2">
        <h3>{full_name}</h3>
        {is_default && (
          <span className="text-yellow-600 text-sm font-medium">Default</span>
        )}
      </div>
      <div className="text-sm text-gray-200 space-y-1 mt-2">
        <p>{street}</p>
        <p>
          {city}, {postal_code}
        </p>
        <p>{formatPhone(phone)}</p>
      </div>

      <div className="flex items-center gap-2 mt-7">
        <Link
          to={`/my-account/address/${id}/edit`}
          state={{ address: info }}
          className="px-3 py-1 border rounded cursor-pointer"
        >
          Edit
        </Link>

        <button
          onClick={() => setShowAlert(true)}
          className="px-3 py-1 border rounded cursor-pointer"
        >
          Remove
        </button>

        {!is_default && (
          <button
            onClick={() => setDefaultAddress(id)}
            className="ml-auto text-yellow-600 underline text-sm cursor-pointer"
          >
            Set as default
          </button>
        )}
      </div>

      {showAlert && (
        <AlertModal
          activateFn={() =>
            deleteAddress(id, {
              onSuccess: () => setShowAlert(false),
              onError: () => setShowAlert(false),
            })
          }
          isActivating={isDeleting}
          modalIsOpen={showAlert}
          onCancel={() => setShowAlert(false)}
          alertText={`Are you sure to delete this address? ${street} ${city}?`}
          userIntentionText="Delete"
        />
      )}
    </div>
  );
}
