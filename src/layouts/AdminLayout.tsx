import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSide"
import { FileText, ShieldCheck, Users, Loader2 } from "lucide-react"
import { useTurmas } from "@/hooks/useTurmas"
import { TurmaCard } from "@/components/TurmaCard" // Importando o novo componente
import { Busca } from "@/components/Busca"

export function AdminLayout() {
  const { turmas, turmasFiltradas, busca, setBusca, loading, deletarTurma, deletarSomenteProva, buscarTurmas, adicionarNovaProva, renovarLink, obterLinkAdmin } = useTurmas();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
        <AppSidebar  onTurmaCriada = {buscarTurmas}/>

        <main className="flex-1">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-slate-200" />
            <h2 className="text-sm font-medium text-slate-600">Painel Administrativo</h2>
          </header>

          <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
            <div className="mb-8 rounded-2xl border border-slate-200/70 bg-white/85 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Área do Aplicador</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Bem-vindo, Aplicador</h1>
              <p className="mt-2 text-sm text-slate-600">Gerencie turmas e arquivos de prova anexados.</p>
            </div>

            {/* Cards de Estatísticas Rápidas */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
               <StatsCard title="Turmas Totais" value={turmas.length.toString()} icon={<Users className="h-4 w-4" />} />
               <StatsCard title="Status Storage" value="Ativo" icon={<ShieldCheck className="h-4 w-4" />} />
               <StatsCard title="Arquivos PDF" value={turmas.filter(t => t.pdf_url).length.toString()} icon={<FileText className="h-4 w-4" />} />
            </div>
            <div className=" mb-8">
              <Busca valor={busca} onChange={setBusca} />
            </div>
            <h3 className="mb-6 text-lg font-bold text-[#001F3F] flex items-center gap-2">
              Controle de Turmas
            </h3>

            {loading ? (
              <div className="flex py-20 justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {turmasFiltradas.map((turma) => (
                  <TurmaCard 
                    key={turma.id}
                    turma={turma}
                    onVerProva={(url) => window.open(url, '_blank')}
                    onDeletarProva={deletarSomenteProva}
                    onDeletarTurma={deletarTurma}
                    onAdicionarProva={adicionarNovaProva}
                    onRenovarLink={renovarLink}
                    onObterLinkAdmin={obterLinkAdmin}

                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function StatsCard({ title, value, icon }: { title: string, value: string, icon: any }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700">{icon}</div>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <h3 className="mt-1 text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  )
}