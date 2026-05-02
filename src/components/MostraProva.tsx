import { ShieldAlert, FileText, ShieldCheck, Hand, AlertCircle } from "lucide-react";
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { useMostraProva } from "@/hooks/useMostraProva";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import '@react-pdf-viewer/core/lib/styles/index.css';

interface MostraProvaProps {
  turma: string;
  pdfUrl: string;
}

export function MostraProva({ turma, pdfUrl }: MostraProvaProps) {
  const { estaProtegido, setEstaProtegido } = useMostraProva();

  if (!pdfUrl) {
    return (
      <Card className="mx-auto w-full max-w-2xl border-dashed border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center py-10 text-red-600 gap-2">
          <AlertCircle size={40} />
          <p className="font-bold text-xs uppercase tracking-widest">Nenhuma prova encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print { body { display: none !important; } }
        .no-select { user-select: none; -webkit-user-select: none; }
        /* Remove barras de rolagem indesejadas mas mantém a do PDF */
        .pdf-container::-webkit-scrollbar { display: none; }
      `}} />

      <Card className="mx-auto w-full max-w-5xl border-none bg-slate-950 shadow-2xl relative no-select">
        
        {/* CORTINA DE PRIVACIDADE */}
        {estaProtegido && (
          <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-900/98 backdrop-blur-2xl p-6 text-center">
            <ShieldAlert className="h-16 w-16 text-red-500 animate-pulse" />
            <h2 className="mt-4 text-xl font-black text-white uppercase italic tracking-tighter">Conteúdo Protegido</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 max-w-xs">
              Captura de tela ou saída detectada. A prova foi ocultada.
            </p>
            <button 
              onClick={() => setTimeout(() => setEstaProtegido(false), 300)}
              className="mt-8 px-10 py-3 bg-blue-600 text-white text-xs font-black rounded-full hover:bg-blue-500 transition-all uppercase"
            >
              Retomar Prova
            </button>
          </div>
        )}

        <CardHeader className="bg-[#001F3F] text-white p-4 border-b border-white/10 relative z-30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg font-black uppercase">
                <FileText className="text-blue-400" size={18} />
                Avaliação Nexus
              </CardTitle>
              <CardDescription className="text-slate-400 text-[10px] font-bold uppercase">
                Turma: <span className="text-blue-300">{turma}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <ShieldCheck size={12} className="text-green-400" />
              <span className="text-[9px] font-black text-green-400 uppercase italic">Protegido</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-slate-900 relative">
          {/* MARCA D'ÁGUA - pointer-events-none permite que o scroll passe por ela */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.08] flex flex-wrap gap-12 overflow-hidden p-10 items-center justify-center">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="text-white text-3xl -rotate-45 font-black uppercase whitespace-nowrap">
                {turma} - NEXUS
              </span>
            ))}
          </div>

          {/* CAMADA DE INTERCEPTAÇÃO DE CLIQUE - pointer-events-none LIBERA O SCROLL */}
          {/* O bloqueio do clique direito é feito pelo Hook via JavaScript no nível do documento */}
          <div className="absolute inset-0 z-10 pointer-events-none bg-transparent" />

          {/* CONTAINER DO PDF - O 'hidden' garante o bloqueio imediato do PrintScreen */}
          <div className={`relative w-full h-[75vh] bg-slate-800 transition-all ${estaProtegido ? 'hidden' : 'block'}`}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfUrl}
                defaultScale={SpecialZoomLevel.PageWidth}
                theme="dark"
              />
            </Worker>
          </div>

          <div className="bg-slate-950 p-3 flex items-center justify-center gap-2 border-t border-white/5 text-slate-500">
            <Hand size={14} />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Role para navegar na prova</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}