import nodemailer from "nodemailer";
import { Resend } from "resend";

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const from = process.env.EMAIL_FROM || "NovaVest Capital <noreply@novavestcapital.com>";
  const provider = process.env.EMAIL_PROVIDER || "resend";

  if (provider === "resend" && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    return resend.emails.send({ from, to, subject, html });
  }

  if (provider === "smtp" && process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== "false",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    return transporter.sendMail({ from, to, subject, html });
  }

  console.warn("Email skipped: no provider configured", { to, subject });
  return { skipped: true };
}

export async function sendAdminEmail(subject: string, html: string) {
  const to = process.env.ADMIN_EMAIL;
  if (!to) return { skipped: true };
  return sendEmail({ to, subject, html });
}
