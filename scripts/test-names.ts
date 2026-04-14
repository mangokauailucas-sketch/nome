import { analyze } from "../src/lib/numerology";

// 50 most common Brazilian female given names (mix of classic and contemporary)
const FEMALE_NAMES = [
  "Maria", "Ana", "Francisca", "Antônia", "Adriana",
  "Juliana", "Márcia", "Fernanda", "Patrícia", "Aline",
  "Sandra", "Camila", "Amanda", "Bruna", "Jéssica",
  "Letícia", "Júlia", "Luciana", "Vanessa", "Mariana",
  "Gabriela", "Vera", "Mônica", "Beatriz", "Daniela",
  "Andrea", "Rita", "Sônia", "Regina", "Isabel",
  "Cláudia", "Simone", "Renata", "Carla", "Elaine",
  "Eliane", "Luana", "Thais", "Larissa", "Natália",
  "Cristina", "Rafaela", "Carolina", "Rosângela", "Silvia",
  "Tatiane", "Paula", "Viviane", "Débora", "Isabela",
];

// Common Brazilian surnames — rotated to produce varied full names.
const SURNAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues",
  "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
  "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida",
  "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
  "Rocha", "Dias", "Mendes", "Nunes", "Cunha",
  "Araújo", "Cardoso", "Moreira", "Castro", "Monteiro",
];

// Some entries get a middle name or a connector to exercise the full-name
// pyramid path and the surname-detection logic.
const MIDDLES: (string | null)[] = [
  null, "Clara", null, "Paula", "Cristina",
  null, "Regina", "de", "Helena", null,
  null, "Beatriz", "Luiza", "dos", "Caroline",
  "Maria", null, null, "de", null,
  "Sofia", null, "da", "Antonia", "Carolina",
  null, "de Cássia", null, null, null,
  null, "dos", null, null, null,
  null, null, "da", null, null,
  null, null, "Emanuelle", null, null,
  null, null, null, "Cristina", null,
];

function pad(str: string, len: number): string {
  const s = str ?? "";
  return s.length >= len ? s.slice(0, len) : s + " ".repeat(len - s.length);
}

function main(): void {
  const col1 = 3;
  const col2 = 34;
  const col3 = 27;
  const col4 = 10;
  const col5 = 9;

  console.log();
  console.log("=== Teste: 50 nomes femininos brasileiros ===");
  console.log();
  console.log(
    pad("#", col1) + " | " +
      pad("Nome completo", col2) + " | " +
      pad("Nome alinhado", col3) + " | " +
      pad("Score o→f", col4) + " | " +
      pad("Base→Apex", col5)
  );
  console.log("-".repeat(col1 + col2 + col3 + col4 + col5 + 12));

  let pristineFirst = 0;
  let pristineSurname = 0;
  let improvedCount = 0;
  let sameScoreCount = 0;
  const aestheticBuckets = new Map<string, number>();

  FEMALE_NAMES.forEach((name, i) => {
    const surname = SURNAMES[i % SURNAMES.length];
    const middle = MIDDLES[i];
    const full = middle ? `${name} ${middle} ${surname}` : `${name} ${surname}`;
    const result = analyze(full, name);

    const [finalFirst, finalLast] = result.nomeFinal.split(" ");
    if (finalFirst?.toLowerCase() === name.toLowerCase()) pristineFirst++;
    if (finalLast?.toLowerCase() === surname.toLowerCase()) pristineSurname++;
    if (result.scoreFinal < result.scoreOriginal) improvedCount++;
    if (result.scoreFinal === result.scoreOriginal) sameScoreCount++;

    const mutationType = detectMutationType(name, surname, finalFirst, finalLast);
    aestheticBuckets.set(mutationType, (aestheticBuckets.get(mutationType) ?? 0) + 1);

    const base = result.piramideOriginal[0].length;
    const apex = result.piramideFinal[result.piramideFinal.length - 1][0];
    console.log(
      pad(String(i + 1), col1) + " | " +
        pad(full, col2) + " | " +
        pad(result.nomeFinal, col3) + " | " +
        pad(`${result.scoreOriginal}→${result.scoreFinal}`, col4) + " | " +
        pad(`${base}→${apex}`, col5)
    );
  });

  console.log();
  console.log("=== Resumo ===");
  console.log(`  Primeiro nome preservado sem mutação: ${pristineFirst}/50`);
  console.log(`  Sobrenome preservado sem mutação:     ${pristineSurname}/50`);
  console.log(`  Score reduzido pelo alinhamento:      ${improvedCount}/50`);
  console.log(`  Score inalterado (já em 0):           ${sameScoreCount}/50`);
  console.log();
  console.log("  Distribuição de mutações aplicadas:");
  const sorted = [...aestheticBuckets.entries()].sort((a, b) => b[1] - a[1]);
  for (const [key, count] of sorted) {
    console.log(`    ${pad(key, 26)} ${count}`);
  }
}

function detectMutationType(
  origFirst: string,
  origSurname: string,
  finalFirst: string | undefined,
  finalLast: string | undefined
): string {
  if (!finalFirst || !finalLast) return "indefinida";
  const firstChanged = finalFirst.toLowerCase() !== origFirst.toLowerCase();
  const lastChanged = finalLast.toLowerCase() !== origSurname.toLowerCase();
  if (!firstChanged && !lastChanged) return "nenhuma (pair novo)";
  if (firstChanged && !lastChanged) return "primeiro nome apenas";
  if (!firstChanged && lastChanged) return "sobrenome apenas";
  return "ambos modificados";
}

main();
