import { useState, useEffect } from "react";

export function useMostraProva() {
  const [estaProtegido, setEstaProtegido] = useState(false);

  useEffect(() => {
    // Bloqueia clique direito globalmente na página da prova
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const keysBloqueadas = ['p', 's', 'u', 'c', 'i', 'j'];
      if (
        e.key === 'PrintScreen' || 
        e.key === 'Snapshot' || 
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && keysBloqueadas.includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        setEstaProtegido(true);
      }
    };

    const ativarProtecao = () => {
      setEstaProtegido(true);
      try { navigator.clipboard.writeText(""); } catch (err) {}
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (e.relatedTarget === null) ativarProtecao();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", ativarProtecao);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) ativarProtecao();
    });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", ativarProtecao);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return { estaProtegido, setEstaProtegido };
}