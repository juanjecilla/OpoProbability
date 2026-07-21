import type { ValidationIssue } from '../lib/hypergeometric';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

/**
 * The Spanish dictionary is the source of truth for the shape; `Translation`
 * is derived from it so a missing key in English is a compile error.
 */
const es = {
  appTitle: 'Calculadora de probabilidad de oposiciones',
  appSubtitle:
    'Cuánta probabilidad tienes de que el sorteo te deje temas que sí llevas preparados.',

  themeToggle: 'Cambiar a modo {mode}',
  themeLight: 'claro',
  themeDark: 'oscuro',
  languageLabel: 'Idioma',

  setupTitle: 'Tu oposición',
  presetLabel: 'Configuración habitual',
  presetCustom: 'Personalizada',
  presetOption: '{N} temas · salen {k} · descartas {discards}',
  presetHint: 'Los presets solo rellenan los campos: compruébalos con tu convocatoria.',

  fieldTopics: 'Temas del temario',
  fieldTopicsHint: 'Cuántas bolas hay en el bombo.',
  fieldDraw: 'Temas que salen',
  fieldDrawHint: 'Cuántas bolas extrae el tribunal.',
  fieldDiscards: 'Temas que descartas',
  fieldDiscardsHint: 'De los que salen, cuántos puedes rechazar.',
  fieldPrepared: 'Temas que llevas preparados',
  fieldPreparedHint: 'Los que dominas de verdad, no los que has leído una vez.',

  developSummary: 'Tienes que desarrollar {count} de los {drawn} temas que salgan.',
  unpreparedSummary: 'Dejas {count} temas sin preparar.',

  resultTitle: 'Probabilidad de éxito',
  resultAria: 'Probabilidad de poder desarrollar los temas exigidos',
  marginalGain: 'El siguiente tema que prepares suma {gain}.',
  marginalGainNone: 'Ya llevas el temario completo.',

  inverseTitle: '¿Cuántos temas necesito?',
  inverseTargetLabel: 'Objetivo de confianza',
  inverseAnswer: 'Necesitas {needed} de {total} temas.',
  inverseSlack: 'Te puedes permitir dejar {count} sin tocar.',
  inverseSlackNone: 'No te sobra ninguno: hace falta el temario entero.',
  inverseImpossible: 'Ese objetivo no se alcanza ni con el temario completo.',
  inverseAlreadyThere: 'Con {prepared} temas ya lo has superado.',
  inverseMissing: 'Te faltan {count} temas para llegar.',

  chartTitle: 'Rendimiento de cada tema',
  chartCaption:
    'La curva se aplana: los últimos temas cuestan lo mismo y aportan mucho menos que los primeros.',
  chartAxisX: 'Temas preparados',
  chartAxisY: 'Probabilidad',
  chartYou: 'Estás aquí',
  chartTarget: 'Objetivo',

  derivationToggle: 'Ver el desarrollo matemático',
  derivationIntro:
    'El sorteo extrae bolas sin devolverlas al bombo, así que el número de temas tuyos que salen sigue una distribución hipergeométrica.',
  derivationWhyNotBinomial:
    'No es una binomial: al no haber reemplazo, las extracciones no son independientes.',
  derivationTotalTitle: '1. Sorteos posibles',
  derivationTotalBody: 'Formas de elegir {k} temas entre {N}:',
  derivationFailureTitle: '2. Sorteos que te hunden',
  derivationFailureBody:
    'Fallas si salen menos de {d} temas tuyos. Cada caso se cuenta eligiendo {i} de tus {prepared} preparados y el resto entre los {unprepared} que no llevas:',
  derivationSuccessTitle: '2. Sorteos que te salvan',
  derivationSuccessBody:
    'Aciertas si salen al menos {d} temas tuyos. Cada caso se cuenta eligiendo {i} de tus {prepared} preparados y el resto entre los {unprepared} que no llevas:',
  derivationTermLabel: 'Salen {i} temas tuyos',
  derivationTermLabelOne: 'Sale 1 tema tuyo',
  derivationResultTitle: '3. Resultado',
  derivationComplementBody: 'Se resta del total la probabilidad de fallar:',
  derivationDirectBody: 'Se suman los casos favorables:',
  derivationGeneralFormula: 'Fórmula general',

  errorsTitle: 'Revisa los datos',

  footerSource: 'Código y explicación matemática en GitHub',

  issue: {
    topicsTooFew: 'El temario debe tener al menos 1 tema.',
    drawTooFew: 'El tribunal debe extraer al menos 1 bola.',
    drawExceedsTopics: 'No se pueden extraer más bolas que temas hay en el temario.',
    discardsNegative: 'Los descartes no pueden ser negativos.',
    discardsExceedDraw: 'Tienes que desarrollar al menos un tema: descarta menos bolas.',
    preparedNegative: 'Los temas preparados deben ser un número entero positivo.',
    preparedExceedsTopics: 'No puedes preparar más temas de los que tiene el temario.',
  } satisfies Record<ValidationIssue, string>,
};

