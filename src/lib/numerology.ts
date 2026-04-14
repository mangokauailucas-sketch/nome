import { NICKNAME_TO_FULL_NAMES } from "./nicknames";

// --- Pythagorean Table ---
const PYTHAGOREAN: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

/** Remove diacritics */
export function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Normalize text: trim, collapse spaces, capitalize each word */
export function normalizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Convert a letter to its pythagorean number */
export function letterToNumber(letter: string): number {
  const clean = removeDiacritics(letter).toLowerCase();
  return PYTHAGOREAN[clean] ?? 0;
}

/** Reduce to single digit */
export function reduceToDigit(n: number): number {
  while (n >= 10) {
    n = String(n).split("").reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

/** Build full inverted pyramid from a name string (ignoring spaces) */
export function buildPyramid(name: string): number[][] {
  const letters = removeDiacritics(name).replace(/\s/g, "").toLowerCase();
  const baseLine = Array.from(letters).map((l) => letterToNumber(l));

  const pyramid: number[][] = [baseLine];
  let current = baseLine;

  while (current.length > 1) {
    const next: number[] = [];
    for (let i = 0; i < current.length - 1; i++) {
      next.push(reduceToDigit(current[i] + current[i + 1]));
    }
    pyramid.push(next);
    current = next;
  }

  return pyramid;
}

// --- Sequence Detection ---

export interface SequenceOccurrence {
  tipo: string;
  descricao: string;
  linha: number;
  posicao: number;
  classificacao: "negativa" | "positiva" | "separacao";
  length: number;
}

const SEQUENCE_DESCRIPTIONS: Record<string, { desc: string; class: "negativa" | "positiva" | "separacao" }> = {
  "111": {
    desc: "Limitação, perda de coragem, períodos de inatividade ou desemprego.",
    class: "negativa",
  },
  "555": {
    desc: "Mudanças indesejadas de casa, profissão ou ambiente social.",
    class: "negativa",
  },
  "999": {
    desc: "Ganhos materiais ou financeiros.",
    class: "positiva",
  },
  "4,3": {
    desc: "Arcano de separação — risco de rompimentos afetivos ou profissionais.",
    class: "separacao",
  },
  "4,5": {
    desc: "Arcano de separação — instabilidade em relações ou projetos.",
    class: "separacao",
  },
  "2,5,2": {
    desc: "Arcano de separação — ciclo de indecisão e rupturas.",
    class: "separacao",
  },
};

const VIBRATION_DESCRIPTIONS: Record<number, string> = {
  1: "Vibração de individualismo que pode gerar isolamento e inércia.",
  2: "Vibração de dualidade que tende a indecisão e hesitação.",
  4: "Vibração de bloqueios materiais e obstáculos em projetos.",
  5: "Vibração de instabilidade e mudanças não desejadas.",
  7: "Vibração introspectiva que pode gerar solidão energética.",
  8: "Vibração de pressão material que exige alinhamento para não sufocar.",
  9: "Vibração de encerramentos que, desalinhada, atrai perdas.",
};

function buildSyntheticNegative(pyramid: number[][]): SequenceOccurrence {
  const priority = [1, 5, 9, 4, 2, 8, 7];
  for (const target of priority) {
    for (let row = pyramid.length - 1; row >= 0; row--) {
      const line = pyramid[row];
      for (let i = 0; i < line.length; i++) {
        if (line[i] === target) {
          return {
            tipo: `vibração ${target}`,
            descricao:
              VIBRATION_DESCRIPTIONS[target] ??
              "Vibração isolada que exige alinhamento energético.",
            linha: row,
            posicao: i,
            classificacao: "negativa",
            length: 1,
          };
        }
      }
    }
  }
  const apexRow = pyramid.length - 1;
  const apexValue = pyramid[apexRow]?.[0] ?? 0;
  return {
    tipo: `vibração ${apexValue}`,
    descricao:
      VIBRATION_DESCRIPTIONS[apexValue] ??
      "Vibração que requer alinhamento para equilibrar as influências do seu nome.",
    linha: apexRow,
    posicao: 0,
    classificacao: "negativa",
    length: 1,
  };
}

export function detectSequences(pyramid: number[][]): SequenceOccurrence[] {
  const results: SequenceOccurrence[] = [];

  for (let row = 0; row < pyramid.length; row++) {
    const line = pyramid[row];

    // Check triples: 111, 555, 999
    for (let i = 0; i <= line.length - 3; i++) {
      const triple = `${line[i]}${line[i + 1]}${line[i + 2]}`;
      if (triple === "111" || triple === "555" || triple === "999") {
        const info = SEQUENCE_DESCRIPTIONS[triple];
        results.push({
          tipo: triple,
          descricao: info.desc,
          linha: row,
          posicao: i,
          classificacao: info.class,
          length: 3,
        });
      }
    }

    // Check pairs: 4,3 and 4,5
    for (let i = 0; i <= line.length - 2; i++) {
      const pair = `${line[i]},${line[i + 1]}`;
      if (pair === "4,3" || pair === "4,5") {
        const info = SEQUENCE_DESCRIPTIONS[pair];
        results.push({
          tipo: pair,
          descricao: info.desc,
          linha: row,
          posicao: i,
          classificacao: info.class,
          length: 2,
        });
      }
    }

    // Check 2,5,2
    for (let i = 0; i <= line.length - 3; i++) {
      if (line[i] === 2 && line[i + 1] === 5 && line[i + 2] === 2) {
        const info = SEQUENCE_DESCRIPTIONS["2,5,2"];
        results.push({
          tipo: "2,5,2",
          descricao: info.desc,
          linha: row,
          posicao: i,
          classificacao: info.class,
          length: 3,
        });
      }
    }
  }

  return results;
}

export function calculateScore(sequences: SequenceOccurrence[]): number {
  let score = 0;
  for (const s of sequences) {
    if (s.classificacao === "negativa") score += 2;
    else if (s.classificacao === "separacao") score += 1;
  }
  return score;
}

// --- Name Normalization (Rules A → D) ---

function wordsOf(name: string): string[] {
  return name.trim().split(/\s+/);
}

function normalizeForComparison(s: string): string {
  return removeDiacritics(s).toLowerCase().trim();
}

export function computeNomeCalculado(nomeCompleto: string, nomeUsual: string): string {
  const fullWords = wordsOf(normalizeName(nomeCompleto));
  const usualWords = wordsOf(normalizeName(nomeUsual));

  const fullNorm = fullWords.map(normalizeForComparison);
  const usualNorm = usualWords.map(normalizeForComparison);

  // Rule A: usual is identical to full name (all words match)
  if (usualNorm.length === fullNorm.length && usualNorm.every((w, i) => w === fullNorm[i])) {
    // Use first 2 words
    return fullWords.slice(0, 2).join(" ");
  }

  // Rule 7.5: full name has exactly 2 words
  if (fullWords.length === 2) {
    return fullWords.join(" ");
  }

  // Check if all usual words exist in full name
  const allUsualInFull = usualNorm.every((uw) => fullNorm.includes(uw));

  if (allUsualInFull) {
    // Rule B: usual words are subset of full name
    return `${fullWords[0]} ${fullWords[fullWords.length - 1]}`;
  }

  // Rule C: usual is an alias/nickname not in the full name
  const firstUsualNorm = usualNorm[0];

  // Check if nickname is a prefix of any full name word
  const prefixMatch = fullWords.find((fw) =>
    normalizeForComparison(fw).startsWith(firstUsualNorm) && normalizeForComparison(fw) !== firstUsualNorm
  );

  if (prefixMatch) {
    return `${prefixMatch} ${fullWords[fullWords.length - 1]}`;
  }

  // Check nickname dictionary
  const dictMatches = NICKNAME_TO_FULL_NAMES[firstUsualNorm];
  if (dictMatches) {
    // Find if any dict match corresponds to a word in the full name
    for (const dictName of dictMatches) {
      const dictNorm = normalizeForComparison(dictName);
      const found = fullWords.find((fw) => normalizeForComparison(fw) === dictNorm);
      if (found) {
        return `${found} ${fullWords[fullWords.length - 1]}`;
      }
    }
  }

  // Rule D: Fallback — first + last
  return `${fullWords[0]} ${fullWords[fullWords.length - 1]}`;
}

// --- Brazilian Name Aesthetics ---

const CONNECTORS = new Set(["de", "da", "do", "das", "dos", "e", "di"]);

function isConnector(word: string): boolean {
  return CONNECTORS.has(removeDiacritics(word).toLowerCase());
}

function isVowelCh(c: string): boolean {
  return "aeiou".includes(removeDiacritics(c).toLowerCase());
}

function isConsonantCh(c: string): boolean {
  const clean = removeDiacritics(c).toLowerCase();
  return /^[bcdfghjklmnpqrstvwxyz]$/.test(clean);
}

interface BrVariation {
  word: string;
  aesthetic: number; // 0 = original, 1 = classic BR style, 2 = stylised, 3 = last-resort
}

/**
 * Generate Brazilian-style spelling variations of a name. Rules curated to
 * match patterns that feel natural in Brazilian Portuguese (Matheus, Raphael,
 * Anna, Mayra, Karolina, Thiago) and avoid the "append h at the end" pattern
 * that produced awkward outputs. For surnames, only the most classic rules
 * are kept so the family identity stays intact.
 */
function generateBrazilianVariations(word: string, forSurname: boolean): BrVariation[] {
  const results: BrVariation[] = [{ word, aesthetic: 0 }];
  const lower = word.toLowerCase();
  const unDia = removeDiacritics(lower).replace(/ç/g, "c");
  const seen = new Set<string>([unDia]);

  const push = (variant: string, aesthetic: number) => {
    const norm = removeDiacritics(variant).toLowerCase().replace(/ç/g, "c");
    if (seen.has(norm)) return;
    seen.add(norm);
    results.push({
      word: variant.charAt(0).toUpperCase() + variant.slice(1),
      aesthetic,
    });
  };

  // Rule 1: double an internal consonant that sits between two vowels
  // (Ana → Anna, Lima → Limma, Juliana → Julianna)
  for (let i = 1; i < unDia.length - 1; i++) {
    if (
      isConsonantCh(unDia[i]) &&
      isVowelCh(unDia[i - 1]) &&
      isVowelCh(unDia[i + 1])
    ) {
      push(lower.slice(0, i + 1) + lower[i] + lower.slice(i + 1), 1);
    }
  }

  // Rule 2: insert 'h' after any 't' followed by a vowel
  // (Mateus → Matheus, Natália → Nathália, Tiago → Thiago)
  for (let i = 0; i < unDia.length - 1; i++) {
    if (unDia[i] === "t" && isVowelCh(unDia[i + 1])) {
      push(lower.slice(0, i + 1) + "h" + lower.slice(i + 1), 1);
    }
  }

  // Rule 3: replace 'f' with 'ph' at first occurrence
  // (Rafael → Raphael, Sofia → Sophia, Felipe → Phelipe)
  const fIdx = unDia.indexOf("f");
  if (fIdx >= 0) {
    push(lower.slice(0, fIdx) + "ph" + lower.slice(fIdx + 1), 1);
  }

  // Rule 4: initial 'c' + a/o/u → 'k'
  // (Carolina → Karolina, Caio → Kaio)
  if (unDia[0] === "c" && ["a", "o", "u"].includes(unDia[1])) {
    push("k" + lower.slice(1), 1);
  }

  // Rule 5: replace 'i' with 'y' after a consonant (non-initial)
  // (Maira → Mayra, Crístian → Crystian)
  for (let i = 1; i < unDia.length; i++) {
    if (unDia[i] === "i" && isConsonantCh(unDia[i - 1])) {
      push(lower.slice(0, i) + "y" + lower.slice(i + 1), 1);
    }
  }

  // Rule 6: replace first 'y' (non-initial) with 'i'
  // (Yan → Ian, Crystal → Cristal)
  const yIdx = unDia.indexOf("y", 1);
  if (yIdx > 0) {
    push(lower.slice(0, yIdx) + "i" + lower.slice(yIdx + 1), 1);
  }

  // Rule 7: insert 'h' after initial p/r/j + vowel (stylised — Phedro, Rhafael, Jhoão)
  if (["p", "r", "j"].includes(unDia[0]) && isVowelCh(unDia[1])) {
    push(lower[0] + "h" + lower.slice(1), 2);
  }

  // Rule 8 (last resort): double the last letter so names with no natural
  // variations still have at least one candidate.
  push(lower + lower[lower.length - 1], 3);

  if (forSurname) {
    return results.filter((v) => v.aesthetic <= 1);
  }
  return results;
}

function determineGivenWord(fullWords: string[], normalUsual: string): string {
  const usualFirst = wordsOf(normalUsual)[0] ?? "";
  const usualNorm = removeDiacritics(usualFirst).toLowerCase();

  const nonConnector = (w: string) => !isConnector(w);
  const norm = (w: string) => removeDiacritics(w).toLowerCase();

  // Exact word match in full
  const exact = fullWords.find((w) => nonConnector(w) && norm(w) === usualNorm);
  if (exact) return exact;

  // Prefix match (usual is shorter form of a word in full)
  const prefix = fullWords.find(
    (w) => nonConnector(w) && norm(w).startsWith(usualNorm) && norm(w) !== usualNorm
  );
  if (prefix) return prefix;

  // Nickname dictionary
  const dictMatches = NICKNAME_TO_FULL_NAMES[usualNorm];
  if (dictMatches) {
    for (const dictName of dictMatches) {
      const dictNorm = removeDiacritics(dictName).toLowerCase();
      const found = fullWords.find((w) => nonConnector(w) && norm(w) === dictNorm);
      if (found) return found;
    }
  }

  // Fallback: first non-connector word
  return fullWords.find(nonConnector) ?? fullWords[0];
}

function determineSurname(fullWords: string[]): string {
  for (let i = fullWords.length - 1; i >= 0; i--) {
    if (!isConnector(fullWords[i])) return fullWords[i];
  }
  return fullWords[fullWords.length - 1] ?? "";
}

export interface NumerologyResult {
  nomeCompleto: string;
  nomeUsual: string;
  nomeCalculado: string;
  piramideOriginal: number[][];
  sequenciasEncontradas: SequenceOccurrence[];
  scoreOriginal: number;
  nomeFinal: string;
  piramideFinal: number[][];
  scoreFinal: number;
  sequenciasFinal: SequenceOccurrence[];
}

export function analyze(nomeCompleto: string, nomeUsual: string): NumerologyResult {
  const normalFull = normalizeName(nomeCompleto);
  const normalUsual = normalizeName(nomeUsual);

  // The pyramid is always built from the full name entered by the user.
  const nomeCalculado = normalFull;

  const piramideOriginal = buildPyramid(nomeCalculado);
  const naturalSequences = detectSequences(piramideOriginal);
  const hasNaturalNegative = naturalSequences.some(
    (s) => s.classificacao === "negativa" || s.classificacao === "separacao"
  );
  const sequenciasEncontradas = hasNaturalNegative
    ? naturalSequences
    : [...naturalSequences, buildSyntheticNegative(piramideOriginal)];
  const scoreOriginal = calculateScore(sequenciasEncontradas);

  // Final structure is strict: [primeiro nome] + [um único sobrenome].
  // Primeiro nome comes from the word the person uses (nomeUsual) when it
  // can be matched in the full name; otherwise the first non-connector word.
  // Sobrenome is always the last non-connector word of the full name, so we
  // never output two surnames side by side.
  const fullWords = wordsOf(nomeCalculado);
  const givenBase = determineGivenWord(fullWords, normalUsual);
  const surnameBase = determineSurname(fullWords);

  const usualNorm = normalizeForComparison(normalUsual);
  const fullNorm = normalizeForComparison(normalFull);
  const givenNorm = normalizeForComparison(givenBase);

  const givenVariations = generateBrazilianVariations(givenBase, false);
  const surnameVariationsRaw =
    givenNorm === normalizeForComparison(surnameBase)
      ? generateBrazilianVariations(surnameBase, false)
      : generateBrazilianVariations(surnameBase, true);
  // Guarantee the two slots can't collapse into the same word.
  const surnameVariations = surnameVariationsRaw.filter(
    (s) => normalizeForComparison(s.word) !== givenNorm
  );

  type Scored = {
    name: string;
    firstAesthetic: number;
    surnameAesthetic: number;
    pyramid: number[][];
    seqs: SequenceOccurrence[];
    score: number;
    length: number;
  };

  const scored: Scored[] = [];
  for (const g of givenVariations) {
    for (const s of surnameVariations) {
      if (normalizeForComparison(g.word) === normalizeForComparison(s.word)) continue;
      const name = `${g.word} ${s.word}`;
      const nameNorm = normalizeForComparison(name);
      if (nameNorm === usualNorm || nameNorm === fullNorm) continue;
      const pyr = buildPyramid(name);
      const seqs = detectSequences(pyr);
      scored.push({
        name,
        firstAesthetic: g.aesthetic,
        surnameAesthetic: s.aesthetic,
        pyramid: pyr,
        seqs,
        score: calculateScore(seqs),
        length: name.replace(/\s/g, "").length,
      });
    }
  }

  // Weighted ranking:
  //  - base pyramid score (alignment is primary)
  //  - +2 per unit of surname mutation: surnames carry family identity and
  //    should stay pristine unless the alignment payoff is large
  //  - +2 for a tier-3 fallback on the given name (avoid "Isabelaa" unless
  //    no tier-1 first-name variation can beat it)
  //  - tie-breaker: prefer lower first-name aesthetic (pristine/classic),
  //    then shorter name
  const weight = (c: Scored) =>
    c.score +
    2 * c.surnameAesthetic +
    (c.firstAesthetic >= 3 ? 2 : 0);

  scored.sort((a, b) => {
    const wa = weight(a);
    const wb = weight(b);
    if (wa !== wb) return wa - wb;
    if (a.firstAesthetic !== b.firstAesthetic)
      return a.firstAesthetic - b.firstAesthetic;
    return a.length - b.length;
  });

  let bestName: string;
  let bestPyramid: number[][];
  let bestSeqs: SequenceOccurrence[];

  if (scored.length > 0) {
    const pick = scored[0];
    bestName = pick.name;
    bestPyramid = pick.pyramid;
    bestSeqs = pick.seqs;
  } else {
    // Extreme fallback — double the last letter of the given name so the
    // final still differs from the original analyzed name.
    const forcedGiven = givenBase + givenBase.slice(-1).toLowerCase();
    const fallback = surnameBase
      ? `${forcedGiven} ${surnameBase}`
      : `${forcedGiven} ${givenBase}`;
    bestName = fallback;
    bestPyramid = buildPyramid(fallback);
    bestSeqs = detectSequences(bestPyramid);
  }

  // Defensive — should never trigger because the filters already exclude
  // these cases, but guarantee divergence from the full and usual names.
  const forceMutation = () => {
    const bw = wordsOf(bestName);
    bw[0] = bw[0] + bw[0].slice(-1).toLowerCase();
    bestName = bw.join(" ");
    bestPyramid = buildPyramid(bestName);
    bestSeqs = detectSequences(bestPyramid);
  };
  if (normalizeForComparison(bestName) === fullNorm) forceMutation();
  if (normalizeForComparison(bestName) === usualNorm) forceMutation();

  const bestScore = calculateScore(bestSeqs);

  return {
    nomeCompleto: normalFull,
    nomeUsual: normalUsual,
    nomeCalculado,
    piramideOriginal,
    sequenciasEncontradas,
    scoreOriginal,
    nomeFinal: bestName,
    piramideFinal: bestPyramid,
    scoreFinal: bestScore,
    sequenciasFinal: bestSeqs,
  };
}
