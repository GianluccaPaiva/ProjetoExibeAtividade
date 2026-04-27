import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FileText, ExternalLink, AlertCircle } from "lucide-react"

interface MostraProvaProps {
  turma: string;
  pdfUrl: string;
}

export function MostraGabarito({ turma, pdfUrl }: MostraProvaProps) {
  if (!pdfUrl) {
    return (
      <Card className="mx-auto w-full max-w-2xl border-dashed border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center py-10 text-red-600 gap-2">
          <AlertCircle size={40} />
          <p className="font-bold">Nenhuma prova encontrada para esta turma.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-6xl overflow-hidden border-none bg-[#001F3F] shadow-xl">
      <CardHeader className="text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="text-blue-400" />
              CADERNO DE QUESTÕES
            </CardTitle>
            <CardDescription className="text-slate-300 font-medium">
              Turma: <span className="text-white uppercase font-bold">{turma}</span>
            </CardDescription>
          </div>
          
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs transition-colors hover:bg-white/20 sm:w-auto"
          >
            <ExternalLink size={14} />
            Abrir em Tela Cheia
          </a>
        </div>
      </CardHeader>

      <CardContent className="bg-slate-100 p-0">
        {/* Visualizador de PDF Embutido */}
        <div className="relative h-[72vh] min-h-[520px] w-full shadow-inner sm:h-[78vh] lg:h-[82vh]">
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`} // Oculta barra de ferramentas para dificultar download direto
            className="w-full h-full border-none"
            title={`Prova - ${turma}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}