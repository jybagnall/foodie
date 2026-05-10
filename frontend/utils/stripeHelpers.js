// 결제 트리거 함수
// paymentIntent: 결제 상태 (성공 여부, 금액 등)
// return_url: 3D Secure 완료 후 리디렉팅되는 페이지,
// window.location.origin: 기본 URL

export async function confirmStripePayment({ stripe, elements, orderId }) {
  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/order/payment/${orderId}`,
    },
    redirect: "if_required",
  });

  // 카드 번호 혹은 CVC 오류 (결제 시도조차 안 됨)
  if (error?.type === "validation_error")
    return { status: "validation_error", message: error.message };

  if (error) return { status: "error", message: error.message };

  if (!paymentIntent)
    return {
      status: "error",
      message:
        "Please try again, or check your order status to see if the payment went through.",
    }; // 예상 못한 버그

  return { status: "success", paymentIntent };
}

// 🍀stripe.confirmPayment: 클라이언트용 올인원 API
// 자동으로 결제 시도, 필요하면 3DS 인증 UI 띄움, 완료까지 진행
