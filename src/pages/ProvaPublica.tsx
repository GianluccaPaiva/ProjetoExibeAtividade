import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MostraGabarito } from "@/components/MostraGabarito";
import { Loader2, AlertTriangle } from "lucide-react";

export function ProvaPublica() {
  const { id } = useParams(); // Pega o ID da URL
  const [dados, setDados] = useState<{ nome_turma: string; pdf_url: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarProva() {
      try {
        const { data, error } = await supabase
          .from("turmas_provas")
          .select("nome_turma, pdf_url")
          .eq("id", id)
          .single();

        if (error) throw error;
        setDados(data);
      } catch (err) {
        console.error("Erro ao buscar prova:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) carregarProva();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!dados || !dados.pdf_url) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold">Prova não encontrada</h1>
        <p className="text-slate-400">O link pode estar expirado ou a prova foi removida pelo administrador.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4">
      <MostraGabarito turma={dados.nome_turma} pdfUrl={dados.pdf_url} />
    </div>
  );
}