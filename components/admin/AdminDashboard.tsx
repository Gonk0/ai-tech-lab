"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";
import type { AdminApplication } from "./AdminApplicationsPanel";

export type AdminContact = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: "pending" | "reviewed" | "closed";
};

type Tab = "contacts" | "partners";

const PARTNER_STATUS = ["pending", "reviewed", "accepted", "rejected"] as const;
const CONTACT_STATUS = ["pending", "reviewed", "closed"] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sk-SK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminDashboard({
  initialContacts,
  initialApplications,
}: {
  initialContacts: AdminContact[];
  initialApplications: AdminApplication[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("contacts");
  const [contacts, setContacts] = useState(initialContacts);
  const [applications, setApplications] = useState(initialApplications);
  const [selectedContactId, setSelectedContactId] = useState(initialContacts[0]?.id ?? "");
  const [selectedAppId, setSelectedAppId] = useState(initialApplications[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedContact = contacts.find((item) => item.id === selectedContactId) ?? null;
  const selectedApp = applications.find((item) => item.id === selectedAppId) ?? null;

  const updateContactStatus = async (status: AdminContact["status"]) => {
    if (!selectedContact) return;
    setSaving(true);
    setMessage("");

    const response = await fetch(`/api/vercel/partners/contacts/${selectedContact.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setMessage("Nepodarilo sa aktualizovať stav");
      setSaving(false);
      return;
    }

    setContacts((current) =>
      current.map((item) => (item.id === selectedContact.id ? { ...item, status } : item)),
    );
    setMessage("Stav aktualizovaný");
    setSaving(false);
    router.refresh();
  };

  const updateAppStatus = async (status: AdminApplication["status"]) => {
    if (!selectedApp) return;
    setSaving(true);
    setMessage("");

    const response = await fetch(`/api/vercel/partners/applications/${selectedApp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setMessage("Nepodarilo sa aktualizovať stav");
      setSaving(false);
      return;
    }

    setApplications((current) =>
      current.map((item) => (item.id === selectedApp.id ? { ...item, status } : item)),
    );
    setMessage("Stav aktualizovaný");
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
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/24">Interný prehľad</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-white">Admin panel</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="self-start border border-white/[0.1] px-4 py-2 text-sm text-white/45 transition-colors hover:border-white/22 hover:text-white/75"
        >
          Odhlásiť sa
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("contacts")}
          className={`border px-4 py-2 text-sm transition-colors ${
            tab === "contacts"
              ? "border-white/28 bg-white/[0.08] text-white"
              : "border-white/[0.08] text-white/40 hover:text-white/70"
          }`}
        >
          Kontakt ({contacts.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("partners")}
          className={`border px-4 py-2 text-sm transition-colors ${
            tab === "partners"
              ? "border-white/28 bg-white/[0.08] text-white"
              : "border-white/[0.08] text-white/40 hover:text-white/70"
          }`}
        >
          Neziskovky ({applications.length})
        </button>
      </div>

      {message ? <p className="text-sm text-emerald-300/80">{message}</p> : null}

      {tab === "contacts" ? (
        contacts.length === 0 ? (
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-8 text-sm text-white/40">
            Zatiaľ žiadne kontaktné správy.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              {contacts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedContactId(item.id)}
                  className={`w-full border px-4 py-4 text-left transition-colors ${
                    selectedContactId === item.id
                      ? "border-white/24 bg-white/[0.06]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/16"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-white">{item.name}</span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/32">{formatDate(item.createdAt)}</p>
                </button>
              ))}
            </div>

            {selectedContact ? (
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
                <div className="mb-6 flex flex-wrap gap-3">
                  {CONTACT_STATUS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={saving}
                      onClick={() => updateContactStatus(status)}
                      className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] ${
                        selectedContact.status === status
                          ? "border-white/28 bg-white/[0.08] text-white"
                          : "border-white/[0.08] text-white/35"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <dl className="space-y-5 text-sm">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Meno</dt>
                    <dd className="mt-1 text-white">{selectedContact.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Email</dt>
                    <dd className="mt-1 break-all text-white/75">{selectedContact.email}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Telefón</dt>
                    <dd className="mt-1 text-white/75">{selectedContact.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.16em] text-white/28">Správa</dt>
                    <dd className="mt-1 leading-7 text-white/65">{selectedContact.message}</dd>
                  </div>
                </dl>
              </div>
            ) : null}
          </div>
        )
      ) : applications.length === 0 ? (
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-8 text-sm text-white/40">
          Zatiaľ žiadne žiadosti od neziskoviek.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {applications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedAppId(item.id)}
                className={`w-full border px-4 py-4 text-left transition-colors ${
                  selectedAppId === item.id
                    ? "border-white/24 bg-white/[0.06]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/16"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{item.organizationName}</span>
                  <span className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/32">{formatDate(item.createdAt)}</p>
              </button>
            ))}
          </div>

          {selectedApp ? (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
              <div className="mb-6 flex flex-wrap gap-3">
                {PARTNER_STATUS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={saving}
                    onClick={() => updateAppStatus(status)}
                    className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] ${
                      selectedApp.status === status
                        ? "border-white/28 bg-white/[0.08] text-white"
                        : "border-white/[0.08] text-white/35"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-[10px] uppercase text-white/28">Organizácia</dt>
                  <dd className="mt-1 text-white">{selectedApp.organizationName}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-white/28">Kontakt</dt>
                  <dd className="mt-1 text-white/75">{selectedApp.contactName}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-white/28">Email</dt>
                  <dd className="mt-1 break-all text-white/75">{selectedApp.email}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-white/28">Instagram</dt>
                  <dd className="mt-1">
                    <a
                      href={selectedApp.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/75 underline"
                    >
                      {selectedApp.instagram}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-white/28">Misia</dt>
                  <dd className="mt-1 leading-7 text-white/65">{selectedApp.missionDescription}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
