import {DECISION_CASES} from '../dist/data/decision-cases.js';
import {groupKey} from '../dist/core/group.js';
import assert from 'node:assert/strict';
import {createCareerWithSeed,resolveChoice,advanceCareer} from '../dist/core/engine.js';
import {buildRoutineDecision,resolveRoutineChoice} from '../dist/core/decisions.js';
import {calendarScale} from '../dist/core/calendar.js';
import {RNG} from '../dist/core/random.js';
import {loadSave,storeSave,getPersistenceStatus} from '../dist/core/persistence.js';
import {syncCoachContext,coachBond,resolveCoachChoice,coachProfile} from '../dist/core/coaches.js';
const fresh=()=>createCareerWithSeed('Dilemas',415,'gremio','Porto Alegre','RS');
const ev=(turn=1,category='U15')=>({id:`y-${turn}`,kind:'INFO',title:'Partida',body:'Atuação',tags:[],matchFeedback:{category,opponent:'Adversário observado',coachName:'Treinador',started:true,minutes:70,rating:7,goals:0,assists:0,saves:0,cleanSheet:false,teamGoals:0,oppGoals:1,fanReaction:'',coachReaction:'',blockGames:1,blockStarts:1,blockGoals:0,blockAssists:0,blockMinutes:70}});
const fixture=()=>{const s=fresh();s.player.position='GK';s.player.careerTurn=1;return s;};
// Explicit old saved offers test primitive effects independently of the authored catalog.
const legacyOffer=(s,family)=>{
 s.player.decisionMemory={recent:[],lastOffered:{}};
 const ids={LOAD:['routine:extra','routine:rest','routine:review'],SERVICE:['routine:help','routine:review','routine:rest'],RIVALRY:['routine:intrigue','routine:team','routine:review']};
 s.pendingEvent={...ev(s.player.careerTurn),decisionFamily:family,choices:ids[family].map(id=>({id,label:`Legacy ${id}`}))};return s.pendingEvent;
};
let count=0;const check=(name,fn)=>{fn();count++;console.log('PASS',name);};
check('10 contextual routines vary cases with cooldown and no RNG consumption',()=>{
 const s=fixture(),cases=[],a=structuredClone(s),b=structuredClone(s);
 assert.deepEqual(buildRoutineDecision(a.player,ev()),buildRoutineDecision(b.player,ev()));
 const rng=s.player.rngState;
 for(let turn=1;turn<=10;turn++){s.player.careerTurn=turn;const e=buildRoutineDecision(s.player,ev(turn));assert.equal(e.choices.length,3);assert.equal(new Set(e.choices.map(c=>c.id)).size,3);assert.ok(e.decisionContext.length>50);assert.ok(!cases.slice(-20).includes(e.decisionCaseId));cases.push(e.decisionCaseId);}
 assert.ok(new Set(cases).size>=6);assert.equal(s.player.rngState,rng);assert.equal(s.player.decisionMemory.recent.length,3);
});
check('special events and legacy pending choices preserved',()=>{const s=fixture();const e={...ev(),choices:[{id:'old',label:'Legacy'}]};assert.equal(buildRoutineDecision(s.player,e),e);assert.deepEqual(e.choices,[{id:'old',label:'Legacy'}]);const special={...ev(),kind:'MILESTONE'};assert.equal(buildRoutineDecision(s.player,special),special);assert.equal(special.choices,undefined);});
check('extra GK work changes handling, costs energy, cannot grind or run injured',()=>{
 const s=fixture();legacyOffer(s,'LOAD');const p=s.player,handling=p.attributes.handling,finishing=p.attributes.finishing,cond=p.physicalCondition,fatigue=p.mentalFatigue;
 resolveChoice(s,'routine:extra');assert.equal(p.attributes.handling,handling+.25*calendarScale(p));assert.equal(p.attributes.finishing,finishing);assert.equal(p.physicalCondition,cond-5);assert.equal(p.mentalFatigue,fatigue+4);assert.equal(p.decisionMemory.extraLoad,2);assert.match(p.lastChoiceResult.summary,/Trabalho extra/);
 const after=JSON.stringify(s);resolveChoice(s,'routine:extra');assert.equal(JSON.stringify(s),after);
 const resolved=structuredClone(s);assert.equal(resolveRoutineChoice(p,{...ev(1),decisionFamily:'LOAD',choices:[{id:'routine:rest',label:'Descansar'}]},'routine:rest',new RNG(1)),false);assert.deepEqual(s,resolved);
 const next=buildRoutineDecision(p,ev(2));assert.ok(!next.choices.some(c=>c.id==='routine:extra'));
 const injured=fixture(),event=legacyOffer(injured,'LOAD');injured.player.injury={remainingBlocks:1,longAbsence:false,returnDiscussed:false};const before=JSON.stringify(injured.player);assert.equal(resolveRoutineChoice(injured.player,event,'routine:extra',new RNG(1)),false);assert.equal(JSON.stringify(injured.player),before);const beforeSave=JSON.stringify(injured);resolveChoice(injured,'routine:extra');assert.equal(JSON.stringify(injured),beforeSave);
});
check('forged ids do not mutate; rest costs opportunity and clears load',()=>{const s=fixture();legacyOffer(s,'LOAD');const before=JSON.stringify(s);resolveChoice(s,'routine:intrigue');assert.equal(JSON.stringify(s),before);s.player.decisionMemory.extraLoad=2;s.player.physicalCondition=70;s.player.mentalFatigue=20;resolveChoice(s,'routine:rest');assert.equal(s.player.physicalCondition,74);assert.equal(s.player.mentalFatigue,15);assert.equal(s.player.decisionMemory.extraLoad,1);assert.equal(s.player.careerApproach,undefined);});
check('favours improve affinity, not professional trust; group remembers contribution',()=>{const s=fixture();Object.assign(s.player,{age:22,currentClubId:'gremio',phase:'PROFISSIONAL',professionalStatus:'SENIOR'});syncCoachContext(s.player);const bond=coachBond(s.player,s.player.tactical.coachId),affinity=bond.affinity,trust=bond.trust;legacyOffer(s,'SERVICE');resolveChoice(s,'routine:help');assert.equal(bond.affinity,affinity+4);assert.equal(bond.trust,trust);assert.equal(s.player.relationships[groupKey(s.player)].affinity,52);assert.ok(s.player.relationships[groupKey(s.player)].memories.length);});
check('intrigue success and discovery have different real costs and persistent memories',()=>{
 for(const caught of [false,true]){const s=fixture();Object.assign(s.player,{age:22,currentClubId:'gremio',phase:'PROFISSIONAL',professionalStatus:'SENIOR'});syncCoachContext(s.player);const bond=coachBond(s.player,s.player.tactical.coachId),trust=bond.trust,affinity=bond.affinity;const event=legacyOffer(s,'RIVALRY');assert.ok(resolveRoutineChoice(s.player,event,'routine:intrigue',{chance:()=>caught}));assert.equal(bond.trust,trust+(caught?-6:0));assert.equal(bond.affinity,affinity+(caught?-3:2));assert.equal(s.player.relationships[groupKey(s.player)].resentment,caught?8:2);assert.equal(s.player.relationships[groupKey(s.player)].rivalry,4);assert.ok(s.player.relationships[groupKey(s.player)].memories.length);assert.equal(s.player.injury,undefined);}
});
check('new fields survive save/reload, legacy absence accepted, corrupted fields rejected',()=>{
 let raw=null;globalThis.localStorage={getItem:()=>raw,setItem:(_,v)=>raw=v,removeItem:()=>raw=null};
 const s=fixture();legacyOffer(s,'LOAD');assert.ok(storeSave(s));assert.deepEqual(loadSave().player.decisionMemory,s.player.decisionMemory);const rebuilt=structuredClone(s);s.player.careerTurn++;rebuilt.player.careerTurn++;assert.deepEqual(buildRoutineDecision(s.player,ev(2)),buildRoutineDecision(rebuilt.player,ev(2)));
 const legacy=fresh();raw=JSON.stringify(legacy);assert.ok(loadSave());
 for(const bad of [{recent:[],lastOffered:{BOGUS:2}},{recent:[],lastOffered:{LOAD:-1}},{recent:[],lastOffered:{},extraLoad:3},{recent:[],lastOffered:{},extraLoad:1.5},{recent:Array(4).fill({family:'LOAD',turn:1}),lastOffered:{}}]){const corrupted=fixture();corrupted.player.decisionMemory=bad;raw=JSON.stringify(corrupted);assert.equal(loadSave(),null);assert.equal(getPersistenceStatus().kind,'corrupt');}
 const badContext=fixture();badContext.pendingEvent.decisionContext=33;raw=JSON.stringify(badContext);assert.equal(loadSave(),null);
});
check('extra training affects next two youth match ratings, then clears',()=>{
 const normal=fixture();normal.player.positionSeasonChosenFor=normal.player.season;normal.player.life.education.chosenFor=normal.player.season;normal.pendingEvent=null;const loaded=structuredClone(normal);loaded.player.decisionMemory={recent:[],lastOffered:{},extraLoad:2};
 advanceCareer(normal);advanceCareer(loaded);assert.ok(normal.pendingEvent.matchFeedback);assert.ok(normal.pendingEvent.matchFeedback.rating>loaded.pendingEvent.matchFeedback.rating);assert.equal(loaded.player.decisionMemory.extraLoad,1);assert.equal(normal.player.rngState,loaded.player.rngState);
 normal.pendingEvent=null;loaded.pendingEvent=null;advanceCareer(normal);advanceCareer(loaded);assert.equal(loaded.player.decisionMemory.extraLoad,0);assert.equal(normal.player.rngState,loaded.player.rngState);
});
const offered=(s,id)=>{s.pendingEvent={...ev(s.player.careerTurn),decisionFamily:'LOAD',choices:[{id,label:id}]};return s.pendingEvent;};
const senior=()=>{const s=fixture();Object.assign(s.player,{age:22,currentClubId:'gremio',phase:'PROFISSIONAL',professionalStatus:'SENIOR'});syncCoachContext(s.player);return s;};
check('extra respects attribute cap99 and reports zero gain without hidden baseline',()=>{
 const s=fixture();s.player.attributes.handling=99;offered(s,'routine:extra');resolveChoice(s,'routine:extra');assert.equal(s.player.attributes.handling,99);assert.match(s.player.lastChoiceResult.summary,/ganho na habilidade trabalhada \+0/);assert.doesNotMatch(s.player.lastChoiceResult.summary,/99|99,|99\./);
});
check('local help and both intrigue outcomes leave former coach and tactical untouched',()=>{
 for(const action of ['help','caught','uncaught']){const s=senior();s.player.currentClubId=null;s.player.phase='ESCOLINHA';s.player.professionalStatus='YOUTH';const former=structuredClone({coaching:s.player.coaching,tactical:s.player.tactical});const id=action==='help'?'routine:help':'routine:intrigue';const event=offered(s,id);assert.ok(resolveRoutineChoice(s.player,event,id,{chance:()=>action==='caught'}));assert.deepEqual({coaching:s.player.coaching,tactical:s.player.tactical},former);assert.ok(s.player.relationships[groupKey(s.player)].memories.length);assert.doesNotMatch(s.player.history[0].detail,/afinidade com o treinador|conflito com o treinador/);}
});
check('physical mental knowledge and adaptation receipts report applied cap deltas',()=>{
 const cases=[
  ['routine:expose',{confidence:100,pressure:99},[/confiança pessoal \+0/,/pressão \+1/]],
  ['routine:reset',{confidence:0,pressure:2},[/confiança pessoal \+0/,/pressão −2/]],
  ['routine:review',{mentalFatigue:99},[/conhecimento da habilidade \+1/,/fadiga mental \+1/]],
  ['routine:focus',{adaptationDebt:.5,physicalCondition:1,mentalFatigue:99},[/adaptação pendente −0,5/,/condição −1/,/fadiga mental \+1/]],
  ['routine:rest',{physicalCondition:99,mentalFatigue:2},[/condição \+1/,/fadiga mental −2/]],
 ];
 for(const [id,state,patterns] of cases){const s=fixture();Object.assign(s.player,state);s.player.attributeKnowledge.handling=99;offered(s,id);resolveChoice(s,id);for(const pattern of patterns)assert.match(s.player.lastChoiceResult.summary,pattern);}
});
check('group and coach receipts use actual changes for favours cooperation and intrigue',()=>{
 for(const action of ['help','team','caught','uncaught']){const s=senior(),p=s.player,bond=coachBond(p,p.tactical.coachId);Object.assign(bond,{affinity:action==='caught'?2:99,trust:2,conflict:99});p.mentalFatigue=99;p.relationships[groupKey(p)]={personId:'group:gremio',affinity:99,respect:action==='caught'?2:99,resentment:99,rivalry:99,memories:[]};const id=action==='help'?'routine:help':action==='team'?'routine:team':'routine:intrigue';const event=offered(s,id);assert.ok(resolveRoutineChoice(p,event,id,{chance:()=>action==='caught'}));const detail=p.history[0].detail;assert.match(detail,/fadiga mental \+1/);
  if(action==='help'){assert.match(detail,/afinidade do grupo \+1/);assert.match(detail,/afinidade com o treinador \+1/);assert.match(detail,/confiança profissional \+0/);}
  if(action==='team')assert.match(detail,/respeito do grupo \+1/);
  if(action==='caught'){assert.match(detail,/confiança profissional −2/);assert.match(detail,/afinidade com o treinador −2/);assert.match(detail,/conflito com o treinador \+1/);assert.match(detail,/respeito do grupo −2/);}
  if(action==='uncaught'){assert.match(detail,/afinidade com o treinador \+1/);assert.match(detail,/afinidade do grupo \+1/);}
  if(action==='caught'||action==='uncaught'){assert.match(detail,/ressentimento do grupo \+1/);assert.match(detail,/rivalidade no grupo \+1/);assert.match(p.relationships[groupKey(p)].memories[0],/rivalidade \+1/);}
 }
});
check('affinity and conflict change coach ask response without granting professional trust',()=>{
 const setup=(affinity,conflict)=>{const s=senior();s.player.coaching.jobs.gremio.coachId='luis-fernando-suarez';syncCoachContext(s.player);const b=coachBond(s.player,s.player.tactical.coachId);Object.assign(b,{affinity,conflict,trust:47});assert.equal(coachProfile(s.player.tactical.coachId).dialogue,54);resolveCoachChoice(s.player,'coach-talk:ask');assert.equal(b.trust,47);assert.equal(s.player.tactical.trust,47);return b;};
 assert.match(setup(50,0).memories[0],/resistência/);
 assert.match(setup(70,0).memories[0],/esclareceu/);
 assert.match(setup(70,50).memories[0],/resistência/);
});
check('adult amateur cases preserve local eligibility without transfer or education menus',()=>{
 for(const linked of [false,true])for(const family of ['PATH','RIVALRY','LOAD']){
  const s=fixture();Object.assign(s.player,{age:23,professionalStatus:'YOUTH',phase:linked?'BASE':'ESCOLINHA',currentClubId:linked?'gremio':null});
  s.player.decisionMemory={recent:[],lastOffered:Object.fromEntries(['LOAD','SPACE','SERVICE','RIVALRY','PRESSURE','ADAPTATION','PATH','LIFE'].filter(f=>f!==family).map(f=>[f,s.player.careerTurn]))};
  const e=buildRoutineDecision(s.player,ev(s.player.careerTurn,'AMATEUR')),definition=DECISION_CASES.find(c=>c.id===e.decisionCaseId);
  assert.equal(e.decisionFamily,family);assert.ok(definition);assert.notEqual(definition.scope,'SENIOR');assert.notEqual(definition.scope,'YOUTH');assert.ok((definition.minAge??12)<=23&&(definition.maxAge??99)>=23);
  assert.ok(!e.choices.some(c=>['career:market','career:education'].includes(c.id)));assert.ok(e.decisionContext.includes(definition.title));
  for(const option of definition.choices){const index=definition.choices.indexOf(option),id=e.choices[index].id;if(option.action==='path'||option.action==='discuss')assert.equal(id,linked?'career:discuss':'routine:review');if(option.action==='stable')assert.equal(id,'career:local');}
 }
 const s=fixture();Object.assign(s.player,{age:23,professionalStatus:'YOUTH',phase:'ESCOLINHA',currentClubId:null});const e=legacyOffer(s,'LOAD');assert.ok(resolveRoutineChoice(s.player,e,'routine:extra',new RNG(1)));assert.match(s.player.history[0].detail,/próxima nota fora do profissional/);
});
check('receipt decimals are compact and preserve sub-cent changes without exposing baseline',()=>{
 const trained=fixture();offered(trained,'routine:extra');resolveChoice(trained,'routine:extra');assert.match(trained.player.lastChoiceResult.summary,/habilidade trabalhada \+0,11/);
 const tiny=fixture();tiny.player.attributes.handling=99-.000056;offered(tiny,'routine:extra');resolveChoice(tiny,'routine:extra');assert.equal(tiny.player.attributes.handling,99);assert.match(tiny.player.lastChoiceResult.summary,/habilidade trabalhada \+<0,01/);assert.doesNotMatch(tiny.player.lastChoiceResult.summary,/0\.000056|98|99/);
 const adapted=fixture();adapted.player.adaptationDebt=.000056;offered(adapted,'routine:focus');resolveChoice(adapted,'routine:focus');assert.equal(adapted.player.adaptationDebt,0);assert.match(adapted.player.lastChoiceResult.summary,/adaptação pendente −<0,01/);
});
console.log(`${count} decision groups PASS`);

{const s=fixture();const experience=s.player.positionProficiency.GK,attrs=structuredClone(s.player.attributes);legacyOffer(s,'SERVICE');resolveChoice(s,'routine:review');assert.ok(s.player.positionProficiency.GK>experience);assert.deepEqual(s.player.attributes,attrs);assert.ok(s.player.lastChoiceResult.effects.some(x=>x.includes('experiência na posição')));console.log('PASS video review still teaches observable positional experience after acquired attributes become visible');}
