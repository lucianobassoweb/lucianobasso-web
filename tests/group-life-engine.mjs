import assert from 'node:assert/strict';
import {createCareerWithSeed,advanceCareer,resolveChoice} from '../dist/core/engine.js';
import {groupKey,groupRelation,ensureGroupContext,ensureGroupRelation,groupAttackSupply,observeGroupMatch,captainEvent,resolveCaptainChoice} from '../dist/core/group.js';
import {simulatePlayerMatch} from '../dist/core/match.js';
import {RNG} from '../dist/core/random.js';
import {syncCoachContext} from '../dist/core/coaches.js';
import {loadSave,storeSave,getRecoveryRaw} from '../dist/core/persistence.js';
import {CLUB_BY_ID} from '../dist/data/clubs-br-2026.js';
const fresh=(seed=55)=>{const s=createCareerWithSeed('Teste',seed,'gremio','Porto Alegre','RS');s.pendingEvent=null;Object.assign(s.player,{position:'CM',positionSeasonChosenFor:2026});s.player.life.education.chosenFor=2026;return s;};
const adult=(seed=55)=>{const s=fresh(seed),p=s.player;Object.assign(p,{age:24,phase:'PROFISSIONAL',professionalStatus:'SENIOR',currentClubId:'gremio'});p.currentSeason.clubId='gremio';p.currentSeason.age=24;p.careerStats.appearances=40;p.careerStats.minutes=3000;syncCoachContext(p);p.tactical.discussedFor=2026;ensureGroupContext(p);return s;};
let groups=0;function check(name,fn){fn();groups++;console.log('PASS',name);}
check('legacy group is migrated only in the current context; club/category/local identity isolated',()=>{
 const s=fresh(),p=s.player;delete p.squad;const legacy={personId:'group:local',affinity:62,respect:74,rivalry:3,resentment:8,memories:['Fato antigo']};p.relationships['group:local']=structuredClone(legacy);
 assert.equal(groupRelation(p).respect,74);ensureGroupContext(p);const key=groupKey(p);assert.equal(groupRelation(p).respect,74);assert.deepEqual(p.relationships['group:local'],legacy);ensureGroupContext(p);assert.equal(Object.keys(p.relationships).length,2);
 p.currentClubId='gremio';ensureGroupContext(p);assert.equal(groupRelation(p).respect,50);ensureGroupRelation(p).respect=82;p.professionalStatus='SENIOR';p.age=18;ensureGroupContext(p);assert.equal(groupRelation(p).respect,50);
 p.currentClubId=null;p.professionalStatus='YOUTH';p.age=12;p.life.localSchool='Outra escola';ensureGroupContext(p);assert.notEqual(groupKey(p),key);assert.equal(groupRelation(p).respect,50);
});
check('participation changes respect once, bench cannot earn captaincy, poor play still costs respect',()=>{
 const p=fresh().player;let r=ensureGroupRelation(p);p.careerTurn=1;observeGroupMatch(p,{minutes:70,started:true,rating:7.5,red:false});assert.equal(r.respect,50.6);const a=structuredClone(p.squad);observeGroupMatch(p,{minutes:70,started:true,rating:7.5,red:false});assert.deepEqual(p.squad,a);p.careerTurn++;observeGroupMatch(p,{minutes:0,started:false,rating:0,red:false});assert.equal(p.squad.contexts[groupKey(p)].appearances,1);assert.equal(r.respect,50.6);p.careerTurn++;observeGroupMatch(p,{minutes:70,started:true,rating:5.5,red:false});assert.equal(r.respect,49.800000000000004);assert.equal(captainEvent(p),null);
});
check('attack supply helps statistical contribution, never changes fixture score or ability',()=>{
 let neutral=0,high=0,low=0;for(let seed=1;seed<=500;seed++){
  const base=adult(seed).player;base.position='ST';const dna=structuredClone(base.dna),attrs=structuredClone(base.attributes);for(const [respect,bucket] of [[50,'n'],[95,'h'],[10,'l']]){const p=structuredClone(base);ensureGroupRelation(p).respect=respect;const m=simulatePlayerMatch(p,CLUB_BY_ID.gremio,CLUB_BY_ID.vasco,new RNG(seed),true,1,{home:true,teamGoals:3,oppGoals:1,minutes:80});assert.equal(m.teamGoals,3);assert.equal(m.oppGoals,1);assert.ok(m.goals+m.assists<=3);assert.deepEqual(p.dna,dna);assert.deepEqual(p.attributes,attrs);const contribution=m.goals+m.assists;if(bucket==='n')neutral+=contribution;if(bucket==='h')high+=contribution;if(bucket==='l')low+=contribution;}
 }
 assert.ok(high>neutral&&neutral>low,`${high}>${neutral}>${low}`);console.log(JSON.stringify({attack500:{low,neutral,high}}));
});
check('defensive group covers risky intervention rather than rewriting club campaign',()=>{
 let covers=0,normalY=0,highY=0;for(let seed=1;seed<=800;seed++){
  const a=adult(seed).player;a.position='CB';const b=structuredClone(a);ensureGroupRelation(b).respect=100;
  for(const [p,bucket] of [[a,'n'],[b,'h']]){const m=simulatePlayerMatch(p,CLUB_BY_ID.gremio,CLUB_BY_ID.vasco,new RNG(seed),true,1,{home:true,teamGoals:0,oppGoals:2,minutes:80});assert.equal(m.teamGoals,0);assert.equal(m.oppGoals,2);assert.equal(m.cleanSheet,false);if(bucket==='n')normalY+=m.yellow?1:0;else{highY+=m.yellow?1:0;covers+=m.groupCovers??0;}}
 }
 assert.ok(covers>0&&highY<normalY);console.log(JSON.stringify({cover800:{covers,normalY,highY}}));
 const p=adult().player;p.position='CB';ensureGroupRelation(p).respect=100;const m=simulatePlayerMatch(p,CLUB_BY_ID.gremio,CLUB_BY_ID.vasco,new RNG(1),false,1,{home:true,teamGoals:0,oppGoals:3,minutes:0});assert.equal(m.groupCovers,0);assert.equal(m.goals,0);
});
check('election requires actual presence; acceptance costs, decline/replay/stale/forgery guarded',()=>{
 const setup=()=>{const s=adult(),p=s.player;p.careerTurn=20;ensureGroupRelation(p).respect=80;p.squad.contexts[groupKey(p)]={appearances:10,starts:10,minutes:700,captain:false};return s;};
 const s=setup(),p=s.player,e=captainEvent(p);assert.ok(e);s.pendingEvent=e;const pressure=p.pressure,fatigue=p.mentalFatigue;resolveChoice(s,'captain:accept');assert.equal(s.pendingEvent,null);assert.equal(p.squad.contexts[groupKey(p)].captain,true);assert.equal(p.pressure,pressure+4);assert.equal(p.mentalFatigue,fatigue+2);const frozen=JSON.stringify(s);resolveChoice(s,'captain:accept');assert.equal(JSON.stringify(s),frozen);
 const d=setup(),de=captainEvent(d.player);assert.ok(resolveCaptainChoice(d.player,de,'captain:decline'));assert.equal(groupRelation(d.player).respect,80);const after=JSON.stringify(d.player);assert.equal(resolveCaptainChoice(d.player,de,'captain:decline'),false);assert.equal(JSON.stringify(d.player),after);assert.equal(captainEvent(d.player),null);
 for(const invalidate of [x=>x.player.season++,x=>x.player.careerTurn++,x=>x.player.currentClubId='vasco',x=>x.player.injury={remainingBlocks:1,longAbsence:false,returnDiscussed:false},x=>x.player.phase='APOSENTADO',x=>x.player.squad.contexts[groupKey(x.player)].starts=0,x=>x.player.squad.contexts[groupKey(x.player)].minutes=0,x=>ensureGroupRelation(x.player).resentment=30]){const t=setup();t.pendingEvent=captainEvent(t.player);invalidate(t);const before=JSON.stringify(t);resolveChoice(t,'captain:accept');assert.equal(JSON.stringify(t),before);}
});
check('capitancy ends on changing group and does not resume automatically on returning',()=>{
 const p=adult().player,key=groupKey(p);ensureGroupRelation(p).respect=80;p.squad.contexts[key]={appearances:10,starts:10,minutes:700,captain:true};p.currentClubId='vasco';ensureGroupContext(p);assert.equal(p.squad.contexts[key].captain,false);p.currentClubId='gremio';ensureGroupContext(p);assert.equal(p.squad.contexts[key].starts,0);assert.equal(groupRelation(p).respect,80);assert.equal(captainEvent(p),null);
 p.squad.contexts[key].captain=true;ensureGroupRelation(p).respect=54;p.careerTurn++;observeGroupMatch(p,{minutes:70,started:true,rating:5.5,red:false});assert.equal(p.squad.contexts[key].captain,false);
});
const offerLife=(s,id)=>{s.player.careerTurn=Math.max(1,s.player.careerTurn);s.pendingEvent={id:`life-${s.player.careerTurn}`,kind:'INFO',title:'Intervalo',body:'',tags:[],decisionFamily:'LIFE',choices:[{id,label:'Lazer'}]};};
check('nocturnal cost affects two actual youth games and keeps weight/happiness observable',()=>{
 const a=fresh(),b=structuredClone(a);offerLife(b,'routine:gaming');resolveChoice(b,'routine:gaming');a.player.careerTurn=b.player.careerTurn;assert.equal(b.player.lifestyle.happiness,59);assert.equal(b.player.lifestyle.sleepDebt,2);assert.ok(b.player.lastChoiceResult.effects.some(x=>x.includes('felicidade pessoal')));
 for(let i=0;i<2;i++){for(const s of [a,b]){s.pendingEvent=null;advanceCareer(s);}assert.ok(b.pendingEvent.matchFeedback.rating<=a.pendingEvent.matchFeedback.rating);assert.ok(b.player.lifestyle.sleepDebt>0);assert.ok(b.player.lifestyle.happiness<=59);assert.ok(b.player.matchEmotions.observations.length>0);assert.equal(b.player.currentSeason.appearances,a.player.currentSeason.appearances);}
 const adultS=adult();offerLife(adultS,'routine:pizza-beer');const w=adultS.player.weightKg;resolveChoice(adultS,'routine:pizza-beer');assert.equal(adultS.player.weightKg,w+.4);assert.equal(adultS.player.lifestyle.happiness,57);adultS.pendingEvent=null;advanceCareer(adultS);assert.equal(adultS.player.lifestyle.excessKg,.36);
 const minor=fresh();offerLife(minor,'routine:party');const before=JSON.stringify(minor);resolveChoice(minor,'routine:party');assert.equal(JSON.stringify(minor),before);
});
check('modern optional save fields reload intact; corrupt fields preserve exact raw bytes; legacy absent unchanged',()=>{
 let raw=null;globalThis.localStorage={getItem:()=>raw,setItem:(_k,v)=>{raw=v;},removeItem:()=>{raw=null;}};
 const s=fresh();offerLife(s,'routine:food');resolveChoice(s,'routine:food');s.pendingEvent=null;advanceCareer(s);assert.ok(storeSave(s));const before=raw,reload=loadSave();assert.equal(raw,before);assert.deepEqual(reload.player.lifestyle,s.player.lifestyle);assert.deepEqual(reload.player.squad,s.player.squad);
 const invalids=[x=>x.player.lifestyle.happiness=101,x=>x.player.lifestyle.sleepDebt=8.1,x=>x.player.lifestyle.excessKg=12.1,x=>x.player.lifestyle.lastProcessedTurn=x.player.careerTurn+1,x=>x.player.squad.version='BOGUS',x=>x.player.squad.lastObservedTurn=x.player.careerTurn+1,x=>x.player.squad.contexts[groupKey(x.player)].starts=999,x=>x.player.story.active.targetGoodMatches=0,x=>delete x.player.story.active.position,x=>delete x.player.story.active.minMatchMinutes];
 for(const invalidate of invalids){const bad=structuredClone(s);invalidate(bad);raw=JSON.stringify(bad);const corrupt=raw;assert.equal(loadSave(),null);assert.equal(getRecoveryRaw(),corrupt);assert.equal(raw,corrupt);assert.equal(storeSave(s),false);}
 const legacy=structuredClone(s);delete legacy.player.squad;delete legacy.player.lifestyle;raw=JSON.stringify(legacy);const oldRaw=raw;assert.ok(loadSave());assert.equal(raw,oldRaw);delete globalThis.localStorage;
});
console.log(`${groups} group/lifestyle integration groups PASS`);
