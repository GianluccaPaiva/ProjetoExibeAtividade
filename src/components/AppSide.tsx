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
import { Button } from "@base-ui/react"

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
      <Button  className="w-full flex items-center border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-cyan-300" onClick={handleLogout}>
        <LogOut className="mr-2" />
        Sair
      </Button>
    </Sidebar>
  )
}