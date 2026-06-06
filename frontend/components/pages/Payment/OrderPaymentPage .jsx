import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import useOrder from "../../../hooks/useOrder";
import StripePaymentSetup from "./StripePaymentSetup";
import Spinner from "../../user_feedback/Spinner";
import EmptyDataState from "../../UI/EmptyDataState";
import { grantPaymentFlowAccess } from "../../../storage/paymentStorage";
import { canRetryPayment } from "../../../utils/orderHelpers";

// 라우터 진입점, 3DS 복귀 처리, 주문 관련 데이터 fetch

export default function OrderPaymentPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectPaymentIntentId = searchParams.get("payment_intent");
  const { order, paymentStatus, isOrderFetching, orderFetchingError } =
    useOrder(orderId);

  useEffect(() => {
    document.title = "Payment | Foodie";
  }, []);

  useEffect(() => {
    if (!paymentStatus) return;

    if (!canRetryPayment(paymentStatus)) {
      navigate("/my-account/orders", { replace: true });
    }
  }, [paymentStatus, navigate]);

  useEffect(() => {
    // 결제 시도의 증거가 없으면 결제창(StripePaymentSetup)이 렌더링됨
    if (!redirectPaymentIntentId) return; // ❗에러의 원인

    grantPaymentFlowAccess(); // "결제 완료 페이지에 접근 허용" 플래그 설정
    window.location.replace(
      `/order/completed/${orderId}?payment_intent=${redirectPaymentIntentId}`,
    );
  }, [redirectPaymentIntentId, orderId]);

  // payment_intent가 있다면 결제창 막고(빈 화면 후) 결제 완료 페이지로
  if (redirectPaymentIntentId) return null;
  if (paymentStatus === "paid") return null;
  if (isOrderFetching) return <Spinner />;

  if (orderFetchingError)
    return (
      <EmptyDataState
        icon={ShoppingBagIcon}
        title="Something went wrong"
        message="We couldn't load your order details. Please refresh the page or try again later."
      />
    );

  return <StripePaymentSetup order={order} orderId={orderId} />;
}
