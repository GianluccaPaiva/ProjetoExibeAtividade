import { useState, useEffect } from "react";

export function useMostraProva() {
  const [estaProtegido, setEstaProtegido] = useState(false);

  useEffect(() => {
    // 1. Bloqueio de Botão Direito e Atalhos de Inspeção/Cópia
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bloqueia Ctrl+P (Print), Ctrl+S (Save), Ctrl+U (Source), Ctrl+C (Copy)
      if ((e.ctrlKey || e.metaKey) && ['p', 's', 'u', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      
      // Detecção da tecla PrintScreen (funciona em alguns navegadores/sistemas)
      if (e.key === 'PrintScreen' || e.key === 'Snapshot') {
        setEstaProtegido(true);
        navigator.clipboard.writeText(""); 
      }
    };

    // 2. Ativação da Proteção (Perda de foco ou mudança de aba)
    // Usamos uma única função para garantir rapidez
// No seu hook useMostraProva.ts
      const ativarProtecao = () => {
        // Define o estado imediatamente
        setEstaProtegido(true);
        
        // Limpa o clipboard (área de transferência) 
        // Isso tenta apagar a imagem que o Windows acabou de copiar
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("Acesso Protegido - Nexus");
        }
      };

    // 3. Vigilância de Visibilidade e Foco
    const lidarComMudancaVisibilidade = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        ativarProtecao();
      }
    };

    // Eventos Globais
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("visibilitychange", lidarComMudancaVisibilidade);
    window.addEventListener("blur", ativarProtecao);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", lidarComMudancaVisibilidade);
      window.removeEventListener("blur", ativarProtecao);
    };
  }, []);

  return {
    estaProtegido,
    setEstaProtegido
  };
}