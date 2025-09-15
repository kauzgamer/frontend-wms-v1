import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/use-sidebar"
import { Link, useLocation } from "react-router-dom"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()

  const abbr: Record<string, string> = {
    "Estoque": "Estoq",
    "Recebimento": "Receb",
    "Expedição": "Exped",
    "Inventário": "Invent",
    "Picking": "Picking",
    "Kit": "Kit",
    "Docs": "Docs",
    "Documentos": "Docs",
    "Integração": "Integra",
    "Atividades": "Ativid",
    "Manufatura": "Manufa",
    "Gestão interna": "Gestão",
    "Configurador": "Config",
    "Etiqueta": "Etiqueta",
    "Início": "Início",
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = !!item.items?.length
          const active = item.isActive ?? (item.url ? location.pathname === item.url : false)

          if (!hasChildren) {
            return (
              <SidebarMenuItem
                key={item.title}
                className={`${active ? "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-sidebar-primary" : ""} -mx-2 border-b border-sidebar-border/60 border-x-transparent`}
              >
                <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span className={collapsed ? "text-[10px] leading-4 max-w-[3.25rem] text-center block" : undefined}>
                      {collapsed ? (abbr[item.title] ?? item.title.slice(0, 6)) : item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible key={item.title} asChild defaultOpen={active} className="group/collapsible">
              <SidebarMenuItem
                className={`${active ? "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-sidebar-primary" : ""} -mx-2 border-b border-sidebar-border/60 border-x-transparent`}
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={active} tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span className={collapsed ? "text-[10px] leading-4 max-w-[3.25rem] text-center block" : undefined}>
                      {collapsed ? (abbr[item.title] ?? item.title.slice(0, 6)) : item.title}
                    </span>
                    {(item.title === "Atividades" || item.title === "Manufatura") && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 keep-size group-data-[collapsible=icon]:hidden" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
