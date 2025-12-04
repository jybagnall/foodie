import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(to, orderId, totalPrice) {
  try {
    await resend.emails.send({
      from: "orders@foodie.com",
      to,
      subject: `Your Foodie Order #${orderId} is Confirmed`,
      html: `<p>Thank you for your order! Your total is <b>$${totalPrice}</b>.</p>`,
    });
    console.log("✅ Order confirmation email sent!");
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
}
