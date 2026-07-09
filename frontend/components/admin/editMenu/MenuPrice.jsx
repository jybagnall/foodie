import { PencilIcon } from "@heroicons/react/24/outline";
import { currencyFormatter } from "../../../utils/format";

export default function MenuPrice({ price, editable, onEdit }) {
  return (
    <div
      onClick={editable ? onEdit : undefined}
      className={`flex items-center gap-2 mb-3 ${
        editable ? "group cursor-pointer" : ""
      }`}
    >
      <p
        className={`mb-3 inline-block rounded-md px-4 py-1 text-lg font-bold transition-colors ${
          editable
            ? "bg-gray-700 text-gray-100 group-hover:bg-indigo-600 group-hover:text-white"
            : "bg-gray-800 text-yellow-300"
        }`}
      >
        {currencyFormatter.format(price)}
      </p>

      {editable && (
        <PencilIcon className="mb-3 h-4 w-4 text-gray-200 transition-colors group-hover:text-indigo-400" />
      )}
    </div>
  );
}
