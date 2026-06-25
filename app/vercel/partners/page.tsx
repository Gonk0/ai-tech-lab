import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { adminSetupRequired, getSession } from "@/lib/admin/auth";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";
import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/db/ensure-schema";
import { contactRequests, partnerApplications } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function VercelPartnersPage() {
  if (await adminSetupRequired()) {
    redirect(`${ADMIN_BASE_PATH}/setup`);
  }

  const session = await getSession();
  if (!session) {
    redirect(`${ADMIN_BASE_PATH}/login`);
  }

  await ensureSchema();

  const [contacts, applications] = await Promise.all([
    getDb().select().from(contactRequests).orderBy(desc(contactRequests.createdAt)),
    getDb().select().from(partnerApplications).orderBy(desc(partnerApplications.createdAt)),
  ]);

  return (
    <main className="px-6 py-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <AdminDashboard
          initialContacts={contacts}
          initialApplications={applications.map((application) => ({
            ...application,
            proofLinks: JSON.parse(application.proofLinks) as string[],
          }))}
        />
      </div>
    </main>
  );
}
