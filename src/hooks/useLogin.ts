// src/hooks/useLogin.ts
import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { toast } from "sonner"

export function useLogin() {
  const [entrada, setEntrada] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() 
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: entrada.email,
        password: entrada.password
      })

      if (error) {
        toast.error("Erro no login", { description: error.message })
        return // Para aqui se der erro
      }

      if (data.user) {
        // Forçamos o toast a aparecer antes de qualquer redirecionamento
        toast.success("Sucesso!", { 
          description: "Bem-vindo, aplicador!",
          duration: 4000 // Garante que ele fique visível por 4 segundos
        })
        console.log("Login realizado com sucesso:", data.user)
      }
    } catch (err) {
      toast.error("Erro inesperado")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { entrada, setEntrada, loading, handleSubmit }
}