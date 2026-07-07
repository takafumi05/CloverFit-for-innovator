import { PROBLEMS } from "@/lib/site-content";
import { Container, Section, SectionHead } from "./primitives";

export default function Problem() {
  return (
    <Section id="problem" surface>
      <Container>
        <SectionHead
          en="PROBLEM"
          title={<>社員の不調は、見えにくい。</>}
          lead={
            <>
              若手社員の疲労、集中力の低下、モチベーションの波、職場の活気不足。これらは売上や離職に影響するにもかかわらず、日常では見過ごされがちです。
              <br />
              <br />
              また、ジム補助や健康イベントを導入しても、社員が自分ごと化できず、利用率が伸びないケースも少なくありません。CloverFitは、社員の心身状態を測定・体験・レポート化することで、健康施策を「使われる施策」に変えていきます。
            </>
          }
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PROBLEMS.map((p) => (
            <div
              key={p}
              className="r flex items-start gap-3 bg-white border border-line rounded-[4px] px-4 py-3.5"
            >
              <span className="mt-[7px] w-1.5 h-1.5 rotate-45 bg-green shrink-0" />
              <span className="text-[14px] text-ink leading-relaxed">{p}</span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
