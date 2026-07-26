import type { FieldIssue } from '../lib/fields';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

/** Shown as-is in both languages: it is the name of the thing, not a word. */
export const productName = { prefix: 'Opo', suffix: 'Probabilidad' } as const;

/**
 * The Spanish dictionary is the source of truth for the shape; `Translation`
 * is derived from it so a missing key in English is a compile error.
 */
const es = {
  appTitle: 'OpoProbabilidad, calculadora hipergeométrica de examen',
  tagline: 'Calculadora hipergeométrica de examen',
  subtitle:
    'Introduce la forma de tu examen y cuánto has estudiado. La calculadora da la probabilidad exacta de que un sorteo aleatorio te permita desarrollar al menos los temas que necesitas — sin reemplazo, solo números enteros.',

  themeToggle: 'Cambiar a modo {mode}',
  themeLight: 'claro',
  themeDark: 'oscuro',
  languageLabel: 'Idioma',

  inputsTitle: 'El examen',
  inputsSub: 'Rellena las cuatro cifras siguientes.',
  presets: 'Exámenes comunes',
  presetOption: '{N} · {k} · mín {d}',
  presetHint: 'Los presets solo rellenan los campos: compruébalos con tu convocatoria.',
  reset: 'Volver al ejemplo',

  fieldTopics: 'Temas totales',
  fieldTopicsHint: 'Todo el temario — las bolas del bombo.',
  fieldDraw: 'Temas sorteados',
  fieldDrawHint: 'Cuántos temas saca el tribunal al azar.',
  fieldPrepared: 'Temas estudiados',
  fieldPreparedHint: 'Los temas que realmente sabes y puedes desarrollar.',
  fieldRequired: 'Mínimo necesario',
  fieldRequiredHint: 'Cuántos de los temas sorteados debes poder desarrollar.',
  decrease: 'Reducir {field}',
  increase: 'Aumentar {field}',

  resultSection: 'El veredicto',
  resultLabel: 'Probabilidad de éxito',
  resultSub:
    'Probabilidad de que el sorteo te dé al menos el mínimo de temas que puedes desarrollar.',
  resultAria: '{risk}, {value}',
  resultEmpty: 'Introduce valores válidos',
  riskVeryHigh: 'Muy probable',
  riskHigh: 'Probable',
  riskEven: 'A cara o cruz',
  riskLow: 'Arriesgado',
  riskVeryLow: 'Improbable',
  marginalGain: 'El siguiente tema que prepares suma {gain}.',
  marginalGainNone: 'Ya llevas el temario completo.',

  progressSection: 'Cómo se mueve la probabilidad',
  chartTitle: 'Rendimientos decrecientes',
  chartAxis: 'temas estudiados →',
  chartSub: 'Cada tema extra que preparas suma menos que el anterior.',
  chartAria:
    'Gráfico de líneas de la probabilidad de éxito según los temas estudiados, de 0 a {N}.',
  chartTarget: 'Objetivo',
  tableTitle: 'La probabilidad, tabulada',
  tableSub: 'Probabilidad de éxito según lo estudiado. Tu valor actual está resaltado.',
  thStudied: 'Estudiados',
  thProbability: 'P(éxito)',

  inverseTitle: '¿Cuántos temas necesito?',
  inverseTargetLabel: 'Objetivo de confianza',
  inverseAnswer: 'Necesitas {needed} de {total} temas.',
  inverseSlack: 'Te puedes permitir dejar {count} sin tocar.',
  inverseSlackNone: 'No te sobra ninguno: hace falta el temario entero.',
  inverseImpossible: 'Ese objetivo no se alcanza ni con el temario completo.',
  inverseAlreadyThere: 'Con {prepared} temas ya lo has superado.',
  inverseMissing: 'Te faltan {count} temas para llegar.',

  workingSection: 'El desarrollo',
  workedTitle: 'Las matemáticas, paso a paso',
  workedIntroComplement:
    'Lo más corto es contar los sorteos que te hunden y restar. Un fallo es un sorteo con menos temas preparados que el mínimo necesario.',
  workedIntroDirect:
    'Se suman los sorteos que te salvan: aquellos con al menos el mínimo de temas preparados.',
  workedNotBinomial:
    'No es una binomial: al no haber reemplazo, las extracciones no son independientes.',
  workedTotal: 'Sorteos posibles',
  workedTerm: 'X = {i}',
  workedResult: 'P(éxito)',
  outcomeTitle: 'Desglose completo de resultados',
  thOutcome: 'Preparados sorteados (i)',
  thWays: 'Casos',
  thExactly: 'P(X = i)',
  thCumulative: 'P(X ≥ i)',
  outcomeNote:
    'X = número de tus temas preparados entre los sorteados. Las filas iguales o superiores al mínimo necesario cuentan como éxito.',
  generalFormula: 'Fórmula general',

  supportTitle: 'Apoya este proyecto',
  supportSub:
    'Esta calculadora es gratuita y de código abierto. Si te ha quitado algo de agobio, un café ayuda a mantenerla.',
  supportAria: '{name} (se abre en una pestaña nueva)',
  footNote: 'hecho para opositores',
  footStack: 'sin rastreo',

  issue: {
    notAnInteger: 'Introduce un número entero.',
    topicsTooFew: 'Introduce un entero de 1 o más.',
    drawTooFew: 'Al menos 1 tema sorteado.',
    drawExceedsTopics: 'Entre 1 y los temas totales.',
    discardsNegative: 'Entre 1 y los temas sorteados.',
    discardsExceedDraw: 'Entre 1 y los temas sorteados.',
    preparedNegative: 'Entre 0 y los temas totales.',
    preparedExceedsTopics: 'Entre 0 y los temas totales.',
  } satisfies Record<FieldIssue, string>,
};

