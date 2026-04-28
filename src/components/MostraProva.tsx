import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, AlertCircle, ShieldCheck, Hand, ShieldAlert } from "lucide-react";
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { useMostraProva } from "@/hooks/useMostraProva"; // Importando o hook
import '@react-pdf-viewer/core/lib/styles/index.css';

interface MostraProvaProps {
  turma: string;
  pdfUrl: string;
}

export function MostraProva({ turma, pdfUrl }: MostraProvaProps) {
  // Chamada do Hook Customizado
  const { estaProtegido, setEstaProtegido } = useMostraProva();

  if (!pdfUrl) {
    return (
      <Card className="mx-auto w-full max-w-2xl border-dashed border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center py-10 text-red-600 gap-2">
          <AlertCircle size={40} />
          <p className="font-bold uppercase text-xs tracking-widest">Nenhuma prova encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-5xl overflow-hidden border-none bg-slate-950 shadow-2xl select-none relative">
      
      {/* CORTINA DE PRIVACIDADE */}
      {estaProtegido && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md transition-all">
          <ShieldAlert className="h-16 w-16 text-red-500 animate-pulse" />
          <h2 className="mt-4 text-xl font-black text-white uppercase italic tracking-tighter">Conteúdo Protegido</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center px-6">
            Acesso bloqueado temporariamente por segurança (Captura detectada)
          </p>
          <button 
            onClick={() => setEstaProtegido(false)}
            className="mt-6 px-8 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-full hover:bg-blue-500 transition-all active:scale-95 uppercase"
          >
            Retomar Visualização
          </button>
        </div>
      )}

      <CardHeader className="bg-[#001F3F] text-white p-4 sm:p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-lg font-black tracking-tight uppercase">
              <FileText className="text-blue-400" size={18} />
              Prova Oficial
            </CardTitle>
            <CardDescription className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              Turma: <span className="text-blue-300">{turma}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <ShieldCheck size={12} className="text-green-400" />
            <span className="text-[9px] font-black text-green-400 uppercase tracking-tighter italic">Criptografado</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 bg-slate-900 relative">
        <div className={`relative w-full h-[70vh] sm:h-[80vh] overflow-hidden bg-slate-800 transition-all duration-500 ${estaProtegido ? 'blur-3xl' : 'blur-0'}`}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div className="w-full h-full">
              <Viewer
                fileUrl={pdfUrl}
                defaultScale={SpecialZoomLevel.PageWidth}
                theme="dark"
              />
            </div>
          </Worker>
        </div>

        {/* FOOTER PARA MOBILE */}
        <div className="bg-slate-950 p-3 flex items-center justify-center gap-2 border-t border-white/5 sm:hidden text-slate-600">
          <Hand size={14} />
          <p className="text-[9px] font-bold uppercase tracking-[0.2em]">
            Pince para zoom • Deslize para rolar
          </p>
        </div>
      </CardContent>
    </Card>
  );
}