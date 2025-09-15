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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
