import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { removeDiacritics } from "@/lib/numerology";

interface InputScreenProps {
  onSubmit: (nomeCompleto: string, nomeUsual: string) => void;
}

export function InputScreen({ onSubmit }: InputScreenProps) {
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [nomeUsual, setNomeUsual] = useState("");
  const [errors, setErrors] = useState<{ full?: string; usual?: string }>({});

  const sanitize = (value: string) =>
    value.replace(/[^a-zA-ZÀ-ÿçÇ\s]/g, "").replace(/\s+/g, " ");

  const validate = (): boolean => {
    const errs: typeof errors = {};
    const fullTrimmed = nomeCompleto.trim();
    const usualTrimmed = nomeUsual.trim();

    if (!fullTrimmed) {
      errs.full = "Preencha seu nome completo.";
    } else {
      const words = fullTrimmed.split(/\s+/);
      if (words.length < 2) errs.full = "Informe pelo menos 2 nomes.";
      else if (words.length > 6) errs.full = "Máximo de 6 nomes.";
    }

    if (!usualTrimmed) {
      errs.usual = "Preencha como você é chamado(a).";
    } else {
      const words = usualTrimmed.split(/\s+/);
      if (words.length > 2) errs.usual = "Máximo de 2 palavras.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(nomeCompleto.trim(), nomeUsual.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-mystic-yellow/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-5xl mb-4">✦</div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Pirâmide Numerológica
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Descubra as energias ocultas no seu nome e encontre sua melhor vibração numerológica.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nomeCompleto" className="text-foreground/90">
              Seu nome completo
            </Label>
            <Input
              id="nomeCompleto"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(sanitize(e.target.value))}
              placeholder="Ex: Maria Clara dos Santos"
              className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground/50"
            />
            {errors.full && (
              <p className="text-sm text-destructive">{errors.full}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeUsual" className="text-foreground/90">
              Como você é chamado(a)?
            </Label>
            <p className="text-xs text-muted-foreground">
              Pode ser apelido, nome social, etc.
            </p>
            <Input
              id="nomeUsual"
              value={nomeUsual}
              onChange={(e) => setNomeUsual(sanitize(e.target.value))}
              placeholder="Ex: Clara"
              className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/30 placeholder:text-muted-foreground/50"
            />
            {errors.usual && (
              <p className="text-sm text-destructive">{errors.usual}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground animate-glow-pulse"
          >
            ✦ Revelar Pirâmide
          </Button>
        </form>
      </div>
    </div>
  );
}
