import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveTournament } from "@/lib/data";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PageHero } from "@/components/shared/page-hero";
import { CreatePoolForm } from "@/components/pools/create-pool-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NewPoolPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const activeTournament = await getActiveTournament();

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={user} activeTournamentId={activeTournament?.id} />

      <PageHero
        title="Criar Bolão"
        subtitle="Personalize seu grupo e convide amigos para competir."
      />

      <main className="container mx-auto px-4 md:px-32 py-8 md:py-12">
        <div className="mb-6">
          <Link 
            href="/boloes" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar para Bolões
          </Link>
        </div>

        <CreatePoolForm isAdmin={user.is_admin} />
      </main>
    </div>
  );
}
