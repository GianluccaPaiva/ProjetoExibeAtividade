import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function validateAuth() {
      try {
        // getUser() é uma chamada de rede que valida o JWT no servidor.
        // Diferente de getSession(), ele não pode ser burlado com dados falsos no localStorage.
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setAuthorized(false);
        } else {
          setAuthorized(true);
        }
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }

    validateAuth();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
          Validando Credenciais...
        </p>
      </div>
    );
  }

  if (!authorized) {
    // Redireciona para o login e salva a página que ele tentou acessar
    // para voltar pra ela depois do login (opcional)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}