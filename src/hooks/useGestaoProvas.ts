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

  /**
   * FUNÇÃO DE PROCESSAMENTO - CORRIGIDA PARA EVITAR O ERRO 'UNKNOWN'
   */
  const processarArquivosParaPdf = async (files: FileList): Promise<Blob> => {
    const arrayFiles = Array.from(files);
    
    // 1. Se for APENAS UM arquivo e for PDF, retorna ele na hora.
    // Isso evita que ele entre no loop e cause o erro addImage(UNKNOWN)
    if (arrayFiles.length === 1 && arrayFiles[0].type === "application/pdf") {
      return arrayFiles[0];
    }

    // 2. Se forem imagens (ou vários arquivos), gera o PDF
    const doc = new jsPDF({ compress: true });
    let imagensAdicionadas = 0;

    for (let i = 0; i < arrayFiles.length; i++) {
      const file = arrayFiles[i];
      
      // Pula o arquivo se for um PDF (jsPDF não mescla PDFs com addImage)
      if (file.type === "application/pdf") continue;

      // Só processa se for imagem
      if (file.type.startsWith("image/")) {
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        if (imagensAdicionadas > 0) doc.addPage();
        
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        doc.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
        imagensAdicionadas++;
      }
    }

    if (imagensAdicionadas === 0 && arrayFiles.length > 0 && arrayFiles[0].type !== "application/pdf") {
      throw new Error("Nenhum arquivo de imagem válido foi encontrado.");
    }

    return doc.output("blob");
  };

  const criarTurmaComProva = async (files: FileList | null) => {
    const nomeLimpo = sanitizarInput(nomeTurma);
    if (!nomeLimpo) return toast.error("Informe um nome válido.");

    setIsProcessando(true);
    try {
      let finalUrl = null;

      if (files && files.length > 0) {
        const pdfBlob = await processarArquivosParaPdf(files);
        const timestamp = Date.now();
        const fileName = `${timestamp}-${nomeLimpo.toLowerCase().replace(/\s+/g, '-')}.pdf`;

        const { error: uploadError } = await supabase.storage
          .from("provas-arquivos")
          .upload(fileName, pdfBlob, { contentType: "application/pdf" });

        if (uploadError) throw uploadError;

        const segundos = (tempo.dias * 86400) + (tempo.horas * 3600) + (tempo.min * 60) + tempo.seg;
        const { data, error: signedError } = await supabase.storage
          .from("provas-arquivos")
          .createSignedUrl(fileName, segundos > 0 ? segundos : 3600);

        if (signedError) throw signedError;
        finalUrl = data.signedUrl;
      }

      const { error: dbError } = await supabase
        .from("turmas_provas")
        .insert([{ nome_turma: nomeLimpo.toUpperCase(), pdf_url: finalUrl }]);

      if (dbError) throw dbError;

      toast.success("Turma criada!");
      setNomeTurma("");
      setTempo({ dias: 0, horas: 1, min: 0, seg: 0 });
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsProcessando(false);
    }
  };

  /**
   * ADICIONAR PROVA (Resolve o erro do log no TurmaCard)
   */
  const adicionarNovaProva = async (id: string, files: FileList | null, nomeT: string) => {
    if (!files || files.length === 0) return;

    setIsProcessando(true);
    try {
      const pdfBlob = await processarArquivosParaPdf(files);
      const timestamp = Date.now();
      const fileName = `${timestamp}-${nomeT.toLowerCase().replace(/\s+/g, '-')}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("provas-arquivos")
        .upload(fileName, pdfBlob, { contentType: "application/pdf" });

      if (uploadError) throw uploadError;

      const { data, error: signedError } = await supabase.storage
        .from("provas-arquivos")
        .createSignedUrl(fileName, 3600);

      if (signedError) throw signedError;

      const { error: dbError } = await supabase
        .from("turmas_provas")
        .update({ pdf_url: data.signedUrl })
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success("Prova anexada!");
      onTurmaCriada();
    } catch (error: any) {
      toast.error("Erro ao anexar: " + error.message);
    } finally {
      setIsProcessando(false);
    }
  };

  const handleFinalizar = async () => {
    const sucesso = await criarTurmaComProva(fileInputRef.current?.files || null);
    if (sucesso) {
      setOpen(false);
      setArquivosSelecionados(0);
      onTurmaCriada();
    }
  };

  return {
    nomeTurma, setNomeTurma, isProcessando, criarTurmaComProva,
    adicionarNovaProva, open, setOpen, handleFileChange, fileInputRef,
    arquivosSelecionados, handleFinalizar, setArquivosSelecionados,
    tempo, setTempo
  };
}