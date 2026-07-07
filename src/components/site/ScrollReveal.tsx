"use client";

import { useEffect } from "react";

/**
 * `.r` を持つ要素を監視し、ビューポートに入ったら `.on` を付与。
 * 768px以下は即時全表示（globals.css 側で制御）。
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".r"));

    if (window.innerWidth <= 768) {
      els.forEach((el) => el.classList.add("on"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach((el) => {
      if (!el.classList.contains("on")) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  return null;
}
