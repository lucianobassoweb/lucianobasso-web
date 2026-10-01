import type { CompetitionCategory, Position } from './types.js';

/** Only observed matches in the current sporting context; never reconstructed from totals. */
export interface FormContext {
  clubId: string | null;
  category: CompetitionCategory;
  position: Position;
  season: number;
}
export interface FormObservation {
  turn: number;
  minutes: number;
  goals: number;
  assists: number;
  rating: number;
  xg: number;
  xa: number;
}
export interface RecentMatchForm {
  context: FormContext;
  observations: FormObservation[];
  /** Includes observed bench and short cameo dates so replaying an event is idempotent. */
  lastObservedTurn: number;
}
export interface FormEvaluation {
  known: boolean;
  dryMatches: number;
  dryMinutes: number;
  assists: number;
  xa: number;
  rollingMatches: number;
  rollingMinutes: number;
  rollingGoals: number;
  rollingAssists: number;
  productionPer90: number;
  severity: number;
  /** Subtract from the next start probability, then retain the engine's probability clamps. */
  startPenalty: number;
  coachText: string;
  fanText: string;
}

const finite = (n: number, fallback = 0): number => Number.isFinite(n) ? n : fallback;
const clamp = (n: number, low: number, high: number): number => Math.max(low, Math.min(high, finite(n)));
const sameContext = (a: FormContext, b: FormContext): boolean =>
  a.clubId === b.clubId && a.category === b.category && a.position === b.position && a.season === b.season;
const cleanObservation = (o: FormObservation): FormObservation => ({
  turn: Math.floor(clamp(o.turn, 0, Number.MAX_SAFE_INTEGER)),
  minutes: clamp(o.minutes, 0, 120),
  goals: Math.floor(clamp(o.goals, 0, 20)),
  assists: Math.floor(clamp(o.assists, 0, 20)),
  rating: clamp(o.rating, 0, 10),
  xg: clamp(o.xg, 0, 20),
  xa: clamp(o.xa, 0, 20),
});

/** A changed club, category, position or season starts a new, genuinely observed history. */
export function recordRecentMatchForm(
  previous: RecentMatchForm | undefined,
  context: FormContext,
  observation: FormObservation,
): RecentMatchForm {
  const current = previous && sameContext(previous.context, context) ? previous : undefined;
  if (!Number.isFinite(observation.turn) || observation.turn < 0) {
    return current ?? { context: { ...context }, observations: [], lastObservedTurn: -1 };
  }
  const clean = cleanObservation(observation);
  if (current && clean.turn <= current.lastObservedTurn) return current;
  // Bench dates carry no personal performance and cannot wash out an existing drought.
  const observations = (current?.observations ?? []).map(cleanObservation);
  // Short scoreless cameos must not evict the substantial evidence used for selection.
  if (clean.minutes >= 45 || clean.minutes > 0 && clean.goals > 0) observations.push(clean);
  return { context: { ...context }, observations: observations.slice(-8), lastObservedTurn: clean.turn };
}

