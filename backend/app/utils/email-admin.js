import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAdminInvitationEmail(to, inviteLink) {
  await resend.emails.send({
    from: "orders@foodie.com",
    to,
    subject: "Admin Invitation",
    html: `<p>You’ve been invited to become an admin. Click <a href="${inviteLink}">here</a> to create your account.</p>`,
  });
}
