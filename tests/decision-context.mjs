import assert from 'node:assert/strict';
import {decisionContext} from '../dist/core/decision-context.js';
import {DECISION_CASES} from '../dist/data/decision-cases.js';
import {createCareerWithSeed} from '../dist/core/engine.js';
import {ensureGroupRelation} from '../dist/core/group.js';
const fresh=()=>{const p=createCareerWithSeed('Contexto',42,'gremio','Porto Alegre','RS').player;Object.assign(p,{position:'ST',careerTurn:8,physicalCondition:55,mentalFatigue:40,pressure:70});return p;};
const event=(p,family)=>{const c=DECISION_CASES.find(c=>c.family===family);return {id:'observed',kind:'INFO',title:'Partida',body:'Corpo legado factual',tags:[],decisionFamily:family,decisionCaseId:c.id,decisionContext:`${c.title}. Situação persistida específica.`,decisionCaseContext:{clubId:p.currentClubId,category:'U15',position:p.position,season:p.season,turn:p.careerTurn},matchFeedback:{category:'U15',minutes:0,started:false,rating:0}};};
let groups=0;const check=(label,fn)=>{fn();groups++;console.log('PASS',label);};
check('new title is separate from persisted situation; legacy uses its actual body',()=>{
 const p=fresh(),e=event(p,'LOAD'),c=decisionContext(p,e);assert.equal(c.title,DECISION_CASES.find(x=>x.id===e.decisionCaseId).title);assert.equal(c.situation,'Situação persistida específica.');assert.ok(!c.situation.includes(c.title));
 const old={id:'old',kind:'INFO',title:'Antigo',body:'Pedido antigo que permanece.',tags:[]};assert.deepEqual(decisionContext(p,old),{title:'Próxima decisão',situation:old.body,stakes:[]});
});
check('actual bench and category starts inform opportunity, no fabricated appearance',()=>{
 const p=fresh(),e=event(p,'SPACE');p.currentSeason.categories={U15:{appearances:6,starts:2,minutes:310,goals:1,assists:0,avgRating:6.8}};const c=decisionContext(p,e);assert.match(c.stakes[0],/banco, sem minutos/);assert.match(c.stakes[1],/2 titularidades em 6 participações/);e.matchFeedback.minutes=19;e.matchFeedback.started=false;assert.match(decisionContext(p,e).stakes[0],/19 minutos, entrando/);
});
check('recent striker evidence reports actual exposure including a goal, stale form ignored',()=>{
 const p=fresh(),e=event(p,'PRESSURE');p.recentForm={context:{...e.decisionCaseContext},lastObservedTurn:8,observations:Array.from({length:8},(_,i)=>({turn:i+1,minutes:70,goals:i===7?1:0,assists:0,rating:6.8,xg:.3,xa:0}))};
 let c=decisionContext(p,e);assert.equal(c.stakes.length,2);assert.match(c.stakes[0],/8 atuações.*1 gols.*560 minutos.*2,4/);assert.doesNotMatch(c.stakes.join(' '),/culpa|sempre|sem gols/);
 p.recentForm.observations[7].goals=0;assert.match(decisionContext(p,e).stakes[0],/0 gols/);p.recentForm.context.clubId='outro';c=decisionContext(p,e);assert.equal(c.stakes.length,1);assert.match(c.stakes[0],/Pressão pessoal/);p.pressure=10;assert.deepEqual(decisionContext(p,e).stakes,[]);
});
check('stale event suppresses stakes; healthy workload and zero adaptation emit no false distress',()=>{
 const p=fresh(),e=event(p,'LOAD');e.decisionCaseContext.turn--;assert.deepEqual(decisionContext(p,e).stakes,[]);e.decisionCaseContext.turn++;p.physicalCondition=95;p.mentalFatigue=5;assert.doesNotMatch(decisionContext(p,e).stakes.join(' '),/fadiga|desgaste|cansado|pressão/);
 p.adaptationDebt=0;assert.deepEqual(decisionContext(p,event(p,'ADAPTATION')).stakes,[]);p.adaptationDebt=5;assert.match(decisionContext(p,event(p,'ADAPTATION')).stakes[0],/pendente.*5/);
});
check('school age tradeoff, low happiness and group facts reflect known current state',()=>{
 const p=fresh();p.life.education.priority='SCHOOL';assert.match(decisionContext(p,event(p,'PATH')).stakes[0],/12 anos.*visão e decisão.*menos tempo/);p.lifestyle={happiness:20,excessKg:0,sleepDebt:0,lastProcessedTurn:8};const life=decisionContext(p,event(p,'LIFE'));assert.match(life.stakes[1],/20\/100.*baixa satisfação/);assert.doesNotMatch(life.stakes.join(' '),/feliz|bom humor/);delete p.lifestyle;assert.equal(decisionContext(p,event(p,'LIFE')).stakes.length,1);
 const r=ensureGroupRelation(p);r.respect=43;r.resentment=30;const rivalry=decisionContext(p,event(p,'RIVALRY'));assert.match(rivalry.stakes[0],/respeito 43.*ressentimento 30/);
});
check('all helpers read without DNA, unseeded RNG, migration or input mutation',()=>{
 const p=fresh();delete p.professionalStatus;delete p.life;delete p.squad;delete p.lifestyle;const events=Object.keys({LOAD:1,SPACE:1,SERVICE:1,RIVALRY:1,PRESSURE:1,ADAPTATION:1,PATH:1,LIFE:1}).map(f=>event(p,f));const snapshot=JSON.stringify({p,events}),dna=p.dna,rng=p.rngState;Object.defineProperty(p,'dna',{get(){throw new Error('DNA read');},configurable:true});const random=Math.random;Math.random=()=>{throw new Error('RNG used');};try{for(const e of events){const c=decisionContext(p,e);assert.ok(c.stakes.length<=2);}}finally{Math.random=random;Object.defineProperty(p,'dna',{value:dna,writable:true,configurable:true});}assert.equal(JSON.stringify({p,events}),snapshot);assert.equal(p.rngState,rng);
});
console.log(`decision-context: ${groups} groups passed`);
