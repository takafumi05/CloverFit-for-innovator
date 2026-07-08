import { useState } from "react";
import { BrandMark } from "@/components/site/icons";

export default function LoginScreen({
  error,
  onSubmit,
}: {
  error: string;
  onSubmit: (username: string, password: string) => void;
}) {
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("");

  const input =
    "w-full bg-white border border-line rounded-[6px] px-4 py-3 text-ink font-sans text-[15px] outline-none focus:border-green transition-colors";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef6f1_0%,#ffffff_60%)] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-white/80 backdrop-blur-xl border border-line rounded-[12px] shadow-[0_24px_60px_rgba(20,32,26,0.10)] px-10 py-12">
        <div className="flex items-center gap-2 mb-1.5">
          <BrandMark className="h-7 w-auto" />
          <span className="font-inter font-extrabold text-[20px] tracking-[-0.02em] text-ink">
            Clover<span className="text-green">Fit</span>
          </span>
        </div>
        <p className="text-[13px] text-muted mb-8">管理者ログイン</p>

        {error && (
          <div className="bg-[#fdeaea] border border-[#f4caca] rounded-[6px] px-4 py-3 text-[13px] text-[#dc2626] mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="font-inter text-[11px] font-semibold tracking-[0.1em] text-muted uppercase block mb-2">
              ユーザー名
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className={input}
            />
          </div>
          <div>
            <label className="font-inter text-[11px] font-semibold tracking-[0.1em] text-muted uppercase block mb-2">
              パスワード
            </label>
            <input
              type="password"
              placeholder="パスワードを入力"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit(user, pass);
              }}
              className={input}
            />
          </div>
          <button
            onClick={() => onSubmit(user, pass)}
            className="mt-2 w-full bg-green text-white rounded-[6px] py-3.5 font-sans font-bold text-[15px] hover:bg-green-dark transition-colors shadow-[0_6px_18px_rgba(22,163,74,0.22)]"
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  );
}
