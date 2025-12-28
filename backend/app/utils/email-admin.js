import { Resend } from "resend";

export async function sendAdminInvitationEmail(to, inviteLink) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to,
      subject: "Admin Invitation",
      html: `<p>You’ve been invited to become an admin of <strong>Foodie</strong>. Click <a href="${inviteLink}">here</a> to create your account.</p>`,
    });
  } catch (err) {
    console.error("Resend Error:", err.message);
    throw err;
  }
}
