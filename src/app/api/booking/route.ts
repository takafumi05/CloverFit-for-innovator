import { ensureSchema, getDb, getExecutionCtx } from "@/lib/db";
import { sendBookingEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });

  const {
    company,
    name,
    email,
    phone,
    message,
    employee_count,
    headcount,
    timing,
    venue,
    plan,
  } = body as Record<string, string | undefined>;

  // 必須: 会社名・お名前・メール・電話・相談内容
  if (
    !company?.trim() ||
    !name?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    !message?.trim()
  ) {
    return Response.json(
      { error: "必須項目を入力してください" },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { error: "メールアドレスの形式が正しくありません" },
      { status: 400 }
    );
  }

  const clean = (s?: string) => s?.trim() || null;

  try {
    const db = getDb();
    await ensureSchema(db);
    const result = await db
      .prepare(
        `INSERT INTO bookings
          (name, email, phone, position, company, message,
           employee_count, headcount, timing, venue, plan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        name.trim(),
        email.trim(),
        phone.trim(),
        // position は旧スキーマ互換のため「選択プラン or 法人お問い合わせ」を格納
        plan?.trim() || "法人お問い合わせ",
        company.trim(),
        message.trim(),
        clean(employee_count),
        clean(headcount),
        clean(timing),
        clean(venue),
        clean(plan)
      )
      .run();

    // 通知メールは waitUntil でレスポンスをブロックせずに送信
    getExecutionCtx().waitUntil(
      sendBookingEmail({
        company: company.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
        employee_count: clean(employee_count),
        headcount: clean(headcount),
        timing: clean(timing),
        venue: clean(venue),
        plan: clean(plan),
      }).catch((e) => console.error("EmailJS Error:", e))
    );

    return Response.json({ success: true, id: result.meta.last_row_id });
  } catch (err) {
    console.error("DB Error:", err);
    return Response.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
