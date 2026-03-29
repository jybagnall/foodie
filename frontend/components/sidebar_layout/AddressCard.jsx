import { formatPhone } from "../../utils/format";

export default function AddressCard({ info }) {
  const { id, full_name, street, city, postal_code, phone, is_default } = info;

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
        <button
          onClick={() => {}}
          className="px-3 py-1 border rounded cursor-pointer"
        >
          Edit
        </button>

        <button
          onClick={() => {}}
          disabled={is_default}
          className="px-3 py-1 border rounded cursor-pointer"
        >
          Remove
        </button>

        {!is_default && (
          <button
            onClick={() => {}}
            className="ml-auto text-yellow-600 underline text-sm cursor-pointer"
          >
            Set as default
          </button>
        )}
      </div>
    </div>
  );
}
