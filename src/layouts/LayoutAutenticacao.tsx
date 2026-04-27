import { Toaster } from "sonner"
import { Login } from "@/components/Login"

export function LayoutAutenticacao() {
  return (
    <div className="min-h-screen w-full bg-slate-50">
      <Toaster position="top-center" richColors closeButton theme="light" />
      <main className="flex min-h-screen items-center justify-center">
        <Login />
      </main>
    </div>
  )
}