export type Translation = typeof es;

const en: Translation = {
  appTitle: 'OpoProbabilidad, hypergeometric exam calculator',
  tagline: 'Hypergeometric exam calculator',
  subtitle:
    "Enter your exam's shape and how much you've studied. The calculator gives the exact probability that a random draw lets you develop at least the topics you need — no replacement, whole numbers only.",

  themeToggle: 'Switch to {mode} mode',
  themeLight: 'light',
  themeDark: 'dark',
  languageLabel: 'Language',

  inputsTitle: 'The exam',
  inputsSub: 'Fill in the four figures below.',
  presets: 'Common exams',
  presetOption: '{N} · {k} · min {d}',
  presetHint: 'Presets only fill the fields in: check them against your official call.',
  reset: 'Reset to example',

  fieldTopics: 'Total topics',
  fieldTopicsHint: 'Everything in the syllabus — the balls in the drum.',
  fieldDraw: 'Topics drawn',
  fieldDrawHint: 'How many topics the board pulls out at random.',
  fieldPrepared: 'Topics studied',
  fieldPreparedHint: 'The topics you genuinely know and can develop.',
  fieldRequired: 'Minimum needed',
  fieldRequiredHint: 'How many of the drawn topics you must be able to write about.',
  decrease: 'Decrease {field}',
  increase: 'Increase {field}',

  resultSection: 'The verdict',
  resultLabel: 'Probability of success',
  resultSub: 'Chance the draw gives you at least the minimum topics you can develop.',
  resultAria: '{risk}, {value}',
  resultEmpty: 'Enter valid values',
  riskVeryHigh: 'Very likely',
  riskHigh: 'Likely',
  riskEven: 'Coin toss',
  riskLow: 'Risky',
  riskVeryLow: 'Unlikely',
  marginalGain: 'The next topic you prepare adds {gain}.',
  marginalGainNone: 'You already cover the whole syllabus.',

  progressSection: 'How the odds move',
  chartTitle: 'Diminishing returns',
  chartAxis: 'topics studied →',
  chartSub: 'Each extra topic you prepare adds less than the one before.',
  chartAria: 'Line chart of success probability by number of topics studied, from 0 to {N}.',
  chartTarget: 'Target',
  tableTitle: 'The odds, tabulated',
  tableSub: 'Success probability at different amounts studied. Your current value is highlighted.',
  thStudied: 'Studied',
  thProbability: 'P(success)',

  inverseTitle: 'How many topics do I need?',
  inverseTargetLabel: 'Confidence target',
  inverseAnswer: 'You need {needed} of {total} topics.',
  inverseSlack: 'You can afford to skip {count} of them.',
  inverseSlackNone: 'No slack at all: the whole syllabus is required.',
  inverseImpossible: 'That target is out of reach even with the whole syllabus.',
  inverseAlreadyThere: 'With {prepared} topics you are already past it.',
  inverseMissing: 'You are {count} topics short.',

  workingSection: 'The working',
  workedTitle: 'The maths, step by step',
  workedIntroComplement:
    "It's shortest to count the draws that sink you and subtract. A failure is a draw with fewer than the minimum needed prepared topics.",
  workedIntroDirect:
    'Add up the draws that save you: the ones holding at least the minimum needed prepared topics.',
  workedNotBinomial: 'It is not a binomial: without replacement, the draws are not independent.',
  workedTotal: 'Total possible draws',
  workedTerm: 'X = {i}',
  workedResult: 'P(success)',
  outcomeTitle: 'Full outcome breakdown',
  thOutcome: 'Prepared drawn (i)',
  thWays: 'Ways',
  thExactly: 'P(X = i)',
  thCumulative: 'P(X ≥ i)',
  outcomeNote:
    'X = number of your prepared topics among those drawn. Rows at or above the minimum needed count as success.',
  generalFormula: 'General formula',

  supportTitle: 'Support this project',
  supportSub:
    'This calculator is free and open source. If it saved you some worry, a coffee keeps it maintained.',
  supportAria: '{name} (opens in a new tab)',
  footNote: 'made for oposición candidates',
  footStack: 'no tracking',

  issue: {
    notAnInteger: 'Enter a whole number.',
    topicsTooFew: 'Enter a whole number of 1 or more.',
    drawTooFew: 'At least 1 topic drawn.',
    drawExceedsTopics: 'Between 1 and total topics.',
    discardsNegative: 'Between 1 and topics drawn.',
    discardsExceedDraw: 'Between 1 and topics drawn.',
    preparedNegative: 'Between 0 and total topics.',
    preparedExceedsTopics: 'Between 0 and total topics.',
  },
};

export const translations: Record<Locale, Translation> = { es, en };

/** Locale used by `Intl` for numbers and percentages. */
export const intlLocales: Record<Locale, string> = {
  es: 'es-ES',
  en: 'en-GB',
};

/** Picks the best supported locale from the browser's preferences. */
export function detectLocale(): Locale {
  const preferred = navigator.languages ?? [navigator.language];
  for (const tag of preferred) {
    const base = tag.split('-')[0]?.toLowerCase();
    const match = locales.find((locale) => locale === base);
    if (match) return match;
  }
  return 'es';
}
