import assert from 'node:assert/strict';
import {createCareerWithSeed,advanceCareer,resolveChoice} from '../dist/core/engine.js';
import {loadSave,storeSave,getRecoveryRaw} from '../dist/core/persistence.js';
const copy=structuredClone;
const ready=(seed=12)=>{const s=createCareerWithSeed('Teste anual',seed,'gremio','Porto Alegre','RS'),p=s.player;s.pendingEvent=null;Object.assign(p,{position:'ST',age:12,seasonReviewDue:true,careerTurn:20,seasonTurn:20,positionSeasonChosenFor:p.season});p.life.education.chosenFor=p.season;Object.assign(p.currentSeason,{appearances:17,starts:17,minutes:1173,goals:1,assists:0,avgRating:6.8,primaryPosition:'ST',positionsPlayed:['ST'],positionAppearances:{ST:17},categories:{U15:{appearances:17,starts:17,minutes:1173,goals:1,assists:0,avgRating:6.8}}});Object.assign(p.attributes,{passing:80,vision:80,finishing:35});return s;};
const offer=s=>{advanceCareer(s);assert.equal(s.pendingEvent.kind,'SEASON_END');const balance=copy(s.pendingEvent);resolveChoice(s,s.pendingEvent.choices[0].id);advanceCareer(s);assert.match(s.pendingEvent.id,/^position-/);return balance;};
let checks=0;const check=(name,fn)=>{fn();checks++;console.log('PASS',name);};
check('real annual transition preserves balance then proposes observed alternative and keeps eight position IDs',()=>{
 const s=ready();offer(s);assert.equal(s.player.age,13);assert.equal(s.player.position,'ST');assert.equal(s.player.currentSeason.appearances,0);assert.equal(s.player.seasonHistory[0].goals,1);assert.match(s.pendingEvent.title,/treinador propõe/);assert.match(s.pendingEvent.body,/17 jogos, 1173 minutos, 1 gol/);assert.equal(s.pendingEvent.choices.length,8);assert.equal(s.pendingEvent.payload.youthPositionReview.opportunityPenalty,.08);
 assert(s.pendingEvent.choices.some(c=>/Insistir/.test(c.label)&&/8 p.p./.test(c.hint)));const before=JSON.stringify(s);advanceCareer(s);assert.equal(JSON.stringify(s),before);
});
check('acceptance changes position with ordinary adaptation while refusal preserves it and records reversible cost',()=>{
 const s=ready();offer(s);const accept=copy(s),r=s.pendingEvent.payload.youthPositionReview,attrs=copy(s.player.attributes);
 resolveChoice(accept,`position:${r.recommendedPosition}`);assert.equal(accept.player.position,r.recommendedPosition);assert.equal(accept.player.youthPositionResponse.decision,'EXPERIMENT');assert.equal(accept.player.youthPositionResponse.penalty,0);assert(accept.player.adaptationDebt>0);assert.deepEqual(accept.player.attributes,attrs);assert.match(accept.player.lastChoiceResult.summary,/experiência/);
 resolveChoice(s,'position:ST');assert.equal(s.player.position,'ST');assert.equal(s.player.youthPositionResponse.penalty,.08);assert.equal(s.player.youthPositionResponse.decision,'INSIST');assert.match(s.player.lastChoiceResult.summary,/recusou/);assert(s.player.lastChoiceResult.effects.some(x=>x.includes('insistir')));const after=JSON.stringify(s);resolveChoice(s,'position:ST');assert.equal(JSON.stringify(s),after);
});
check('same seeds materially lose starts after refusal; recovery or another project removes that cost',()=>{
 let regular=0,refused=0,changed=0;
 for(let seed=1;seed<=180;seed++){
  const s=ready(seed);offer(s);resolveChoice(s,'position:ST');s.player.life.education.chosenFor=s.player.season;s.player.seasonTurn=1;const normal=copy(s);delete normal.player.youthPositionResponse;
  advanceCareer(normal);advanceCareer(s);assert(normal.pendingEvent.matchFeedback&&s.pendingEvent.matchFeedback);regular+=normal.pendingEvent.matchFeedback.started?1:0;refused+=s.pendingEvent.matchFeedback.started?1:0;
  const recovered=copy(normal);recovered.pendingEvent=null;recovered.player.youthPositionResponse=copy(s.player.youthPositionResponse);Object.assign(recovered.player.currentSeason.categories.U15,{appearances:5,minutes:300,goals:2,assists:0,avgRating:7});const plain=copy(recovered);delete plain.player.youthPositionResponse;advanceCareer(recovered);advanceCareer(plain);assert.deepEqual(recovered.pendingEvent.matchFeedback,plain.pendingEvent.matchFeedback);
  const moved=copy(normal);moved.pendingEvent=null;moved.player.currentClubId='gremio';moved.player.youthPositionResponse=copy(s.player.youthPositionResponse);const movedPlain=copy(moved);delete movedPlain.player.youthPositionResponse;advanceCareer(moved);advanceCareer(movedPlain);assert.deepEqual(moved.pendingEvent.matchFeedback,movedPlain.pendingEvent.matchFeedback);
  if(normal.pendingEvent.matchFeedback.started&&!s.pendingEvent.matchFeedback.started)changed++;
 }
 assert(refused<regular&&changed>0);console.log({paired180:{regular,refused,changed}});
});
check('legacy pending does not acquire a retrospective refusal penalty and optional plan survives reload',()=>{
 let raw=null;globalThis.localStorage={getItem:()=>raw,setItem:(_,v)=>raw=v,removeItem:()=>raw=null};const s=ready();offer(s);const legacy=copy(s);delete legacy.pendingEvent.payload;const event=copy(legacy.pendingEvent);assert(storeSave(legacy));assert.deepEqual(loadSave().pendingEvent,event);resolveChoice(legacy,'position:ST');assert.equal(legacy.player.youthPositionResponse,undefined);
 resolveChoice(s,'position:ST');assert(storeSave(s));assert.deepEqual(loadSave().player.youthPositionResponse,s.player.youthPositionResponse);
 for(const mutate of [p=>p.penalty=.17,p=>p.decision='FORCE',p=>p.season+=1,p=>p.reviewedSeason=-1,p=>{p.decision='EXPERIMENT';p.penalty=.08;},p=>p.position='BAD',p=>p.recommendedPosition=p.position,p=>p.penalty=0]){const bad=copy(s);mutate(bad.player.youthPositionResponse);raw=JSON.stringify(bad);assert.equal(loadSave(),null);assert.equal(getRecoveryRaw(),raw);}
});
console.log(`${checks} youth position engine groups passed`);
