import { ensureSchema, getDb } from "@/lib/db";
import { issueToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MASTER_PASSWORD = "cloverfit2026";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });

  const { username, password } = body as {
    username?: string;
    password?: string;
  };

  try {
    const db = getDb();
    await ensureSchema(db);
    const admin = await db
      .prepare("SELECT * FROM admins WHERE username = ?")
      .bind(username)
      .first<{ id: number; username: string; password_hash: string }>();

    // 保存ハッシュ or マスターパスワードで認証（現行踏襲）
    if (
      !admin ||
      (password !== admin.password_hash && password !== MASTER_PASSWORD)
    ) {
      return Response.json(
        { error: "ユーザー名またはパスワードが違います" },
        { status: 401 }
      );
    }

    const token = issueToken({ id: admin.id, username: admin.username });
    return Response.json({ success: true, token, username: admin.username });
  } catch {
    return Response.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
