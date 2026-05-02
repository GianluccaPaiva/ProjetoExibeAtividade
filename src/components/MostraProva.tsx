// src/components/MostraProva.tsx
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
      {/* Bloqueio de Impressão via CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { display: none !important; }
        }
        .no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}} />

      <Card className="mx-auto w-full max-w-5xl overflow-hidden border-none bg-slate-950 shadow-2xl relative no-select">
        
        {/* CORTINA DE PRIVACIDADE */}
        {estaProtegido && (
          <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-900/98 backdrop-blur-2xl transition-all">
            <ShieldAlert className="h-16 w-16 text-red-500 animate-pulse" />
            <h2 className="mt-4 text-xl font-black text-white uppercase italic tracking-tighter">Acesso Suspenso</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center px-6 mt-2 max-w-xs">
              Captura de tela, gravação ou troca de aba detectada.
            </p>
            <button 
              onClick={() => setTimeout(() => setEstaProtegido(false), 400)}
              className="mt-8 px-10 py-3 bg-blue-600 text-white text-xs font-black rounded-full hover:bg-blue-500 transition-all active:scale-95 uppercase shadow-lg shadow-blue-500/20"
            >
              Confirmar e Retomar
            </button>
          </div>
        )}

        <CardHeader className="bg-[#001F3F] text-white p-4 border-b border-white/10 relative z-30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-lg font-black tracking-tight uppercase">
                <FileText className="text-blue-400" size={18} />
                Avaliação Nexus
              </CardTitle>
              <CardDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Turma: <span className="text-blue-300">{turma}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <ShieldCheck size={12} className="text-green-400" />
              <span className="text-[9px] font-black text-green-400 uppercase tracking-tighter italic">Protegido</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-slate-900 relative min-h-[75vh]">
          {/* MARCA D'ÁGUA DINÂMICA (Z-20: Fica acima do PDF) */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.07] flex flex-wrap gap-16 overflow-hidden p-10 select-none items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="text-white text-4xl -rotate-45 font-black uppercase tracking-tighter whitespace-nowrap">
                {turma} - NEXUS
              </span>
            ))}
          </div>

          {/* CAMADA INVISÍVEL DE INTERCEPTAÇÃO (Z-10: Bloqueia cliques no PDF) */}
          <div className="absolute inset-0 z-10 bg-transparent cursor-default" />

          {/* CONTAINER DO PDF (Opacity-0 é processado mais rápido que Blur) */}
          <div className={`relative w-full h-[75vh] overflow-hidden transition-all duration-75 ${estaProtegido ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfUrl}
                defaultScale={SpecialZoomLevel.PageWidth}
                theme="dark"
              />
            </Worker>
          </div>

          <div className="bg-slate-950 p-3 flex items-center justify-center gap-2 border-t border-white/5 sm:hidden text-slate-600 relative z-30">
            <Hand size={14} />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Visualização Restrita</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}