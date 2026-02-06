import { getAllUsers } from '@/lib/admin'
import { PageHero } from '@/components/shared/page-hero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAdminToggle } from '@/components/admin/user-admin-toggle'
import { Users, ShieldCheck, UserCheck } from 'lucide-react'

export default async function AdminUsersPage() {
  const users = await getAllUsers()

  const adminCount = users.filter(u => u.is_admin).length
  const regularCount = users.filter(u => !u.is_admin).length

  return (
    <>
      <PageHero
        title="Gerenciar Usuarios"
        subtitle="Administre os participantes do bolao"
      >
        <div className="flex items-center gap-3">
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Total</p>
                <p className="text-xl font-bold text-white">{users.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Admins</p>
                <p className="text-xl font-bold text-white">{adminCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageHero>

      <main className="container mx-auto px-4 py-8">
        {users.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Nenhum usuario cadastrado</h2>
              <p className="text-slate-500">Convide participantes para comecar o bolao.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Admins */}
            {adminCount > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Administradores
                </h2>
                <Card className="border-0 shadow-md overflow-hidden pt-0">
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {users.filter(u => u.is_admin).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-6 py-4 bg-emerald-50/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-base font-bold text-emerald-700">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900">{user.name}</span>
                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">Admin</Badge>
                              </div>
                              <p className="text-sm text-slate-500">{user.email}</p>
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

            {/* Regular Users */}
            {regularCount > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Participantes ({regularCount})
                </h2>
                <Card className="border-0 shadow-md overflow-hidden pt-0">
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {users.filter(u => !u.is_admin).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-base font-bold text-slate-600">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium text-slate-900">{user.name}</span>
                              <p className="text-sm text-slate-500">{user.email}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{user.total_predictions} palpites</p>
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
