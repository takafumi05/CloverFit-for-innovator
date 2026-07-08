"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminAuthContext, tokenExpMs } from "./context";
import LoginScreen from "./LoginScreen";
import Sidebar from "./Sidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState("");
  const [loginErr, setLoginErr] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("cf_admin_token") || "";
    if (stored && tokenExpMs(stored) > Date.now()) setToken(stored);
    else if (stored) localStorage.removeItem("cf_admin_token");
    setReady(true);
  }, []);

  const authFetch = useCallback(
    (path: string, opts: RequestInit = {}) =>
      fetch(path, {
        ...opts,
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
          ...(opts.headers || {}),
        },
      }),
    [token]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("cf_admin_token");
    setToken("");
  }, []);

  async function doLogin(username: string, password: string) {
    setLoginErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { token: string; error?: string };
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem("cf_admin_token", data.token);
      setToken(data.token);
    } catch (err) {
      setLoginErr(err instanceof Error ? err.message : "ログインに失敗しました");
    }
  }

  if (!ready) return null;
  if (!token) return <LoginScreen error={loginErr} onSubmit={doLogin} />;

  return (
    <AdminAuthContext.Provider value={{ token, authFetch, logout }}>
      <div className="min-h-screen bg-surface text-ink">
        <div className="grid grid-cols-[240px_1fr] max-[820px]:grid-cols-1 min-h-screen">
          <Sidebar onLogout={logout} />
          <main className="p-6 md:p-8 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </AdminAuthContext.Provider>
  );
}
