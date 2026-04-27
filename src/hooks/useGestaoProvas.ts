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
  
  // Adicionado o estado de tempo que tínhamos configurado anteriormente
  const [tempo, setTempo] = useState({ dias: 0, horas: 1, min: 0, seg: 0 });

  const sanitizarInput = (texto: string) => {
    return texto
      .replace(/<[^>]*>?/gm, '') // Remove tags HTML
      .replace(/[^\w\sÀ-ÿ-]/gi, '') // Permite letras, acentos, números e espaços
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

  const converterImagensParaPdf = async (files: FileList): Promise<Blob> => {
    const doc = new jsPDF({ compress: true });
    const arrayFiles = Array.from(files);

    for (let i = 0; i < arrayFiles.length; i++) {
      const file = arrayFiles[i];
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
    // 1. Sanitização imediata
    const nomeLimpo = sanitizarInput(nomeTurma);

    if (!nomeLimpo) {
      return toast.error("Por favor, informe um nome válido para a turma.");
    }

    setIsProcessando(true);
    try {
      let finalUrl = null;

      if (files && files.length > 0) {
        const timestamp = Date.now();
        // Usamos o nome limpo para o nome do arquivo também
        const fileName = `${timestamp}-${nomeLimpo.toLowerCase().replace(/\s+/g, '-')}.pdf`;

        const pdfBlob = await converterImagensParaPdf(files);
        const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

        // Upload para o Storage
        const { error: uploadError } = await supabase.storage
          .from("provas-arquivos")
          .upload(fileName, pdfFile, { 
            contentType: "application/pdf",
            upsert: false 
          });

        if (uploadError) throw uploadError;

        // 2. MUDANÇA PARA SEGURANÇA: createSignedUrl em vez de getPublicUrl
        // Calcula o tempo (padrão 1h se o admin não mexer)
        const segundos = (tempo.dias * 86400) + (tempo.horas * 3600) + (tempo.min * 60) + tempo.seg;
        const expiraEm = segundos > 0 ? segundos : 3600;

        const { data, error: signedError } = await supabase.storage
          .from("provas-arquivos")
          .createSignedUrl(fileName, expiraEm);

        if (signedError) throw signedError;
          
        finalUrl = data.signedUrl;
      }

      // 3. Inserção no banco usando a variável nomeLimpo (Corrigindo o erro de escopo)
      const { error: dbError } = await supabase
        .from("turmas_provas")
        .insert([{ 
          nome_turma: nomeLimpo.toUpperCase(), // Salvando o dado sanitizado
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
    nomeTurma,
    setNomeTurma,
    isProcessando,
    criarTurmaComProva,
    open,
    setOpen,
    handleFileChange,
    fileInputRef,
    arquivosSelecionados,
    handleFinalizar,
    setArquivosSelecionados,
    tempo,    // Exportado para o Dialog usar
    setTempo  // Exportado para o Dialog usar
  };
}