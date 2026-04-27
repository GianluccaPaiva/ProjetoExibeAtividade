import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLogin } from "@/hooks/useLogin"
import { Loader2 } from "lucide-react"

export function Login() {
  // Pegamos o handleSubmit direto do hook agora
  const { entrada, setEntrada, loading, handleSubmit } = useLogin()

  return (
    <div className="flex w-full items-center justify-center px-2 py-6 sm:px-4 sm:py-8">
      <Card className="w-full max-w-md border-slate-700/70 bg-slate-950/70 text-slate-100 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white">Acesso ao sistema</CardTitle>
          <CardDescription className="text-slate-300">Faca login para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={entrada.email}
                onChange={(e) => setEntrada({ ...entrada, email: e.target.value })}
                className="border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-400"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-slate-200">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={entrada.password}
                onChange={(e) => setEntrada({ ...entrada, password: e.target.value })}
                className="border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-400"
                required 
              />
            </div>
            <Button type="submit" className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}