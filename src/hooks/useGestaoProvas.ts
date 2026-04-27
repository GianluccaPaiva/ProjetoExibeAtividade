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
    // Definimos a compressão na inicialização (opcional, mas ajuda)
    const doc = new jsPDF({
      compress: true,
    });
    
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
      
      // ALTERAÇÃO AQUI: 
      // 1. Mudamos de "PNG" para "JPEG"
      // 2. Adicionamos "FAST" no final para compressão otimizada
      doc.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    }

    return doc.output("blob");
  };

  const criarTurmaComProva = async (files: FileList | null) => {
    if (!nomeTurma.trim()) {
      return toast.error("Por favor, informe o nome da turma.");
    }

    setIsProcessando(true);
    try {
      let publicUrl = null;

      if (files && files.length > 0) {
        const timestamp = Date.now();
        const nomeLimpo = nomeTurma.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const fileName = `${timestamp}-${nomeLimpo}.pdf`;

        const pdfBlob = await converterImagensParaPdf(files);
        const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

        const { error: uploadError } = await supabase.storage
          .from("provas-arquivos")
          .upload(fileName, pdfFile, { 
            contentType: "application/pdf",
            upsert: false 
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("provas-arquivos")
          .getPublicUrl(fileName);
          
        publicUrl = data.publicUrl;
      }

      const { error: dbError } = await supabase
        .from("turmas_provas")
        .insert([{ 
          nome_turma: nomeTurma.toUpperCase().trim(), 
          pdf_url: publicUrl 
        }]);

      if (dbError) throw dbError;

      toast.success(publicUrl ? "Turma e prova criadas!" : "Turma criada com sucesso!");
      setNomeTurma("");
      
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
  };
}