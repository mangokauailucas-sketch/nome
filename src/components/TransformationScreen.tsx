import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface TransformationScreenProps {
  nomeCalculado: string;
  nomeFinal: string;
  onComplete: () => void;
}

export function TransformationScreen({
  nomeCalculado,
  nomeFinal,
  onComplete,
}: TransformationScreenProps) {
  const [phase, setPhase] = useState<"scatter" | "reform" | "done">("scatter");
  const [displayLetters, setDisplayLetters] = useState<string[]>(
    nomeCalculado.split("")
  );

  useEffect(() => {
    // Phase 1: scatter (1.5s)
    const t1 = setTimeout(() => setPhase("reform"), 1500);
    // Phase 2: reform to new name (1.5s)
    const t2 = setTimeout(() => {
      setDisplayLetters(nomeFinal.split(""));
      setPhase("done");
    }, 3000);
    // Phase 3: auto-advance
    const t3 = setTimeout(() => onComplete(), 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [nomeCalculado, nomeFinal, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[612px] space-y-8 text-center">
        <p className="text-muted-foreground text-sm animate-fade-in">
          Transformando sua energia numerológica...
        </p>

        {/* Letter animation area */}
        <div className="flex justify-center items-center min-h-[120px] flex-wrap gap-1">
          {displayLetters.map((letter, i) => (
            <span
              key={`${phase}-${i}`}
              className={`
                inline-block text-3xl md:text-4xl font-bold transition-all duration-700
                ${letter === " " ? "w-3" : ""}
                ${phase === "scatter"
                  ? "text-mystic-warn/70"
                  : phase === "reform"
                    ? "text-primary/70 blur-sm"
                    : "text-primary animate-glow-pulse"
                }
              `}
              style={{
                transform:
                  phase === "scatter"
                    ? `translateY(${Math.sin(i * 1.5) * 20}px) rotate(${Math.cos(i * 2) * 15}deg)`
                    : phase === "reform"
                      ? `translateY(${Math.sin(i * 0.8) * 5}px)`
                      : "none",
                transitionDelay: `${i * 50}ms`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {letter === " " ? "" : letter}
            </span>
          ))}
        </div>

        {phase === "done" && (
          <div className="animate-fade-in space-y-2">
            <p className="text-mystic-good text-sm font-medium">
              ✦ Nova energia alinhada
            </p>
          </div>
        )}

        <button
          onClick={onComplete}
          className="text-muted-foreground/60 hover:text-muted-foreground text-xs underline transition-colors"
        >
          Pular
        </button>
      </div>
    </div>
  );
}
