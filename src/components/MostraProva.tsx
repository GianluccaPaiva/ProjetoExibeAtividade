import { useState } from "react";
import { ShieldAlert, FileText, ShieldCheck, Hand, AlertCircle, Printer, Loader2 } from "lucide-react";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { useMostraProva } from "@/hooks/useMostraProva";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "@react-pdf-viewer/core/lib/styles/index.css";

interface MostraProvaProps {
  turma: string;
  pdfUrl: string;
}

export function MostraProva({ turma, pdfUrl }: MostraProvaProps) {
  const { estaProtegido, setEstaProtegido } = useMostraProva();
  const [imprimindo, setImprimindo] = useState(false);

  const handleImprimir = async () => {
    if (!pdfUrl || imprimindo) return;

    try {
      setImprimindo(true);

      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Falha ao baixar o PDF para impressão");

      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(pdfBlob);

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = blobUrl;

      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.focus();
            iframe.contentWindow?.print();
          } catch (err) {
            console.error("Erro ao disparar impressão do iframe:", err);
            window.open(blobUrl, "_blank");
          } finally {
            setImprimindo(false);
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
              URL.revokeObjectURL(blobUrl);
            }, 60000);
          }
        }, 400);
      };
    } catch (err) {
      console.error("Erro ao imprimir PDF:", err);
      setImprimindo(false);
      const printWindow = window.open(pdfUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
      }
    }
  };

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
        .no-select { user-select: none; -webkit-user-select: none; }
        /* Remove barras de rolagem indesejadas mas mantém a do PDF */
        .pdf-container::-webkit-scrollbar { display: none; }
        @media print {
          body { background: white !important; }
        }
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
              className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-900/40 border border-blue-400/20 uppercase tracking-wider transition-all cursor-pointer"
            >
              Retomar Prova
            </button>
          </div>
        )}

        <CardHeader className="bg-[#001F3F] text-white p-4 sm:p-5 border-b border-white/10 relative z-30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-black uppercase tracking-tight">
                <FileText className="text-blue-400" size={20} />
                Avaliação Nexus
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Turma: <span className="text-blue-300 font-black">{turma}</span>
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleImprimir}
                disabled={imprimindo}
                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-900/30 border border-blue-400/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                {imprimindo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Carregando...</span>
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4 text-blue-100" />
                    <span>Imprimir Prova</span>
                  </>
                )}
              </Button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider italic">Protegido</span>
              </div>
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

          <div className="pdf-container absolute inset-0 z-0 overflow-hidden" />
          
          {/* CAMADA DE INTERCEPTAÇÃO DE CLIQUE - pointer-events-none LIBERA O SCROLL */}
          {/* O bloqueio do clique direito é feito pelo Hook via JavaScript no nível do documento */}
          <div className="absolute inset-0 z-10 pointer-events-none bg-transparent" />

          {/* CONTAINER DO PDF - O 'hidden' garante o bloqueio imediato do PrintScreen */}
          <div className={`relative w-full h-[75vh] bg-slate-800 transition-all ${estaProtegido ? "hidden" : "block"}`}>
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