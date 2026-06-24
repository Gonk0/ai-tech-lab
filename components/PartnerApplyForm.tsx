"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type WebsiteMode = "has_site" | "no_site";

type FormState = {
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  instagram: string;
  websiteMode: WebsiteMode;
  websiteUrl: string;
  wantsNewWebsite: boolean;
  operatingSince: string;
  missionDescription: string;
  proofLinks: string[];
  additionalNotes: string;
  confirmsTrackRecord: boolean;
  confirmsCustomSite: boolean;
  acceptsTerms: boolean;
};

const INITIAL_STATE: FormState = {
  organizationName: "",
  contactName: "",
  email: "",
  phone: "",
  instagram: "",
  websiteMode: "no_site",
  websiteUrl: "",
  wantsNewWebsite: true,
  operatingSince: "",
  missionDescription: "",
  proofLinks: [""],
  additionalNotes: "",
  confirmsTrackRecord: false,
  confirmsCustomSite: false,
  acceptsTerms: false,
};

const fieldClass =
  "w-full border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/22 focus:border-white/24";
const labelClass = "mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/34";
const errorClass = "mt-1.5 text-xs text-rose-300/90";

export function PartnerApplyForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      delete next.form;
      return next;
    });
  };

  const updateProofLink = (index: number, value: string) => {
    setForm((current) => {
      const proofLinks = [...current.proofLinks];
      proofLinks[index] = value;
      return { ...current, proofLinks };
    });
    setErrors((current) => {
      const next = { ...current };
      delete next.proofLinks;
      delete next.form;
      return next;
    });
  };

  const addProofLink = () => {
    if (form.proofLinks.length >= 8) return;
    setForm((current) => ({ ...current, proofLinks: [...current.proofLinks, ""] }));
  };

  const removeProofLink = (index: number) => {
    if (form.proofLinks.length <= 1) return;
    setForm((current) => ({
      ...current,
      proofLinks: current.proofLinks.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const payload = {
      organizationName: form.organizationName,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      instagram: form.instagram,
      websiteMode: form.websiteMode,
      websiteUrl: form.websiteMode === "has_site" ? form.websiteUrl : undefined,
      wantsNewWebsite: form.websiteMode === "no_site" ? form.wantsNewWebsite : undefined,
      operatingSince: form.operatingSince,
      missionDescription: form.missionDescription,
      proofLinks: form.proofLinks.filter((link) => link.trim().length > 0),
      additionalNotes: form.additionalNotes,
      confirmsTrackRecord: form.confirmsTrackRecord,
      confirmsCustomSite: form.websiteMode === "has_site" ? form.confirmsCustomSite : undefined,
      acceptsTerms: form.acceptsTerms,
    };

    try {
      const response = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        id?: string;
        error?: string;
        fields?: Record<string, string>;
      };

      if (!response.ok) {
        setErrors(result.fields ?? { form: result.error ?? "Submission failed" });
        return;
      }

      setSubmittedId(result.id ?? "submitted");
    } catch {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.05] p-8 md:p-10"
      >
        <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-emerald-300/80">
          Application received
        </p>
        <h2 className="mb-4 text-3xl font-bold tracking-[-0.03em] text-white">
          Thank you for applying.
        </h2>
        <p className="max-w-xl text-sm leading-7 text-white/48">
          We review every nonprofit application manually. If your organization is selected, we will
          contact you at the email you provided. Reference:{" "}
          <span className="font-mono text-white/70">{submittedId}</span>
        </p>
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
      <div className="mb-8 border-b border-white/[0.06] pb-6">
        <h2 className="text-2xl font-bold tracking-[-0.03em] text-white">Partnership application</h2>
        <p className="mt-2 text-sm leading-7 text-white/38">
          Required fields are marked. Instagram and proof links help us verify real community work.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/52">
            Organization
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="organizationName">
                Organization name *
              </label>
              <input
                id="organizationName"
                className={fieldClass}
                value={form.organizationName}
                onChange={(event) => updateField("organizationName", event.target.value)}
                placeholder="Your nonprofit or initiative"
              />
              {errors.organizationName ? (
                <p className={errorClass}>{errors.organizationName}</p>
              ) : null}
            </div>

            <div>
              <label className={labelClass} htmlFor="operatingSince">
                Active since *
              </label>
              <input
                id="operatingSince"
                className={fieldClass}
                value={form.operatingSince}
                onChange={(event) => updateField("operatingSince", event.target.value)}
                placeholder="e.g. 2019 or 4 years"
              />
              {errors.operatingSince ? (
                <p className={errorClass}>{errors.operatingSince}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/52">
            Contact
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="contactName">
                Contact person *
              </label>
              <input
                id="contactName"
                className={fieldClass}
                value={form.contactName}
                onChange={(event) => updateField("contactName", event.target.value)}
                placeholder="Full name"
              />
              {errors.contactName ? <p className={errorClass}>{errors.contactName}</p> : null}
            </div>

            <div>
              <label className={labelClass} htmlFor="email">
                Email *
              </label>
              <input
                id="email"
                type="email"
                className={fieldClass}
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="contact@organization.org"
              />
              {errors.email ? <p className={errorClass}>{errors.email}</p> : null}
            </div>

            <div>
              <label className={labelClass} htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                className={fieldClass}
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+421 ..."
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="instagram">
                Instagram *
              </label>
              <input
                id="instagram"
                className={fieldClass}
                value={form.instagram}
                onChange={(event) => updateField("instagram", event.target.value)}
                placeholder="@yourorg or profile URL"
              />
              {errors.instagram ? <p className={errorClass}>{errors.instagram}</p> : null}
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/52">
            Website status
          </h3>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => updateField("websiteMode", "no_site")}
              className={`border px-4 py-4 text-left text-sm transition-colors ${
                form.websiteMode === "no_site"
                  ? "border-white/28 bg-white/[0.06] text-white"
                  : "border-white/[0.08] text-white/42 hover:border-white/18 hover:text-white/65"
              }`}
            >
              <span className="block font-semibold">No website yet</span>
              <span className="mt-1 block text-xs leading-6 text-white/34">
                We want one built from scratch on your modern stack.
              </span>
            </button>

            <button
              type="button"
              onClick={() => updateField("websiteMode", "has_site")}
              className={`border px-4 py-4 text-left text-sm transition-colors ${
                form.websiteMode === "has_site"
                  ? "border-white/28 bg-white/[0.06] text-white"
                  : "border-white/[0.08] text-white/42 hover:border-white/18 hover:text-white/65"
              }`}
            >
              <span className="block font-semibold">We already have a website</span>
              <span className="mt-1 block text-xs leading-6 text-white/34">
                Share the URL if it is not on WordPress or a page builder.
              </span>
            </button>
          </div>

          {form.websiteMode === "has_site" ? (
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="websiteUrl">
                  Current website URL *
                </label>
                <input
                  id="websiteUrl"
                  className={fieldClass}
                  value={form.websiteUrl}
                  onChange={(event) => updateField("websiteUrl", event.target.value)}
                  placeholder="https://yourorganization.org"
                />
                {errors.websiteUrl ? <p className={errorClass}>{errors.websiteUrl}</p> : null}
              </div>

              <label className="flex items-start gap-3 text-sm leading-7 text-white/42">
                <input
                  type="checkbox"
                  checked={form.confirmsCustomSite}
                  onChange={(event) => updateField("confirmsCustomSite", event.target.checked)}
                  className="mt-1"
                />
                <span>
                  I confirm our current website is not built on WordPress, Wix, Squarespace,
                  Webflow, or any other paid template or drag-and-drop builder.
                </span>
              </label>
              {errors.confirmsCustomSite ? (
                <p className={errorClass}>{errors.confirmsCustomSite}</p>
              ) : null}
            </div>
          ) : (
            <label className="flex items-start gap-3 text-sm leading-7 text-white/42">
              <input
                type="checkbox"
                checked={form.wantsNewWebsite}
                onChange={(event) => updateField("wantsNewWebsite", event.target.checked)}
                className="mt-1"
              />
              <span>
                We do not have a website and want AI Tech Lab to design and build one from scratch,
                then manage it long-term.
              </span>
            </label>
          )}
          {errors.wantsNewWebsite ? <p className={errorClass}>{errors.wantsNewWebsite}</p> : null}
        </section>

        <section>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/52">
            Proof of work
          </h3>

          <div className="mb-5">
            <label className={labelClass} htmlFor="missionDescription">
              What does your organization do? *
            </label>
            <textarea
              id="missionDescription"
              rows={5}
              className={`${fieldClass} resize-y`}
              value={form.missionDescription}
              onChange={(event) => updateField("missionDescription", event.target.value)}
              placeholder="Describe your mission, who you help, and the impact you have already created."
            />
            {errors.missionDescription ? (
              <p className={errorClass}>{errors.missionDescription}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <label className={labelClass}>Proof links *</label>
              <button
                type="button"
                onClick={addProofLink}
                className="text-xs uppercase tracking-[0.16em] text-white/35 transition-colors hover:text-white/70"
              >
                + Add link
              </button>
            </div>
            <p className="text-xs leading-6 text-white/30">
              Share social profiles, posts, press, event pages or other public proof that shows you
              have been operating for some time.
            </p>

            {form.proofLinks.map((link, index) => (
              <div key={`proof-${index}`} className="flex gap-2">
                <input
                  className={fieldClass}
                  value={link}
                  onChange={(event) => updateProofLink(index, event.target.value)}
                  placeholder="https://instagram.com/... or Facebook / news article"
                />
                {form.proofLinks.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeProofLink(index)}
                    className="flex-shrink-0 border border-white/[0.08] px-3 text-sm text-white/35 transition-colors hover:border-white/20 hover:text-white/70"
                    aria-label="Remove proof link"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            ))}
            {errors.proofLinks ? <p className={errorClass}>{errors.proofLinks}</p> : null}
          </div>

          <div className="mt-5">
            <label className={labelClass} htmlFor="additionalNotes">
              Anything else we should know
            </label>
            <textarea
              id="additionalNotes"
              rows={3}
              className={`${fieldClass} resize-y`}
              value={form.additionalNotes}
              onChange={(event) => updateField("additionalNotes", event.target.value)}
              placeholder="Optional context, team size, upcoming campaigns, etc."
            />
          </div>
        </section>

        <section className="space-y-4 border-t border-white/[0.06] pt-6">
          <label className="flex items-start gap-3 text-sm leading-7 text-white/42">
            <input
              type="checkbox"
              checked={form.confirmsTrackRecord}
              onChange={(event) => updateField("confirmsTrackRecord", event.target.checked)}
              className="mt-1"
            />
            <span>
              I confirm that the links and information above represent real work our organization
              has already done in the community.
            </span>
          </label>
          {errors.confirmsTrackRecord ? (
            <p className={errorClass}>{errors.confirmsTrackRecord}</p>
          ) : null}

          <label className="flex items-start gap-3 text-sm leading-7 text-white/42">
            <input
              type="checkbox"
              checked={form.acceptsTerms}
              onChange={(event) => updateField("acceptsTerms", event.target.checked)}
              className="mt-1"
            />
            <span>
              I understand that AI Tech Lab selects partners based on demonstrated impact, that
              support continues after launch, and that accepted sites are built and managed on a
              modern custom stack — not WordPress or page builders.
            </span>
          </label>
          {errors.acceptsTerms ? <p className={errorClass}>{errors.acceptsTerms}</p> : null}
        </section>
      </div>

      {errors.form ? <p className={`${errorClass} mt-6`}>{errors.form}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 inline-flex items-center gap-2 bg-white px-7 py-4 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit application"}
        {!submitting ? <span>→</span> : null}
      </button>
    </motion.form>
  );
}
