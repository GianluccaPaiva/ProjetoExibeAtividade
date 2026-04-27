
export function BemVindo() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white p-6 text-center">
        <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Projeto Exibe atividades!</h1>
            <p className="text-lg text-slate-400 mb-6">
                Este é um projeto de código aberto para facilitar a gestão e exibição de provas escolares. 
                Professores podem criar turmas, anexar provas em PDF e gerar links públicos para os alunos acessarem.
            </p>
            <p className="text-lg text-slate-400">
                Explore as funcionalidades, contribua com melhorias ou simplesmente aproveite a praticidade de ter suas provas organizadas e acessíveis online!
            </p>
        </div>
    </div>
  );
}