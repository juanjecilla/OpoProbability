import type { FieldIssue } from '../lib/fields.js';

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
  htmlTitle: 'OpoProbabilidad · calculadora hipergeométrica de examen',
  metaDescription:
    'Introduce la forma de tu examen y cuánto has estudiado: la probabilidad exacta de que el sorteo te deje temas que puedes desarrollar, sin reemplazo y con el desarrollo hipergeométrico paso a paso.',
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
  fieldPreparedFromMap: 'Se cuenta a partir de tus temas marcados.',

  topicsTitle: 'Tus temas',
  topicsSummaryRandom: 'Estudiados al azar',
  topicsSummaryMap: '{P} de {N} marcados',
  topicsSourceLabel: 'Origen de los temas estudiados',
  topicsSourceRandom: 'Al azar',
  topicsSourceMap: 'Mis temas',
  topicsRandomNote:
    'Cada sesión elige al azar {P} temas como estudiados. Pasa a «Mis temas» para marcar los tuyos y hacer el sorteo de verdad.',
  topicsRandomNoteUnknown:
    'Cada sesión elige al azar qué temas cuentan como estudiados. Pasa a «Mis temas» para marcar los tuyos.',
  topicsNeedN: 'Corrige el número de temas (N) para poder marcar los tuyos.',
  topicsSeedHint:
    'Hemos marcado los temas 1–{P} para empezar. Ajusta la selección a los temas que de verdad dominas.',
  topicsCounterAria: 'Temas estudiados: {P} de {N}',
  topicsAll: 'Todos',
  topicsNone: 'Ninguno',
  topicsInvert: 'Invertir',
  topicsRangeLabel: 'Marcar por rango',
  topicsRangeHint: 'Ej.: 1-20, 35, 40-45',
  topicsRangeMark: 'Marcar',
  topicsRangeUnmark: 'Desmarcar',
  topicsRangeSyntax: 'Escribe números o rangos separados por comas, como 1-20, 35.',
  topicsRangeReversed: 'Un rango va de menor a mayor, por ejemplo 5-9.',
  topicsRangeOut: 'Los temas van del 1 al {N}.',
  topicsGridLabel: 'Temas del temario: pulsa para marcar los estudiados',
  topicChipAria: 'Tema {n}',
  topicsTooMany:
    'Con más de {max} temas no se muestra la cuadrícula: usa el rango, o Todos / Ninguno / Invertir.',
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
  inverseCustomOption: 'Personalizado',
  inverseCustomLabel: 'Objetivo personalizado, en tanto por ciento',
  inverseCustomInvalid: 'Introduce un número entero entre 1 y 99.',
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

  simNavLink: 'Simulacro de sorteo',
  calcNavLink: 'Calculadora',
  simCtaTitle: 'Ponlo a prueba',
  simCtaQuietLead: '¿Prefieres verlo en vivo?',
  simCtaQuietRandom: 'Simula un sorteo al azar',
  simCtaQuietMap: 'Simula un sorteo con tus temas',
  simCtaResultTitle: 'Con {rate} de éxito: pruébalo en 100 sorteos',
  simCtaResultHint: 'Lanzamos 100 sorteos de golpe y los comparamos con la probabilidad calculada.',
  simCtaResultButton: 'Simular 100 sorteos →',
  simHtmlTitle: 'Simulacro de sorteo · OpoProbabilidad',
  simMetaDescription:
    'Simula el sorteo de temas de tu examen: rondas al azar con tus cifras, historial de sesiones y comparación con la probabilidad exacta.',
  simAppTitle: 'OpoProbabilidad, simulacro de sorteo',
  simTagline: 'Simulacro de sorteo',
  simSubtitle:
    'Saca bolas al azar con la forma de tu examen y comprueba cuántas veces el sorteo te deja temas que sabes.',

  simConfigSection: 'Tu examen',
  simConfigSummary:
    '{N} temas · {k} sorteados · mín {d} · {unstudied} sin estudiar ({P} estudiados)',
  simConfigEdit: 'Ajustar cifras',
  simConfigInvalid: 'Corrige las cifras para poder sortear.',
  simBackToCalc: 'Abrir en la calculadora',

  simDrawSection: 'El bombo',
  simDraw: 'Sortear',
  simDrawTen: '×10',
  simDrawHundred: '×100',
  simDrawTenAria: 'Sortear 10 rondas',
  simDrawHundredAria: 'Sortear 100 rondas',
  simDrawing: 'Sorteando…',
  simDrumLabel: 'Bombo del sorteo',
  simStudiedLegend: 'Estudiado',
  simUnstudiedLegend: 'Sin estudiar',
  simBallAria: 'Tema {n}, {state}',
  simStateStudied: 'estudiado',
  simStateUnstudied: 'sin estudiar',

  simTallyRounds: 'Rondas',
  simTallySuccess: 'Éxitos',
  simTallyFailure: 'Fracasos',
  simTallyWipeout: 'Pleno de fracaso',
  simTallyObserved: 'Observado',
  simTallyExpected: 'Calculado',
  simTallyEmpty: 'Todavía no hay rondas.',

  simOutcomeSuccess: 'Éxito',
  simOutcomeFailure: 'Fracaso',
  simOutcomeWipeout: 'Pleno de fracaso',
  simOutcomeSuccessDetail: 'Puedes desarrollar {n} de {k}.',
  simOutcomeFailureDetail: 'Solo {n} de {k}: necesitabas {d}.',
  simOutcomeWipeoutDetail: 'Los {k} sorteados eran temas sin estudiar.',
  simAnnounce: 'Ronda {id}: {outcome}',

  simRoundsSection: 'Rondas de esta sesión',
  simRoundsNewestFirst: 'La más reciente arriba. Se guardan las últimas {max}.',
  simRoundLabel: 'Ronda {id}',

  simSessionsSection: 'Sesiones guardadas',
  simSessionsLead: 'Cada cambio de cifras abre una sesión nueva. Se guardan las últimas {max}.',
  simSessionsEmpty: 'Aún no hay sesiones guardadas.',
  simSessionCurrent: 'En curso',
  simSessionSummary: '{rounds} rondas · {rate} de éxito',
  simSessionConfig: '{N} · {k} · mín {d} · {P} estudiados',
  simSessionResume: 'Retomar',
  simSessionResumeBlocked: 'Tus temas han cambiado desde esta sesión, así que no se puede retomar.',
  simSessionSourceRandom: 'Temas al azar',
  simSessionSourceMap: 'Mis temas',
  simSessionDelete: 'Borrar',
  simSessionsClear: 'Borrar todo el historial',
  simSessionStudied: 'Temas estudiados: {list}',

  simConfirmCancel: 'Cancelar',
  simConfirmDeleteTitle: '¿Borrar esta sesión?',
  simConfirmDeleteBody: 'Se perderán sus {rounds} rondas. No se puede deshacer.',
  simConfirmClearTitle: '¿Borrar todo el historial?',
  simConfirmClearBody: 'Se perderán {sessions} sesiones guardadas. No se puede deshacer.',
  simConfirmAction: 'Borrar',

  simAnimSettings: 'Animaciones',
  simAnimLevel: 'Nivel',
  simAnimFull: 'Completo',
  simAnimLight: 'Ligero',
  simAnimOff: 'Sin animación',
  simAnimConfetti: 'Confeti en los éxitos',
  simAnimShake: 'Sacudida en el pleno de fracaso',
  simAnimReduced: 'Tu sistema pide menos movimiento: las animaciones empiezan desactivadas.',

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
  htmlTitle: 'OpoProbabilidad · hypergeometric exam calculator',
  metaDescription:
    "Enter your exam's shape and how much you've studied: the exact probability that the draw leaves you topics you can develop, without replacement and with the step-by-step hypergeometric working.",
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
  fieldPreparedFromMap: 'Counted from your marked topics.',

  topicsTitle: 'Your topics',
  topicsSummaryRandom: 'Studied at random',
  topicsSummaryMap: '{P} of {N} marked',
  topicsSourceLabel: 'Where studied topics come from',
  topicsSourceRandom: 'Random',
  topicsSourceMap: 'My topics',
  topicsRandomNote:
    'Each session picks {P} topics at random as studied. Switch to “My topics” to mark your own and make the draw real.',
  topicsRandomNoteUnknown:
    'Each session picks at random which topics count as studied. Switch to “My topics” to mark your own.',
  topicsNeedN: 'Fix the number of topics (N) to be able to mark yours.',
  topicsSeedHint:
    'We marked topics 1–{P} to start. Adjust the selection to the topics you genuinely know.',
  topicsCounterAria: 'Topics studied: {P} of {N}',
  topicsAll: 'All',
  topicsNone: 'None',
  topicsInvert: 'Invert',
  topicsRangeLabel: 'Mark by range',
  topicsRangeHint: 'E.g. 1-20, 35, 40-45',
  topicsRangeMark: 'Mark',
  topicsRangeUnmark: 'Unmark',
  topicsRangeSyntax: 'Enter numbers or ranges separated by commas, like 1-20, 35.',
  topicsRangeReversed: 'A range runs low to high, for example 5-9.',
  topicsRangeOut: 'Topics run from 1 to {N}.',
  topicsGridLabel: 'Syllabus topics: press to mark the ones you studied',
  topicChipAria: 'Topic {n}',
  topicsTooMany:
    'Above {max} topics the grid is not shown: use the range box, or All / None / Invert.',
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
  inverseCustomOption: 'Custom',
  inverseCustomLabel: 'Custom target, as a percentage',
  inverseCustomInvalid: 'Enter a whole number between 1 and 99.',
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

  simNavLink: 'Draw simulator',
  calcNavLink: 'Calculator',
  simCtaTitle: 'Put it to the test',
  simCtaQuietLead: 'Rather see it happen?',
  simCtaQuietRandom: 'Simulate a random draw',
  simCtaQuietMap: 'Simulate a draw with your topics',
  simCtaResultTitle: 'At {rate} success: test it over 100 draws',
  simCtaResultHint: 'We run 100 draws at once and compare them with the calculated probability.',
  simCtaResultButton: 'Simulate 100 draws →',
  simHtmlTitle: 'Draw simulator · OpoProbabilidad',
  simMetaDescription:
    'Simulate your exam topic draw: random rounds with your numbers, a history of sessions and a comparison with the exact probability.',
  simAppTitle: 'OpoProbabilidad, draw simulator',
  simTagline: 'Draw simulator',
  simSubtitle:
    'Pull balls at random with your exam shape and see how often the draw leaves you topics you know.',

  simConfigSection: 'Your exam',
  simConfigSummary: '{N} topics · {k} drawn · min {d} · {unstudied} unstudied ({P} studied)',
  simConfigEdit: 'Adjust numbers',
  simConfigInvalid: 'Fix the numbers to be able to draw.',
  simBackToCalc: 'Open in the calculator',

  simDrawSection: 'The drum',
  simDraw: 'Draw',
  simDrawTen: '×10',
  simDrawHundred: '×100',
  simDrawTenAria: 'Draw 10 rounds',
  simDrawHundredAria: 'Draw 100 rounds',
  simDrawing: 'Drawing…',
  simDrumLabel: 'Draw drum',
  simStudiedLegend: 'Studied',
  simUnstudiedLegend: 'Unstudied',
  simBallAria: 'Topic {n}, {state}',
  simStateStudied: 'studied',
  simStateUnstudied: 'unstudied',

  simTallyRounds: 'Rounds',
  simTallySuccess: 'Successes',
  simTallyFailure: 'Failures',
  simTallyWipeout: 'Wipeouts',
  simTallyObserved: 'Observed',
  simTallyExpected: 'Calculated',
  simTallyEmpty: 'No rounds yet.',

  simOutcomeSuccess: 'Success',
  simOutcomeFailure: 'Failure',
  simOutcomeWipeout: 'Wipeout',
  simOutcomeSuccessDetail: 'You can develop {n} of {k}.',
  simOutcomeFailureDetail: 'Only {n} of {k}: you needed {d}.',
  simOutcomeWipeoutDetail: 'All {k} drawn topics were unstudied.',
  simAnnounce: 'Round {id}: {outcome}',

  simRoundsSection: 'Rounds this session',
  simRoundsNewestFirst: 'Newest on top. The last {max} are kept.',
  simRoundLabel: 'Round {id}',

  simSessionsSection: 'Saved sessions',
  simSessionsLead: 'Changing the numbers opens a new session. The last {max} are kept.',
  simSessionsEmpty: 'No saved sessions yet.',
  simSessionCurrent: 'Current',
  simSessionSummary: '{rounds} rounds · {rate} success',
  simSessionConfig: '{N} · {k} · min {d} · {P} studied',
  simSessionResume: 'Resume',
  simSessionResumeBlocked: 'Your topics changed since this session, so it cannot be resumed.',
  simSessionSourceRandom: 'Random topics',
  simSessionSourceMap: 'My topics',
  simSessionDelete: 'Delete',
  simSessionsClear: 'Clear all history',
  simSessionStudied: 'Studied topics: {list}',

  simConfirmCancel: 'Cancel',
  simConfirmDeleteTitle: 'Delete this session?',
  simConfirmDeleteBody: 'Its {rounds} rounds will be lost. This cannot be undone.',
  simConfirmClearTitle: 'Clear all history?',
  simConfirmClearBody: '{sessions} saved sessions will be lost. This cannot be undone.',
  simConfirmAction: 'Delete',

  simAnimSettings: 'Animations',
  simAnimLevel: 'Level',
  simAnimFull: 'Full',
  simAnimLight: 'Light',
  simAnimOff: 'Off',
  simAnimConfetti: 'Confetti on successes',
  simAnimShake: 'Shake on wipeouts',
  simAnimReduced: 'Your system asks for less motion: animations start switched off.',

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
