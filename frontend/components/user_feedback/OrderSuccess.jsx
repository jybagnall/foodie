// Success.jsx
// 성공과 실패로 나누지 말고 OrderFeedback 컴포넌트로 통합해야함
export default function OrderSuccess() {
  return (
    <div className="text-center p-20">
      <h1 className="text-2xl font-bold text-green-600">
        ✅ Payment Successful!
      </h1>
      <p>Thank you for your purchase.</p>
    </div>
  );
}
