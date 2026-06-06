// "order/completed/:orderId/receipt";

import { useParams } from "react-router-dom";
import useOrder from "../../../hooks/useOrder";

export default function OrderReceipt() {
  const { orderId } = useParams();
  const { order, isOrderFetching, orderFetchingError } = useOrder(orderId);

  return <div></div>;
}
