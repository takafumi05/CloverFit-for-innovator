import { FEATURES } from "@/lib/site-content";
import { Container, Section, SectionHead } from "./primitives";
import { FEATURE_ICONS } from "./icons";

export default function Features() {
  return (
    <Section id="features" surface>
      <Container>
        <SectionHead
          en="FEATURES"
          title={<>単なるフィットネスではない、5つの特徴。</>}
          lead="社員が自分の状態に気づき、健康施策が「使われる」状態をつくります。"
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => {
            const Icon = FEATURE_ICONS[f.icon];
            return (
              <div
                key={f.title}
                className={`r d${(i % 4) + 1} group bg-white border border-line border-t-[3px] border-t-green rounded-[6px] p-7 transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(20,32,26,0.08)]`}
              >
                <div className="w-12 h-12 rounded-[6px] bg-green-tint flex items-center justify-center text-green group-hover:bg-green group-hover:text-white transition-colors duration-300">
                  {Icon && <Icon className="w-6 h-6" />}
                </div>
                <h3 className="mt-5 font-sans font-bold text-[17px] text-ink">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-[1.9] text-muted">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
