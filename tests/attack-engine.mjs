import assert from 'node:assert/strict';
import {createCareerWithSeed,advanceCareer} from '../dist/core/engine.js';
import {syncCoachContext} from '../dist/core/coaches.js';
import {observedAttackRating} from '../dist/core/match.js';
import {recordRecentMatchForm} from '../dist/core/form.js';
import {promotionEvidence} from '../dist/core/calendar.js';
import {loadSave,storeSave,getPersistenceStatus} from '../dist/core/persistence.js';
const youth=(seed=9)=>{const s=createCareerWithSeed('Teste ataque',seed),p=s.player;s.pendingEvent=null;p.position='ST';p.positionSeasonChosenFor=p.season;p.life.education.chosenFor=p.season;return s;};
const adult=(seed=9)=>{const s=youth(seed),p=s.player;Object.assign(p,{age:25,professionalStatus:'SENIOR',phase:'PROFISSIONAL',currentClubId:'gremio'});p.positionProficiency.ST=90;for(const k in p.attributes)p.attributes[k]=75;p.careerStats.appearances=200;p.careerStats.minutes=15000;p.debut={season:2025,age:24,clubId:'gremio',opponentId:'vasco',minutes:80};syncCoachContext(p);p.tactical.discussedFor=p.season;return s;};
const addDrought=(s,category)=>{const p=s.player;p.careerTurn=8;p.seasonTurn=6;const context={clubId:p.currentClubId,category,position:p.position,season:p.season};for(let turn=1;turn<=6;turn++)p.recentForm=recordRecentMatchForm(p.recentForm,context,{turn,minutes:69,goals:0,assists:0,rating:7.1,xg:.2,xa:.03});return s;};
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('PASS',name);};
check('reproduced youth high note without output now has evidence-based note, no phantom MOTM',()=>{
 const s=youth();advanceCareer(s);const f=s.pendingEvent.matchFeedback;assert.deepEqual([f.minutes,f.goals,f.assists,f.rating],[78,0,0,6.6]);assert.match(f.ratingReason,/pouca produção/);assert.equal(s.player.currentSeason.motm,0);
 for(let seed=1;seed<=100;seed++){const t=youth(seed);for(const k in t.player.attributes)t.player.attributes[k]=95;advanceCareer(t);if(t.pendingEvent.matchFeedback.goals===0&&t.pendingEvent.matchFeedback.assists===0)assert.equal(t.player.currentSeason.motm,0);}
});
check('striker no-goal 7+ needs recorded contribution; defense not judged by striker production',()=>{
 const m={rating:7.1,minutes:69,goals:0,assists:0,xg:.1,xa:.1};assert.equal(observedAttackRating('ST',m).rating,6.6);assert.equal(observedAttackRating('ST',{...m,assists:1}).rating,7.1);assert.match(observedAttackRating('ST',{...m,assists:1}).ratingReason,/assistência/);assert.equal(observedAttackRating('CB',m).rating,7.1);assert(observedAttackRating('ST',{...m,xg:1}).rating<6.6);
});
check('same players and RNG seeds have fewer starts after six substantial sterile appearances',()=>{
 for(const [make,category] of [[youth,'U15'],[adult,'SENIOR']]){
 let startsFresh=0,startsDry=0,changed=0;
 for(let seed=1;seed<=120;seed++){
 const fresh=make(seed);fresh.player.careerTurn=8;fresh.player.seasonTurn=6;const dry=addDrought(structuredClone(fresh),category);
 advanceCareer(fresh);advanceCareer(dry);const a=fresh.pendingEvent.matchFeedback,b=dry.pendingEvent.matchFeedback;
 assert(a&&b);startsFresh+=a.started?1:0;startsDry+=b.started?1:0;if(a.started&&!b.started)changed++;
 if(b.minutes>=45&&b.goals===0)assert.match(b.coachReaction,/sem gol/);
 assert.equal(dry.player.recentForm.observations.length,b.minutes>=45||b.minutes>0&&b.goals>0?7:6);assert.equal(dry.player.recentForm.lastObservedTurn,9);
 const before=JSON.stringify(dry);advanceCareer(dry);assert.equal(JSON.stringify(dry),before);
 }
 assert(startsDry<startsFresh);assert(changed>0);console.log(category,{startsFresh,startsDry,changed});
 }
});
check('recent form and rating explanation survive reload, old events unchanged, corrupt histories rejected',()=>{
 let raw=null;globalThis.localStorage={getItem:()=>raw,setItem:(_,v)=>raw=v,removeItem:()=>raw=null};
 const s=addDrought(youth(),'U15');advanceCareer(s);assert(storeSave(s));assert.deepEqual(loadSave().player.recentForm,s.player.recentForm);assert.deepEqual(loadSave().pendingEvent,s.pendingEvent);
 const old=youth();old.pendingEvent={id:'legacy',kind:'CHOICE',title:'Antigo',body:'Já oferecido',tags:[],choices:[{id:'old',label:'Manter'}]};delete old.player.recentForm;assert(storeSave(old));const loaded=loadSave(),before=JSON.stringify(loaded);advanceCareer(loaded);assert.equal(JSON.stringify(loaded),before);
 for(const corrupt of [f=>f.observations.push(...f.observations),f=>f.observations[0].minutes=-1,f=>f.observations[0].turn=99,f=>f.context.position='BOGUS',f=>f.lastObservedTurn=-2,f=>f.lastObservedTurn=999999]){const bad=structuredClone(s);corrupt(bad.player.recentForm);raw=JSON.stringify(bad);assert.equal(loadSave(),null);assert.equal(getPersistenceStatus().kind,'corrupt');}
});
check('productive attackers can reach promotion under observed ratings; high empty notes cannot',()=>{
 const s=youth(),p=s.player;Object.assign(p,{age:17,currentClubId:'gremio'});
 p.currentSeason.categories={U20:{appearances:12,starts:12,minutes:800,goals:0,assists:0,avgRating:7.5}};
 assert.equal(promotionEvidence(p).eligible,false);
 Object.assign(p.currentSeason.categories.U20,{goals:4,avgRating:6.8});assert.equal(promotionEvidence(p).eligible,true);
 p.position='WG';Object.assign(p.currentSeason.categories.U20,{goals:0,assists:5});assert.equal(promotionEvidence(p).eligible,true);
 p.age=14;assert.equal(promotionEvidence(p).eligible,false);
});
console.log(`${checks} attacking engine groups passed`);
