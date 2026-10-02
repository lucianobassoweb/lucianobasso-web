import assert from 'node:assert/strict';
import {DECISION_CASES} from '../dist/data/decision-cases.js';
import {createCareerWithSeed} from '../dist/core/engine.js';
import {buildRoutineDecision,applyCaseSocial,canResolveCaseChoice,canResolveRoutineChoice,resolveRoutineChoice} from '../dist/core/decisions.js';
import {competitionCategory} from '../dist/core/calendar.js';
import {ensureGroupRelation} from '../dist/core/group.js';
import {RNG} from '../dist/core/random.js';
import {storeSave,loadSave} from '../dist/core/persistence.js';

const counts={LOAD:20,SPACE:20,SERVICE:20,RIVALRY:15,PRESSURE:20,ADAPTATION:15,PATH:20,LIFE:20};
const positions=['GK','CB','FB','DM','CM','AM','WG','ST'];
const validIds=new Set(['extra','rest','review','reset','help','team','focus','expose','intrigue','leisure','food','gaming','pizza-beer','party'].map(x=>`routine:${x}`).concat(['career:discuss','career:education','career:market','career:stable','career:local']));
const fresh=(age=12,club=false,position='CM',senior=false)=>{
 const s=createCareerWithSeed('Casos',415,'gremio','Porto Alegre','RS'),p=s.player;
 Object.assign(p,{age,currentClubId:club?'gremio':null,position,careerTurn:1,phase:senior?'PROFISSIONAL':club?'BASE':'ESCOLINHA',professionalStatus:senior?'SENIOR':'YOUTH',physicalCondition:55,mentalFatigue:25,pressure:70,adaptationDebt:5});
 p.currentSeason.age=age;p.currentSeason.clubId=p.currentClubId;p.positionSeasonChosenFor=p.season;
 p.life.education.chosenFor=p.season;ensureGroupRelation(p).resentment=30;s.pendingEvent=null;return s;
};
const event=(p,started=true,id=`case-${p.careerTurn}`)=>({id,kind:'INFO',title:'Partida observada',body:'Atuação',tags:[],matchFeedback:{category:competitionCategory(p),opponent:'Adversário observado',coachName:'Treinador',started,minutes:started?70:0,rating:started?7:0,goals:0,assists:0,saves:0,cleanSheet:false,teamGoals:0,oppGoals:1,fanReaction:'',coachReaction:'',blockGames:started?1:0,blockStarts:started?1:0,blockGoals:0,blockAssists:0,blockMinutes:started?70:0}});
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('PASS',name);};
const offered=new Map();
check('150 editorial cases: exact families, unique identities, coherent ages and three unique actions',()=>{
 assert.equal(DECISION_CASES.length,150);
 for(const field of ['id','title','situation'])assert.equal(new Set(DECISION_CASES.map(c=>c[field])).size,150,field);
 for(const [family,n]of Object.entries(counts)){
  assert.equal(DECISION_CASES.filter(c=>c.family===family).length,n);
  assert.ok(DECISION_CASES.filter(c=>c.family===family&&(c.minAge??12)<=12&&(c.maxAge??99)>=12&&(!c.scope||c.scope==='ANY')&&!c.requires&&!c.positions).length>=5);
 }
 for(const c of DECISION_CASES){assert.equal(c.choices.length,3);assert.equal(new Set(c.choices.map(x=>x.action)).size,3);assert.equal(new Set(c.choices.map(x=>x.label)).size,3);assert.ok((c.minAge??12)<=(c.maxAge??99));if(c.scope==='SENIOR')assert.ok(c.minAge>=18);for(const x of c.choices)for(const v of Object.values(x.social??{}))assert.ok(Number.isFinite(v)&&Math.abs(v)<=5);}
});
check('all 150 cases actually drawn with three resolvable IDs across observed context matrix',()=>{
 const contexts=[[12,false,false],[17,false,false],[17,true,false],[24,false,false],[24,true,true],[30,true,true]];
 let draws=0;
 for(const [age,club,senior]of contexts)for(const pos of positions)for(const starter of [false,true]){
  const p=fresh(age,club,pos,senior).player,rng=p.rngState,dna=structuredClone(p.dna);
  for(let turn=1;turn<=180;turn++){
   p.careerTurn=turn;const recent=(p.decisionMemory?.recentCases??[]).map(c=>c.id),e=buildRoutineDecision(p,event(p,starter));draws++;
   assert.ok(e.decisionCaseId);assert.equal(e.choices.length,3);assert.equal(new Set(e.choices.map(c=>c.id)).size,3);assert.ok(!recent.includes(e.decisionCaseId),'20-case cooldown');assert.ok(p.decisionMemory.recentCases.length<=20);
   for(const choice of e.choices){assert.ok(validIds.has(choice.id),choice.id);assert.ok(canResolveCaseChoice(p,e,choice.id),`${e.decisionCaseId}/${choice.id}`);if(choice.id.startsWith('routine:'))assert.ok(canResolveRoutineChoice(p,e,choice.id));}
   if(age<18){assert.ok(!e.choices.some(c=>['routine:pizza-beer','routine:party'].includes(c.id)));assert.doesNotMatch(JSON.stringify(e),/cerveja|álcool|balada|sexual/i);}
   if(!offered.has(e.decisionCaseId))offered.set(e.decisionCaseId,{player:structuredClone(p),event:structuredClone(e)});
  }
  assert.equal(p.rngState,rng);assert.deepEqual(p.dna,dna);
 }
 const missing=DECISION_CASES.filter(c=>!offered.has(c.id)).map(c=>c.id);assert.deepEqual(missing,[]);console.log(JSON.stringify({draws,reachable:offered.size,contexts:contexts.length*positions.length*2}));
});
check('seeded draws are reproducible, rendered/reloaded offers idempotent, no RNG or DNA access',()=>{
 const a=fresh(17,true,'ST').player,b=structuredClone(a),ea=event(a),eb=event(b);
 const state=a.rngState;const dna=a.dna;Object.defineProperty(a,'dna',{get(){throw new Error('DNA read during case offer');},configurable:true});
 const random=Math.random;Math.random=()=>{throw new Error('Unseeded case draw');};
 try{buildRoutineDecision(a,ea);buildRoutineDecision(b,eb);assert.deepEqual(ea,eb);const memory=JSON.stringify(a.decisionMemory);assert.equal(buildRoutineDecision(a,ea),ea);assert.equal(JSON.stringify(a.decisionMemory),memory);assert.equal(a.rngState,state);}finally{Math.random=random;Object.defineProperty(a,'dna',{value:dna,writable:true,configurable:true});}
 const storage=new Map(),previous=globalThis.localStorage;
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 try{const s=fresh(17,true,'ST');s.player=a;s.pendingEvent=ea;assert.ok(storeSave(s));const loaded=loadSave();assert.ok(loaded);assert.deepEqual(loaded.pendingEvent,ea);assert.deepEqual(loaded.player.decisionMemory,a.decisionMemory);const before=JSON.stringify(loaded);buildRoutineDecision(loaded.player,loaded.pendingEvent);assert.equal(JSON.stringify(loaded),before);a.careerTurn++;loaded.player.careerTurn++;assert.deepEqual(buildRoutineDecision(a,event(a)),buildRoutineDecision(loaded.player,event(loaded.player)));}finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
});
check('modern case/context and bounded cooldown survive persistence; malformed catalog records rejected',()=>{
 const storage=new Map(),previous=globalThis.localStorage;
 globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 try{
  const sample=offered.get('life-01'),s=fresh();s.player=structuredClone(sample.player);s.pendingEvent=structuredClone(sample.event);assert.ok(storeSave(s));const key=[...storage.keys()][0],valid=storage.get(key);
  for(const mutate of [q=>{[q.pendingEvent.choices[0].id,q.pendingEvent.choices[2].id]=[q.pendingEvent.choices[2].id,q.pendingEvent.choices[0].id];},q=>q.pendingEvent.decisionCaseId='not-a-case',q=>delete q.pendingEvent.decisionCaseContext,q=>q.pendingEvent.decisionFamily='LOAD',q=>q.pendingEvent.choices[1].id=q.pendingEvent.choices[0].id,q=>q.player.decisionMemory.recentCases=Array(21).fill({id:'life-01',turn:1}),q=>q.player.decisionMemory.recentCases=[{id:'life-01',turn:q.player.careerTurn+1}]]){
   const q=JSON.parse(valid);mutate(q);const corrupt=JSON.stringify(q);storage.set(key,corrupt);assert.equal(loadSave(),null);assert.equal(storage.get(key),corrupt);storage.set(key,valid);assert.ok(loadSave());
  }
 }finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
});
check('social extras follow the persisted option index even after an action alias changes',()=>{
 const sample=offered.get('life-01'),p=structuredClone(sample.player),e=structuredClone(sample.event),id=e.choices[2].id;
 assert.equal(id,'routine:gaming');p.age=18;const r=ensureGroupRelation(p);Object.assign(r,{affinity:50,respect:50});
 // Resolution preflight is tested separately; this helper is called after engine actions.
 assert.deepEqual(applyCaseSocial(p,e,id).sort(),['groupAffinity','groupRespect']);assert.equal(r.affinity,53);assert.equal(r.respect,51);
 const snapshot=JSON.stringify(p);assert.deepEqual(applyCaseSocial(p,e,'routine:forged'),[]);assert.equal(JSON.stringify(p),snapshot);
});
check('legacy choices and events stay unchanged; stale club/turn/position/season/category rejected without mutation',()=>{
 const p=fresh().player,legacy={...event(p),choices:[{id:'old:continue',label:'Escolha anterior',hint:'Custo anterior'}]};const before=JSON.stringify({p,legacy});assert.equal(buildRoutineDecision(p,legacy),legacy);assert.equal(JSON.stringify({p,legacy}),before);assert.ok(canResolveCaseChoice(p,legacy,'old:continue'));
 const special={...event(p),kind:'MILESTONE'};assert.equal(buildRoutineDecision(p,special),special);assert.equal(special.choices,undefined);
 const sample=offered.get('life-01');
 for(const change of [q=>q.currentClubId=q.currentClubId?null:'gremio',q=>q.careerTurn++,q=>q.position=q.position==='ST'?'GK':'ST',q=>q.season++,q=>{q.professionalStatus='SENIOR';q.currentClubId='gremio';}]){
  const q=structuredClone(sample.player),e=structuredClone(sample.event);change(q);const before=JSON.stringify({q,e});for(const c of e.choices){assert.equal(canResolveCaseChoice(q,e,c.id),false);if(c.id.startsWith('routine:'))assert.equal(resolveRoutineChoice(q,e,c.id,new RNG(1)),false);}assert.equal(JSON.stringify({q,e}),before);
 }
 const q=structuredClone(sample.player),e=structuredClone(sample.event),snapshot=JSON.stringify({q,e});assert.equal(canResolveCaseChoice(q,e,'routine:forged'),false);assert.equal(JSON.stringify({q,e}),snapshot);
});
check('life-01 decline / early leisure / late party apply physical and group tradeoffs once, minor safe',()=>{
 const sample=offered.get('life-01');assert.ok(sample);const options=DECISION_CASES.find(c=>c.id==='life-01').choices;
 for(const [action,physical,fatigue,happiness,sleep]of [['rest',4,-5,0,0],['leisure',2,-2,3,0],['night',-9,6,9,2]]){
  const p=structuredClone(sample.player),e=structuredClone(sample.event);Object.assign(p,{physicalCondition:55,mentalFatigue:25});p.lifestyle={happiness:50,excessKg:0,sleepDebt:0,lastProcessedTurn:p.careerTurn};const r=ensureGroupRelation(p);Object.assign(r,{respect:50,affinity:50,resentment:0});const beforeDNA=structuredClone(p.dna),beforeRng=p.rngState;
  const index=options.findIndex(x=>x.action===action),id=e.choices[index].id;assert.ok(resolveRoutineChoice(p,e,id,new RNG(1)));assert.equal(p.physicalCondition,55+physical);assert.equal(p.mentalFatigue,25+fatigue);assert.equal(p.lifestyle.happiness,50+happiness);assert.equal(p.lifestyle.sleepDebt,sleep);assert.equal(r.respect,50+(options[index].social?.respect??0));assert.equal(r.affinity,50+(options[index].social?.affinity??0));assert.deepEqual(p.dna,beforeDNA);assert.equal(p.rngState,beforeRng);
  const after=JSON.stringify(p);assert.equal(resolveRoutineChoice(p,e,id,new RNG(1)),false);assert.equal(JSON.stringify(p),after);if(p.age<18)assert.equal(id,action==='night'?'routine:gaming':`routine:${action}`);
 }
});
console.log(`decision-cases: ${checks} groups passed`);
