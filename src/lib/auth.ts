import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { getEnv } from "./env";

// 署名付きJWT（HS256）で管理者認証。秘密鍵は env(ADMIN_JWT_SECRET) から取得。
const ALG = "HS256";
const TOKEN_TTL = "24h";

function getSecretKey(): Uint8Array {
  const secret = getEnv("ADMIN_JWT_SECRET");
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export type AdminPayload = JWTPayload & { username: string; role: "admin" };

/** ログイン成功時に署名付きJWTを発行 */
export async function issueToken(username: string): Promise<string> {
  return new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecretKey());
}

function unauthorized(message: string): Response {
  return Response.json({ error: message }, { status: 401 });
}

/**
 * Authorization: Bearer <JWT> を検証。
 * 署名・有効期限・role を確認し、成功で AdminPayload、失敗で 401 Response を返す。
 */
export async function requireAdmin(
  req: Request
): Promise<AdminPayload | Response> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return unauthorized("認証が必要です");
  try {
    const { payload } = await jwtVerify(auth.slice(7), getSecretKey());
    if (payload.role !== "admin") return unauthorized("権限がありません");
    return payload as AdminPayload;
  } catch {
    return unauthorized("セッションが無効か期限切れです");
  }
}
