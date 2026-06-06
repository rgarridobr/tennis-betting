import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTennisClubs } from '@/lib/data';
import { PageHero } from '@/components/shared/page-hero';
import { TennisClubManager } from '@/components/admin/tennis-club-manager';

export default async function AdminClubsPage() {
  const user = await getSession();
  if (!user || !user.is_admin) redirect('/login');

  const clubs = await getTennisClubs();

  return (
    <>
      <PageHero
        title="Clubes Oficiais"
        subtitle="Cadastre, edite e exclua os clubes oficiais do sistema"
      />

      <main className="container mx-auto px-4 lg:px-32 py-8">
        <TennisClubManager clubs={clubs} />
      </main>
    </>
  );
}
