import { useParams } from "react-router-dom";
import AuthContext from "../../../../contexts/AuthContext";
import { useContext } from "react";
import useOrder from "../../../../hooks/useOrder";
import Spinner from "../../../user_feedback/Spinner";
import PageError from "../../../user_feedback/PageError";
import BackToDash from "../../../UI/BackToDash";
import { formatDateOnly } from "../../../../utils/format";

export default function OrderDetail() {
  const { orderId } = useParams();
  const { accessToken } = useContext(AuthContext);
  const { order, orderFetchingError, isFetchingOrder } = useOrder(
    accessToken,
    orderId,
  );

  // ErrorPage 필요함
  if (isFetchingOrder) return <Spinner />; // 너무 큼
  if (orderFetchingError) return <PageError />;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4">
          <BackToDash url="/my-account/orders" dashboardName="Back to orders" />

          <div className="w-full rounded-lg border-2 border-gray-400 p-6 text-left mt-5">
            {/* Order Header */}
            <div className="pb-2 sm:pb-3">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-lg">Order #3333</p>
                <span className="text-sm px-3 py-1 rounded-full bg-gray-500">
                  Delievered
                </span>
              </div>
              <p className="text-sm text-gray-300">Placed on 02. 26. 2025</p>
            </div>
            {/* Order Header */}

            {/* Main Layout */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT SIDE */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Info */}
                <div className="border rounded-lg p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Shipping method</p>
                      <p className="text-sm text-gray-400">CJ Korea Express</p>
                    </div>
                    <div>
                      <p className="font-semibold">Shipping address</p>
                      <p className="text-sm text-gray-400">
                        광주광역시 남구 금당로3길 20
                        <br />
                        103동 901호
                        <br />
                        Korea, Republic of
                        <br />
                        010-2862-0402
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivered Section */}
                <div className="border rounded-lg p-5">
                  <p className="text-green-500 font-semibold mb-2">Delivered</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Delivered on November 28, 2025
                  </p>

                  {/* Item 1 */}
                  <div className="flex gap-4 mb-6">
                    <img src="/item1.png" className="w-16 h-16 object-cover" />
                    <div className="flex-1">
                      <p>Ancient Nutrition, 종합 콜라겐 단백질</p>
                      <p className="text-sm text-red-400">₩45,994</p>
                      <p className="text-sm">Quantity: 1</p>

                      <div className="mt-2 flex gap-2">
                        <button className="border px-3 py-1 rounded">
                          Buy again
                        </button>
                        <button className="border px-3 py-1 rounded">
                          Write a Review
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex gap-4">
                    <img src="/item2.png" className="w-16 h-16 object-cover" />
                    <div className="flex-1">
                      <p>California Gold Nutrition, 크릴 오일</p>
                      <p className="text-sm text-red-400">₩38,850</p>
                      <p className="text-sm">Quantity: 1</p>

                      <div className="mt-2 flex gap-2">
                        <button className="border px-3 py-1 rounded">
                          Buy again
                        </button>
                        <button className="border px-3 py-1 rounded">
                          Write a Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="lg:col-span-1 space-y-6">
                {/* Reorder */}
                <button className="w-full border rounded-lg py-3 font-medium">
                  Reorder
                </button>

                {/* Order Summary */}
                <div className="border rounded-lg p-5">
                  <p className="font-semibold mb-4">Order summary</p>

                  <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal</span>
                    <span>₩84,844</span>
                  </div>

                  <div className="flex justify-between text-sm mb-2">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>

                  <div className="flex justify-between text-sm mb-4">
                    <span>Tax</span>
                    <span>₩0</span>
                  </div>

                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Order total</span>
                    <span>₩84,844</span>
                  </div>

                  <div className="mt-3 text-green-500 text-sm">
                    You saved ₩21,210
                  </div>
                </div>

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
