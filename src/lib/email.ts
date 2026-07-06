import { POSITION_MAP } from "./constants";

// EmailJS（サーバー側 予約通知）の資格情報。
// private な accessToken は Cloudflare Secret / .dev.vars（EMAILJS_ACCESS_TOKEN）での上書きを推奨。
const EMAILJS = {
  serviceId: process.env.EMAILJS_SERVICE_ID ?? "service_dpaxz7o",
  templateId: process.env.EMAILJS_TEMPLATE_ID ?? "template_vy1oi7d",
  userId: process.env.EMAILJS_USER_ID ?? "Bo0CYQhPE97QN9Q_K",
  accessToken: process.env.EMAILJS_ACCESS_TOKEN ?? "tzThZAIG-thd4jgdI6m8I",
};

export type BookingEmailInput = {
  name: string;
  email: string;
  phone?: string | null;
  position: string;
  company?: string | null;
  message?: string | null;
};

/** 予約申し込みの通知メールを EmailJS REST API で送信 */
export async function sendBookingEmail(input: BookingEmailInput): Promise<void> {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS.serviceId,
      template_id: EMAILJS.templateId,
      user_id: EMAILJS.userId,
      accessToken: EMAILJS.accessToken,
      template_params: {
        name: input.name,
        email: input.email,
        phone: input.phone || "なし",
        position: POSITION_MAP[input.position] || input.position,
        company: input.company || "なし",
        message: input.message || "なし",
      },
    }),
  });
  console.log("EmailJS status:", res.status);
}
