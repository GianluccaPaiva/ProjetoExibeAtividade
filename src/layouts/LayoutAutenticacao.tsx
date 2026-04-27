import { Toaster } from "sonner"
import { Login } from "@/components/Login"

export function LayoutAutenticacao() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.15),transparent_40%)]" />

      <Toaster position="top-center" />
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 md:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <p className="inline-flex rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-cyan-300 uppercase">
              NotaExibe Portal
            </p>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                Acompanhe turmas, provas e resultados em um unico painel.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Entre para gerenciar avaliacoes com agilidade, publicar conteudo para alunos e visualizar dados sem complicacao.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-700/70 bg-slate-900/50 p-3 shadow-[0_20px_60px_-30px_rgba(14,165,233,0.8)] backdrop-blur-md sm:p-5">
            <Login />
          </section>
        </div>
      </main>
    </div>
  )
}