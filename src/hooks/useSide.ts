import { supabase } from "@/lib/supabase"
import { FileText, LayoutDashboard, Settings } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
export function useSide(){
    const navigate = useNavigate();
    const navItems = [
        { title: "Dashboard", url: "#", icon: LayoutDashboard },
        { title: "Gabaritos", url: "#", icon: FileText },
    ]

    const settingsItems = [
        { title: "Configurações", url: "#", icon: Settings },
    ]
    const handleLogout = async () => {
        try {
            // 1. Avisa o Supabase para invalidar o token
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            // 2. Limpa manualmente qualquer resquício no localStorage (opcional, mas seguro)
            localStorage.clear();
            // 3. Redireciona para o login
            // Usamos o replace: true para o usuário não conseguir "voltar" com o botão do browser
            navigate("/login", { replace: true });
            
            toast.success("Sessão encerrada com sucesso!");
        } catch (error: any) {
            toast.error("Erro ao sair: " + error.message);
        }
        };

    return {
        navItems,
        settingsItems,
        handleLogout
    }
}