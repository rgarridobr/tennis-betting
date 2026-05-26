import { getAllUsers, countAllUsers, getUserFilterOptions } from '@/lib/admin';
import { PageHero } from '@/components/shared/page-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateUserDialog } from '@/components/admin/create-user-dialog';
import { EditUserDialog } from '@/components/admin/edit-user-dialog';
import { UserStatusToggle } from '@/components/admin/user-status-toggle';
import { DeleteUserButton } from '@/components/admin/delete-user-button';
import { Users, ShieldCheck, UserCheck, Phone, Home, Icon } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { tennisBall } from '@lucide/lab';
import { UserFilters } from '@/components/admin/user-filters';
import { UserPagination } from '@/components/admin/user-pagination';

interface Props {
  searchParams: Promise<{
    search?: string;
    state?: string;
    city?: string;
    club?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default async function AdminUsersPage({ searchParams }: Props) {
  const myUser = await getSession();
  if (!myUser || !myUser.is_admin) redirect('/login');

  const { search, state, city, club, page } = await searchParams;
  const currentPage = page ? parseInt(page) : 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const [users, totalUsers, filterOptions] = await Promise.all([
    getAllUsers({ search, state, city, club, limit: ITEMS_PER_PAGE, offset }),
    countAllUsers({ search, state, city, club }),
    getUserFilterOptions(),
  ]);

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  return (
    <>
      <PageHero title="Gerenciar Usuários" subtitle="Administre os participantes do grupo"/> 

      <main className="container mx-auto px-4 lg:px-32 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lista de Usuários</h2>
            <p className="text-slate-500 font-medium">Gerencie o acesso e permissões dos participantes</p>
          </div>
          <CreateUserDialog />
        </div>

        <UserFilters filterOptions={filterOptions} />

        {users.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum usuário cadastrado</h2>
              <p className="text-slate-500">Convide participantes para começar o grupo.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-emerald-600" />
                  Todos os Usuários ({totalUsers})
                </h2>
              </div>
              <Card className="border-0 shadow-xl overflow-hidden pt-0 rounded-[2rem] bg-white">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 py-6 sm:px-8 hover:bg-slate-50 transition-all group gap-6 ${!user.is_active ? 'bg-slate-50/50 grayscale-[0.5]' : ''}`}
                      >
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm group-hover:scale-110 transition-transform shrink-0 ${user.is_admin ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg font-black text-slate-900 truncate max-w-[200px] sm:max-w-none">
                                {user.name}
                                {user.nickname && (
                                  <span className="text-slate-400 font-medium text-sm ml-2">({user.nickname})</span>
                                )}
                              </span>
                              {user.is_admin && (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-lg h-5">
                                  Admin
                                </Badge>
                              )}
                              {!user.is_active && (
                                <Badge
                                  variant="secondary"
                                  className="bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-lg h-5"
                                >
                                  Inativo
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-slate-400 truncate">{user.email}</p>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              {user.whatsapp && (
                                <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-emerald-500" /> {user.whatsapp}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              {user.tennis_club && (
                                <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                  <Icon iconNode={tennisBall} className="w-3 h-3 text-emerald-500" />
                                  {user.tennis_club}
                                </p>
                              )}
                            </div>
                            <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-wider">
                              {user.total_predictions} palpites
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 pt-4 sm:pt-0">
                          {user.id !== myUser?.id && (
                            <>
                              <UserStatusToggle userId={user.id} isActive={user.is_active} />
                              <div className="flex items-center gap-1 ml-2">
                                <EditUserDialog user={user as any} />
                                <DeleteUserButton userId={user.id} userName={user.name} />
                              </div>
                            </>
                          )}
                          {user.id === myUser?.id && (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-slate-200"
                            >
                              Você
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <UserPagination currentPage={currentPage} totalPages={totalPages} />
            </section>
          </div>
        )}
      </main>
    </>
  );
}
