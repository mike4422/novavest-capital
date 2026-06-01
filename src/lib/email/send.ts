import nodemailer from "nodemailer";
import { Resend } from "resend";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.EMAIL_FROM;
  const provider = process.env.EMAIL_PROVIDER;

  if (!from) {
    throw new Error("EMAIL_FROM is missing in .env.local");
  }

  if (!provider) {
    throw new Error("EMAIL_PROVIDER is missing. Use either 'smtp' or 'resend'.");
  }

  if (provider === "resend") {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing in .env.local");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    console.log("Resend email result:", result);
    return result;
  }

  if (provider === "smtp") {
    if (!process.env.SMTP_HOST) throw new Error("SMTP_HOST is missing.");
    if (!process.env.SMTP_USER) throw new Error("SMTP_USER is missing.");
    if (!process.env.SMTP_PASS) throw new Error("SMTP_PASS is missing.");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== "false",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();

    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("SMTP email sent:", result.messageId);
    return result;
  }

  throw new Error("Invalid EMAIL_PROVIDER. Use 'smtp' or 'resend'.");
}

export async function sendAdminEmail(subject: string, html: string) {
  const to = process.env.ADMIN_EMAIL;

  if (!to) {
    throw new Error("ADMIN_EMAIL is missing in .env.local");
  }

  return sendEmail({ to, subject, html });
}