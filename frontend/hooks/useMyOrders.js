import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import OrderService from "../services/order.service";

export default function useMyOrders() {
  const { accessToken } = useContext(AuthContext);

  const {
    data: orders = [],
    error: ordersFetchingError,
    isFetching: isFetchingOrders,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: ({ signal }) =>
      new OrderService(signal, () => accessToken).getMyOrders(),
    enabled: !!accessToken,
  });

  return { orders, ordersFetchingError, isFetchingOrders };
}

// {id, created_at, total_amount, payment_status, item_count, preview_items= {name, image, qty}}
