// src/components/admin/GestaoProvasDialog.tsx

import { PlusCircle, FileUp, Loader2, ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGestaoProvas } from "@/hooks/useGestaoProvas";

interface GestaoProvasDialogProps {
  onTurmaCriada: () => void;
}

export function GestaoProvasDialog({ onTurmaCriada }: GestaoProvasDialogProps) {
  const {
    arquivosSelecionados,
    fileInputRef,
    nomeTurma,
    setNomeTurma,
    isProcessando,
    open,
    setOpen,
    handleFileChange,
    handleFinalizar,
  } = useGestaoProvas(onTurmaCriada);

  // Função auxiliar para definir o texto de exibição do arquivo
  const getTextoArquivo = () => {
    if (arquivosSelecionados === 0) return "Clique para selecionar PDF ou Fotos";
    if (arquivosSelecionados === 1) return "1 arquivo selecionado";
    return `${arquivosSelecionados} arquivos selecionados`;
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) onTurmaCriada(); 
      }}
    >
      <DialogTrigger>
        <div 
          role="button"
          tabIndex={0}
          className="flex w-full items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer transition-colors"
        >
          <PlusCircle size={18} className="shrink-0" />
          <span>Criar turma com/sem prova</span>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-md border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="text-primary" /> Configurar Prova
          </DialogTitle>
          <DialogDescription>
            Crie uma turma e anexe o **PDF** pronto ou **fotos** das páginas para gerar o arquivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="turma">Identificação da Turma</Label>
            <Input 
              id="turma" 
              placeholder="Ex: 3A" 
              className="uppercase font-bold"
              value={nomeTurma}
              onChange={(e) => setNomeTurma(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Arquivo da Prova (PDF ou Imagens)</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
            >
              <FileUp className={arquivosSelecionados > 0 ? "text-primary" : "text-muted-foreground"} size={32} />
              <span className="text-sm font-medium text-center">
                {getTextoArquivo()}
              </span>
              <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                // MUDANÇA AQUI: Aceita PDF e Imagens
                accept="image/*,application/pdf" 
                className="hidden" 
                onChange={handleFileChange}
              />
              <p className="text-[10px] text-muted-foreground">
                Dica: Selecione várias fotos para criar um PDF único.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            className="w-full h-11 font-bold" 
            disabled={isProcessando || !nomeTurma} 
            onClick={handleFinalizar}
          >
            {isProcessando ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando Arquivos...</>
            ) : (
              "Criar Turma e Disponibilizar Prova"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}