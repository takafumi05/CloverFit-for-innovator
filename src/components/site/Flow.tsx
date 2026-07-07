import { FLOW } from "@/lib/site-content";
import { Container, Section, SectionHead } from "./primitives";

export default function Flow() {
  return (
    <Section id="flow">
      <Container>
        <SectionHead
          en="FLOW"
          title={<>60分で、測定からフィードバックまで完結。</>}
          lead="当日の流れはシンプル。運動が苦手な方でも無理なく参加できます。"
        />

        <ol className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FLOW.map((s, i) => (
            <li
              key={s.title}
              className="r relative bg-white border border-line rounded-[6px] p-6 pl-7"
            >
              <span className="absolute -top-3 left-6 inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-[4px] bg-green text-white font-inter font-bold text-[14px] shadow-[0_6px_16px_rgba(22,163,74,0.25)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-sans font-bold text-[16px] text-ink">
                {s.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.85] text-muted">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
