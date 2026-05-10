import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import useOrder from "../../../hooks/useOrder";
import StripePaymentSetup from "./StripePaymentSetup";
import Spinner from "../../user_feedback/Spinner";
import EmptyDataState from "../../UI/EmptyDataState";
import { markAsFromPayment } from "../../../storage/paymentStorage";
import useUserId from "../../../hooks/useUserId";

// 라우터 진입점, 3DS 복귀 처리, 주문 관련 데이터 fetch

export default function OrderPaymentPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectStatus = searchParams.get("redirect_status");
  const redirectPaymentIntentId = searchParams.get("payment_intent");
  const userId = useUserId();
  const queryClient = useQueryClient();
  const { order, isFetching, orderFetchingError } = useOrder(orderId);

  useEffect(() => {
    document.title = "Payment | Foodie";
  }, []);

  // 3D Secure 인증 후 URL에 ?redirect_status=succeeded 혹은 failed가 붙어서 돌아옴,
  // redirectStatus === "failed" (결제 실패) clientSecret을 새로 만들 필요 없음.
  useEffect(() => {
    if (!redirectStatus) return; // 아무 것도 안 함

    if (redirectStatus === "succeeded") {
      queryClient.invalidateQueries({ queryKey: ["savedCards", userId] });
    }

    markAsFromPayment();
    navigate(
      `/order/completed/${orderId}?payment_intent=${redirectPaymentIntentId}`,
      {
        replace: true,
        state: { status: redirectStatus },
      },
    );
  }, [redirectStatus, redirectPaymentIntentId, orderId, navigate]);

  if (redirectStatus) return null; // StripePaymentSetup 렌더링 막음
  if (isFetching) return <Spinner />;

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
