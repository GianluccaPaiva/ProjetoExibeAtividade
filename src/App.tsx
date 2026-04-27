import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Importe os seus componentes aqui
import { AdminLayout } from "./layouts/AdminLayout";
import { ProvaPublica } from "./pages/ProvaPublica";
import { Login } from "./components/Login"; // O componente que você acabou de mandar
import { BemVindo } from "./pages/BemVindo";

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Checa se o admin já está logado
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Fica vigiando: se o handleSubmit do seu componente funcionar, 
    // essa função aqui detecta e libera o acesso na hora.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <Routes>
      {/* ROTA PÚBLICA (ALUNOS) */}
      <Route path="/prova/:id" element={<ProvaPublica />} />

      {/* ROTA DE LOGIN (O SEU COMPONENTE) */}
      <Route 
        path="/login" 
        element={!session ? <Login /> : <Navigate to="/admin" replace />} 
      />

      {/* ROTA DO ADMINISTRADOR (PROTEGIDA) */}
      <Route 
        path="/admin/*" 
        element={session ? <AdminLayout /> : <Navigate to="/login" replace />} 
      />

      {/* REDIRECIONAMENTO INICIAL */}
      <Route 
        path="/" 
        element={session ? <Navigate to="/admin" replace /> : <BemVindo />} 
      />

      {/* QUALQUER OUTRA MERDA VOLTA PRO INÍCIO */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;