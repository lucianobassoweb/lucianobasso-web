import assert from 'node:assert/strict';
import {createCareerWithSeed,advanceCareer,resolveChoice} from '../dist/core/engine.js';
import {compensationView,quoteCompensation,agreeCompensation,syncCompensation} from '../dist/core/compensation.js';
import {syncCoachContext,ensureCoaching} from '../dist/core/coaches.js';
import {CLUB_BY_ID} from '../dist/data/clubs-br-2026.js';
import {loadSave,storeSave,getRecoveryRaw} from '../dist/core/persistence.js';
const fresh=()=>{const s=createCareerWithSeed('Remuneração',55),p=s.player;s.pendingEvent=null;p.position='CM';p.positionSeasonChosenFor=p.season;p.life.education.chosenFor=p.season;return s;};
const adult=()=>{const s=fresh(),p=s.player;Object.assign(p,{age:24,currentClubId:'gremio',professionalStatus:'SENIOR',phase:'PROFISSIONAL',marketValue:20000000,contractYearsLeft:3});p.careerStats.appearances=40;p.careerStats.minutes=4000;syncCoachContext(p);p.tactical.discussedFor=p.season;return s;};
let groups=0;function check(name,fn){fn();groups++;console.log('PASS',name);}
check('read only legacy previews distinguish unavailable agreement from future estimate',()=>{
 const p=adult().player,before=JSON.stringify(p);const v=compensationView(p);assert.equal(v.monthly,null);assert.ok(v.referenceMonthly>0);assert.ok(v.legacy);assert.equal(JSON.stringify(p),before);const local=fresh().player;assert.equal(compensationView(local).kind,'NONE');assert.equal(compensationView(local).monthly,0);
});
check('value and club budget affect future salary while signed salary is protected',()=>{
 const p=adult().player;agreeCompensation(p);const original=p.compensation.monthly,base=compensationView(p).referenceMonthly;p.marketValue=50000000;assert.ok(compensationView(p).referenceMonthly>base);syncCompensation(p);assert.equal(p.compensation.monthly,original);p.marketValue=100000;assert.ok(compensationView(p).referenceMonthly<base);p.season++;syncCompensation(p);assert.equal(p.compensation.monthly,original);agreeCompensation(p);assert.ok(p.compensation.monthly<original);assert.ok(quoteCompensation(p,CLUB_BY_ID.gremio).monthly>quoteCompensation(p,CLUB_BY_ID.trem).monthly);
});
check('aid is reviewed annually; promotion changes kind; release and retirement stop pay',()=>{
 const p=fresh().player;p.currentClubId='gremio';agreeCompensation(p);const old=p.compensation.monthly;assert.equal(p.compensation.kind,'AID');p.age=17;for(const k of Object.keys(p.attributes))p.attributes[k]=65;syncCompensation(p);assert.equal(p.compensation.monthly,old);p.season++;syncCompensation(p);assert.ok(p.compensation.monthly>old);p.professionalStatus='SENIOR';syncCompensation(p);assert.equal(p.compensation.kind,'SALARY');p.currentClubId=null;syncCompensation(p);assert.equal(p.compensation,undefined);p.currentClubId='gremio';agreeCompensation(p);p.phase='APOSENTADO';syncCompensation(p);assert.equal(p.compensation,undefined);
});
check('floors caps and supplied terms never create one-real salaries or nonfinite pay',()=>{
 for(const s of [fresh(),adult()]){const p=s.player;p.currentClubId='gremio';for(const n of [1,-1,NaN,Infinity,100000000]){agreeCompensation(p,n);assert.ok(Number.isFinite(p.compensation.monthly));assert.ok(p.compensation.monthly>=(p.compensation.kind==='AID'?150:1500));assert.ok(p.compensation.monthly<=(p.compensation.kind==='AID'?3500:2500000));}}
});
check('transfer accepts the exact salary shown, including coach reconsideration and replay guard',()=>{
 const s=adult(),p=s.player;const choice='market:vasco:1000000:2026',monthly=7300;s.pendingEvent={id:'offer',kind:'MARKET',title:'Oferta',body:'Projeto',tags:[],payload:{coachOffers:{vasco:'changed-coach'},salaryOffers:{vasco:monthly}},choices:[{id:choice,label:'Vasco'}]};resolveChoice(s,choice);assert.equal(p.currentClubId,'gremio');assert.equal(s.pendingEvent.id,'market-reconsider');assert.equal(s.pendingEvent.payload.salaryOffers.vasco,monthly);assert.match(s.pendingEvent.choices[0].hint,/7\.300/);const confirm=s.pendingEvent.choices[0].id;resolveChoice(s,confirm);assert.equal(p.currentClubId,'vasco');assert.equal(p.compensation.monthly,monthly);const after=JSON.stringify(s);resolveChoice(s,confirm);assert.equal(JSON.stringify(s),after);
});
check('short contract renewal reprices, long contract stay and ordinary games do not',()=>{
 const s=adult(),p=s.player;agreeCompensation(p,4000);p.marketValue=70000000;s.pendingEvent={id:'stay',kind:'MARKET',title:'Continuar',body:'Projeto',tags:[],choices:[{id:'market:stay',label:'Ficar'}]};resolveChoice(s,'market:stay');assert.equal(p.compensation.monthly,4000);p.contractYearsLeft=1;s.pendingEvent={id:'stay2',kind:'MARKET',title:'Continuar',body:'Projeto',tags:[],choices:[{id:'market:stay',label:'Ficar'}]};resolveChoice(s,'market:stay');assert.ok(p.compensation.monthly>4000);const current=p.compensation.monthly;advanceCareer(s);assert.equal(p.compensation.monthly,current);
});
check('legacy missing agreement initializes prospectively only after an accepted transition',()=>{
 const s=adult(),p=s.player;const attrs=structuredClone(p.attributes),rng=p.rngState;s.pendingEvent={id:'choose',kind:'CHOICE',title:'Projeto',body:'Contexto',tags:[],choices:[{id:'career:stable',label:'Seguir'}]};resolveChoice(s,'bad');assert.equal(p.compensation,undefined);advanceCareer(s);assert.equal(p.compensation,undefined);resolveChoice(s,'career:stable');assert.ok(p.compensation);assert.equal(p.compensation.agreedSeason,p.season);assert.equal(p.rngState,rng);assert.deepEqual(p.attributes,attrs);
});
check('new fields round trip; corrupt pay protects original save; legacy pending without identity stays valid',()=>{
 const map=new Map();globalThis.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};const s=adult();agreeCompensation(s.player);advanceCareer(s);assert.ok(storeSave(s));assert.deepEqual(loadSave().player.compensation,s.player.compensation);const key=[...map.keys()][0];const good=JSON.stringify(s);for(const modify of [p=>p.compensation.monthly=1,p=>p.compensation.monthly=2500001,p=>p.compensation.kind='AID',p=>p.compensation.clubId='vasco',p=>p.compensation.agreedSeason=p.season+1,p=>p.compensation.lastReviewedSeason=p.season+1]){const b=JSON.parse(good);modify(b.player);const raw=JSON.stringify(b);map.set(key,raw);assert.equal(loadSave(),null);assert.equal(getRecoveryRaw(),raw);assert.equal(storeSave(s),false);assert.equal(map.get(key),raw);}map.set(key,good);assert.ok(loadSave());const legacy=fresh();assert.ok(storeSave(legacy));assert.equal(loadSave().player.compensation,undefined);
});
console.log(`${groups} compensation groups PASS`);
