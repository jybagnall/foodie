import { useParams } from "react-router-dom";
import { useEffect } from "react";
import useOrder from "../../../hooks/useOrder";
import StripePaymentSetup from "./StripePaymentSetup";

// 라우터 진입점, 데이터 fetch
export default function OrderPaymentPage() {
  const { orderId } = useParams();
  const { order, isFetching } = useOrder(orderId);

  useEffect(() => {
    document.title = "Payment | Foodie";
  }, []);

  // ❗!order 이어도 결제 진행은 계속 할 것
  if (isFetching) return <Spinner />;

  return <StripePaymentSetup order={order} orderId={orderId} />;
}
