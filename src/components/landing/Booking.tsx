import { LINE_URL } from "@/lib/constants";
import { H2, LABEL, SECTION_TOP, SUB, WRAP } from "./styles";
import { LineIcon } from "./icons";

export default function Booking() {
  return (
    <section id="booking" className={SECTION_TOP}>
      <div className={WRAP}>
        <div className="grid grid-cols-2 gap-20 items-start max-[900px]:grid-cols-1 max-[900px]:gap-14">
          <div className="sticky top-[110px] max-[900px]:static">
            <span className={`${LABEL} r on`}>Contact</span>
            <h2 className={`${H2} r d1 on`}>
              まずは、
              <br />
              体験から。
            </h2>
            <p className={`${SUB} r d2 on`}>
              起業家・経営者の方を対象にご案内しております。
            </p>
          </div>

          <div className="flex flex-col items-start gap-10 pt-2 r d2 on">
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-3 bg-[#06C755] text-white font-sans font-bold text-[16px] no-underline px-9 py-[18px] rounded-xl transition-[background,box-shadow] duration-200 shadow-[0_4px_20px_rgba(6,199,85,0.3)] hover:bg-[#05b34c] hover:shadow-[0_8px_28px_rgba(6,199,85,0.4)] max-md:text-[14px] max-md:px-6 max-md:py-4"
            >
              <LineIcon />
              公式LINEで体験予約する
            </a>
            <div className="flex items-center gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/line-qr.png"
                alt="CloverFit 公式LINE QRコード"
                className="w-[140px] h-[140px] rounded-xl border border-border bg-white p-2 max-md:w-[110px] max-md:h-[110px]"
              />
              <p className="font-sans font-light text-[13px] text-ts leading-[2]">
                QRコードを読み取って
                <br />
                友だち追加してください
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
