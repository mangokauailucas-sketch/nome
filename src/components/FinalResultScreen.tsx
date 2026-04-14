import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PyramidDisplay } from "@/components/PyramidDisplay";
import type { SequenceOccurrence } from "@/lib/numerology";

interface FinalResultScreenProps {
  nomeFinal: string;
  pyramid: number[][];
  sequences: SequenceOccurrence[];
  scoreFinal: number;
}

export function FinalResultScreen({
  nomeFinal,
  pyramid,
  sequences,
  scoreFinal,
}: FinalResultScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(nomeFinal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 sm:px-4 py-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-mystic-yellow/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[612px] space-y-6 text-center">
        <div className="space-y-2 animate-fade-in">
          <p className="text-muted-foreground text-sm">Seu nome alinhado</p>
          <h2 className="text-3xl md:text-4xl font-bold text-primary animate-glow-pulse inline-block px-4 py-2">
            {nomeFinal}
          </h2>
        </div>

        {/* Pyramid */}
        <div className="py-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <PyramidDisplay
            pyramid={pyramid}
            sequences={sequences}
            animate={false}
            highlightNegative={true}
          />
        </div>

        {/* Message */}
        <div
          className="animate-fade-in bg-card/50 border border-border rounded-lg px-4 py-4 space-y-2"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="text-mystic-good font-semibold">
            ✦ Energia numerológica alinhada
          </p>
          <p className="text-foreground/80 text-sm">
            Com esse nome, sua energia numerológica fica livre das sequências de bloqueio.
            {scoreFinal > 0 &&
              " Algumas influências menores ainda existem, mas o impacto foi significativamente reduzido."}
          </p>
        </div>

        {/* Actions */}
        <div
          className="flex flex-col gap-3 animate-fade-in"
          style={{ animationDelay: "0.7s" }}
        >
          <Button
            onClick={handleCopy}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold animate-yellow-pulse"
          >
            {copied ? "✓ Copiado!" : "Copiar nome alinhado"}
          </Button>
        </div>
      </div>
    </div>
  );
}
