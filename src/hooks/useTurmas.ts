import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

export interface Turma {
  id: string;
  nome_turma: string;
  pdf_url: string | null;
  created_at: string;
}

export function useTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  
  const turmasFiltradas = turmas.filter((turma) =>
    turma.nome_turma.toLowerCase().includes(busca.toLowerCase())
  );

  const extrairNomeLimpo = (url: string) => {
    try {
      const partes = url.split('/');
      const nomeComQuery = partes[partes.length - 1];
      return nomeComQuery.split('?')[0];
    } catch {
      return null;
    }
  };

  const obterLinkAdmin = async (pdfUrlNoBanco: string) => {
    try {
      const fileName = extrairNomeLimpo(pdfUrlNoBanco);
      if (!fileName) throw new Error("Arquivo não encontrado");

      const { data, error } = await supabase.storage
        .from('provas-arquivos')
        .createSignedUrl(fileName, 315360000);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      toast.error("Erro ao acessar arquivo original");
      return null;
    }
  };

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

  const renovarLink = async (id: string, pdfUrlOriginal: string, segundos: number) => {
    try {
      const fileName = extrairNomeLimpo(pdfUrlOriginal);
      if (!fileName) throw new Error("Caminho do arquivo não identificado");

      const { data, error: signedError } = await supabase.storage
        .from('provas-arquivos')
        .createSignedUrl(fileName, segundos);

      if (signedError) throw signedError;

      const { error: dbError } = await supabase
        .from('turmas_provas')
        .update({ pdf_url: data.signedUrl })
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success("Link renovado com sucesso!");
      await buscarTurmas(); 
      return data.signedUrl;
    } catch (error: any) {
      toast.error("Erro ao renovar link: " + error.message);
      return null;
    }
  };

  const deletarTurma = async (id: string, pdfUrl: string | null) => {
    const confirmar = confirm("Tem certeza que deseja excluir esta turma?");
    if (!confirmar) return;

    try {
      if (pdfUrl) {
        const fileName = extrairNomeLimpo(pdfUrl);
        if (fileName) await supabase.storage.from('provas-arquivos').remove([fileName]);
      }
      const { error } = await supabase.from('turmas_provas').delete().eq('id', id);
      if (error) throw error;
      toast.success("Turma removida.");
      await buscarTurmas();
    } catch (err) {
      toast.error("Erro ao deletar turma");
    }
  };

  const deletarSomenteProva = async (id: string, pdfUrl: string) => {
    const confirmar = confirm("Deseja remover apenas o arquivo PDF?");
    if (!confirmar) return;

    try {
      const fileName = extrairNomeLimpo(pdfUrl);
      if (fileName) await supabase.storage.from('provas-arquivos').remove([fileName]);
      const { error } = await supabase.from('turmas_provas').update({ pdf_url: null }).eq('id', id);
      if (error) throw error;
      toast.success("Arquivo removido.");
      await buscarTurmas();
    } catch (err) {
      toast.error("Erro ao remover arquivo");
    }
  };

  // --- FUNÇÃO CORRIGIDA ---
  const adicionarNovaProva = async (id: string, files: FileList | null, nomeTurma: string) => {
    if (!files || files.length === 0) return;
    
    const toastId = toast.loading("Processando arquivo...");

    try {
      const arrayFiles = Array.from(files);
      let pdfFileParaUpload: File | Blob;
      const fileName = `${Date.now()}-${nomeTurma.replace(/\s+/g, '-').toLowerCase()}.pdf`;

      // SE FOR PDF ÚNICO: Bypass no jsPDF para evitar o erro UNKNOWN
      if (arrayFiles.length === 1 && arrayFiles[0].type === "application/pdf") {
        pdfFileParaUpload = arrayFiles[0];
      } 
      // SE FOR IMAGEM: Converte usando jsPDF
      else {
        const doc = new jsPDF();
        let imagensValidas = 0;

        for (let i = 0; i < arrayFiles.length; i++) {
          const file = arrayFiles[i];
          if (!file.type.startsWith("image/")) continue;

          const imgData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });

          if (imagensValidas > 0) doc.addPage();
          const imgProps = doc.getImageProperties(imgData);
          const pdfWidth = doc.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
          imagensValidas++;
        }

        if (imagensValidas === 0) throw new Error("Nenhum arquivo válido selecionado.");
        pdfFileParaUpload = doc.output('blob');
      }

      // Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from('provas-arquivos')
        .upload(fileName, pdfFileParaUpload, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      // Gera link assinado (Segurança)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('provas-arquivos')
        .createSignedUrl(fileName, 3600); // 1 hora de validade inicial

      if (signedError) throw signedError;

      // Atualiza Banco com o link assinado
      const { error: dbError } = await supabase
        .from('turmas_provas')
        .update({ pdf_url: signedData.signedUrl })
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success("Prova anexada com sucesso!", { id: toastId });
      await buscarTurmas(); 

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro no processamento.", { id: toastId });
    }
  };

  useEffect(() => {
    buscarTurmas();
  }, []);

  return { 
    busca, setBusca, turmasFiltradas, turmas, loading, 
    deletarTurma, deletarSomenteProva, buscarTurmas, 
    adicionarNovaProva, renovarLink, obterLinkAdmin
  };
}