// GET /orders/:orderId/payment-status
export default function OrderConfirmation() {
  return (
    <div className="text-center p-20">
      <h1 className="text-2xl font-bold text-green-600">
        Order confirmation page
      </h1>
    </div>
  );
}

// SELECT o.status, p.payment_status
// FROM orders o
// LEFT JOIN payments p ON o.id = p.order_id
// WHERE o.id = $1

// if (order.status !== "paid") {
//   navigate("/payment-failed");
// }
// if (order.status !== "paid") {
//   return <ErrorUI />;
// }

// We're processing your payment. Please wait.
