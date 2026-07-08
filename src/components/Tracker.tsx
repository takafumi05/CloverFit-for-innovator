"use client";

import { useEffect } from "react";

type TrackEvent = { type: "pageview" | "section"; section?: string; duration?: number };

function send(
  events: TrackEvent[],
  sessionId: string,
  path: string,
  referrer: string,
  beacon: boolean
) {
  const body = JSON.stringify({ sessionId, path, referrer, events });
  try {
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([body], { type: "application/json" })
      );
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // 計測失敗は無視
  }
}

/**
 * Cookie不使用・IP非保存の軽量アクセス計測。
 * pageview を1回、各 section[id] の可視滞在時間を離脱時にまとめて送信。
 */
export default function Tracker() {
  useEffect(() => {
    let sid = sessionStorage.getItem("cf_sid");
    if (!sid) {
      sid =
        (crypto.randomUUID && crypto.randomUUID()) ||
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("cf_sid", sid);
    }
    const path = location.pathname;
    const referrer = document.referrer || "";

    // pageview
    send([{ type: "pageview" }], sid, path, referrer, false);

    // section 滞在時間
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[id]")
    );
    const openAt = new Map<string, number>(); // section -> 可視開始時刻
    const total = new Map<string, number>(); // section -> 累積ms
    const pageStart = performance.now();

    const obs = new IntersectionObserver(
      (entries) => {
        const now = performance.now();
        entries.forEach((e) => {
          const id = (e.target as HTMLElement).id;
          if (e.isIntersecting) {
            if (!openAt.has(id)) openAt.set(id, now);
          } else {
            const start = openAt.get(id);
            if (start != null) {
              total.set(id, (total.get(id) || 0) + (now - start));
              openAt.delete(id);
            }
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach((s) => obs.observe(s));

    let sent = false;
    const flush = () => {
      if (sent) return;
      sent = true;
      const now = performance.now();
      openAt.forEach((start, id) =>
        total.set(id, (total.get(id) || 0) + (now - start))
      );
      const events: TrackEvent[] = [];
      total.forEach((ms, section) => {
        if (ms >= 500) events.push({ type: "section", section, duration: Math.round(ms) });
      });
      events.push({
        type: "section",
        section: "(page)",
        duration: Math.round(now - pageStart),
      });
      send(events, sid!, path, referrer, true);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);

    return () => {
      obs.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  return null;
}
