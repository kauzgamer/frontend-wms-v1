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
    { title: "Estoque", url: "#", icon: Boxes, isActive: true },
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
        <div className="flex items-center gap-2 px-2 py-1">
          <Settings2 className="size-5" />
          <span className="text-sm font-semibold">TOTVS LOGÍSTICA</span>
        </div>
        <div className="px-2 pt-1">
          <SidebarInput placeholder="Pesquisar" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
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
