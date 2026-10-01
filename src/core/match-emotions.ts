import type { CompetitionCategory, Position } from './types.js';

/** Observations start when this feature is introduced; old career totals are not evidence. */
export interface MatchEmotionContext {
  clubId: string | null;
  category: CompetitionCategory;
  season: number;
}
export interface MatchEmotionRecord {
  turn: number;
  result: 'W' | 'D' | 'L';
  position: Position;
  minutes: number;
  goals: number;
  /** Whether a sufficiently long observed appearance exposed this role's goal duty. */
  personalFailure: boolean;
}
export interface MatchEmotionMemory {
  context: MatchEmotionContext;
  observations: MatchEmotionRecord[];
  lastObservedTurn: number;
}
export interface MatchEmotionObservation {
  turn: number;
  result: 'W' | 'D' | 'L';
  position: Position;
  minutes: number;
  goals: number;
  goalsAgainst: number;
  rating: number;
  xg?: number;
}
export interface MatchEmotionStates { morale: number; happiness: number; respect: number; pressure: number; }
export interface MatchEmotionDeltas { morale: number; happiness: number; respect: number; pressure: number; }
export interface MatchEmotionEffect {
  memory: MatchEmotionMemory;
  deltas: MatchEmotionDeltas;
  breakdown: {
    defeatStreak: number;
    otherRecentDefeats: number;
    personalStreak: number;
    collective: MatchEmotionDeltas;
    personal: MatchEmotionDeltas;
  };
  explanation: string;
}
const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
const rounded = (n: number): number => Math.round(n * 1000) / 1000;
const zero = (): MatchEmotionDeltas => ({ morale: 0, happiness: 0, respect: 0, pressure: 0 });
const sameContext = (a: MatchEmotionContext, b: MatchEmotionContext): boolean =>
  a.clubId === b.clubId && a.category === b.category && a.season === b.season;

/** Pure, deterministic effects of an actual fixture. Zero minutes retain only the collective result. */
export function applyMatchEmotions(
  previous: MatchEmotionMemory | undefined,
  context: MatchEmotionContext,
  observation: MatchEmotionObservation | null,
  states: MatchEmotionStates,
): MatchEmotionEffect {
  const current = previous && sameContext(previous.context, context) ? previous : undefined;
  const memory: MatchEmotionMemory = current ?? { context: { ...context }, observations: [], lastObservedTurn: -1 };
  const empty: MatchEmotionEffect = { memory, deltas: zero(), breakdown: {
    defeatStreak: 0, otherRecentDefeats: 0, personalStreak: 0, collective: zero(), personal: zero(),
  }, explanation: '' };
  // Also guard a replay after a context transition; one turn cannot charge two fixtures.
  if (!observation || !Number.isSafeInteger(observation.turn) || observation.turn < 0
    || previous && observation.turn <= previous.lastObservedTurn
    || !['W', 'D', 'L'].includes(observation.result)) return empty;
  const history = memory.observations.slice(-7);
  let precedingDefeats = 0;
  for (let i = history.length - 1; i >= 0 && history[i]!.result === 'L'; i--) precedingDefeats++;
  const collective = zero();
  const defeatStreak = observation.result === 'L' ? precedingDefeats + 1 : 0;
  // The consecutive tail and the older defeats are disjoint, avoiding double counting.
  const otherRecentDefeats = observation.result === 'L'
    ? history.filter(o => o.result === 'L').length - precedingDefeats : 0;
  if (observation.result === 'L') {
    collective.morale = -Math.min(6, 1.2 + .6 * precedingDefeats + .3 * otherRecentDefeats);
    collective.happiness = -Math.min(8, 1.5 + .8 * precedingDefeats + .4 * otherRecentDefeats);
  }
  const attack = observation.position === 'ST' || observation.position === 'WG';
  const defense = ['GK', 'CB', 'FB', 'DM'].includes(observation.position);
  const minutes = clamp(observation.minutes, 0, 120);
  const goals = clamp(observation.goals, 0, 20);
  const conceded = clamp(observation.goalsAgainst, 0, 3);
  const personalFailure = minutes >= 20 && (attack && goals === 0 || defense && conceded > 0);
  let personalStreak = personalFailure ? 1 : 0;
  if (personalFailure) {
    for (let i = history.length - 1; i >= 0; i--) {
      const prior = history[i]!;
      if (prior.position !== observation.position) break;
      // Bench and tiny cameos establish no personal sample and cannot erase earlier evidence.
      if (prior.minutes < 20 && !(attack && prior.goals > 0)) continue;
      if (!prior.personalFailure) break;
      personalStreak++;
    }
  }
  const personal = zero();
  if (personalFailure) {
    const roleWeight = observation.position === 'WG' || observation.position === 'DM' ? .5 : 1;
    const repetition = 1 + Math.min(1, (personalStreak - 1) * .2);
    const performanceRelief = observation.rating >= 7.5 ? .5 : 1;
    const exposure = Math.min(1, minutes / 90) * roleWeight * repetition * performanceRelief;
    // Recorded missed chances add modest weight; missing xG never invents opportunities.
    const attackChances = 1 + .25 * clamp(observation.xg ?? 0, 0, 1);
    const factor = exposure * (attack ? attackChances : conceded);
    personal.morale = -(attack ? .5 : .4) * factor;
    personal.happiness = -(attack ? .6 : .5) * factor;
    personal.respect = -(attack ? .3 : .25) * factor;
    personal.pressure = (attack ? .8 : .6) * factor;
  }
  const deltas = zero();
  for (const key of ['morale', 'happiness', 'respect', 'pressure'] as const) {
    const requested = collective[key] + personal[key];
    const bounded = clamp(requested, key === 'morale' ? -7 : key === 'happiness' ? -9 : key === 'respect' ? -2 : 0,
      key === 'pressure' ? 4 : 0);
    const before = clamp(states[key], 0, 100);
    deltas[key] = rounded(clamp(before + bounded, 0, 100) - before);
    collective[key] = rounded(collective[key]);
    personal[key] = rounded(personal[key]);
  }
  const parts: string[] = [];
  if (defeatStreak > 0) parts.push(defeatStreak > 1
    ? `${defeatStreak} derrotas seguidas pesam na moral e na felicidade.`
    : 'A derrota pesa na moral e na felicidade.');
  if (otherRecentDefeats > 0) parts.push(`${otherRecentDefeats} ${otherRecentDefeats === 1 ? 'outra derrota recente mantém' : 'outras derrotas recentes mantêm'} a frustração.`);
  if (personalFailure) {
    parts.push(attack
      ? `A atuação sem gol aumenta a cobrança pela função${personalStreak > 1 ? ` (${personalStreak} atuações seguidas observadas)` : ''}.`
      : `Os gols sofridos aumentam a cobrança pelo setor${personalStreak > 1 ? ` (${personalStreak} atuações seguidas observadas)` : ''}; o registro não identifica culpa individual.`);
    if (observation.rating >= 7.5) parts.push('A boa nota atenua essa cobrança.');
  }
  return {
    memory: { context: { ...context }, observations: [...history, {
      turn: observation.turn, result: observation.result, position: observation.position, minutes, goals, personalFailure,
    }], lastObservedTurn: observation.turn },
    deltas, breakdown: { defeatStreak, otherRecentDefeats, personalStreak, collective, personal },
    explanation: parts.join(' '),
  };
}
