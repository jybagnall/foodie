import { toast } from "react-hot-toast";
import { currencyFormatter } from "../../../utils/format";
import Button from "../../UI/Button";
import AddingItemFeedback from "../../user_feedback/AddingItemFeedback";
import useCartActions from "../../../hooks/useCartActions";

export default function MenuItem({ menuItem }) {
  const { name, price, description, image } = menuItem;
  const { addItemAndSync } = useCartActions();

  const handleAddToCart = (item) => {
    const { isNew, nextQty } = addItemAndSync(item);

    // 커스텀 토스트에 같은 ID의 토스트가 이미 떠있으면 새로 안 만듬.
    toast.custom(
      (t) => (
        <AddingItemFeedback t={t} item={item} isNew={isNew} nextQty={nextQty} />
      ),
      {
        id: "cart-feedback",
        duration: 2000,
      },
    );
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
              onClick={() => handleAddToCart(menuItem)}
              className="py-1 px-3 bg-yellow-300 text-gray-800 border-yellow-300 hover:bg-yellow-400"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </article>
    </li>
  );
}
