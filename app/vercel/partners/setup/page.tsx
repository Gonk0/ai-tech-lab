import { AdminSetupForm } from "@/components/admin/AdminSetupForm";

export default function VercelPartnersSetupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-28">
      <div className="w-full max-w-lg">
        <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-white/24">Vercel / Partners</p>
        <h1 className="mb-8 text-3xl font-bold tracking-[-0.03em] text-white">Create admin password</h1>
        <AdminSetupForm />
      </div>
    </main>
  );
}
