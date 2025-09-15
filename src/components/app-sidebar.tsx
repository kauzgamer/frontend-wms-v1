"use client"

import * as React from "react"
import {
  Boxes,
  PackagePlus,
  Truck,
  ClipboardList,
  Hand,
  Layers3,
  FileText,
  Cable,
  Activity,
  Factory,
  Settings2,
  ArrowRightFromLine,
  ArrowLeftToLine,
  Home,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
// import { NavUser } from "@/components/nav-user"
// import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    { name: "WMS", logo: Settings2, plan: "Prod" },
  ],
  navMain: [
    { title: "Início", url: "#", icon: Home, isActive: true },
    { title: "Configurações", url: "#", icon: Settings2 },
    { title: "Estoque", url: "#", icon: Boxes },
    { title: "Recebimento", url: "#", icon: PackagePlus },
    { title: "Expedição", url: "#", icon: Truck },
    { title: "Inventário", url: "#", icon: ClipboardList },
    { title: "Picking", url: "#", icon: Hand },
    { title: "Kit", url: "#", icon: Layers3 },
    { title: "Docs", url: "#", icon: FileText },
    { title: "Integração", url: "#", icon: Cable },
    { title: "Atividades", url: "#", icon: Activity },
    { title: "Manufatura", url: "#", icon: Factory },
  ],
  projects: [
    
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar()
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1 w-full group-data-[collapsible=icon]:justify-center">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="v-align-middle text-sidebar-foreground/90 size-8 group-data-[collapsible=icon]:size-9"
          >
            <path
              fill="currentColor"
              d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z"
            />
          </svg>
          <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">TOTVS LOGÍSTICA</span>
        </div>
        <div className="px-2 pt-1 group-data-[collapsible=icon]:hidden">
          <SidebarInput placeholder="Pesquisar" className="group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            {state === "collapsed" ? "Expandir" : "Encolher"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={state === "collapsed" ? "Expandir sidebar" : "Encolher sidebar"}
            onClick={toggleSidebar}
            className="size-8"
          >
            {state === "collapsed" ? (
              <ArrowRightFromLine className="size-4" />
            ) : (
              <ArrowLeftToLine className="size-4" />
            )}
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
