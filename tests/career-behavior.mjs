import assert from 'node:assert/strict';
import {createCareerWithSeed,advanceCareer,resolveChoice} from '../dist/core/engine.js';
import {selectPosition,tacticalRating,coachPositionFeedback} from '../dist/core/positions.js';
import {growthStep,overall} from '../dist/core/dna.js';
import {trialProbability} from '../dist/core/pathways.js';
import {CLUB_BY_ID} from '../dist/data/clubs-br-2026.js';
import {RNG} from '../dist/core/random.js';
const copy=x=>structuredClone(x);
const names=new Set();
let rejects=0, retries=0, retired=0, professional=0;
const choose=(s,education='BALANCED')=>{
 const e=s.pendingEvent;if(!e)return;
 if(!e.choices?.length){s.pendingEvent=null;return;}
 let id=e.choices[0].id;
 if(e.id.startsWith('retirement-'))id=s.player.age>=38?'retirement:stop':'retirement:continue';
 if(e.id.startsWith('position-'))id='position:AM';
 if(e.id.startsWith('education-'))id=`education:${education}`;
 if(e.id.startsWith('role-'))id='role:stay';
 if(e.kind==='SEASON_END')id=e.choices.find(c=>c.id==='market:stay')?.id??id;
 resolveChoice(s,id);
};
for(let i=1;i<=100;i++){
 const s=createCareerWithSeed('Caso',i);names.add(s.player.hometown);
 assert.equal(s.player.age,12);assert.equal(s.player.currentClubId,null);
 assert.notEqual(s.player.hometown,'A DEFINIR');
 advanceCareer(s);assert.ok(s.pendingEvent?.choices?.length,'Introduction must lead to a choice');
 const event=copy(s.pendingEvent);advanceCareer(s);assert.deepEqual(s.pendingEvent,event,'Continuar cannot skip a decision');
 let guard=0;while(s.player.phase!=='APOSENTADO'&&guard++<1000){choose(s);if(!s.pendingEvent)advanceCareer(s);}
 assert.equal(s.player.phase,'APOSENTADO');assert.equal(s.player.careerTurn,234);
 const walk=x=>{if(typeof x==='number')assert.ok(Number.isFinite(x));else if(x&&typeof x==='object')Object.values(x).forEach(walk);};walk(s);
 const scouting=s.player.life.scouting;rejects+=scouting.rejections.length;
 if(scouting.rejections.length&&scouting.trialAttempts>1)retries++;
 if(s.player.careerStats.appearances)professional++;
 assert.ok(s.pendingEvent?.choices?.some(c=>c.id==='after:WORK'));
 choose(s);assert.ok(s.player.life.secondCareer);
 retired++;
}
assert.ok(names.size>=10);assert.ok(rejects>0&&retries>0&&professional>0);
let schoolOVR=0,footballOVR=0;
for(let seed=101;seed<=130;seed++){
 for(const priority of ['SCHOOL','FOOTBALL']){
  const s=createCareerWithSeed('Estudos',seed);let guard=0;
  while(s.player.age<19&&guard++<300){choose(s,priority);if(!s.pendingEvent)advanceCareer(s);}
  assert.equal(s.player.life.education.completed,priority==='SCHOOL');
  if(priority==='SCHOOL')schoolOVR+=overall(s.player);else footballOVR+=overall(s.player);
 }
}
assert.ok(footballOVR>schoolOVR,'Protecting studies has a football opportunity cost');
const s=createCareerWithSeed('Reconversão',777);const p=s.player;p.age=35;selectPosition(p,'AM');p.positionProficiency.AM=90;
const original=copy(p.attributes);selectPosition(p,'ST');assert.deepEqual(p.attributes,original);assert.ok(p.secondaryPositions.includes('AM'));assert.ok(p.adaptationDebt>0);
const originalDebt=p.adaptationDebt;const rng=new RNG(9);
const {trainPositionExperience}=await import('../dist/core/positions.js');for(let i=0;i<12;i++)trainPositionExperience(p);assert.ok(p.adaptationDebt<originalDebt);
p.attributes.pace=30;p.attributes.stamina=40;p.attributes.positioning=85;p.attributes.decisions=85;p.attributes.technique=85;
p.tactical={coachId:'test',role:'HOLD',support:.5,trust:55,discussedFor:null};const fixed=tacticalRating(p,'ST');p.tactical.role='MOBILE';assert.ok(fixed>tacticalRating(p,'ST'));
const slow=copy(p);slow.dna.physicalMaturationAge=20;slow.dna.technicalAptitude=25;assert.equal(trialProbability(slow,CLUB_BY_ID.caxias,true),trialProbability(p,CLUB_BY_ID.caxias,true));assert.equal(coachPositionFeedback(slow),coachPositionFeedback(p));
const technique=p.attributes.technique,pace=p.attributes.pace;for(let i=0;i<9;i++)growthStep(p,rng);assert.ok(p.attributes.pace<pace-.5);assert.ok(p.attributes.technique>technique-.5);
// Old saves missing added state remain playable and preserve their existing club/position.
const legacy=createCareerWithSeed('Legado',55);delete legacy.player.life;delete legacy.player.tactical;legacy.player.currentClubId='gremio';legacy.player.age=25;legacy.player.position='CM';legacy.pendingEvent=null;advanceCareer(legacy);assert.equal(legacy.player.currentClubId,'gremio');assert.ok(legacy.player.life&&legacy.player.tactical);
console.log(JSON.stringify({retired,professional,origins:names.size,rejections:rejects,retriedAfterRejection:retries,pairedEducationCareers:60,schoolOVR19:schoolOVR/30,footballOVR19:footballOVR/30,reconversionAndRole:'PASS',legacySave:'PASS'},null,2));
