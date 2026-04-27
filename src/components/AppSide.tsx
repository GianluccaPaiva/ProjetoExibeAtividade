import { 

  User, 
  ChevronUp,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GestaoProvasDialog } from "./GestaoProvasDialog" // O componente de Dialog que criamos
import { useSide } from "@/hooks/useSide"

type AppSidebarProps = {
  onTurmaCriada: () => void; // Função para atualizar a lista de turmas no AdminLayout
}
export function AppSidebar( { onTurmaCriada }: AppSidebarProps ) {
   const{ navItems, settingsItems, handleLogout } = useSide()

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* Cabeçalho Melhorado com função de Toggle */}

      <SidebarContent>
        {/* Grupo de Ações: Novo botão solicitado */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.12em]">
            Ações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                 <GestaoProvasDialog onTurmaCriada={onTurmaCriada}/>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </SidebarContent>

      {/* Footer com Dropdown de Perfil */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div 
                  role="button"
                  tabIndex={0}
                  className="h-12 w-full flex items-center gap-2 px-3 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/50 cursor-pointer hover:bg-sidebar-accent transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 outline-none"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <User size={14} className="text-slate-500" />
                    </div>
                    <span className="truncate font-medium text-sm text-sidebar-foreground">Aplicador</span>
                  </div>
                  
                  <ChevronUp className="ml-auto opacity-50 shrink-0 group-data-[collapsible=icon]:hidden" size={14} />
                  
                  <div className="hidden group-data-[collapsible=icon]:flex h-7 w-7 rounded-full bg-slate-200 items-center justify-center">
                    <User size={14} className="text-slate-500" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width] mb-2">
                {/* Substituímos o DropdownMenuLabel problemático por uma div estilizada */}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Minha Conta
                </div>
                
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer">
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-red-500 cursor-pointer focus:bg-red-50 focus:text-red-500 font-bold"
              >
                <LogOut onClick={handleLogout} className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}