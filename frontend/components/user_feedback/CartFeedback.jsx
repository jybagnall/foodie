import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function CartFeedback({ t, meal }) {
  const navigate = useNavigate();

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
        <p className="text-sm text-gray-500">Added to cart.</p>
      </div>
      <button
        onClick={() => {
          navigate("/cart");
          toast.dismiss(t.id);
        }}
        className="ml-3 text-sm font-medium text-purple-600"
      >
        View the cart
      </button>
    </div>
  );
}
