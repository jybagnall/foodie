import { PencilIcon } from "@heroicons/react/24/outline";

export default function MenuName({ name, editable, onEdit }) {
  return (
    <div
      onClick={editable ? onEdit : undefined}
      className={`flex items-center gap-2 mb-3 ${
        editable ? "group cursor-pointer" : ""
      }`}
    >
      <h3
        className={`mb-3 text-2xl font-bold transition-colors ${
          editable
            ? "text-gray-100 group-hover:text-indigo-400"
            : "text-gray-100"
        }`}
      >
        {name}
      </h3>

      {editable && (
        <PencilIcon className="mb-3 h-4 w-4 text-gray-200 transition-colors group-hover:text-indigo-400" />
      )}
    </div>
  );
}
