import { useState, useEffect } from "react";

export function useMostraProva() {
  const [estaProtegido, setEstaProtegido] = useState(false);

  useEffect(() => {
    // 1. Bloqueio de Botão Direito e Atalhos
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloqueia Ctrl+P (Print), Ctrl+S (Save), Ctrl+U (Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'u')) {
        e.preventDefault();
      }
      // Tentativa de detectar PrintScreen
      if (e.key === 'PrintScreen') {
        setEstaProtegido(true);
        navigator.clipboard.writeText(""); 
      }
    };

    // 2. Detecção de Mudança de Aba ou Minimização
    const lidarComVisibilidade = () => {
      if (document.visibilityState === 'hidden') {
        setEstaProtegido(true);
      }
    };

    // 3. Detecção de Perda de Foco (Alt+Tab ou ferramentas de captura externas)
    const pausarAcesso = () => setEstaProtegido(true);
    const retomarAcesso = () => setEstaProtegido(false);

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", lidarComVisibilidade);
    window.addEventListener("blur", pausarAcesso);
    window.addEventListener("focus", retomarAcesso);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", lidarComVisibilidade);
      window.removeEventListener("blur", pausarAcesso);
      window.removeEventListener("focus", retomarAcesso);
    };
  }, []);

  return {
    estaProtegido,
    setEstaProtegido
  };
}