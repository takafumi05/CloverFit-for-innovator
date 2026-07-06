// 現行の「署名なし base64 トークン」方式を踏襲（パリティ維持）。
// 有効期限は 24 時間。

export type AdminPayload = { id: number; username: string; exp: number };

const TOKEN_TTL_MS = 86_400_000; // 24h

export function issueToken(admin: { id: number; username: string }): string {
  return btoa(
    JSON.stringify({
      id: admin.id,
      username: admin.username,
      exp: Date.now() + TOKEN_TTL_MS,
    })
  );
}

/**
 * Authorization: Bearer <token> を検証。
 * 成功で AdminPayload、失敗で 401 Response を返す。
 */
export function requireAdmin(req: Request): AdminPayload | Response {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "認証が必要です" }, { status: 401 });
  }
  try {
    const payload = JSON.parse(atob(auth.slice(7))) as AdminPayload;
    if (payload.exp < Date.now()) {
      return Response.json({ error: "セッションが期限切れです" }, { status: 401 });
    }
    return payload;
  } catch {
    return Response.json({ error: "無効なトークンです" }, { status: 401 });
  }
}
