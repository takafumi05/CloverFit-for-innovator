import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });

  const { status, admin_note } = body as {
    status?: string;
    admin_note?: string;
  };

  try {
    const updates: string[] = ["updated_at = CURRENT_TIMESTAMP"];
    const bind: unknown[] = [];
    if (status) {
      updates.push("status = ?");
      bind.push(status);
    }
    if (admin_note !== undefined) {
      updates.push("admin_note = ?");
      bind.push(admin_note);
    }
    bind.push(id);

    const db = getDb();
    await db
      .prepare(`UPDATE bookings SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...bind)
      .run();

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "DB更新エラー" }, { status: 500 });
  }
}
