"use client";

import { useEffect, useState } from "react";
import { INSTAGRAM_URL, LINE_URL } from "@/lib/constants";

const NAV_LINKS = [
  { id: "problem", label: "課題" },
  { id: "solution", label: "ソリューション" },
  { id: "origin", label: "創業者" },
  { id: "supervisor", label: "監修" },
];

const SECTION_IDS = [
  "problem",
  "solution",
  "origin",
  "supervisor",
  "booking",
  "contact",
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      let current = "";
      for (const id of SECTION_IDS) {
        const sec = document.getElementById(id);
        if (sec && sec.getBoundingClientRect().top <= 120) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkBase =
    "font-inter text-[11px] font-medium tracking-[0.08em] no-underline rounded-md whitespace-nowrap px-[14px] py-[6px] transition-colors duration-200 hover:text-white hover:bg-white/[0.06] max-[640px]:text-[9px] max-[640px]:px-[7px] max-[640px]:py-[5px] max-[640px]:tracking-[0.04em] max-[400px]:text-[8px] max-[400px]:px-[5px] max-[400px]:py-[4px]";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[300] grid grid-cols-[auto_1fr] items-center py-[22px] px-12 border-b transition-[background,backdrop-filter,border-color] duration-[400ms] max-md:py-[18px] max-md:px-6 max-[640px]:py-[14px] max-[640px]:px-3 max-[640px]:gap-1 ${
        scrolled
          ? "bg-[rgba(5,5,5,0.92)] backdrop-blur-[16px] border-border"
          : "bg-transparent border-transparent"
      }`}
    >
      <a href="#hero" className="flex items-center">
        <img
          src="/images/cloverfit-logo.png"
          alt="CloverFit"
          className="h-9 w-auto block"
        />
      </a>

      <div className="flex items-center gap-2 w-full justify-center pl-8 max-[640px]:gap-1 max-[640px]:pl-4">
        {NAV_LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className={`${linkBase} ${
              active === l.id ? "text-white" : "text-white/45"
            }`}
          >
            {l.label}
          </a>
        ))}

        <span className="flex-1" />

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener"
          aria-label="Instagram"
          className="flex items-center text-white/45 hover:text-white transition-colors duration-200 mr-1 no-underline"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="18"
            height="18"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
          </svg>
        </a>

        <a
          href={LINE_URL}
          target="_blank"
          rel="noopener"
          className="font-inter text-[11px] font-medium tracking-[0.08em] no-underline whitespace-nowrap text-accent border border-accent rounded-md ml-3 px-[14px] py-[6px] transition-colors duration-200 hover:bg-[rgba(0,224,90,0.12)] max-[640px]:text-[9px] max-[640px]:px-[9px] max-[640px]:py-[5px] max-[400px]:px-[7px] max-[400px]:py-[4px] max-[400px]:ml-auto"
        >
          体験予約
        </a>
      </div>
    </nav>
  );
}
