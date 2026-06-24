"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";

export type AdminApplication = {
  id: string;
  createdAt: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string | null;
  instagram: string;
  websiteMode: "has_site" | "no_site";
  websiteUrl: string | null;
  operatingSince: string;
  missionDescription: string;
  proofLinks: string[];
  additionalNotes: string | null;
  status: "pending" | "reviewed" | "accepted" | "rejected";
};

const STATUS_OPTIONS = ["pending", "reviewed", "accepted", "rejected"] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminApplicationsPanel({
  initialApplications,
}: {
  initialApplications: AdminApplication[];
}) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [selectedId, setSelectedId] = useState(initialApplications[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selected = applications.find((application) => application.id === selectedId) ?? null;

  const updateStatus = async (status: AdminApplication["status"]) => {
    if (!selected) return;

    setSaving(true);
    setMessage("");

    const response = await fetch(`/api/vercel/partners/applications/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setMessage("Could not update status");
      setSaving(false);
      return;
    }

    setApplications((current) =>
      current.map((application) =>
        application.id === selected.id ? { ...application, status } : application,
      ),
    );
    setMessage("Status updated");
    setSaving(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await fetch("/api/vercel/partners/auth/logout", { method: "POST" });
    router.replace(`${ADMIN_BASE_PATH}/login`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/24">Internal review</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-white">
            Partner applications
          </h1>
          <p className="mt-2 text-sm text-white/38">{applications.length} total submissions</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="self-start border border-white/[0.1] px-4 py-2 text-sm text-white/45 transition-colors hover:border-white/22 hover:text-white/75"
        >
          Sign out
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-8 text-sm text-white/40">
          No applications yet.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {applications.map((application) => (
              <button
                key={application.id}
                type="button"
                onClick={() => setSelectedId(application.id)}
                className={`w-full border px-4 py-4 text-left transition-colors ${
                  selectedId === application.id
                    ? "border-white/24 bg-white/[0.06]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/16"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{application.organizationName}</span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                    {application.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/32">{formatDate(application.createdAt)}</p>
              </button>
            ))}
          </div>

          {selected ? (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={saving}
                    onClick={() => updateStatus(status)}
                    className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors ${
                      selected.status === status
                        ? "border-white/28 bg-white/[0.08] text-white"
                        : "border-white/[0.08] text-white/35 hover:border-white/18 hover:text-white/65"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {message ? <p className="mb-4 text-sm text-emerald-300/80">{message}</p> : null}

              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Organization</dt>
                  <dd className="mt-1 text-white">{selected.organizationName}</dd>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Contact</dt>
                    <dd className="mt-1 text-white/75">{selected.contactName}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Active since</dt>
                    <dd className="mt-1 text-white/75">{selected.operatingSince}</dd>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Email</dt>
                    <dd className="mt-1 break-all text-white/75">{selected.email}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Phone</dt>
                    <dd className="mt-1 text-white/75">{selected.phone || "—"}</dd>
                  </div>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Instagram</dt>
                  <dd className="mt-1">
                    <a
                      href={selected.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-white/75 underline decoration-white/20 hover:text-white"
                    >
                      {selected.instagram}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Website</dt>
                  <dd className="mt-1 text-white/75">
                    {selected.websiteMode === "has_site" && selected.websiteUrl ? (
                      <a
                        href={selected.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all underline decoration-white/20 hover:text-white"
                      >
                        {selected.websiteUrl}
                      </a>
                    ) : (
                      "No website — wants one built from scratch"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Mission</dt>
                  <dd className="mt-1 leading-7 text-white/65">{selected.missionDescription}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Proof links</dt>
                  <dd className="mt-2 space-y-2">
                    {selected.proofLinks.map((link) => (
                      <a
                        key={link}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block break-all text-white/65 underline decoration-white/20 hover:text-white"
                      >
                        {link}
                      </a>
                    ))}
                  </dd>
                </div>
                {selected.additionalNotes ? (
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Notes</dt>
                    <dd className="mt-1 leading-7 text-white/65">{selected.additionalNotes}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
