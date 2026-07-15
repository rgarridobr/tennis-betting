import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllPoolsAdmin } from "@/lib/admin";
import { getTournaments } from "@/lib/data";
import { AdminPoolManager } from "@/components/admin/admin-pool-manager";
import { PageHero } from "@/components/shared/page-hero";
import { getTranslations } from "next-intl/server";

export default async function AdminPoolsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!user.is_admin) redirect("/dashboard");

  const t = await getTranslations("admin");

  const [pools, tournaments] = await Promise.all([
    getAllPoolsAdmin(),
    getTournaments()
  ]);

  return (
    <>
      <PageHero 
        title={t("poolsTitle")} 
        subtitle={t("poolsSubtitle")} 
      />

      <main className="container mx-auto px-4 md:px-32 py-8">
        <AdminPoolManager pools={pools} tournaments={tournaments} />
      </main>
    </>
  );
}
