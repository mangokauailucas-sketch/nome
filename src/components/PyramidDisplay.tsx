import { useState, useEffect, useMemo } from "react";
import type { SequenceOccurrence } from "@/lib/numerology";

interface PyramidDisplayProps {
  pyramid: number[][];
  sequences: SequenceOccurrence[];
  animate?: boolean;
  highlightNegative?: boolean;
  onAnimationComplete?: () => void;
}

export function PyramidDisplay({
  pyramid,
  sequences,
  animate = false,
  highlightNegative = true,
  onAnimationComplete,
}: PyramidDisplayProps) {
  const [visibleRows, setVisibleRows] = useState(animate ? 0 : pyramid.length);

  useEffect(() => {
    if (!animate) {
      setVisibleRows(pyramid.length);
      return;
    }
    setVisibleRows(0);
    let row = 0;
    const interval = setInterval(() => {
      row++;
      setVisibleRows(row);
      if (row >= pyramid.length) {
        clearInterval(interval);
        setTimeout(() => onAnimationComplete?.(), 400);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [animate, pyramid.length, onAnimationComplete]);

  // Build a set of highlighted cell positions
  const highlightedCells = useMemo(() => {
    if (!highlightNegative) return new Set<string>();
    const set = new Set<string>();
    for (const seq of sequences) {
      if (seq.classificacao === "negativa" || seq.classificacao === "separacao") {
        for (let i = 0; i < seq.length; i++) {
          set.add(`${seq.linha}-${seq.posicao + i}`);
        }
      }
    }
    return set;
  }, [sequences, highlightNegative]);

  const positiveCells = useMemo(() => {
    if (!highlightNegative) return new Set<string>();
    const set = new Set<string>();
    for (const seq of sequences) {
      if (seq.classificacao === "positiva") {
        for (let i = 0; i < seq.length; i++) {
          set.add(`${seq.linha}-${seq.posicao + i}`);
        }
      }
    }
    return set;
  }, [sequences, highlightNegative]);

  const baseLength = pyramid[0]?.length ?? 0;

  // Mobile-first sizing. Each tier's mobile width × base + gap stays within
  // ~340px so common 8–20 letter names render without horizontal scroll on
  // the smallest phones; wider screens get the md: larger cells.
  const sizeClass =
    baseLength <= 8
      ? "w-8 h-8 md:w-10 md:h-10 text-sm md:text-base"
      : baseLength <= 12
        ? "w-6 h-6 md:w-9 md:h-9 text-xs md:text-sm"
        : baseLength <= 16
          ? "w-5 h-5 md:w-8 md:h-8 text-[11px] md:text-sm"
          : baseLength <= 20
            ? "w-4 h-4 md:w-7 md:h-7 text-[10px] md:text-xs"
            : "w-3.5 h-3.5 md:w-6 md:h-6 text-[9px] md:text-[11px]";

  const gapClass = baseLength <= 16 ? "gap-1" : "gap-0.5 md:gap-1";

  return (
    <div className="overflow-x-auto max-w-full">
      <div className={`flex flex-col items-center ${gapClass} min-w-min`}>
        {pyramid.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className={`flex ${gapClass} justify-center transition-all duration-500`}
            style={{
              opacity: rowIdx < visibleRows ? 1 : 0,
              transform: rowIdx < visibleRows ? "translateY(0)" : "translateY(-10px)",
              transitionDelay: `${rowIdx * 50}ms`,
            }}
          >
            {row.map((num, colIdx) => {
              const isWarn = highlightedCells.has(`${rowIdx}-${colIdx}`);
              const isGood = positiveCells.has(`${rowIdx}-${colIdx}`);
              return (
                <div
                  key={colIdx}
                  className={`
                    ${sizeClass} flex items-center justify-center rounded-md font-bold
                    transition-all duration-300
                    ${isWarn
                      ? "bg-mystic-warn/20 text-mystic-warn animate-warn-pulse border border-mystic-warn/40"
                      : isGood
                        ? "bg-mystic-good/20 text-mystic-good border border-mystic-good/40"
                        : "bg-secondary text-foreground border border-border"
                    }
                  `}
                >
                  {num}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
