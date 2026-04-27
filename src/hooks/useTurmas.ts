import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

// Tipagem básica para facilitar o uso no componente
export interface Turma {
  id: string;
  nome_turma: string;
  pdf_url: string | null;
  created_at: string;
}

export function useTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. BUSCAR TURMAS
  const buscarTurmas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('turmas_provas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTurmas(data || []);
    } catch (error) {
      toast.error("Erro ao carregar turmas");
    } finally {
      setLoading(false);
    }
  };

  // 2. DELETAR TURMA COMPLETA (Registro + Arquivo)
  const deletarTurma = async (id: string, pdfUrl: string | null) => {
    const confirmar = confirm("Tem certeza que deseja excluir esta turma e todos os seus dados?");
    if (!confirmar) return;

    try {
      // Se houver PDF, deleta do Storage primeiro
      if (pdfUrl) {
        const fileName = pdfUrl.split('/').pop();
        if (fileName) {
          await supabase.storage.from('provas-arquivos').remove([fileName]);
        }
      }

      const { error } = await supabase.from('turmas_provas').delete().eq('id', id);
      if (error) throw error;

      toast.success("Turma removida com sucesso!");
      await buscarTurmas(); // Redesenha a lista
    } catch (err) {
      toast.error("Erro ao deletar turma");
    }
  };

  // 3. REMOVER APENAS O PDF (Mantém a turma)
  const deletarSomenteProva = async (id: string, pdfUrl: string) => {
    const confirmar = confirm("Deseja remover apenas o arquivo PDF desta turma?");
    if (!confirmar) return;

    try {
      const fileName = pdfUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('provas-arquivos').remove([fileName]);
      }
      
      const { error } = await supabase
        .from('turmas_provas')
        .update({ pdf_url: null })
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Arquivo removido. A turma continua ativa.");
      await buscarTurmas(); // Redesenha a lista
    } catch (err) {
      toast.error("Erro ao remover arquivo");
    }
  };

  // 4. ADICIONAR NOVA PROVA (Conversão IMG -> PDF -> Upload)
  const adicionarNovaProva = async (id: string, files: FileList | null, nomeTurma: string) => {
    if (!files || files.length === 0) return;
    
    const toastId = toast.loading("Convertendo imagens e enviando prova...");

    try {
      const doc = new jsPDF();
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
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      const pdfBlob = doc.output('blob');
      const fileName = `${Date.now()}-${nomeTurma.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Upload
      const { error: uploadError } = await supabase.storage
        .from('provas-arquivos')
        .upload(fileName, pdfFile);

      if (uploadError) throw uploadError;

      // URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('provas-arquivos')
        .getPublicUrl(fileName);

      // Atualiza Banco
      const { error: dbError } = await supabase
        .from('turmas_provas')
        .update({ pdf_url: publicUrl })
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success("Prova anexada com sucesso!", { id: toastId });
      await buscarTurmas(); // Redesenha a lista

    } catch (err: any) {
      console.error(err);
      toast.error("Erro no processamento do arquivo.", { id: toastId });
    }
  };

  useEffect(() => {
    buscarTurmas();
  }, []);

  return { 
    turmas, 
    loading, 
    deletarTurma, 
    deletarSomenteProva, 
    buscarTurmas, 
    adicionarNovaProva 
  };
}