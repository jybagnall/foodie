import { useContext, useState } from "react";
import { toast } from "react-hot-toast";

import { currencyFormatter } from "../../../utils/format";
import Button from "../../UI/Button";
import CartContext from "../../../contexts/CartContext";
import CartFeedback from "../../user_feedback/CartFeedback";

export default function MealItem({ meal }) {
  const { name, price, description, image } = meal;
  const { addItem } = useContext(CartContext);

  const handleAddToCart = (meal) => {
    addItem(meal);
    toast.custom((t) => <CartFeedback t={t} meal={meal} />, { duration: 2000 });
  };

  return (
    <li className="bg-gray-700 rounded-2xl overflow-hidden text-center shadow-md shadow-black/30 flex flex-col">
      <article className="flex flex-col h-full">
        <img
          src={image?.startsWith("http") ? image : "/logo.jpg"}
          alt={name || "Logo"}
          className="w-full h-80 object-cover"
        />

        <div className="flex flex-col grow justify-between p-4">
          <div>
            <h3 className="text-2xl font-bold my-3 text-gray-100">{name}</h3>
            <p className="inline-block bg-gray-500 text-yellow-300 text-sm font-bold py-1 px-4 rounded mb-3">
              {currencyFormatter.format(price)}
            </p>
            <p className="text-gray-300 text-sm">{description}</p>
          </div>

          <div className="mt-4">
            <Button
              onClick={() => handleAddToCart(meal)}
              propStyle="py-1 px-3 bg-yellow-300 text-gray-800 border-yellow-300 hover:bg-yellow-400"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </article>
    </li>
  );
}
