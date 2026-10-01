import assert from 'node:assert/strict';
import {createCareerWithSeed,resolveChoice,advanceCareer} from '../dist/core/engine.js';
import {evaluationSearchPreview,searchForEvaluation,scoutingCandidates,trialProbability} from '../dist/core/pathways.js';
import {RNG} from '../dist/core/random.js';
import {CLUB_BY_ID} from '../dist/data/clubs-br-2026.js';
import {loadSave,storeSave,getPersistenceStatus,getRecoveryRaw} from '../dist/core/persistence.js';
const fresh=()=>createCareerWithSeed('Busca',19,'gremio','Porto Alegre','RS');
const decision=s=>{s.pendingEvent={id:'old-search',kind:'CHOICE',title:'Outros caminhos',body:'Legado',tags:[],choices:[{id:'career:explore',label:'Buscar outras oportunidades de avaliação',hint:'Ampliar observação para convites futuros; não garante vaga'},{id:'career:local',label:'Continuar'}]};return s;};
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('PASS',name);};
check('old no-cost choice now previews and applies real costs without guaranteeing a trial',()=>{
 const s=decision(fresh()),p=s.player,original=structuredClone(p),event=structuredClone(s.pendingEvent);const preview=evaluationSearchPreview(p);assert.match(preview.hint,/Fadiga mental \+3; pressão \+2/);assert.deepEqual(s.pendingEvent,event);
 resolveChoice(s,'career:explore');assert.equal(p.mentalFatigue,original.mentalFatigue+3);assert.equal(p.pressure,original.pressure+2);assert.equal(p.life.scouting.observations,1);assert.equal(p.life.scouting.searchPriority,true);assert.equal(p.life.scouting.lastSearchSeason,p.season);assert.equal(p.life.scouting.trialAttempts,0);assert.equal(p.currentClubId,null);assert.equal(p.rngState,original.rngState);assert.deepEqual(p.attributes,original.attributes);assert.match(p.lastChoiceResult.summary,/incertos/);assert(p.lastChoiceResult.effects.some(e=>e.includes('fadiga mental')));assert(p.lastChoiceResult.effects.some(e=>e.includes('pressão')));
 const after=JSON.stringify(s);resolveChoice(s,'career:explore');assert.equal(JSON.stringify(s),after);
});
check('observation beyond 30 stays monotonic and cooldown cannot stack',()=>{
 const p=fresh().player;p.life.scouting.observations=70;searchForEvaluation(p);assert.equal(p.life.scouting.observations,71);assert(!evaluationSearchPreview(p).available);const before=JSON.stringify(p);assert.equal(searchForEvaluation(p),null);assert.equal(JSON.stringify(p),before);
 scoutingCandidates(p,new RNG(99));assert.equal(p.life.scouting.searchPriority,undefined);assert(!evaluationSearchPreview(p).available);p.season++;assert(evaluationSearchPreview(p).available);
});
check('priority improves the next list draw once and never improves approval probability',()=>{
 const p=fresh().player;p.life.scouting.observations=20;const club=CLUB_BY_ID.gremio,approval=trialProbability(p,club,false);
 const calls=[];const rng={pick:a=>a[0],chance:prob=>{calls.push(prob);return false;}};
 const a=scoutingCandidates(p,rng);const base=calls.pop();assert.equal(a.length,1);searchForEvaluation(p);const b=scoutingCandidates(p,rng);const enhanced=calls.pop();assert(Math.abs(enhanced-base-.12)<1e-10);assert.equal(b.length,1);assert.equal(p.life.scouting.searchPriority,undefined);assert.equal(trialProbability(p,club,false),approval);scoutingCandidates(p,rng);assert.equal(calls.pop(),base);
});
check('priority can open a wider observation below the ordinary threshold, not a guaranteed second option',()=>{
 const p=fresh().player,probs=[];const rng={pick:a=>a[0],chance:x=>{probs.push(x);return false;}};
 assert.equal(scoutingCandidates(p,rng).length,1);assert.equal(probs.length,0);searchForEvaluation(p);assert.equal(scoutingCandidates(p,rng).length,1);assert.equal(probs.length,1);assert(probs[0]<=.77);assert.equal(p.life.scouting.searchPriority,undefined);
});
check('blocked club/senior/overload options are guarded even on legacy events',()=>{
 for(const mutate of [p=>p.currentClubId='gremio',p=>p.professionalStatus='SENIOR',p=>p.mentalFatigue=80,p=>p.life.scouting.searchPriority=true,p=>p.life.scouting.lastSearchSeason=p.season]){const s=decision(fresh());mutate(s.player);const before=JSON.stringify(s);assert(!evaluationSearchPreview(s.player).available);resolveChoice(s,'career:explore');assert.equal(JSON.stringify(s),before);}
});
check('pressure at cap previews actual delta, fatigue always costs when available',()=>{const p=fresh().player;p.pressure=100;assert.equal(evaluationSearchPreview(p).pressure,0);assert.match(evaluationSearchPreview(p).hint,/pressão \+0/);searchForEvaluation(p);assert.equal(p.pressure,100);assert.equal(p.mentalFatigue,11);});
check('modern fields reload, legacy remains valid, corrupt/future fields preserve recovery bytes',()=>{
 let raw=null;globalThis.localStorage={getItem:()=>raw,setItem:(_,v)=>raw=v,removeItem:()=>raw=null};
 const s=fresh();searchForEvaluation(s.player);assert(storeSave(s));assert.deepEqual(loadSave().player.life.scouting,s.player.life.scouting);const old=fresh();assert(storeSave(old));assert(loadSave());
 for(const bad of [p=>p.life.scouting.searchPriority=2,p=>p.life.scouting.lastSearchSeason=-1,p=>p.life.scouting.lastSearchSeason=p.season+1,p=>p.life.scouting.lastSearchSeason=2026.5]){const s=fresh();bad(s.player);raw=JSON.stringify(s);assert.equal(loadSave(),null);assert.equal(getPersistenceStatus().kind,'corrupt');assert.equal(getRecoveryRaw(),raw);}
 raw=null;
});
check('actual next invitation consumes priority and keeps approval a separate choice',()=>{
 const s=decision(fresh()),p=s.player;Object.assign(p,{age:13,position:'ST',seasonTurn:2});p.positionSeasonChosenFor=p.season;p.life.education.chosenFor=p.season;
 resolveChoice(s,'career:explore');advanceCareer(s);assert.match(s.pendingEvent.id,/^trial-/);assert.equal(p.life.scouting.searchPriority,undefined);assert.equal(p.life.scouting.trialAttempts,0);assert.equal(p.currentClubId,null);assert(s.pendingEvent.choices.some(c=>c.id==='trial:stay'));
});
console.log(`${checks} evaluation search groups passed`);
