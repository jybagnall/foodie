import useMyOrders from "../../../../hooks/useMyOrders";
import Spinner from "../../../user_feedback/Spinner";
import PageError from "../../../user_feedback/PageError";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import EmptyDataState from "../../../UI/EmptyDataState";

import OrderCard from "./OrderCard";

// {id, created_at, total_amount, payment_status, item_count, preview_items= {name, image, qty}}
export default function MyOrders() {
  const { orders, ordersFetchingError, isFetchingOrders } = useMyOrders();

  if (isFetchingOrders) return <Spinner />;
  if (ordersFetchingError) return <PageError />;
  if (orders.length === 0)
    return (
      <EmptyDataState
        icon={ShoppingBagIcon}
        title="No orders yet"
        message="Looks like you haven't placed any orders yet."
      />
    );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="font-bold text-xl">Orders</p>
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
