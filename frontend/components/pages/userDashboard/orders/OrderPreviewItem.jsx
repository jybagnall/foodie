import { toast } from "react-hot-toast";
import { currencyFormatter } from "../../../../utils/format";
import useServerCartActions from "../../../../hooks/useServerCartActions";
import AddingItemFeedback from "../../../user_feedback/AddingItemFeedback";

export default function OrderPreviewItem({ item, showPrice = false }) {
  const { addItem } = useServerCartActions();

  const handleBuyAgain = (item) => {
    const { isNew, nextQty } = addItem({ ...item, id: item.menu_id });
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
    <div className="flex gap-4 mb-4">
      <img src={item.image} className="w-30 h-30 object-cover" />
      <div className="flex-1">
        <p>{item.name}</p>
        {showPrice && (
          <p className="text-sm text-red-400">
            {currencyFormatter.format(item.price)}
          </p>
        )}
        <p className="text-sm">Qty: {item.qty}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => handleBuyAgain(item)}
            className="border px-3 py-1 rounded whitespace-nowrap cursor-pointer"
          >
            Buy again
          </button>
        </div>
      </div>
    </div>
  );
}
