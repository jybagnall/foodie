import { useContext, useState } from "react";
import { toast } from "react-hot-toast";

import { currencyFormatter } from "../../utils/format";
import Button from "../UI/Button";
import CartContext from "../../contexts/CartContext";
import CartFeedback from "../user_feedback/CartFeedback";

export default function MealItem({ meal }) {
  const { addItem } = useContext(CartContext);

  const handleAddToCart = (meal) => {
    addItem(meal);
    toast.custom((t) => <CartFeedback t={t} meal={meal} />, { duration: 2000 });
  };

  return (
    <li className="bg-gray-700 rounded-2xl overflow-hidden text-center shadow-md shadow-black/30 flex flex-col">
      <article className="flex flex-col h-full">
        {/* React는 백엔드의 파일 시스템을 볼 수 없기 때문에, Express 서버가 제공하는 URL을 통해 접근해야 함, 그리고 지금 설정은 `서버가 public 폴더 안에 있는 모든 파일을 웹 URL로 접근 가능하게` 되어있음 */}
        <img
          src={`http://localhost:5000/${meal.image}`}
          alt={meal.name}
          className="w-full h-80 object-cover"
        />

        <div className="flex flex-col grow justify-between p-4">
          <div>
            <h3 className="text-2xl font-bold my-3 text-gray-100">
              {meal.name}
            </h3>
            <p className="inline-block bg-gray-500 text-yellow-300 text-sm font-bold py-1 px-4 rounded mb-3">
              {currencyFormatter.format(meal.price)}
            </p>
            <p className="text-gray-300 text-sm">{meal.description}</p>
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
