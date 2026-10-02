import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {migrateAttributeScale} from '../dist/core/attribute-scale.js';
import {createCareerWithSeed,advanceCareer,resolveChoice} from '../dist/core/engine.js';
import {ensureStories,updateStories,choiceSnapshot} from '../dist/core/stories.js';
import {ensureCoaching,syncCoachContext} from '../dist/core/coaches.js';
const fresh=seed=>createCareerWithSeed('História',seed,'gremio','Porto Alegre','RS');
const ready=seed=>{const s=fresh(seed),p=s.player;s.pendingEvent=null;p.position='GK';p.positionSeasonChosenFor=p.season;p.life.education.chosenFor=p.season;
// Explicit legacy active chapter: retain the old contractual objectives in this compatibility suite.
p.story.active={id:'story-1',kind:'FORMATION',category:'U15',clubId:null,title:'Legado',objective:'3 participações, 120 minutos',startedSeason:p.season,startedTurn:0,deadlineTurn:8,appearances:0,minutes:0,goodMatches:0,targetAppearances:3,targetMinutes:120,targetGoodMatches:0};p.story.sequence=1;return s;};
const senior=seed=>{const s=ready(seed),p=s.player;p.age=24;p.phase='PROFISSIONAL';p.professionalStatus='SENIOR';p.currentClubId='gremio';p.currentSeason.clubId='gremio';delete p.story;ensureCoaching(p);syncCoachContext(p);p.tactical.discussedFor=p.season;return s;};
const migrant=ready(310);delete migrant.player.story;migrant.player.currentSeason.appearances=15;migrant.player.currentSeason.minutes=900;migrant.player.careerTurn=15;
ensureStories(migrant.player);assert.equal(migrant.player.story.active.appearances,0);assert.equal(migrant.player.story.archive.length,0);assert.equal(migrant.player.story.active.startedTurn,15);
const played=ready(311);let rounds=0;
while(!played.player.story.archive.length&&rounds++<12){advanceCareer(played);if(played.pendingEvent?.choices)resolveChoice(played,played.pendingEvent.choices[0].id);}
const completed=played.player.story.archive[0];assert.equal(completed.outcome,'ACHIEVED');assert.equal(completed.appearances,3);assert.ok(completed.minutes>=120);assert.equal(completed.targetGoodMatches,0);assert.equal(played.player.story.active,null);assert.equal(played.player.careerStats.appearances,0);
const saved=structuredClone(played.player.story);updateStories(played.player,{appearances:1,minutes:90,rating:9,category:'U15'});assert.deepEqual(played.player.story,saved);
const blocked=JSON.stringify(played.player);resolveChoice(played,'career:not-available');assert.equal(JSON.stringify(played.player),blocked);
let benchFound=false;
for(let seed=320;seed<380&&!benchFound;seed++){const s=senior(seed);advanceCareer(s);if(s.pendingEvent?.id.startsWith('bench-')){benchFound=true;assert.equal(s.player.story.active.appearances,0);assert.equal(s.player.story.active.minutes,0);}}
assert.ok(benchFound,'real professional bench fixture');
const injured=senior(381);injured.player.injury={remainingBlocks:2,longAbsence:false,returnDiscussed:false};advanceCareer(injured);assert.equal(injured.player.story.active.appearances,0);assert.equal(injured.player.story.active.minutes,0);
const partial=ready(382);ensureStories(partial.player);partial.player.careerTurn++;
updateStories(partial.player,{appearances:1,minutes:55,rating:6.2,category:'U15'});partial.player.careerTurn=8;updateStories(partial.player);assert.equal(partial.player.story.archive[0].outcome,'PARTIAL');assert.equal(partial.player.story.archive[0].minutes,55);assert.equal(partial.player.story.active,null);assert.match(partial.player.story.archive[0].payoff,/Prazo encerrado/);
const comeback=senior(383);comeback.player.injury={remainingBlocks:0,longAbsence:true,returnDiscussed:false};advanceCareer(comeback);resolveChoice(comeback,'comeback:GRADUAL');assert.equal(comeback.player.story.active.kind,'COMEBACK');assert.equal(comeback.player.story.active.appearances,0);assert.ok(comeback.player.lastChoiceResult.effects.some(x=>x.includes('condição física')||x.includes('confiança')));
const discussion=senior(384);discussion.pendingEvent={id:'discussion',kind:'INFO',title:'Papel',body:'',tags:[],choices:[{id:'career:discuss',label:'Conversar'}]};resolveChoice(discussion,'career:discuss');assert.equal(discussion.player.lastChoiceResult.choiceId,'career:discuss');assert.ok(discussion.player.lastChoiceResult.effects.some(x=>x.includes('Próxima decisão')));
const school=ready(385);school.pendingEvent={id:'school-context',kind:'INFO',title:'Família',body:'',tags:[],choices:[{id:'career:education',label:'Rever estudos'}]};resolveChoice(school,'career:education');assert.equal(school.player.lastChoiceResult.eventId,'school-context');assert.match(school.player.lastChoiceResult.effects.join(' '),/Próxima decisão/);
const retire=senior(386);retire.pendingEvent={id:'retirement',kind:'CHOICE',title:'Encerrar',body:'',tags:[],choices:[{id:'retirement:stop',label:'Encerrar'}]};resolveChoice(retire,'retirement:stop');assert.equal(retire.player.lastChoiceResult.choiceId,'retirement:stop');assert.equal(retire.player.story.active,null);
const reconsider=senior(388),job=ensureCoaching(reconsider.player).jobs['vasco'];
reconsider.pendingEvent={id:'offer',kind:'MARKET',title:'Proposta',body:'',tags:[],payload:{coachOffers:{vasco:job.coachId+'-old'}},choices:[{id:'market:vasco:100:2026',label:'Aceitar Vasco'}]};
resolveChoice(reconsider,'market:vasco:100:2026');assert.equal(reconsider.pendingEvent.id,'market-reconsider');assert.equal(reconsider.player.currentClubId,'gremio');assert.match(reconsider.player.lastChoiceResult.summary,/treinador/);assert.ok(!reconsider.player.lastChoiceResult.effects.some(x=>x.startsWith('clube:')));
const regular=senior(390);ensureStories(regular.player);Object.assign(regular.player.story.active,{objective:'Legado: 3 partidas, 150 minutos, 2 notas >=6,8',targetAppearances:3,targetMinutes:150,targetGoodMatches:2});for(const k of ['challengeVersion','position','minMatchMinutes','performanceLabel'])delete regular.player.story.active[k];regular.player.careerStats.appearances=100;regular.player.careerStats.minutes=9000;regular.player.positionProficiency.GK=95;for(const key of Object.keys(regular.player.attributes))regular.player.attributes[key]=90;
for(let i=0;i<25&&!regular.player.story?.archive.some(c=>c.kind==='REGULARITY'&&c.outcome==='ACHIEVED');i++){if(regular.pendingEvent?.choices?.length)resolveChoice(regular,regular.pendingEvent.choices[0].id);else advanceCareer(regular);}
const regularPayoff=regular.player.story.archive.find(c=>c.kind==='REGULARITY'&&c.outcome==='ACHIEVED');assert.ok(regularPayoff);assert.ok(regularPayoff.goodMatches>=2);assert.ok(regularPayoff.minutes>=150);
const adult=ready(391);adult.player.age=23;adult.player.professionalStatus='YOUTH';advanceCareer(adult);assert.ok(!adult.pendingEvent.choices.some(c=>c.id==='career:education'));
// Existing story evidence must never change simulation RNG or sporting state.
const pairedA=ready(387),pairedB=structuredClone(pairedA);pairedB.player.story.archive.push({...pairedB.player.story.active,endedSeason:2026,endedTurn:0,outcome:'UNMET',payoff:'Fixture'});
for(let i=0;i<30;i++){for(const s of [pairedA,pairedB]){if(s.pendingEvent?.choices?.length)resolveChoice(s,s.pendingEvent.choices[0].id);else advanceCareer(s);}assert.equal(pairedA.player.rngState,pairedB.player.rngState);assert.deepEqual(pairedA.player.attributes,pairedB.player.attributes);assert.deepEqual(pairedA.player.currentSeason,pairedB.player.currentSeason);assert.deepEqual(pairedA.player.careerStats,pairedB.player.careerStats);}
// Modern malformed optional fields are rejected while absent legacy fields remain valid.
const source=fs.readFileSync(new URL('../src/core/persistence.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/^import .*$/gm,'').replace(/^export /gm,'')+'\nglobalThis.api={loadSave,storeSave};';
function load(s){const context=vm.createContext({migrateAttributeScale,localStorage:{getItem:()=>JSON.stringify(s)}});vm.runInContext(compiled,context);return context.api.loadSave();}
const valid=ready(389);advanceCareer(valid);resolveChoice(valid,valid.pendingEvent.choices[0].id);assert.ok(load(played));const legacy=structuredClone(played);delete legacy.player.story;delete legacy.player.lastChoiceResult;assert.ok(load(legacy));
for(const mutate of [s=>s.player.story.active.appearances=-1,s=>s.player.story.active.deadlineTurn=s.player.story.active.startedTurn,s=>s.player.story.active.kind='SOCIAL',s=>s.player.story.archive[0].outcome='FAKE',s=>s.player.lastChoiceResult.effects=[42],s=>s.player.story.sequence=.2]){const bad=structuredClone(valid);bad.player.story.archive=structuredClone(played.player.story.archive);mutate(bad);assert.equal(load(bad),null);}
const receipt=structuredClone(played.player.lastChoiceResult);advanceCareer(played);assert.deepEqual(played.player.lastChoiceResult,receipt);
assert.equal(choiceSnapshot(played.player)['posição'],'Goleiro');
console.log('PASS story migration, real progress/payoff, idempotency, bench/injury, partial deadline, comeback, early receipts, RNG/stats pairing and persistence validation');
