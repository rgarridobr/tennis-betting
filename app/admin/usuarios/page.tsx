import { getAllUsers } from '@/lib/admin'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAdminToggle } from '@/components/admin/user-admin-toggle'
import { CreateUserDialog } from '@/components/admin/create-user-dialog'
import { Users, ShieldCheck, UserCheck, Phone } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage() {
  const users = await getAllUsers();
  const myUser = await getSession();
  if (!myUser || !myUser.is_admin) redirect('/login');

  const adminCount = users.filter(u => u.is_admin).length
  const regularCount = users.filter(u => !u.is_admin).length

  return (
    <>
      <PageHero
        title="Gerenciar Usuários"
        subtitle="Administre os participantes do bolão"
      >
        <div className="flex flex-wrap items-center gap-4 md:grid md:grid-cols-2 lg:flex">
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Total</p>
                <p className="text-2xl font-black text-white">{users.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-none backdrop-blur-md rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider">Admins</p>
                <p className="text-2xl font-black text-white">{adminCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 md:px-32 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lista de Usuários</h2>
            <p className="text-slate-500 font-medium">Gerencie o acesso e permissões dos participantes</p>
          </div>
          <CreateUserDialog />
        </div>

        {users.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum usuario cadastrado</h2>
              <p className="text-slate-500">Convide participantes para começar o bolao.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Admins */}
            {adminCount > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    Administradores
                  </h2>
                </div>
                <Card className="border-0 shadow-xl overflow-hidden pt-0 rounded-[2rem] bg-white">
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {users.filter(u => u.is_admin).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-8 py-6 bg-emerald-50/30"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl font-black text-emerald-700 shadow-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-slate-900">{user.name}</span>
                               </div>
                              <p className="text-sm font-semibold text-slate-400">{user.email}</p>
                              {user.whatsapp && (
                                <p className="text-xs font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {user.whatsapp}
                                </p>
                              )}
                            </div>
                          </div>
                          {user.id !== myUser?.id && (
                          <UserAdminToggle userId={user.id} isAdmin={user.is_admin} />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Regular Users */}
            {regularCount > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-8 bg-blue-500 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                    Participantes ({regularCount})
                  </h2>
                </div>
                <Card className="border-0 shadow-xl overflow-hidden pt-0 rounded-[2rem] bg-white">
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {users.filter(u => !u.is_admin).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-8 py-6 hover:bg-slate-50 transition-all group"
                        >
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-black text-slate-600 shadow-sm group-hover:scale-110 transition-transform">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-lg font-black text-slate-900">{user.name}</span>
                              <p className="text-sm font-semibold text-slate-400">{user.email}</p>
                              {user.whatsapp && (
                                <p className="text-xs font-bold text-slate-500 mt-0.5 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-emerald-500" /> {user.whatsapp}
                                </p>
                              )}
                              <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-wider">{user.total_predictions} palpites</p>
                            </div>
                          </div>
                          <UserAdminToggle userId={user.id} isAdmin={user.is_admin} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        )}
      </main>
    </>
  )
}
