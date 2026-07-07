"use client";

import { useState } from "react";
import { PLAN_OPTIONS } from "@/lib/site-content";
import { Container, Section, SectionHead } from "./primitives";

type Values = {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  employee_count: string;
  headcount: string;
  timing: string;
  venue: string;
  plan: string;
};

const EMPTY: Values = {
  company: "",
  name: "",
  email: "",
  phone: "",
  message: "",
  employee_count: "",
  headcount: "",
  timing: "",
  venue: "",
  plan: "",
};

const REQUIRED: (keyof Values)[] = [
  "company",
  "name",
  "email",
  "phone",
  "message",
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPLOYEE_OPTIONS = ["〜20名", "21〜50名", "51〜100名", "101名以上"];
const TIMING_OPTIONS = [
  "できるだけ早く",
  "1〜3ヶ月以内",
  "3ヶ月以降",
  "時期は未定",
];
const VENUE_OPTIONS = [
  "社内にスペースがある",
  "スペースがない",
  "わからない",
];

const inputBase =
  "w-full bg-white rounded-[4px] text-ink text-[14.5px] px-4 py-3 outline-none transition-colors";

export default function ContactForm() {
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, boolean>>>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof Values) => (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setV((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: false }));
  };

  const border = (k: keyof Values) =>
    errors[k] ? "border border-[#e11d48]" : "border border-line focus:border-green";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<keyof Values, boolean>> = {};
    REQUIRED.forEach((k) => {
      if (!v[k].trim()) next[k] = true;
    });
    if (v.email.trim() && !EMAIL_RE.test(v.email.trim())) next.email = true;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: v.company.trim(),
          name: v.name.trim(),
          email: v.email.trim(),
          phone: v.phone.trim(),
          message: v.message.trim(),
          employee_count: v.employee_count,
          headcount: v.headcount.trim(),
          timing: v.timing,
          venue: v.venue,
          plan: v.plan,
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      alert("送信に失敗しました。時間をおいて再度お試しください。");
      setSubmitting(false);
    }
  }

  return (
    <Section id="contact">
      <Container>
        <SectionHead
          en="CONTACT"
          title={<>無料体験・お問い合わせ</>}
          lead="内容はできるだけ簡単で構いません。担当者より折り返しご連絡いたします。"
          center
          className="mx-auto"
        />

        <div className="mt-12 max-w-[760px] mx-auto">
          {sent ? (
            <div className="bg-green-tint border border-green/25 rounded-[8px] px-8 py-12 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-white border border-green/30 flex items-center justify-center">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-green)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="mt-5 text-[15.5px] leading-[1.95] text-ink">
                お問い合わせありがとうございます。
                <br />
                内容を確認のうえ、担当者よりご連絡いたします。
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white border border-line rounded-[8px] p-6 sm:p-9 shadow-[0_2px_16px_rgba(20,32,26,0.04)]"
            >
              {/* 必須項目 */}
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="会社名" required error={errors.company}>
                  <input
                    className={`${inputBase} ${border("company")}`}
                    placeholder="株式会社クローバー"
                    value={v.company}
                    onChange={set("company")}
                  />
                </Field>
                <Field label="お名前" required error={errors.name}>
                  <input
                    className={`${inputBase} ${border("name")}`}
                    placeholder="山田 太郎"
                    value={v.name}
                    onChange={set("name")}
                  />
                </Field>
                <Field label="メールアドレス" required error={errors.email}>
                  <input
                    type="email"
                    className={`${inputBase} ${border("email")}`}
                    placeholder="example@company.co.jp"
                    value={v.email}
                    onChange={set("email")}
                  />
                </Field>
                <Field label="電話番号" required error={errors.phone}>
                  <input
                    className={`${inputBase} ${border("phone")}`}
                    placeholder="03-1234-5678"
                    value={v.phone}
                    onChange={set("phone")}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field label="相談内容" required error={errors.message}>
                  <textarea
                    className={`${inputBase} ${border("message")} min-h-[130px] resize-y`}
                    placeholder="無料体験会の相談、導入時期、実施場所などご記入ください。"
                    value={v.message}
                    onChange={set("message")}
                  />
                </Field>
              </div>

              {/* 任意項目 */}
              <div className="mt-8 pt-7 border-t border-line">
                <p className="text-[13px] font-semibold text-muted mb-4">
                  任意項目（分かる範囲でご記入ください）
                </p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="従業員数" optional>
                    <select
                      className={`${inputBase} border border-line focus:border-green`}
                      value={v.employee_count}
                      onChange={set("employee_count")}
                    >
                      <option value="">選択してください</option>
                      {EMPLOYEE_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="実施希望人数" optional>
                    <input
                      className={`${inputBase} border border-line focus:border-green`}
                      placeholder="例）10名程度"
                      value={v.headcount}
                      onChange={set("headcount")}
                    />
                  </Field>
                  <Field label="実施希望時期" optional>
                    <select
                      className={`${inputBase} border border-line focus:border-green`}
                      value={v.timing}
                      onChange={set("timing")}
                    >
                      <option value="">選択してください</option>
                      {TIMING_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="実施場所の有無" optional>
                    <select
                      className={`${inputBase} border border-line focus:border-green`}
                      value={v.venue}
                      onChange={set("venue")}
                    >
                      <option value="">選択してください</option>
                      {VENUE_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="興味のあるプラン" optional>
                      <select
                        className={`${inputBase} border border-line focus:border-green`}
                        value={v.plan}
                        onChange={set("plan")}
                      >
                        <option value="">選択してください</option>
                        {PLAN_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 w-full inline-flex items-center justify-center font-sans font-bold text-[15.5px] px-8 py-4 rounded-[4px] bg-green text-white hover:bg-green-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(22,163,74,0.22)]"
              >
                {submitting ? "送信中..." : "この内容で申し込む"}
              </button>
              <p className="mt-3 text-center text-[12px] text-muted">
                送信いただいた内容は、無料体験・導入のご案内のみに利用します。
              </p>
            </form>
          )}
        </div>
      </Container>
    </Section>
  );
}

function Field({
  label,
  required,
  optional,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-ink flex items-center gap-2">
        {label}
        {required && <span className="text-green text-[12px]">必須</span>}
        {optional && (
          <span className="text-muted text-[11px] font-normal">任意</span>
        )}
        {error && (
          <span className="text-[#e11d48] text-[11px] font-normal">
            ご入力ください
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
