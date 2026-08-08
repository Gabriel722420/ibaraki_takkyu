'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Trophy,
  Megaphone,
  Files,
  FolderTree,
  Layers,
  Users,
  Building2,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from 'lucide-react'
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
import { TooltipProvider } from '@/components/ui/tooltip'
import { ADMIN_NAV } from '@/lib/admin-nav'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { LogoutButton } from '@/components/admin/LogoutButton'

// href ごとのアイコン（wp-admin 風のメニューアイコン）
const ICONS: Record<string, LucideIcon> = {
  '/admin/games': Trophy,
  '/admin/news': Megaphone,
  '/admin/resources': Files,
  '/admin/categories': FolderTree,
  '/admin/divisions': Layers,
  '/admin/officers': Users,
  '/admin/about': Building2,
  '/admin/policy': ShieldCheck,
  '/admin/account': Settings,
}

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
    <TooltipProvider delayDuration={0}>
    <SidebarProvider className="admin-shell">
      <Sidebar>
        <SidebarHeader className="border-sidebar-border border-b">
          <Link
            href="/admin"
            className="flex flex-col px-2 py-1.5 leading-tight"
          >
            <span className="text-sm font-bold">茨城県卓球連盟</span>
            <span className="text-xs opacity-70">管理画面</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/admin' || undefined}
                >
                  <Link href="/admin">
                    <LayoutDashboard />
                    ダッシュボード
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          {ADMIN_NAV.map((g) => (
            <SidebarGroup key={g.title}>
              <SidebarGroupLabel>{g.title}</SidebarGroupLabel>
              <SidebarMenu>
                {g.items.map((it) => {
                  const Icon = ICONS[it.href]
                  return (
                    <SidebarMenuItem key={it.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(pathname, it.href) || undefined}
                        tooltip={it.label}
                      >
                        <Link href={it.href}>
                          {Icon && <Icon />}
                          {it.label}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        {/* wp-admin のアドミンバー風・細い濃色帯 */}
        <header className="sticky top-0 z-10 flex h-10 items-center gap-2 bg-[#1d2327] px-3 text-[#f0f0f1]">
          <SidebarTrigger className="text-[#f0f0f1] hover:bg-white/10 hover:text-white" />
          <Link href="/" className="text-sm hover:text-white" target="_blank">
            茨城県卓球連盟
          </Link>
          <div className="flex-1" />
          <span className="hidden text-xs opacity-80 sm:inline">{email}</span>
          <LogoutButton className="h-7 border-white/30 bg-transparent px-2 text-xs text-white hover:bg-white/10 hover:text-white" />
        </header>

        {/* メイン領域：WP風の薄グレー背景 */}
        <div className="min-h-[calc(100svh-2.5rem)] bg-[#f0f0f1] p-4 md:p-6">
          <div className="mb-3">
            <AdminBreadcrumb />
          </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  )
}
