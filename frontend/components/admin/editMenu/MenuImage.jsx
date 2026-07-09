import { PencilIcon } from "@heroicons/react/24/outline";

export default function MenuImage({ image, editable, onEdit }) {
  return (
    <div
      onClick={editable ? onEdit : undefined}
      className={`flex items-center gap-2 ${
        editable ? "group cursor-pointer" : ""
      }`}
    >
      <img
        src={image?.startsWith("http") ? image : "/logo.jpg"}
        alt="Menu image"
        className={`w-full h-80 object-cover ${editable ? "cursor-pointer hover:ring-4 hover:ring-indigo-400 hover:ring-offset-2 hover:ring-offset-gray-900" : ""}`}
      />

      {editable && (
        <div className="relative group/icon">
          <PencilIcon className="h-5 w-5 ml-4 text-gray-200 transition-colors group-hover:text-indigo-400" />
        </div>
      )}
    </div>
  );
}
