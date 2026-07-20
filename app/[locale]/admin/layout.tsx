import React from "react"
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()
  if (!user) redirect('/login')
  if (!user.is_admin) redirect('/')

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader user={user} />
      {children}
    </div>
  )
}
