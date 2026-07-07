import { CONDITIONS } from "@/lib/site-content";
import { Container, Section, SectionHead } from "./primitives";

export default function Conditions() {
  return (
    <Section id="conditions" surface>
      <Container>
        <SectionHead
          en="CONDITIONS"
          title={<>社内ジムがなくても、会議室で実施可能。</>}
          lead="特別な設備は不要。少し広めのスペースがあれば実施できます。"
        />

        <div className="mt-12 bg-white border border-line rounded-[6px] overflow-hidden">
          {CONDITIONS.map((c) => (
            <div
              key={c.label}
              className="flex flex-col sm:flex-row sm:items-center border-b border-line last:border-b-0"
            >
              <div className="sm:w-[220px] shrink-0 px-6 py-4 bg-surface sm:bg-transparent">
                <span className="font-sans font-bold text-[14px] text-green-dark">
                  {c.label}
                </span>
              </div>
              <div className="px-6 py-4 sm:border-l border-line">
                <span className="text-[14.5px] text-ink leading-relaxed">
                  {c.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
