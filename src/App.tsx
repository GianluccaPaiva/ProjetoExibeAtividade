import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./hooks/useApp";

// Componentes
import { AdminLayout } from "./layouts/AdminLayout";
import { ProvaPublica } from "./pages/ProvaPublica";
import { BemVindo } from "./pages/BemVindo";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LayoutAutenticacao } from "./layouts/LayoutAutenticacao";

function App() {
  const { session, loading } = useApp();

  // Enquanto valida a sessão, não renderiza nada ou mostra um Spinner
  if (loading) return null; 

  return (
    <Routes>
      {/* ROTA PÚBLICA (ALUNOS) */}
      <Route path="/prova/:id" element={<ProvaPublica />} />

      {/* ROTA DE LOGIN */}
      <Route 
        path="/login" 
        element={!session ? <LayoutAutenticacao /> : <Navigate to="/admin" replace />} 
      />

      {/* ROTA DO ADMINISTRADOR (PROTEGIDA) */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        } 
      />

      {/* REDIRECIONAMENTO INICIAL */}
      <Route 
        path="/" 
        element={session ? <Navigate to="/admin" replace /> : <BemVindo />} 
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;