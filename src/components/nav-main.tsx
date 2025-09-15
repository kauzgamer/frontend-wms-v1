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
import { useSidebar } from "@/components/ui/sidebar"

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
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem
              className={
                // linha divisória e indicador ativo (borda reta) encostadas na lateral
                `${item.isActive ? "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-sidebar-primary" : ""} -mx-2 border-b border-sidebar-border/60 border-x-transparent`
              }
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={item.isActive} tooltip={item.title}>
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
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
