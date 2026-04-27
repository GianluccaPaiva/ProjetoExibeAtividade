import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BuscaProps {
  valor: string;
  onChange: (valor: string) => void;
}

export function Busca({ valor, onChange }: BuscaProps) {
  return (
    <div className="relative w-full max-w-sm mb-6">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/90">
        <Search size={20} />
      </div>
      
      <Input
        placeholder="Buscar turma (ex: 3A, Física...)"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10 h-11 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-0 rounded-xl transition-all"
      />

      {valor && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-blue-500/15 text-slate-300 hover:text-blue-300 rounded-full"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
}