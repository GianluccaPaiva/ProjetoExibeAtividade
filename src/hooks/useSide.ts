import { supabase } from "@/lib/supabase"
import { FileText, LayoutDashboard, Settings } from "lucide-react"
export function useSide(){
    const navItems = [
        { title: "Dashboard", url: "#", icon: LayoutDashboard },
        { title: "Gabaritos", url: "#", icon: FileText },
    ]

    const settingsItems = [
        { title: "Configurações", url: "#", icon: Settings },
    ]
    const handleLogout = async () => {
        await supabase.auth.signOut()
      }

    return {
        navItems,
        settingsItems,
        handleLogout
    }
}