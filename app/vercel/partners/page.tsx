import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AdminApplicationsPanel } from "@/components/admin/AdminApplicationsPanel";
import { adminSetupRequired, getSession } from "@/lib/admin/auth";
import { ADMIN_BASE_PATH } from "@/lib/admin/constants";
import { db } from "@/lib/db";
import { partnerApplications } from "@/lib/db/schema";

export default async function VercelPartnersPage() {
  if (await adminSetupRequired()) {
    redirect(`${ADMIN_BASE_PATH}/setup`);
  }

  const session = await getSession();

  if (!session) {
    redirect(`${ADMIN_BASE_PATH}/login`);
  }

  const applications = await db
    .select()
    .from(partnerApplications)
    .orderBy(desc(partnerApplications.createdAt));

  return (
    <main className="px-6 py-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <AdminApplicationsPanel
          initialApplications={applications.map((application) => ({
            ...application,
            proofLinks: JSON.parse(application.proofLinks) as string[],
          }))}
        />
      </div>
    </main>
  );
}
