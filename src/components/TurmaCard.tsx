import { Eye, FileUp, FileX2, Trash2, Users, Link as LinkIcon, Check, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  onRenovarLink: (id: string, url: string, seg: number) => Promise<string | null> // Nova prop
  onObterLinkAdmin: (pdfUrl: string) => Promise<string | null> // Nova prop
}

export function TurmaCard({ 
  turma, 
  onDeletarProva, 
  onDeletarTurma, 
  onAdicionarProva,
  onRenovarLink,
  onObterLinkAdmin
}: TurmaCardProps) {
  const [copiado, setCopiado] = useState(false);
  const [loadingLink, setLoadingLink] = useState(false);
  const [tempo, setTempo] = useState({ dias: 0, horas: 1, min: 0, seg: 0 });

  // 2. Crie esta função interna para o clique do botão "Ver"
  const handleVerComoAdmin = async () => {
    if (!turma.pdf_url) return;
    
    const urlAdmin = await onObterLinkAdmin(turma.pdf_url);
    if (urlAdmin) {
      window.open(urlAdmin, "_blank");
    }
  };

  const handleGerarECopiar = async () => {
    if (!turma.pdf_url) return;
    
    setLoadingLink(true);
    const segundos = (tempo.dias * 86400) + (tempo.horas * 3600) + (tempo.min * 60) + tempo.seg;
    const tempoFinal = segundos > 0 ? segundos : 3600; // Padrão 1h se zerado

    const novaUrl = await onRenovarLink(turma.id, turma.pdf_url, tempoFinal);

    if (novaUrl) {
      const baseUrl = window.location.origin;
      const linkPublico = `${baseUrl}/prova/${turma.id}`;
      navigator.clipboard.writeText(linkPublico);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
    setLoadingLink(false);
  };

  return (
    <div className="group rounded-xl border-2 border-slate-800 bg-slate-950 p-6 shadow-xl transition-all hover:border-slate-600 hover:shadow-2xl">
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
        {turma.pdf_url && (
          <Dialog>
            <DialogTrigger >
              <Button className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 shadow-lg">
                <LinkIcon size={16} /> Gerar Link p/ Alunos
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-[350px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 uppercase font-black tracking-tighter">
                  <Clock className="text-blue-500" /> Validade do Link
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-slate-500 font-bold">Dias</Label>
                  <Input type="number" className="bg-slate-950 border-slate-800 h-9" value={tempo.dias} onChange={e => setTempo({...tempo, dias: +e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-slate-500 font-bold">Horas</Label>
                  <Input type="number" className="bg-slate-950 border-slate-800 h-9" value={tempo.horas} onChange={e => setTempo({...tempo, horas: +e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-slate-500 font-bold">Minutos</Label>
                  <Input type="number" className="bg-slate-950 border-slate-800 h-9" value={tempo.min} onChange={e => setTempo({...tempo, min: +e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-slate-500 font-bold">Segundos</Label>
                  <Input type="number" className="bg-slate-950 border-slate-800 h-9" value={tempo.seg} onChange={e => setTempo({...tempo, seg: +e.target.value})} />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  onClick={handleGerarECopiar} 
                  disabled={loadingLink} 
                  className="w-full bg-blue-600 hover:bg-blue-500 font-black"
                >
                  {loadingLink ? <Loader2 className="animate-spin mr-2" /> : copiado ? <Check className="mr-2" /> : null}
                  {copiado ? "LINK COPIADO!" : "GERAR E COPIAR LINK"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ... (Restante do card: Área de Visualização/Upload e Excluir continua igual ao seu código) ... */}
        <div className="flex w-full overflow-hidden rounded-xl border-2 border-slate-800 bg-slate-900/50">
           {turma.pdf_url ? (
             <div className="flex w-full">
               {/* Botão Ver (AJUSTADO) */}
                  <Button 
                    variant="ghost" 
                    className="flex-1 rounded-none border-r-2 border-slate-800 h-12 font-bold text-slate-300 hover:bg-white hover:text-black transition-all gap-2"
                    onClick={handleVerComoAdmin} // Agora chama a função segura
                  >
                    <Eye size={18} /> Ver
                  </Button>
               <Button variant="ghost" className="flex-1 rounded-none h-12 font-bold text-slate-400 hover:bg-orange-600 hover:text-white transition-all gap-2" onClick={() => onDeletarProva(turma.id, turma.pdf_url!)}>
                 <FileX2 size={18} /> Limpar
               </Button>
             </div>
           ) : (
             <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 py-4 text-sm font-bold text-slate-300 hover:bg-slate-800 transition-colors">
               <FileUp size={18} className="text-blue-400" />
               <span>Anexar Prova (PDF/IMG)</span>
               <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => onAdicionarProva(turma.id, e.target.files, turma.nome_turma)} />
             </label>
           )}
        </div>

        <Button variant="outline" className="w-full h-12 border-2 border-slate-800 bg-transparent text-red-500 font-black hover:bg-red-600 hover:text-white hover:border-red-600 transition-all gap-2" onClick={() => onDeletarTurma(turma.id, turma.pdf_url)}>
          <Trash2 size={18} /> EXCLUIR TURMA
        </Button>
      </div>
    </div>
  )
}