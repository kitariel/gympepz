import nodemailer from "nodemailer";
import { env } from "@/env";

export type SendResult = { delivered: boolean; id?: string };

function buildOtpEmail(code: string): { subject: string; text: string; html: string } {
  return {
    subject: "Your verification code",
    text: `Your OTP is ${code}. Expires in 10 minutes.`,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Your GoTrain verification code</h2>
      <p style="margin: 0 0 12px;">Use this code to finish signing in:</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 2px; margin: 0 0 12px;">${code}</p>
      <p style="margin: 0; color: #666;">This code expires in 10 minutes.</p>
    </div>`,
  };
}

async function sendViaResend(to: string, code: string): Promise<SendResult | null> {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    return null;
  }

  try {
    const { subject, text, html } = buildOtpEmail(code);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Resend OTP email failed", response.status, body);
      return { delivered: false };
    }

    const data = (await response.json()) as { id?: string };
    return { delivered: true, id: data.id };
  } catch (err) {
    console.error("Failed to send OTP email via Resend", err);
    return { delivered: false };
  }
}

function getTransporter() {
  if (
    !env.SMTP_HOST ||
    !env.SMTP_PORT ||
    !env.SMTP_USER ||
    !env.SMTP_PASS ||
    !env.SMTP_FROM
  ) {
    return null;
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: Number(env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function sendOtpEmail(to: string, code: string): Promise<SendResult> {
  try {
    const resendResult = await sendViaResend(to, code);
    if (resendResult) {
      return resendResult;
    }

    const transporter = getTransporter();
    if (!transporter) {
      console.warn(
        "Email is not configured; set RESEND_* or SMTP_* env vars to enable OTP delivery.",
      );
      return { delivered: false };
    }

    const { subject, text, html } = buildOtpEmail(code);
    const info = await transporter.sendMail({
      from: env.SMTP_FROM!,
      to,
      subject,
      text,
      html,
    });
    return { delivered: true, id: info.messageId };
  } catch (err) {
    console.error("Failed to send OTP email", err);
    return { delivered: false };
  }
}
