import { Eye, FileUp, FileX2, Trash2, Users, Link as LinkIcon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

interface TurmaCardProps {
  turma: {
    id: string
    nome_turma: string
    pdf_url: string | null
  }
  onVerProva: (url: string) => void
  onDeletarProva: (id: string, url: string) => void
  onDeletarTurma: (id: string, url: string | null) => void
  onAdicionarProva: (id: string, files: FileList | null, nome: string) => void
}

export function TurmaCard({ 
  turma, 
  onVerProva, 
  onDeletarProva, 
  onDeletarTurma, 
  onAdicionarProva 
}: TurmaCardProps) {
  const [copiado, setCopiado] = useState(false);

  // Função para gerar e copiar o link público do aluno
  const gerarLinkAluno = () => {
    const baseUrl = window.location.origin;
    const linkCompleto = `${baseUrl}/prova/${turma.id}`;
    
    navigator.clipboard.writeText(linkCompleto);
    setCopiado(true);
    toast.success("Link da prova copiado!");
    
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="group rounded-xl border-2 border-slate-800 bg-slate-950 p-6 shadow-xl transition-all hover:border-slate-600 hover:shadow-2xl">
      {/* Cabeçalho do Card */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <span className="inline-block rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
            {turma.pdf_url ? "Prova Disponível" : "Sem Anexo"}
          </span>
          <h4 className="mt-1 text-2xl font-black text-white uppercase leading-none">
            {turma.nome_turma}
          </h4>
        </div>
        <div className="rounded-full bg-slate-900 p-2 text-slate-500 group-hover:bg-slate-800 group-hover:text-blue-400 transition-colors">
          <Users size={20} />
        </div>
      </div>

      <div className="space-y-3">
        {/* Ação Principal: Gerar Link (Só aparece se houver PDF) */}
        {turma.pdf_url && (
          <Button 
            onClick={gerarLinkAluno}
            className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 transition-all shadow-lg active:scale-95"
          >
            {copiado ? <Check size={16} /> : <LinkIcon size={16} />}
            {copiado ? "Link Copiado!" : "Gerar Link p/ Alunos"}
          </Button>
        )}

        {/* Área de Visualização/Upload */}
        <div className="flex w-full overflow-hidden rounded-xl border-2 border-slate-800 bg-slate-900/50">
          {turma.pdf_url ? (
            <div className="flex w-full">
              <Button 
                variant="ghost" 
                className="flex-1 rounded-none border-r-2 border-slate-800 h-12 font-bold text-slate-300 hover:bg-white hover:text-black transition-all gap-2"
                onClick={() => onVerProva(turma.pdf_url!)}
              >
                <Eye size={18} /> Ver
              </Button>
              <Button 
                variant="ghost" 
                className="flex-1 rounded-none h-12 font-bold text-slate-400 hover:bg-orange-600 hover:text-white transition-all gap-2"
                onClick={() => onDeletarProva(turma.id, turma.pdf_url!)}
              >
                <FileX2 size={18} /> Limpar
              </Button>
            </div>
          ) : (
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 transition-colors">
              <FileUp size={18} className="text-blue-400" />
              <span>Anexar Prova (PDF/IMG)</span>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                accept="image/*"
                onChange={(e) => onAdicionarProva(turma.id, e.target.files, turma.nome_turma)}
              />
            </label>
          )}
        </div>

        {/* Ação de Exclusão */}
        <Button 
          variant="outline" 
          className="w-full h-12 border-2 border-slate-800 bg-transparent text-red-500 font-black hover:bg-red-600 hover:text-white hover:border-red-600 transition-all gap-2"
          onClick={() => onDeletarTurma(turma.id, turma.pdf_url)}
        >
          <Trash2 size={18} /> EXCLUIR TURMA
        </Button>
      </div>
    </div>
  )
}