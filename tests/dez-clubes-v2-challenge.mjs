import assert from 'node:assert/strict';
import {createGame,choose,validGame,POSITIONS,overall,projectTarget,wellbeing,CLUBS} from '../prototypes/dez-clubes-v2/engine.mjs';
const clone=g=>JSON.parse(JSON.stringify(g));
const pick=(g,base)=>g.event.choices.find(c=>c.id.split('@')[0]===base);
function choice(g,policy='WORK'){
 if(g.event.kind==='FORMATION')return pick(g,'formation:balanced');
 if(g.event.kind==='ENTRY')return g.event.choices[0];
 if(g.event.kind==='RIVALRY')return pick(g,'rival:earn');
 if(g.event.kind==='ROUTINE')return pick(g,'routine:REST');
 if(g.event.kind==='PLAN')return g.event.choices.find(c=>c.action?.routine===policy)??g.event.choices[0];
 if(g.event.kind==='RECOVERY')return pick(g,'recovery:READ');
 if(g.event.kind==='DECISIVE')return pick(g,'decisive:safe');
 return pick(g,'market:stay')??g.event.choices[0];
}
function advance(g,kind){let n=0;while(g.event.kind!==kind){assert(choose(g,choice(g).id),g.event.kind);assert(++n<180);}return g;}
function finish(g,policy='WORK',observer=()=>{}){let n=0;while(g.phase!=='DONE'){assert(validGame(g));observer(g);assert(choose(g,choice(g,policy).id),g.event.kind);assert(++n<180);}assert(validGame(g));assert.equal(g.age,25);assert.equal(g.playedMatches.length,126);assert.equal(g.objectiveHistory.length,21);assert(!/NaN|Infinity/.test(JSON.stringify(g)));return g;}
const metrics={},groups=[];
function check(name,fn){fn();groups.push(name);console.log('PASS',name);}
check('new combined moments finish all roles with frozen stage targets and fewer clicks',()=>{
 let met=0,decisions=0;const situations=new Set(),stages=new Set();let maxMet=0;
 for(const {id:position} of POSITIONS)for(let seed=1;seed<=8;seed++){
  const g=finish(createGame('Amostra pública',position,seed),'WORK',state=>{if(state.event.kind==='PLAN'){assert.equal(state.event.choices.length,3);assert(state.event.choices.every(c=>c.action));for(const c of state.event.choices){const a=c.action;assert.equal(a.revision,1);assert.equal(a.objective.revision,2);assert.equal(a.objective.status,'ACTIVE');assert(a.objective.target.minutes<=450);assert(a.objective.target.good<=a.objective.target.apps);situations.add(a.situation);stages.add(a.objective.stage);assert(c.benefit.length<65);assert(c.cost.length<90);}}assert(!['ROUTINE','RECOVERY','DECISIVE'].includes(state.event.kind));});
  const count=g.objectiveHistory.filter(o=>o.status==='MET').length;met+=count;maxMet=Math.max(maxMet,count);decisions+=g.decisions;assert.equal(g.decisions,31);assert(g.objectiveHistory.every(o=>o.progress.output>=0));
 }
 assert.equal(stages.size,4);assert(situations.size>=9);assert(maxMet<17);metrics.cohort={careers:64,meanMet:met/64,maxMet,meanDecisions:decisions/64,situations:[...situations],stages:[...stages]};
});
check('all three choices create different causal plans at identical input and RNG',()=>{
 const base=advance(createGame('Par público','ST',3),'PLAN'),rows=[];
 for(const c of base.event.choices){const g=clone(base);assert(choose(g,c.id));assert.equal(g.lastMatches.length,6);assert.equal(g.progression.at(-1).intent,c.action.intent);assert.equal(g.routine.mode,c.action.routine);assert.deepEqual(g.objectiveHistory[0].target,c.action.objective.target);assert.deepEqual(g.objectiveHistory[0].benchmark,c.action.objective.benchmark);rows.push({routine:g.routine.mode,intent:g.progression.at(-1).intent,skills:g.skills,fatigue:g.fatigue,stress:g.mentalStress,production:g.roleEvidence});}
 assert.equal(new Set(rows.map(r=>r.intent)).size,3);assert.equal(new Set(rows.map(r=>r.routine)).size,3);assert.equal(new Set(rows.map(r=>JSON.stringify(r.skills))).size,3);metrics.pairedPlans=rows.map(r=>({routine:r.routine,intent:r.intent,fatigue:r.fatigue,stress:r.stress,goals:r.production.goals,assists:r.production.assists}));
});
check('opportunity limits integration without impossible bench demands or skill ceilings',()=>{
 for(const position of ['ST','GK']){
  const source=advance(createGame('Banco público',position,6,{challenge:false}),'RIVALRY'),bench=clone(source),ready=clone(source);bench.challengeRevision=1;ready.challengeRevision=1;bench.rival.quality=95;ready.rival.quality=20;assert(validGame(bench)&&validGame(ready));
  assert(choose(bench,pick(bench,'rival:earn').id));assert(choose(ready,pick(ready,'rival:earn').id));
  for(const c of bench.event.choices){const b=c.action.objective.benchmark,t=c.action.objective.target;assert.equal(c.action.objective.stage,'INTEGRATION');assert(t.minutes<=Math.max(10,b.projectedMinutes));assert(t.good<=1);assert(t.apps<=Math.max(1,Math.ceil(b.projectedApps)));}
  assert(bench.event.choices[0].action.objective.target.minutes<ready.event.choices[0].action.objective.target.minutes);
  const high=clone(source);high.challengeRevision=1;for(const k of Object.keys(high.skills))high.skills[k]=95;high.proficiency=100;assert(validGame(high));const before=overall(high);assert(choose(high,pick(high,'rival:earn').id));assert(choose(high,high.event.choices[0].id));assert(overall(high)>80);assert(before>80);assert(Object.values(high.skills).every(v=>v>80));
 }
});
check('keeper protection forecast includes actual SAFE exposure, strength and zero sweep production',()=>{
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const source=advance(createGame('Previsão pública GK','GK',15,{challenge:false}),'RIVALRY');source.challengeRevision=1;
 assert(choose(source,pick(source,'rival:earn').id));
 const c=source.event.choices.find(c=>c.action.intent==='SAFE'),b=c.action.objective.benchmark;
 const keeperGoal=clamp(.4+(b.opponentLevel-source.skills.goalkeeping)*.005-.075,.16,.72);
 const actualOpponentLevel=source.clubProject.clubId;
 // Public catalog strength and the same intention offset enter executed possession creation.
 const teamLevel=CLUBS.find(c=>c.id===actualOpponentLevel).level;
 const opposition=clamp(.42+(b.opponentLevel-teamLevel)*.004-.035,.12,.82);
 assert.equal(b.theoreticalRate,9*opposition*.68*(1-keeperGoal));
 const withoutSafe=9*clamp(.42+(b.opponentLevel-teamLevel)*.004,.12,.82)*.68*(1-keeperGoal);assert(b.theoreticalRate<withoutSafe);
 const raw=JSON.stringify(source);let saves=0,interventions=0;
 for(let draw=1;draw<=16;draw++){const g=clone(source);g.rng=(Math.imul(draw,2654435761)+15)>>>0;assert(choose(g,c.id));for(const m of g.lastMatches){saves+=m.saves;interventions+=m.interventions;assert.equal(m.strategy,'SAFE');assert.equal(m.interventions,0);}assert.equal(g.objectiveHistory[0].progress.output,g.lastMatches.reduce((n,m)=>n+m.saves+m.interventions,0));}
 assert.equal(JSON.stringify(source),raw);assert.equal(interventions,0);metrics.keeperForecast={theoreticalRate:b.theoreticalRate,withoutSafe,opponentLevel:b.opponentLevel,teamLevel,pairedDraws:16,saves,interventions};
});
check('fatigue offers lower-load rest for all roles and natural branches recover instead of repeating',()=>{
 const gentle={GK:'SAFE',CB:'HOLD',FB:'HOLD',DM:'HOLD',CM:'CONTROL',AM:'CONTROL',WG:'CONTROL',ST:'LINK'},rows=[],clamp=v=>Math.max(0,Math.min(100,v));
 for(const {id:position} of POSITIONS){
  const g=createGame('Recuperação pública',position,1);let n=0;
  while(g.event.choices[0]?.action?.situation!=='FATIGUE'){
   assert.notEqual(g.phase,'DONE');let c=g.event.choices[0];if(c.action)c=g.event.choices.find(x=>x.action.routine==='TRAIN')??g.event.choices.find(x=>x.action.routine==='WORK')??c;if(g.event.kind==='INTEREST')c=g.event.choices.at(-1);assert(choose(g,c.id));assert(++n<100);
  }
  const c=g.event.choices.find(c=>c.action.routine==='REST');assert.equal(c.action.intent,gentle[position]);assert.equal(new Set(g.event.choices.map(c=>c.action.intent)).size,3);assert.equal(new Set(g.event.choices.map(c=>c.action.routine)).size,3);
  const intensity=c.action.intent==='LINK'?1:.82,net75=6.5-(1+75/90*5.5*intensity);assert(net75>0,'75 min recovery absent '+position);
  const before={condition:g.condition,fatigue:g.fatigue},loaded=clone(g);assert(choose(g,c.id));assert(choose(loaded,c.id));assert.deepEqual(g,loaded);
  assert(g.lastMatches.some(m=>m.minutes>=75),'no substantial recovery exposure '+position);let physical=before.condition;for(const m of g.lastMatches)physical=clamp(clamp(physical+6.5)-(1+m.minutes/90*5.5*intensity));assert(Math.abs(g.condition-physical)<1e-8,'physical formula changed '+position);
  assert(g.condition>before.condition,'condition failed to recover '+position);assert(g.fatigue<before.fatigue,'fatigue failed to recover '+position);
  const recovered={condition:g.condition,fatigue:g.fatigue};while(!g.event.choices[0]?.action&&g.phase!=='DONE')assert(choose(g,choice(g).id));assert.notEqual(g.event.choices[0]?.action?.situation,'FATIGUE','natural fatigue loop '+position);
  rows.push({position,intent:c.action.intent,net75,before,recovered,matchMinutes:g.lastMatches.map(m=>m.minutes),nextSituation:g.event.choices[0]?.action?.situation});
 }
 metrics.fatigueRecovery=rows;
});
check('forged combined actions and benchmarks reject atomically before any mutation',()=>{
 const source=advance(createGame('Guarda pública','AM',7),'PLAN');
 const mutations=[g=>g.challengeRevision=2,g=>g.challengeRevision=0,g=>delete g.challengeRevision,g=>g.event.choices[0].action.revision=2,g=>g.event.choices[0].action.intent='SAFE',g=>g.event.choices[0].action.routine='AUTO',g=>g.event.choices[0].action.situation='OTHER',g=>g.event.choices[0].action.objective.target.output=0,g=>g.event.choices[0].action.objective.target.minutes=540,g=>g.event.choices[0].action.objective.benchmark.rate=0,g=>g.event.choices[0].action.objective.progress.output=1,g=>g.event.choices[0].id=`moment:3@${g.serial}`,g=>delete g.event.choices[0].action,g=>g.objective.target.good=0];
 for(const mutate of mutations){const g=clone(source);mutate(g);const raw=JSON.stringify(g);assert.equal(validGame(g),false);assert.equal(choose(g,g.event.choices[0].id),false);assert.equal(JSON.stringify(g),raw);}metrics.atomicRejections=mutations.length;
});
check('public seed replay and hydration keep frozen decisions exact',()=>{
 const g=finish(createGame('Replay público','DM',9),'REST'),replay=createGame(g.name,g.position,g.seed);for(const c of g.choicesLog)assert(choose(replay,c.id));assert.deepEqual(replay,g);const raw=JSON.stringify(g);assert.equal(choose(g,'moment:0@999'),false);assert.equal(JSON.stringify(g),raw);
 const active=advance(createGame('Preview público','WG',8),'PLAN'),before=JSON.stringify(active);projectTarget(active,active.event.choices[0].action.intent);wellbeing(active);assert.equal(JSON.stringify(active),before);const loaded=clone(active),id=active.event.choices[1].id;assert(choose(active,id));assert(choose(loaded,id));assert.deepEqual(active,loaded);
});
check('formation is identical to control and old pending six-game promises resolve before adoption',()=>{
 const a=advance(createGame('Formação pública','ST',12),'ENTRY'),b=advance(createGame('Formação pública','ST',12,{challenge:false}),'ENTRY');for(const field of ['skills','proficiency','dna','rng','progression','happiness','mentalStress','fatigue','condition'])assert.deepEqual(a[field],b[field]);
 const control=advance(createGame('Legado público','ST',12,{challenge:false}),'PLAN'),old=clone(control);delete old.challengeRevision;assert(validGame(old));const selected=old.event.choices[0].id,prefix=clone(old.playedMatches);assert(choose(old,selected));assert(choose(control,selected));for(const field of ['playedMatches','lastMatches','progression','skills','totalstats','seasonStats','objectiveHistory','trust','condition','fatigue','happiness','mentalStress'])assert.deepEqual(old[field],control[field],field);assert.deepEqual(old.playedMatches.slice(0,prefix.length),prefix);assert.equal(old.challengeRevision,1);assert(old.event.choices[0].action);assert.equal(control.challengeRevision,0);assert(!control.event.choices[0].action);
 const done=finish(createGame('DONE controle','ST',14,{challenge:false}));delete done.challengeRevision;const raw=JSON.stringify(done);assert(validGame(done));assert.equal(choose(done,'forged'),false);assert.equal(JSON.stringify(done),raw);
 metrics.compatibility={formationIdentical:true,legacyBlockExact:true,doneImmutable:true};
});
console.log(JSON.stringify({groups:groups.length,metrics},null,2));
