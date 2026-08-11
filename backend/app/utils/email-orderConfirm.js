import { stripe } from "../config/stripe.js";

import { resend } from "../config/resend.js";

import { getOrderConfirmationDetails } from "../services/order-service.js";
import { formatCurrency } from "./orderCalculations.js";
import { formatPaymentMethodDisplay } from "./paymentInfo.js";
import { retrieveStripeCharge } from "../integrations/stripe/charge.js";

// Promise.race로 타임아웃을 거는 이유:
// 이메일 발송이 멈추면, 그 뒤에 있는 결제 이벤트들도 전부 처리가 안 되고 줄줄이 밀림.

// resend.emails.send()가 멈춰있어도 15초 뒤에 이 함수는 종료되고,
// 워커는 다음 이벤트로 계속 진행 가능.
// 백그라운드에 남은 이메일 요청은 나중에 알아서 성공하거나 실패.

async function withTimeout(promise, ms, message) {
  let timer;

  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function sendOrderConfirmationEmail(
  client,
  orderId,
  paymentIntent,
) {
  const { amount_received, currency, latest_charge } = paymentIntent;

  try {
    const { email, full_name, street, city, postal_code, phone } =
      await getOrderConfirmationDetails(client, orderId);

    const charge = await retrieveStripeCharge(latest_charge);

    const { type, card } = charge.payment_method_details;
    const paymentInfo = {
      method: type, // card, paypal
      brand: card?.brand ?? null,
      last4: card?.last4 ?? null,
    };

    const html = `
<div style="
  font-family: Arial, sans-serif;
  background-color: #f9fafb;
  padding: 40px 0;
">
  <div style="
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  ">

    <!-- Message -->
    <p style="
      text-align: center;
      color: #6b7280;
      margin-bottom: 30px;
    ">
      Thank you for your order! Your payment has been confirmed and your order is now being processed.
    </p>

    <!-- Divider -->
    <div style="border-top: 1px solid #e5e7eb; margin: 20px 0;"></div>

    <!-- Order Info -->
    <table style="
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    ">
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">
          Order ID
        </td>
        <td style="
          padding: 8px 0;
          text-align: right;
          font-weight: bold;
        ">
          #${orderId}
        </td>
      </tr>

      <tr>
        <td style="padding: 8px 0; color: #6b7280;">
          Total Amount
        </td>
        <td style="
          padding: 8px 0;
          text-align: right;
          font-weight: bold;
          color: #16a34a;
        ">
          ${formatCurrency(currency, amount_received)}
        </td>
      </tr>

      <tr>
        <td style="padding: 8px 0; color: #6b7280;">
          Payment Method
        </td>
        <td style="
          padding: 8px 0;
          text-align: right;
        ">
          ${formatPaymentMethodDisplay(paymentInfo)}
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <div style="border-top: 1px solid #e5e7eb; margin: 20px 0;"></div>

    <!-- Customer -->
    <h3 style="
      font-size: 16px;
      margin-bottom: 10px;
      color: #111827;
    ">
      Customer
    </h3>

    <p style="margin: 0; color: #374151;">
      ${full_name}<br />
      ${phone}
    </p>

    <!-- Shipping -->
    <h3 style="
      font-size: 16px;
      margin: 20px 0 10px;
      color: #111827;
    ">
      Shipping Address
    </h3>

    <p style="margin: 0; color: #374151;">
      ${postal_code} ${street}<br />
      ${city}
    </p>

    <!-- Footer -->
    <p style="
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      margin-top: 30px;
    ">
      If you have any questions, feel free to contact our support team.
    </p>

  </div>
</div>
    `;

    await withTimeout(
      resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: email,
        subject: "Payment Processed for Your Foodie Order",
        html,
      }),
      15000,
      "Resend email send timed out",
    );
  } catch (err) {
    if (err.message === "Resend email send timed out") {
      console.warn(
        `Email sending timed out for order ${orderId}. Continuing worker.`,
      );
    } else {
      console.error("❌ Failed to send email:", err);
    }
  }
}
