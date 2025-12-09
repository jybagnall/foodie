// Cancel.jsx
// 성공과 실패로 나누지 말고 OrderFeedback 컴포넌트로 통합해야함

export default function OrderFailure() {
  return (
    <div className="text-center p-20">
      <h1 className="text-2xl font-bold text-red-500">❌ Payment Cancelled</h1>
      <p>Your order was not completed.</p>
    </div>
  );
}
