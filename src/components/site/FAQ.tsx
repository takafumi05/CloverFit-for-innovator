"use client";

import { useState } from "react";
import { FAQS } from "@/lib/site-content";
import { Container, Section, SectionHead } from "./primitives";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" surface>
      <Container>
        <SectionHead en="FAQ" title={<>よくある質問</>} center className="mx-auto" />

        <div className="mt-12 max-w-[820px] mx-auto flex flex-col gap-2.5">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="bg-white border border-line rounded-[6px] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-5 cursor-pointer"
                >
                  <span className="flex items-start gap-3">
                    <span className="font-inter font-bold text-green shrink-0">
                      Q
                    </span>
                    <span className="font-sans font-bold text-[15px] text-ink leading-relaxed">
                      {f.q}
                    </span>
                  </span>
                  <span
                    className={`relative shrink-0 w-5 h-5 transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  >
                    <span className="absolute top-1/2 left-0 w-5 h-[2px] -translate-y-1/2 bg-green rounded" />
                    <span className="absolute left-1/2 top-0 h-5 w-[2px] -translate-x-1/2 bg-green rounded" />
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-5 flex items-start gap-3">
                      <span className="font-inter font-bold text-muted shrink-0">
                        A
                      </span>
                      <p className="text-[14.5px] leading-[1.9] text-muted">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