/** Goal exposure is a positional duty, not a guess at natural aptitude or a quality ceiling. */
export function evaluateRecentMatchForm(
  form: RecentMatchForm | undefined,
  context: FormContext,
  age: number,
): FormEvaluation {
  const empty: FormEvaluation = {
    known: false, dryMatches: 0, dryMinutes: 0, assists: 0, xa: 0,
    rollingMatches: 0, rollingMinutes: 0, rollingGoals: 0, rollingAssists: 0, productionPer90: 0,
    severity: 0, startPenalty: 0, coachText: '', fanText: '',
  };
  if (!form || !sameContext(form.context, context)) return empty;
  const observations = form.observations.slice(-8).map(cleanObservation);
  const result = { ...empty, known: observations.length > 0 };
  if (context.position !== 'ST' && context.position !== 'WG') return result;
  // A goal in any real appearance ends the drought. Short cameos cannot establish one.
  for (let i = observations.length - 1; i >= 0; i--) {
    const match = observations[i]!;
    if (match.minutes <= 0) continue;
    if (match.goals > 0) break;
    if (match.minutes < 45) continue;
    result.dryMatches++;
    result.dryMinutes += match.minutes;
    result.assists += match.assists;
    result.xa += match.xa;
  }
  // Three substantial matches/180 minutes begin the consequence; six/360 reach full exposure.
  const exposure = Math.min(1, result.dryMatches / 6, result.dryMinutes / 360);
  const progression = result.dryMatches >= 3 && result.dryMinutes >= 180
    ? clamp((exposure - 0.25) / 0.75, 0, 1) : 0;
  // Creation is valuable, but six long appearances without a striker goal still cost space.
  const contributionRelief = Math.min(0.55, result.assists * 0.12 + result.xa * 0.06);
  const droughtSeverity = progression * (1 - contributionRelief);
  // A goal ends the drought, but one goal does not erase the rest of the observed production.
  // Count a scored cameo in both numerator and minutes; it cannot establish the sample itself.
  const sample = observations.filter(match => match.minutes > 0);
  const substantial = sample.filter(match => match.minutes >= 45);
  const substantialMinutes = substantial.reduce((sum, match) => sum + match.minutes, 0);
  result.rollingMatches = sample.length;
  result.rollingMinutes = sample.reduce((sum, match) => sum + match.minutes, 0);
  result.rollingGoals = sample.reduce((sum, match) => sum + match.goals, 0);
  result.rollingAssists = sample.reduce((sum, match) => sum + match.assists, 0);
  const assistWeight = context.position === 'ST' ? 0.45 : 1;
  result.productionPer90 = result.rollingMinutes > 0
    ? (result.rollingGoals + assistWeight * result.rollingAssists) * 90 / result.rollingMinutes : 0;
  const expectedProduction = context.position === 'ST' ? 0.25 : 0.40;
  // Assists already contribute to the production rate; only recorded xA provides extra relief.
  const rollingXa = sample.reduce((sum, match) => sum + match.xa, 0);
  const rollingSeverity = substantial.length >= 6 && substantialMinutes >= 360
    ? clamp(1 - result.productionPer90 / expectedProduction, 0, 1) * (1 - Math.min(0.35, rollingXa * 0.06)) : 0;
  const roleWeight = context.position === 'ST' ? 1 : 0.5;
  const ageWeight = age <= 12 ? 0.5 : age <= 13 ? 0.7 : age <= 15 ? 0.85 : 1;
  const cap = context.category === 'SENIOR' ? 0.30 : context.category === 'AMATEUR' ? 0.24 : 0.18;
  result.severity = Math.max(droughtSeverity, rollingSeverity) * roleWeight;
  result.startPenalty = cap * ageWeight * result.severity;
  if (result.startPenalty <= 0) return result;
  const rollingDominates = rollingSeverity > droughtSeverity;
  const evidence = rollingDominates
    ? `a janela recente observada: ${result.rollingMatches} participações, ${Math.round(result.rollingMinutes)} minutos, ${result.rollingGoals} ${result.rollingGoals === 1 ? 'gol' : 'gols'} e ${result.rollingAssists} ${result.rollingAssists === 1 ? 'assistência' : 'assistências'} (${substantial.length} atuações de pelo menos 45 minutos)`
    : `${result.dryMatches} atuações de pelo menos 45 minutos e ${Math.round(result.dryMinutes)} minutos sem gol`;
  const creation = rollingDominates
    ? rollingXa >= 0.5 ? ' A criação registrada atenua a cobrança por produção recente.' : ''
    : result.assists > 0 || result.xa >= 0.5
    ? ' A participação na criação atenua a cobrança, mas a sequência sem gol ainda pesa.' : '';
  const formative = context.category !== 'SENIOR' && context.category !== 'AMATEUR';
  result.coachText = formative
    ? `Na formação, o treinador acompanha ${evidence} e passa a considerar rodar a titularidade.${creation}`
    : `O treinador acompanha ${evidence}; a titularidade perde força pela produção recente.${creation}`;
  result.fanText = formative
    ? `Quem acompanha a formação espera uma resposta após ${evidence}.${creation}`
    : `A torcida cobra mais presença no placar após ${evidence}.${creation}`;
  return result;
}
