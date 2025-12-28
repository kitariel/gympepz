import nodemailer from "nodemailer";
import { env } from "@/env";

export type SendResult = { delivered: boolean; id?: string };

// Type-safe SMTP transport configuration
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: Number(env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to: string, code: string): Promise<SendResult> {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: "Your verification code",
      text: `Your OTP is ${code}. Expires in 10 minutes.`,
      html: `<p>Your OTP is <strong>${code}</strong>.</p><p>Expires in 10 minutes.</p>`,
    });
    return { delivered: true, id: info.messageId };
  } catch (err) {
    console.error("Failed to send OTP email", err);
    return { delivered: false };
  }
}