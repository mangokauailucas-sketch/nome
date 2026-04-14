import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { analyze, type NumerologyResult } from "@/lib/numerology";
import { InputScreen } from "@/components/InputScreen";
import { OriginalPyramidScreen } from "@/components/OriginalPyramidScreen";
import { TransformationScreen } from "@/components/TransformationScreen";
import { FinalResultScreen } from "@/components/FinalResultScreen";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pirâmide Numerológica — Análise do Seu Nome" },
      {
        name: "description",
        content:
          "Descubra as energias ocultas no seu nome com a pirâmide numerológica invertida. Análise gratuita e sugestão de nome alinhado.",
      },
    ],
  }),
});

type Screen = "input" | "pyramid" | "transform" | "result";

const STORAGE_KEY = "numerologia_aligned_v4";

type StoredAlignment = {
  version: 4;
  result: NumerologyResult;
  alignedAt: string;
};

function readStoredAlignment(): StoredAlignment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAlignment;
    if (!parsed || parsed.version !== 4 || !parsed.result) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredAlignment(result: NumerologyResult): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredAlignment = {
      version: 4,
      result,
      alignedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota/serialization failures — persistence is best-effort
  }
}

function Index() {
  const [screen, setScreen] = useState<Screen>("input");
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredAlignment();
    if (stored) {
      setResult(stored.result);
      setScreen("result");
    }
    setHydrated(true);
  }, []);

  const handleSubmit = useCallback((nomeCompleto: string, nomeUsual: string) => {
    if (readStoredAlignment()) {
      return;
    }
    const res = analyze(nomeCompleto, nomeUsual);
    setResult(res);
    setScreen("pyramid");
  }, []);

  const handlePyramidNext = useCallback(() => {
    if (!result) return;
    setScreen("transform");
  }, [result]);

  const handleTransformComplete = useCallback(() => {
    if (result) {
      writeStoredAlignment(result);
    }
    setScreen("result");
  }, [result]);

  if (!hydrated) {
    return null;
  }

  if (screen === "input" || !result) {
    return <InputScreen onSubmit={handleSubmit} />;
  }

  if (screen === "pyramid") {
    return (
      <OriginalPyramidScreen
        nomeCalculado={result.nomeCalculado}
        pyramid={result.piramideOriginal}
        sequences={result.sequenciasEncontradas}
        score={result.scoreOriginal}
        onNext={handlePyramidNext}
      />
    );
  }

  if (screen === "transform") {
    return (
      <TransformationScreen
        nomeCalculado={result.nomeCalculado}
        nomeFinal={result.nomeFinal}
        onComplete={handleTransformComplete}
      />
    );
  }

  return (
    <FinalResultScreen
      nomeFinal={result.nomeFinal}
      pyramid={result.piramideFinal}
      sequences={result.sequenciasFinal}
      scoreFinal={result.scoreFinal}
    />
  );
}