export type Translation = typeof es;

const en: Translation = {
  appTitle: 'Competitive exam probability calculator',
  appSubtitle: 'How likely the draw is to hand you topics you have actually prepared.',

  themeToggle: 'Switch to {mode} mode',
  themeLight: 'light',
  themeDark: 'dark',
  languageLabel: 'Language',

  setupTitle: 'Your exam',
  presetLabel: 'Common setups',
  presetCustom: 'Custom',
  presetOption: '{N} topics · {k} drawn · {discards} discarded',
  presetHint: 'Presets only fill the fields in: check them against your official call.',

  fieldTopics: 'Topics in the syllabus',
  fieldTopicsHint: 'How many balls are in the drum.',
  fieldDraw: 'Topics drawn',
  fieldDrawHint: 'How many balls the board pulls out.',
  fieldDiscards: 'Topics you discard',
  fieldDiscardsHint: 'Of those drawn, how many you may reject.',
  fieldPrepared: 'Topics you have prepared',
  fieldPreparedHint: 'The ones you truly know, not the ones you have read once.',

  developSummary: 'You must develop {count} of the {drawn} topics drawn.',
  unpreparedSummary: 'You are leaving {count} topics unprepared.',

  resultTitle: 'Probability of success',
  resultAria: 'Probability of being able to develop the required topics',
  marginalGain: 'The next topic you prepare adds {gain}.',
  marginalGainNone: 'You already cover the whole syllabus.',

  inverseTitle: 'How many topics do I need?',
  inverseTargetLabel: 'Confidence target',
  inverseAnswer: 'You need {needed} of {total} topics.',
  inverseSlack: 'You can afford to skip {count} of them.',
  inverseSlackNone: 'No slack at all: the whole syllabus is required.',
  inverseImpossible: 'That target is out of reach even with the whole syllabus.',
  inverseAlreadyThere: 'With {prepared} topics you are already past it.',
  inverseMissing: 'You are {count} topics short.',

  chartTitle: 'What each topic is worth',
  chartCaption:
    'The curve flattens out: the last topics cost the same and buy far less than the first ones.',
  chartAxisX: 'Topics prepared',
  chartAxisY: 'Probability',
  chartYou: 'You are here',
  chartTarget: 'Target',

  derivationToggle: 'Show the maths',
  derivationIntro:
    'The draw takes balls without putting them back, so the number of your own topics that come up follows a hypergeometric distribution.',
  derivationWhyNotBinomial:
    'It is not a binomial: without replacement, the draws are not independent.',
  derivationTotalTitle: '1. Possible draws',
  derivationTotalBody: 'Ways to pick {k} topics out of {N}:',
  derivationFailureTitle: '2. Draws that sink you',
  derivationFailureBody:
    'You fail if fewer than {d} of your topics come up. Each case is counted by picking {i} of your {prepared} prepared topics and the rest among the {unprepared} you skipped:',
  derivationSuccessTitle: '2. Draws that save you',
  derivationSuccessBody:
    'You succeed if at least {d} of your topics come up. Each case is counted by picking {i} of your {prepared} prepared topics and the rest among the {unprepared} you skipped:',
  derivationTermLabel: '{i} of your topics come up',
  derivationTermLabelOne: '1 of your topics comes up',
  derivationResultTitle: '3. Result',
  derivationComplementBody: 'Subtract the probability of failing from the total:',
  derivationDirectBody: 'Add up the favourable cases:',
  derivationGeneralFormula: 'General formula',

  errorsTitle: 'Check your input',

  footerSource: 'Source code and maths write-up on GitHub',

  issue: {
    topicsTooFew: 'The syllabus must have at least 1 topic.',
    drawTooFew: 'The board must draw at least 1 ball.',
    drawExceedsTopics: 'You cannot draw more balls than there are topics.',
    discardsNegative: 'Discards cannot be negative.',
    discardsExceedDraw: 'You must develop at least one topic: discard fewer balls.',
    preparedNegative: 'Prepared topics must be a positive whole number.',
    preparedExceedsTopics: 'You cannot prepare more topics than the syllabus holds.',
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
