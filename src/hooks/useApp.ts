import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useApp() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Checa a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuta mudanças (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Garante que o loading pare se houver uma mudança rápida
      setLoading(false); 
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
}