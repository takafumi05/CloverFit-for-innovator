import { INSTAGRAM_URL } from "@/lib/constants";
import { InstagramIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="border-t border-border py-20">
      <div className="max-w-[1080px] mx-auto px-12 flex items-center justify-between flex-wrap gap-7 max-md:flex-col max-md:items-start max-md:px-6">
        <div>
          <div className="font-inter font-extrabold text-[20px] tracking-[-0.03em] text-tp mb-2">
            CloverFit
          </div>
          <div className="font-sans font-light text-[13px] text-ts">
            ジムで身体は変わった。でも、心は？
          </div>
        </div>
        <div className="flex flex-col items-end gap-2.5 max-md:items-start">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-[7px] font-inter text-[13px] font-normal text-ts no-underline tracking-[0.03em] transition-colors duration-200 hover:text-tp"
          >
            <InstagramIcon width={15} height={15} />
            @cloverfit2026
          </a>
          <span className="font-inter text-[11px] text-[#333] tracking-[0.04em]">
            © 2026 CloverFit. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
