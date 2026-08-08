'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { ADMIN_NAV } from '@/lib/admin-nav'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { LogoutButton } from '@/components/admin/LogoutButton'

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(href + '/')
}

export function AdminShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider className="admin-shell">
      <Sidebar>
        <SidebarHeader className="border-b">
          <Link href="/admin" className="px-2 py-1.5 text-sm leading-tight">
            <span className="font-bold">茨城県卓球連盟</span>
            <span className="block text-xs text-muted-foreground">管理画面</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/admin'}
                >
                  <Link href="/admin">ダッシュボード</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          {ADMIN_NAV.map((g) => (
            <SidebarGroup key={g.title}>
              <SidebarGroupLabel>{g.title}</SidebarGroupLabel>
              <SidebarMenu>
                {g.items.map((it) => (
                  <SidebarMenuItem key={it.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(pathname, it.href)}
                    >
                      <Link href={it.href}>{it.label}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <div className="ml-1 flex-1">
            <AdminBreadcrumb />
          </div>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {email}
          </span>
          <LogoutButton />
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
