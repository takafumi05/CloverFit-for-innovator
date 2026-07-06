import { ensureSchema, getDb, getExecutionCtx } from "@/lib/db";
import { sendBookingEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });

  const { name, email, phone, position, company, message } = body as Record<
    string,
    string | undefined
  >;

  if (!name?.trim() || !email?.trim() || !position?.trim()) {
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

  try {
    const db = getDb();
    await ensureSchema(db);
    const result = await db
      .prepare(
        `INSERT INTO bookings (name, email, phone, position, company, message) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        name.trim(),
        email.trim(),
        phone?.trim() || null,
        position.trim(),
        company?.trim() || null,
        message?.trim() || null
      )
      .run();

    // 通知メールは waitUntil でレスポンスをブロックせずに送信
    getExecutionCtx().waitUntil(
      sendBookingEmail({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        position: position.trim(),
        company: company?.trim() || null,
        message: message?.trim() || null,
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
