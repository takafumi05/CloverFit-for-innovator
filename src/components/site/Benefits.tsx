import { BENEFITS_COMPANY, BENEFITS_PARTICIPANT } from "@/lib/site-content";
import { Container, Section, SectionHead } from "./primitives";
import { CheckIcon } from "./icons";

function BenefitList({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div className="bg-white border border-line rounded-[6px] p-7">
      <div className="inline-flex items-center gap-2 bg-green-tint text-green-dark text-[13px] font-bold rounded-[3px] px-3 py-1.5">
        {label}
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <CheckIcon className="w-[18px] h-[18px] text-green shrink-0 mt-0.5" />
            <span className="text-[14.5px] leading-relaxed text-ink">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Benefits() {
  return (
    <Section id="benefits">
      <Container>
        <SectionHead
          en="BENEFITS"
          title={<>社員の状態を整え、組織の活力を高める。</>}
          lead="企業にとっても、参加する社員にとっても意味のある時間になります。"
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-3">
          <BenefitList label="企業側のメリット" items={BENEFITS_COMPANY} />
          <BenefitList label="参加者側のメリット" items={BENEFITS_PARTICIPANT} />
        </div>
      </Container>
    </Section>
  );
}
