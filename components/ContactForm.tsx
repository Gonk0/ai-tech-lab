"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

const fieldClass =
  "w-full border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/22 focus:border-white/24";
const labelClass = "mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/34";
const errorClass = "mt-1.5 text-xs text-rose-300/90";

export function ContactForm() {
  const { t } = useLanguage();
  const c = t.contact;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, message }),
    });

    const result = (await response.json()) as {
      ok?: boolean;
      fields?: Record<string, string>;
      error?: string;
    };

    if (!response.ok) {
      if (result.fields) {
        const mapped: Record<string, string> = {};
        for (const [key, code] of Object.entries(result.fields)) {
          if (code === "Required") mapped[key] = c.required;
          else if (code === "Invalid email") mapped[key] = c.invalidEmail;
          else if (code === "Message too short") mapped[key] = c.minMessage;
          else mapped[key] = code;
        }
        setErrors(mapped);
      } else {
        setErrors({ form: result.error ?? "Error" });
      }
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.05] p-8 md:p-10"
      >
        <h2 className="mb-4 text-3xl font-bold tracking-[-0.03em] text-white">{c.successTitle}</h2>
        <p className="max-w-xl text-sm leading-7 text-white/48">{c.successBody}</p>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white/[0.075] bg-white/[0.028] p-7 md:p-9"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="name">
            {c.name} *
          </label>
          <input
            id="name"
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name ? <p className={errorClass}>{errors.name}</p> : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            {c.email} *
          </label>
          <input
            id="email"
            type="email"
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email ? <p className={errorClass}>{errors.email}</p> : null}
        </div>

        <div>
          <label className={labelClass} htmlFor="phone">
            {c.phone}
          </label>
          <input
            id="phone"
            className={fieldClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass} htmlFor="message">
            {c.message} *
          </label>
          <textarea
            id="message"
            rows={6}
            className={`${fieldClass} resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={c.messagePlaceholder}
          />
          {errors.message ? <p className={errorClass}>{errors.message}</p> : null}
        </div>
      </div>

      {errors.form ? <p className={`${errorClass} mt-4`}>{errors.form}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 inline-flex items-center gap-2 bg-white px-7 py-4 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-60"
      >
        {submitting ? c.submitting : c.submit}
        {!submitting ? <span>→</span> : null}
      </button>
    </motion.form>
  );
}
