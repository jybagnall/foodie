import { PencilIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import MenuName from "./MenuName";
import MenuImage from "./MenuImage";
import MenuPrice from "./MenuPrice";
import MenuDescription from "./MenuDescription";

export default function EditableMenuItem({ menuItem }) {
  const { id: menuId, name, price, description, image } = menuItem;

  return (
    <Link
      to={`/admin/edit-menu/${menuId}`}
      className="rounded-2xl p-[2px] hover:bg-gradient-to-br hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500"
    >
      <article className="overflow-hidden rounded-[calc(1rem-2px)] bg-gray-700 flex flex-col h-full">
        <div className="relative group">
          <MenuImage image={image} editable={false} />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
            <PencilIcon className="w-8 h-8 text-gray-200" />
          </div>

          <div className="flex flex-col grow justify-center items-center text-center p-4">
            <div className="flex flex-col items-center">
              <MenuName name={name} editable={false} />
              <MenuPrice price={price} editable={false} />
              <MenuDescription description={description} editable={false} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
