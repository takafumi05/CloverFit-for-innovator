import { issueToken } from "@/lib/auth";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });

  const { username, password } = body as {
    username?: string;
    password?: string;
  };

  const adminUsername = getEnv("ADMIN_USERNAME") ?? "admin";
  const adminPassword = getEnv("ADMIN_PASSWORD");

  // 認証情報が未設定ならログイン不可（シークレット必須）
  if (!adminPassword || !getEnv("ADMIN_JWT_SECRET")) {
    console.error(
      "Admin auth is not configured: set ADMIN_PASSWORD and ADMIN_JWT_SECRET"
    );
    return Response.json({ error: "サーバー設定エラー" }, { status: 500 });
  }

  if (username !== adminUsername || password !== adminPassword) {
    return Response.json(
      { error: "ユーザー名またはパスワードが違います" },
      { status: 401 }
    );
  }

  const token = await issueToken(adminUsername);
  return Response.json({ success: true, token, username: adminUsername });
}
