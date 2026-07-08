"use client";

import { createContext, useContext } from "react";

export type AdminAuth = {
  token: string;
  authFetch: (path: string, opts?: RequestInit) => Promise<Response>;
  logout: () => void;
};

export const AdminAuthContext = createContext<AdminAuth | null>(null);

export function useAdminAuth(): AdminAuth {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminShell");
  return ctx;
}

/** JWT の exp(秒) を ms で返す。デコード不可なら 0（無効扱い）。 */
export function tokenExpMs(token: string): number {
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)));
    return typeof json.exp === "number" ? json.exp * 1000 : 0;
  } catch {
    return 0;
  }
}
