import { useParams } from "react-router-dom";
import useOrder from "../../../../hooks/useOrder";
import PageError from "../../../user_feedback/PageError";
import BackToDash from "../../../UI/BackToDash";
import Spinner from "../../../user_feedback/Spinner";
import OrderPreviewItem from "./OrderPreviewItem";
import OrderHeader from "./OrderHeader";
import { useEffect } from "react";
import OrderSummary from "../../../OrderUI/OrderSummary";
import DeliverySummary from "../../../OrderUI/DeliverySummary";

// 주문 status가 더 많아질 수도 있음
// orders.status      → 주문이 지금 어디 있는지  (준비중, 배달중, 배달완료 등)
// payments.status    → 돈이 잘 결제됐는지       (결제완료, 결제실패 등)

export default function OrderDetail() {
  const { orderId } = useParams();
  const { order, orderFetchingError, isFetching } = useOrder(orderId);

  useEffect(() => {
    document.title = "Order Details | Foodie";
  }, []);

  // "데이터 요청 중인 상태" & "데이터 존재 여부" 확인!
  if (isFetching || !order) return <Spinner />;
  if (orderFetchingError) return <PageError />;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <BackToDash url="/my-account/orders" dashboardName="Back to orders" />

          <div className="w-full rounded-lg border-2 border-yellow-600 p-6 text-left mt-5">
            <OrderHeader order={order} />

            {/* Main Layout */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT SIDE */}
              <div className="lg:col-span-2 space-y-6">
                <DeliverySummary order={order} />

                {/* Delivered Section */}
                <div className="border rounded-lg p-5">
                  {order.items.map((item) => (
                    <OrderPreviewItem key={item.name} item={item} showPrice />
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="lg:col-span-1 space-y-6">
                {/* Reorder */}
                <button className="w-full border rounded-lg py-3 font-medium">
                  Reorder
                </button>

                <OrderSummary order={order} />

                {/* Payment */}
                <div className="border rounded-lg p-5">
                  <p className="font-semibold mb-2">Payment method</p>
                  <p className="text-sm text-gray-400">
                    Kakao Pay (Alipay+ Partner)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
