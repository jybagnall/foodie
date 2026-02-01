import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddingItemFeedback({ t, meal, isNew, nextQty }) {
  const navigate = useNavigate();
  const msg = isNew ? (
    <>added to cart.</>
  ) : (
    <>
      quantity increased <b>({nextQty})</b>.
    </>
  );

  return (
    <div
      className={`${
        t.visible ? "animate-enter" : "animate-leave"
      } flex items-center gap-3 bg-white shadow-lg rounded-lg p-4`}
    >
      <img
        src={meal.image}
        alt={meal.name}
        className="w-12 h-12 rounded-md object-cover"
      />
      <div className="flex-1">
        <p className="font-semibold">{meal.name}</p>
        <p className="text-sm text-gray-500">{msg}</p>
      </div>
      <button
        onClick={() => {
          navigate("/cart");
          toast.dismiss(t.id);
        }}
        className="ml-3 text-sm font-medium text-gray-600 cursor-pointer"
      >
        View the cart
      </button>
    </div>
  );
}
