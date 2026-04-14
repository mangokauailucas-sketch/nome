import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PyramidDisplay } from "@/components/PyramidDisplay";
import type { SequenceOccurrence } from "@/lib/numerology";

interface OriginalPyramidScreenProps {
  nomeCalculado: string;
  pyramid: number[][];
  sequences: SequenceOccurrence[];
  score: number;
  onNext: () => void;
}

export function OriginalPyramidScreen({
  nomeCalculado,
  pyramid,
  sequences,
  onNext,
}: OriginalPyramidScreenProps) {
  const [animDone, setAnimDone] = useState(false);

  const handleAnimComplete = useCallback(() => {
    setAnimDone(true);
  }, []);

  const negatives = sequences.filter(
    (s) => s.classificacao === "negativa" || s.classificacao === "separacao"
  );
  const positives = sequences.filter((s) => s.classificacao === "positiva");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 sm:px-4 py-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-mystic-yellow/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[612px] space-y-6 text-center">
        {/* Name display */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">Nome analisado</p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-wide">
            {nomeCalculado.split("").map((letter, i) => (
              <span
                key={i}
                className={letter === " " ? "" : "inline-block animate-float-letter"}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </h2>
        </div>

        {/* Pyramid */}
        <div className="py-4">
          <PyramidDisplay
            pyramid={pyramid}
            sequences={sequences}
            animate={true}
            highlightNegative={animDone}
            onAnimationComplete={handleAnimComplete}
          />
        </div>

        {/* Sequence descriptions */}
        {animDone && (
          <div className="space-y-3 animate-fade-in">
            {[...new Map(negatives.map((s) => [s.tipo, s])).values()].map(
              (seq, i) => (
                <div
                  key={i}
                  className="bg-mystic-warn/10 border border-mystic-warn/30 rounded-lg px-4 py-3 text-left"
                >
                  <p className="text-mystic-warn font-semibold text-sm">
                    Sequência {seq.tipo}
                  </p>
                  <p className="text-foreground/80 text-sm mt-1">
                    {seq.descricao}
                  </p>
                </div>
              )
            )}

            {positives.length > 0 &&
              [...new Map(positives.map((s) => [s.tipo, s])).values()].map(
                (seq, i) => (
                  <div
                    key={`p-${i}`}
                    className="bg-mystic-good/10 border border-mystic-good/30 rounded-lg px-4 py-3 text-left"
                  >
                    <p className="text-mystic-good font-semibold text-sm">
                      Sequência {seq.tipo}
                    </p>
                    <p className="text-foreground/80 text-sm mt-1">
                      {seq.descricao}
                    </p>
                  </div>
                )
              )}

            <Button
              onClick={onNext}
              className="mt-4 w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold animate-yellow-pulse"
            >
              ✦ Alinhar meu nome
            </Button>
          </div>
        )}

        {/* Skip button */}
        {!animDone && (
          <button
            onClick={() => setAnimDone(true)}
            className="text-muted-foreground/60 hover:text-muted-foreground text-xs underline transition-colors"
          >
            Pular animação
          </button>
        )}
      </div>
    </div>
  );
}
