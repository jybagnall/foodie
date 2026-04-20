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

export async function sendPasswordResetEmail(to, resetLink) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to,
      subject: "Password Reset Request",
      html: `
        <p>Click the link below to reset your password. This link is valid for 10 minutes.</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
      `,
    });
  } catch (err) {
    console.error("Resend Error:", err.message);
    throw err;
  }
}
