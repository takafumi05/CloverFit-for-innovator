"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { EMAILJS_PUBLIC } from "@/lib/constants";
import { H2, LABEL, SUB } from "./styles";

type Errors = { name?: boolean; email?: boolean; message?: boolean };

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const inputCls = (hasErr?: boolean) =>
    `w-full bg-white/[0.04] border rounded-lg text-tp font-sans text-[14px] px-4 py-[14px] outline-none transition-colors duration-200 ${
      hasErr ? "border-[#e05]" : "border-border focus:border-accent"
    }`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Errors = {
      name: !name.trim(),
      email: !email.trim(),
      message: !message.trim(),
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.message) return;

    setSubmitting(true);
    try {
      await emailjs.send(
        EMAILJS_PUBLIC.serviceId,
        EMAILJS_PUBLIC.templateId,
        {
          name: name.trim(),
          email: email.trim(),
          phone: "なし",
          position: subject.trim() || "お問い合わせ",
          company: "なし",
          message: message.trim(),
        },
        { publicKey: EMAILJS_PUBLIC.publicKey }
      );
      setSent(true);
    } catch {
      alert("送信に失敗しました。再度お試しください。");
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="border-t border-border py-[120px]">
      <div className="max-w-[680px] mx-auto px-12 max-md:px-6">
        <span className={`${LABEL} r on`}>Contact</span>
        <h2 className={`${H2} r d1 on`}>お問い合わせ</h2>
        <p className={`${SUB} r d2 on`}>
          ご質問・ご相談はこちらからお気軽にどうぞ。
        </p>

        {!sent ? (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5 mt-12 r d3 on"
          >
            <div className="flex gap-4 max-[600px]:flex-col">
              <div className="flex flex-col gap-2 flex-1">
                <label
                  htmlFor="cf-name"
                  className="font-sans text-[12px] font-medium text-ts tracking-[0.06em]"
                >
                  お名前<span className="text-accent ml-1">*</span>
                </label>
                <input
                  id="cf-name"
                  type="text"
                  placeholder="山田 太郎"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: false }));
                  }}
                  className={inputCls(errors.name)}
                />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label
                  htmlFor="cf-email"
                  className="font-sans text-[12px] font-medium text-ts tracking-[0.06em]"
                >
                  メールアドレス<span className="text-accent ml-1">*</span>
                </label>
                <input
                  id="cf-email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: false }));
                  }}
                  className={inputCls(errors.email)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label
                htmlFor="cf-subject"
                className="font-sans text-[12px] font-medium text-ts tracking-[0.06em]"
              >
                件名
              </label>
              <input
                id="cf-subject"
                type="text"
                placeholder="お問い合わせの件名"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputCls(false)}
              />
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label
                htmlFor="cf-message"
                className="font-sans text-[12px] font-medium text-ts tracking-[0.06em]"
              >
                メッセージ<span className="text-accent ml-1">*</span>
              </label>
              <textarea
                id="cf-message"
                placeholder="お問い合わせ内容をご記入ください。"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message)
                    setErrors((p) => ({ ...p, message: false }));
                }}
                className={`${inputCls(errors.message)} min-h-[140px] resize-y`}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2.5 bg-accent text-[#050505] font-sans font-bold text-[15px] px-10 py-4 rounded-[10px] border-none cursor-pointer transition-[background,box-shadow] duration-200 self-start hover:bg-[#00c94f] hover:shadow-[0_6px_24px_rgba(0,224,90,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {submitting ? "送信中..." : "送信する"}
            </button>
          </form>
        ) : (
          <div className="bg-[rgba(0,200,80,0.08)] border border-[rgba(0,200,80,0.2)] rounded-xl px-8 py-7 text-center mt-4">
            <div className="text-[32px] mb-3">✉️</div>
            <p className="font-sans text-[15px] text-tp leading-[2]">
              お問い合わせありがとうございます。
              <br />
              内容を確認のうえ、担当者よりご連絡いたします。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
