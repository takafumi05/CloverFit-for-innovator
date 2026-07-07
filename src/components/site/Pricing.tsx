import { PLANS } from "@/lib/site-content";
import { Container, Section, SectionHead } from "./primitives";

export default function Pricing() {
  return (
    <Section id="pricing">
      <Container>
        <SectionHead
          en="PRICING"
          title={<>まずは無料体験から、無理なく。</>}
          lead="料金はあくまで目安です。人数・場所・内容に応じて個別にご提案します。"
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-[6px] p-6 ${
                p.featured
                  ? "border-2 border-green bg-green-tint/40 shadow-[0_16px_44px_rgba(22,163,74,0.14)]"
                  : "border border-line bg-white"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-6 inline-flex items-center bg-green text-white text-[11px] font-bold rounded-[3px] px-2.5 py-1 shadow-[0_6px_16px_rgba(22,163,74,0.28)]">
                  まずはこちら
                </span>
              )}
              <h3 className="font-sans font-bold text-[16px] text-ink">
                {p.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-inter font-extrabold text-[26px] text-ink tracking-tight">
                  {p.price}
                </span>
                {p.priceNote && (
                  <span className="text-[11px] text-muted">（{p.priceNote}）</span>
                )}
              </div>
              <p className="mt-3 text-[13px] leading-[1.85] text-muted flex-1">
                {p.desc}
              </p>
              <a
                href="#contact"
                className={`mt-6 inline-flex items-center justify-center font-sans font-bold text-[13.5px] px-4 py-3 rounded-[3px] transition-colors duration-200 no-underline ${
                  p.featured
                    ? "bg-green text-white hover:bg-green-dark"
                    : "bg-white text-ink border border-line hover:border-green hover:text-green"
                }`}
              >
                {p.featured ? "無料体験を申し込む" : "相談する"}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[13px] text-muted">
          ※
          実施人数・場所・内容により変動します。まずは無料体験会で社員の反応をご確認ください。
        </p>
      </Container>
    </Section>
  );
}
