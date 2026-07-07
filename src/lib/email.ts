// EmailJS（サーバー側 問い合わせ通知）の資格情報。
// private な accessToken は Cloudflare Secret / .dev.vars（EMAILJS_ACCESS_TOKEN）での上書きを推奨。
const EMAILJS = {
  serviceId: process.env.EMAILJS_SERVICE_ID ?? "service_dpaxz7o",
  templateId: process.env.EMAILJS_TEMPLATE_ID ?? "template_vy1oi7d",
  userId: process.env.EMAILJS_USER_ID ?? "Bo0CYQhPE97QN9Q_K",
  accessToken: process.env.EMAILJS_ACCESS_TOKEN ?? "tzThZAIG-thd4jgdI6m8I",
};

export type BookingEmailInput = {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  employee_count?: string | null;
  headcount?: string | null;
  timing?: string | null;
  venue?: string | null;
  plan?: string | null;
};

// 任意項目を本文末尾に整形（既存 EmailJS テンプレを改修せず全情報を届ける）
function buildMessage(input: BookingEmailInput): string {
  const optionals: [string, string | null | undefined][] = [
    ["従業員数", input.employee_count],
    ["実施希望人数", input.headcount],
    ["実施希望時期", input.timing],
    ["実施場所の有無", input.venue],
    ["興味のあるプラン", input.plan],
  ];
  const filled = optionals.filter(([, val]) => val && val.trim());
  const extra = filled.length
    ? "\n\n─── 任意項目 ───\n" +
      filled.map(([label, val]) => `${label}: ${val}`).join("\n")
    : "";
  return `${input.message}${extra}`;
}

/** 問い合わせ／無料体験申し込みの通知メールを EmailJS REST API で送信 */
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
        company: input.company || "なし",
        position: input.plan?.trim() || "法人お問い合わせ",
        message: buildMessage(input),
      },
    }),
  });
  console.log("EmailJS status:", res.status);
}
