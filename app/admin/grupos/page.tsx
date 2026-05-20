import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllPoolsAdmin } from "@/lib/admin";
import { getTournaments } from "@/lib/data";
import { AdminPoolManager } from "@/components/admin/admin-pool-manager";
import { PageHero } from "@/components/shared/page-hero";

export default async function AdminPoolsPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!user.is_admin) redirect("/dashboard");

  const [pools, tournaments] = await Promise.all([
    getAllPoolsAdmin(),
    getTournaments()
  ]);

  return (
    <>
      <PageHero 
        title="Gerenciar Grupos" 
        subtitle="Acompanhe, crie e edite os grupos da plataforma e seus participantes" 
      />

      <main className="container mx-auto px-4 md:px-32 py-8">
        <AdminPoolManager pools={pools} tournaments={tournaments} />
      </main>
    </>
  );
}
