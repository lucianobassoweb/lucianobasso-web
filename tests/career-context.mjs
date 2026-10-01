import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createCareerWithSeed, advanceCareer, resolveChoice } from '../dist/core/engine.js';
import { CLUB_BY_ID } from '../dist/data/clubs-br-2026.js';

// Test the owned source directly: no build of unrelated source is needed for this pure module.
const source = fs.readFileSync(new URL('../src/core/context.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
  .replace(/^import .*;\n/gm, '').replace(/^export /gm, '') + '\nglobalThis.build = buildCareerContext;';
const noRandom = Object.create(Math);
noRandom.random = () => { throw Error('presentation must not consume random numbers'); };
const sandbox = vm.createContext({ CLUB_BY_ID, Math: noRandom });
vm.runInContext(compiled, sandbox);
const build = (save, event) => JSON.parse(JSON.stringify(sandbox.build(save, event)));
const text = result => result.paragraphs.join(' ');
const fresh = () => createCareerWithSeed('Contexto', 404, 'gremio', 'Porto Alegre', 'RS');
const choices = (...ids) => ids.map(id => ({ id, label: id }));
const event = (overrides = {}) => ({
  id: 'm-18', kind: 'MATCH', title: 'Partida', body: 'Participação nesta rodada. Nota 7.4 · 80 min · xG 0.1 · xA 0.2.', tags: [],
  choices: choices('career:stable', 'career:responsibility', 'career:discuss', 'career:market'),
  matchFeedback: { category: 'SENIOR', opponent: 'Vasco', coachName: 'Treinador observado', started: true, minutes: 80, goals: 0, assists: 0, rating: 7.4, saves: 1, cleanSheet: false, teamGoals: 0, oppGoals: 1, fanReaction: '', coachReaction: '', blockGames: 1, blockStarts: 1, blockGoals: 0, blockAssists: 0, blockMinutes: 80 },
  ...overrides,
});
const senior = () => {
  const s = fresh(), p = s.player;
  Object.assign(p, { age: 24, phase: 'PROFISSIONAL', professionalStatus: 'SENIOR', currentClubId: 'gremio', position: 'GK', adaptationDebt: 0 });
  p.careerStats.appearances = 30;
  p.currentSeason.appearances = 8; p.currentSeason.starts = 6; p.currentSeason.avgRating = 6.5;
  p.currentSeason.categories = { SENIOR: { appearances: 8, starts: 6, minutes: 520, goals: 0, assists: 0, avgRating: 6.5 } };
  p.tactical = { coachId: 'observado', role: 'BALANCED', trust: 55, support: .5, discussedFor: null };
  delete p.coaching;
  return s;
};
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }

check('bank and start describe actual participation, not fabricated streaks', () => {
  const s = senior(), e = event();
  const started = build(s, e), bench = build(s, { ...e, matchFeedback: { ...e.matchFeedback, started: false, minutes: 0, rating: 0 } });
  assert.match(text(started), /6 titularidades em 8 participações/);
  assert.match(text(bench), /sem entrar.*8 participações, 6 como titular/);
  assert.match(text(bench), /não fornece uma nova avaliação individual/);
  assert.notEqual(text(started), text(bench));
  assert.doesNotMatch(text(bench), /banco há|seguidas|0 × 1|80 min/);
  assert.match(bench.nextStep, /Conversar/);
});
check('GK evaluation uses season ratings regardless of scoring statistics', () => {
  const s = senior(), e = event();
  const a = build(s, e); s.player.currentSeason.categories.SENIOR.goals = 35; s.player.currentSeason.categories.SENIOR.assists = 15;
  assert.deepEqual(build(s, e), a);
  assert.match(text(a), /6\.50, em 8 participações.*Seu trabalho como goleiro/);
  assert.match(text(a), /acima dessa média/);
});
check('confidence changes a relevant tension without exposing the numeric bond', () => {
  const s = senior(), e = event(); e.matchFeedback.rating = 6.5;
  s.player.tactical.trust = 30; const low = build(s, e);
  s.player.tactical.trust = 80; const high = build(s, e);
  assert.match(text(low), /Treinador observado está baixa/);
  assert.match(text(high), /Treinador observado está alta/);
  assert.notEqual(low.nextStep, high.nextStep);
  assert.doesNotMatch(text(low), /30\/100|confiança.*30/);
});
check('campaign is actual collective form, not an invented player ledger', () => {
  const s = senior(), e = event();
  s.player.coaching = { season: s.player.season, campaigns: { gremio: { points: 9, games: 10, form: [0, 0, 1, 0, 3, 0] } }, bonds: {} };
  const loss = build(s, e);
  assert.match(text(loss), /9 pontos em 10 jogos.*1 vitória, 1 empate e 4 derrotas/);
  assert.match(text(loss), /não deve ser atribuída apenas/);
  s.player.coaching.campaigns.gremio.form = [3, 3, 1, 3, 0, 3];
  assert.notEqual(text(build(s, e)), text(loss));
  s.player.coaching.season--;
  assert.doesNotMatch(text(build(s, e)), /9 pontos em 10 jogos/);
});
check('position adaptation must have observed change evidence', () => {
  const s = senior(); s.player.position = 'AM'; s.player.adaptationDebt = 25;
  s.player.positionHistory = [{ season: s.player.season, position: 'AM', previousPosition: 'CM' }];
  const result = build(s, event());
  assert.match(text(result), /meia central para meia ofensivo.*ainda está em adaptação/);
  assert.match(result.nextStep, /adaptação à nova posição/);
  s.player.positionHistory = [];
  assert.doesNotMatch(text(build(s, event())), /mudança de/);
});
check('tactical role describes agreed demands, never genetic fit', () => {
  const s = senior(); s.player.position = 'CM'; s.player.tactical.role = 'MOBILE';
  assert.match(text(build(s, event())), /liberdade de movimento.*Mobilidade/);
  s.player.tactical.role = 'HOLD';
  assert.match(text(build(s, event())), /mais fixa.*leitura e a técnica/);
});
check('school priority and local pathway change factual context; discovery remains', () => {
  const s = fresh(), p = s.player; p.position = 'GK'; p.age = 13;
  p.lastChoiceResult = { choiceId: 'education:BALANCED', turn: p.careerTurn };
  p.currentSeason.categories = { U15: { appearances: 5, starts: 5, minutes: 400, goals: 0, assists: 0, avgRating: 6.8 } };
  const e = event({ kind: 'INFO', body: 'Sub-15: 80 minutos nesta partida. Os treinadores agora observam melhor: jogo aéreo.', choices: choices('career:local', 'career:explore', 'career:education') });
  e.matchFeedback.category = 'U15'; e.matchFeedback.rating = 6.5;
  const a = build(s, e);
  assert.match(text(a), /jogo aéreo/); assert.match(text(a), /5 titularidades em 5 participações/);
  assert.match(text(a), /escola ainda não foi concluída/);
  p.life.education.priority = 'SCHOOL'; const b = build(s, e);
  assert.match(text(b), /proteção dos estudos/); assert.notEqual(text(a), text(b));
  assert.doesNotMatch(text(b), /80 minutos/);
  assert.ok(text(b).split(/\s+/).length + b.nextStep.split(/\s+/).length < 170);
});
check('initial senior entry separates youth evidence from senior opportunity and preserves debut', () => {
  const s = senior(), p = s.player; p.careerStats.appearances = 1;
  p.seasonHistory = [{ season: 2025, categories: { U20: { appearances: 15, starts: 14, minutes: 1100, avgRating: 7.3 } } }];
  const e = event({ tags: ['ESTREIA'] }); e.matchFeedback.started = false;
  const result = build(s, e);
  assert.match(text(result), /Sub-20 de 2025, foram 15 participações/);
  assert.match(text(result), /primeira aparição profissional/);
  assert.match(text(result), /xG 0.1 · xA 0.2/);
});
check('injury and negotiated return outrank routine season facts', () => {
  const s = senior(); s.player.injury = { remainingBlocks: 4, longAbsence: true, returnDiscussed: false };
  const injured = build(s, event()); assert.match(injured.paragraphs[0], /afastamento.*4 partidas/);
  s.player.injury.remainingBlocks = 0; s.player.comebackBlocks = 3; s.player.comebackPlan = 'GRADUAL';
  assert.match(build(s, event()).paragraphs[0], /retomada.*gradual negociada/);
});
check('annual review uses the completed year, preserves titles and release', () => {
  const s = senior(), p = s.player;
  p.seasonHistory = [{ ...structuredClone(p.currentSeason), season: 2025, avgRating: 7.1, categories: { SENIOR: { appearances: 20, starts: 15, minutes: 1000, avgRating: 7.1 } } }];
  p.currentSeason.categories.SENIOR.avgRating = 5; p.currentSeason.categories.SENIOR.appearances = 30;
  const e = event({ id: 'season-2025', kind: 'SEASON_END', body: 'Títulos: Copa Brasil. Sua vaga na base não foi renovada.', matchFeedback: undefined, choices: undefined });
  const a = build(s, e);
  assert.equal(a.paragraphs[0], e.body); assert.match(text(a), /15 titularidades em 20 participações/);
  assert.doesNotMatch(text(a), /5\.00|30 participações/);
  e.id = 'season-1999'; assert.deepEqual(build(s, e).paragraphs, [e.body]);
});
check('market preserves changed command and relates concrete choices to current contract', () => {
  const s = senior(); s.player.contractYearsLeft = 2;
  const e = event({ kind: 'MARKET', id: 'market-reconsider', matchFeedback: undefined, body: 'O treinador da proposta mudou. Reavalie o projeto.', choices: choices('market:stay', 'market-confirm:vasco:100:2026') });
  const a = build(s, e);
  assert.equal(a.paragraphs[0], e.body); assert.match(text(a), /proposta concreta de Vasco.*2 temporadas/);
  assert.match(a.nextStep, /Compare o comando/); assert.doesNotMatch(text(a), /garante|será titular/);
});
check('absent category records do not borrow statistics from another category', () => {
  const s = senior(); s.player.currentSeason.categories = { U20: { appearances: 99, starts: 99, minutes: 9000, avgRating: 9.9 } };
  assert.doesNotMatch(text(build(s, event())), /99|9\.90|8 participações/);
});
check('special events and legacy missing optional fields safely preserve their body', () => {
  const s = fresh(), special = { id: 'trial', kind: 'CHOICE', title: 'Convite', body: 'Teste na base; aprovação incerta.', tags: [] };
  assert.deepEqual(build(s, special).paragraphs, [special.body]);
  for (const key of ['life', 'tactical', 'coaching', 'story', 'professionalStatus', 'debut', 'professionalTransition']) delete s.player[key];
  const e = event(); e.matchFeedback.category = 'U15';
  s.player.currentSeason.appearances = 0;
  assert.deepEqual(build(s, e).paragraphs, [e.body]);
});
check('deterministic, deeply immutable and entirely independent of hidden DNA/fit', () => {
  const s = senior(), e = event(), before = JSON.stringify(s), baseline = build(s, e);
  assert.deepEqual(build(s, e), baseline); assert.equal(JSON.stringify(s), before);
  Object.defineProperty(s.player, 'dna', { get() { throw Error('hidden DNA accessed'); }, configurable: true });
  s.player.positionHistory = [{ season: s.player.season, position: 'GK', previousPosition: 'GK', get hiddenCompatibility() { throw Error('hidden fit accessed'); } }];
  assert.deepEqual(build(s, e), baseline);
  const frozen = senior(); freeze(frozen); freeze(e);
  assert.deepEqual(build(frozen, e), build(frozen, e));
  assert.equal(frozen.player.rngState, JSON.parse(before).player.rngState);
});
check('next step never requires a missing role-conversation choice', () => {
  const s = senior(); s.player.tactical.trust = 25;
  const e = event({ choices: choices('career:market') });
  const a = build(s, e);
  assert.doesNotMatch(a.nextStep, /conversa|Conversar/);
  assert.match(a.nextStep, /career:market/);
});
check('five real formation rounds change observed focus without repeating default school/local filler', () => {
  const s = fresh(), p = s.player;
  p.age = 13; p.position = 'GK'; p.positionSeasonChosenFor = p.season;
  p.life.education.chosenFor = p.season; p.life.scouting.lastAttemptSeason = p.season;
  s.pendingEvent = null;
  const snapshots = [];
  for (let round = 0; round < 5; round++) {
    if (round === 0) advanceCareer(s);
    else { resolveChoice(s, 'career:local'); if (!s.pendingEvent) advanceCareer(s); }
    assert.ok(s.pendingEvent.matchFeedback);
    const before = JSON.stringify(s), result = build(s, s.pendingEvent);
    assert.equal(JSON.stringify(s), before);
    assert.match(text(result), /Os treinadores agora observam melhor:/);
    snapshots.push(result);
  }
  assert.ok(snapshots.filter(r => /escola ainda não foi concluída/.test(text(r))).length <= 1);
  assert.ok(snapshots.filter(r => /Seu caminho de formação/.test(text(r))).length <= 1);
  // Strip changing counts to require a changed observation/tension, not numerical substitution alone.
  assert.ok(new Set(snapshots.map(r => text(r).replace(/\d+(?:[.,]\d+)?/g, '#'))).size >= 2);
});
check('match interpretation changes with goalkeeper interventions, result and disciplinary facts', () => {
  const s = senior(), e = event();
  e.matchFeedback.rating = 6.5;
  e.matchFeedback.saves = 1;
  const quiet = build(s,e);
  e.matchFeedback.saves = 4;
  const busy = build(s,e);
  assert.match(text(busy), /4 defesas diante de Vasco/);
  assert.match(text(busy), /derrota reúne duas leituras/);
  assert.notEqual(text(quiet).replace(/\d/g,'#'),text(busy).replace(/\d/g,'#'));
  e.matchFeedback.cleanSheet = true; e.matchFeedback.oppGoals = 0;
  const clean = build(s,e);
  assert.match(text(clean), /terminou sem sofrer gol/);
  assert.doesNotMatch(text(clean), /derrota reúne/);
  e.matchFeedback.cleanSheet = false; e.matchFeedback.oppGoals = 1;
  e.tags = ['EXPULSO'];
  assert.match(build(s,e).paragraphs[0], /expulsão contra Vasco/);
  e.tags = []; s.player.position = 'ST'; e.matchFeedback.goals = 1;
  assert.match(text(build(s,e)), /participou diretamente do ataque com 1 gol/);
});

console.log(`PASS ${checks} career-context checks: factual counterfactuals, old saves, annual/market branches, no DNA/RNG, purity and determinism`);
