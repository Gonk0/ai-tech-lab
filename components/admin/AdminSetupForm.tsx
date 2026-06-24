"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_BASE_PATH, ADMIN_EMAIL } from "@/lib/admin/constants";

const fieldClass =
  "w-full border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/22 focus:border-white/24";

export function AdminSetupForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      const response = await fetch("/api/vercel/partners/auth/status");
      const data = (await response.json()) as {
        setupRequired?: boolean;
        authenticated?: boolean;
      };

      if (!data.setupRequired) {
        router.replace(data.authenticated ? ADMIN_BASE_PATH : `${ADMIN_BASE_PATH}/login`);
        return;
      }

      setLoading(false);
    }

    void checkStatus();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/vercel/partners/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmPassword }),
    });

    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Setup failed");
      setSubmitting(false);
      return;
    }

    router.replace(ADMIN_BASE_PATH);
    router.refresh();
  };

  if (loading) {
    return <p className="text-sm text-white/40">Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-5">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 text-sm leading-7 text-white/42">
        <p>
          Create the admin password for <span className="text-white/70">{ADMIN_EMAIL}</span>. This
          step is only available once, before the first login.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/34" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          type="password"
          className={fieldClass}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={12}
        />
      </div>

      <div>
        <label
          className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/34"
          htmlFor="confirmPassword"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          className={fieldClass}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          minLength={12}
        />
      </div>

      {error ? <p className="text-sm text-rose-300/90">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-60"
      >
        {submitting ? "Creating..." : "Create admin password"}
      </button>
    </form>
  );
}
