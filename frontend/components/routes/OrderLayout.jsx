import { Outlet } from "react-router-dom";

export default function OrderLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}

// 🔑stripe={stripePromise}: “이 웹페이지는 이 Stripe 계정으로 결제를 진행할 거야!”
// clientSecret은 결제할 주문에 대한 특정 PaymentIntent에 속한 값
