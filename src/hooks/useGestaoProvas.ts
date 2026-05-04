import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

export function useGestaoProvas(onTurmaCriada: () => void) {
  const [nomeTurma, setNomeTurma] = useState("");
  const [isProcessando, setIsProcessando] = useState(false);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [arquivosSelecionados, setArquivosSelecionados] = useState<number>(0);
  const [tempo, setTempo] = useState({ dias: 0, horas: 1, min: 0, seg: 0 });

  const sanitizarInput = (texto: string) => {
    return texto
      .replace(/<[^>]*>?/gm, '')
      .replace(/[^\w\sÀ-ÿ-]/gi, '')
      .trim();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArquivosSelecionados(e.target.files?.length || 0);
  };

  const handleFinalizar = async () => {
    const sucesso = await criarTurmaComProva(fileInputRef.current?.files || null);
    if (sucesso) {
      setOpen(false);
      setArquivosSelecionados(0);
      onTurmaCriada();
    }
  };

  // Função melhorada para lidar com os dois tipos
  const processarArquivosParaPdf = async (files: FileList): Promise<Blob> => {
    const arrayFiles = Array.from(files);
    
    // Se for apenas UM arquivo e ele já for PDF, retorna ele direto
    if (arrayFiles.length === 1 && arrayFiles[0].type === "application/pdf") {
      return arrayFiles[0];
    }

    // Se forem imagens ou múltiplos arquivos, gera o PDF
    const doc = new jsPDF({ compress: true });

    for (let i = 0; i < arrayFiles.length; i++) {
      const file = arrayFiles[i];
      
      // Pula se por acaso tentarem enfiar um PDF no meio de imagens (jsPDF não mescla PDFs nativamente)
      if (file.type === "application/pdf") continue;

      const imgData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      if (i > 0) doc.addPage();
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      doc.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    }
    return doc.output("blob");
  };

  const criarTurmaComProva = async (files: FileList | null) => {
    const nomeLimpo = sanitizarInput(nomeTurma);

    if (!nomeLimpo) {
      return toast.error("Por favor, informe um nome válido para a turma.");
    }

    setIsProcessando(true);
    try {
      let finalUrl = null;

      if (files && files.length > 0) {
        const timestamp = Date.now();
        const fileName = `${timestamp}-${nomeLimpo.toLowerCase().replace(/\s+/g, '-')}.pdf`;

        // CHAMA A NOVA FUNÇÃO QUE DECIDE SE CONVERTE OU NÃO
        const pdfBlob = await processarArquivosParaPdf(files);
        const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

        const { error: uploadError } = await supabase.storage
          .from("provas-arquivos")
          .upload(fileName, pdfFile, { 
            contentType: "application/pdf",
            upsert: false 
          });

        if (uploadError) throw uploadError;

        const segundos = (tempo.dias * 86400) + (tempo.horas * 3600) + (tempo.min * 60) + tempo.seg;
        const expiraEm = segundos > 0 ? segundos : 3600;

        const { data, error: signedError } = await supabase.storage
          .from("provas-arquivos")
          .createSignedUrl(fileName, expiraEm);

        if (signedError) throw signedError;
        finalUrl = data.signedUrl;
      }

      const { error: dbError } = await supabase
        .from("turmas_provas")
        .insert([{ 
          nome_turma: nomeLimpo.toUpperCase(),
          pdf_url: finalUrl 
        }]);

      if (dbError) throw dbError;

      toast.success(finalUrl ? "Turma e prova criadas!" : "Turma criada com sucesso!");
      setNomeTurma("");
      setTempo({ dias: 0, horas: 1, min: 0, seg: 0 });
      return true;

    } catch (error: any) {
      console.error("Erro completo:", error);
      toast.error("Erro no processo: " + (error.message || "Erro desconhecido"));
      return false;
    } finally {
      setIsProcessando(false);
    }
  };

  return {
    nomeTurma, setNomeTurma, isProcessando, criarTurmaComProva,
    open, setOpen, handleFileChange, fileInputRef,
    arquivosSelecionados, handleFinalizar, setArquivosSelecionados,
    tempo, setTempo
  };
}