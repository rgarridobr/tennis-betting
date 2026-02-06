import { getAllUsers } from '@/lib/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserAdminToggle } from '@/components/admin/user-admin-toggle'

export default async function AdminUsersPage() {
  const users = await getAllUsers()

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Usuários</h1>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Usuários ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum usuário cadastrado
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{user.name}</span>
                      {user.is_admin && (
                        <Badge className="bg-primary text-primary-foreground">Admin</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.total_predictions} palpites
                    </p>
                  </div>
                  <UserAdminToggle userId={user.id} isAdmin={user.is_admin} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
