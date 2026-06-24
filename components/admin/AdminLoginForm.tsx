"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_BASE_PATH, ADMIN_EMAIL } from "@/lib/admin/constants";

const fieldClass =
  "w-full border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/22 focus:border-white/24";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
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

      if (data.setupRequired) {
        router.replace(`${ADMIN_BASE_PATH}/setup`);
        return;
      }

      if (data.authenticated) {
        router.replace(searchParams.get("next") ?? ADMIN_BASE_PATH);
        return;
      }

      setLoading(false);
    }

    void checkStatus();
  }, [router, searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/vercel/partners/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Login failed");
      setSubmitting(false);
      return;
    }

    router.replace(searchParams.get("next") ?? ADMIN_BASE_PATH);
    router.refresh();
  };

  if (loading) {
    return <p className="text-sm text-white/40">Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-5">
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/34">Admin email</p>
        <p className="border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-white/65">
          {ADMIN_EMAIL}
        </p>
      </div>

      <div>
        <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-white/34" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={fieldClass}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
      </div>

      {error ? <p className="text-sm text-rose-300/90">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-60"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
