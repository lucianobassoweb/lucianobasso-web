import {syncCoachContext} from '../dist/core/coaches.js';
import assert from 'node:assert/strict';
import {createCareerWithSeed,advanceCareer,resolveChoice} from '../dist/core/engine.js';
import {transitionEvent,transitionLoad,legacyNarrative} from '../dist/core/transitions.js';
import {RNG} from '../dist/core/random.js';
import {growthStep} from '../dist/core/dna.js';
import {CLUB_BY_ID} from '../dist/data/clubs-br-2026.js';
const make=seed=>{const s=createCareerWithSeed('Caso',seed);s.pendingEvent=null;s.player.age=18;s.player.professionalStatus='SENIOR';s.player.currentClubId='gremio';s.player.position='AM';s.player.positionSeasonChosenFor=s.player.season;s.player.life.education.chosenFor=s.player.season;s.player.careerStats.minutes=0;return s;};
const protectedSave=make(1);protectedSave.player.seasonHistory=[{age:15,avgRating:8.1,goals:40,assists:20}];protectedSave.pendingEvent=transitionEvent(protectedSave.player);
const immediateSave=structuredClone(protectedSave);
resolveChoice(protectedSave,'transition:PROTECTED');resolveChoice(immediateSave,'transition:IMMEDIATE');
assert.ok(transitionLoad(immediateSave.player).starts>transitionLoad(protectedSave.player).starts);
assert.ok(immediateSave.player.pressure>protectedSave.player.pressure);
assert.deepEqual(immediateSave.player.dna,protectedSave.player.dna);
assert.deepEqual(immediateSave.player.attributes,protectedSave.player.attributes);
protectedSave.player.careerStats.minutes=2000;assert.equal(transitionLoad(protectedSave.player).pressure,0);
// A six-block absence means no appearances, and the existing attributes are not erased.
const injured=make(2);injured.player.professionalTransition={mode:'PROTECTED',clubId:'gremio',youthBuzz:0,seniorMinutesAtStart:0};injured.player.injury={remainingBlocks:6,longAbsence:true,returnDiscussed:false};
const original=structuredClone(injured.player.attributes);
let absenceGuard=0;while(injured.player.careerTurn<6&&absenceGuard++<50){if(injured.pendingEvent?.choices?.length)resolveChoice(injured,injured.pendingEvent.choices[0].id);else {injured.pendingEvent=null;advanceCareer(injured);}assert.equal(injured.player.currentSeason.appearances,0);assert.equal(injured.player.careerStats.appearances,0);}
injured.pendingEvent=null;advanceCareer(injured);assert.ok(injured.pendingEvent.id.startsWith('comeback-'));
resolveChoice(injured,'comeback:GRADUAL');assert.equal(injured.player.injury,undefined);assert.equal(injured.player.comebackBlocks,6);
assert.ok(injured.player.attributes.technique>original.technique-1);
assert.equal(injured.player.dna.injuryResistance,make(2).player.dna.injuryResistance);
// A veteran can receive a real proposal to a smaller project without forcing a transfer.
let lowerOffers=0,stayOptions=0;
for(let seed=10;seed<110;seed++){
 const s=make(seed),p=s.player;p.age=35;p.professionalTransition={mode:'PROTECTED',clubId:'gremio',youthBuzz:0,seniorMinutesAtStart:0};p.careerStats.minutes=10000;
 syncCoachContext(p);p.tactical.discussedFor=p.season;p.seasonTurn=18;p.transferIntent='LEAVE';p.marketValue=1000000;
 advanceCareer(s);const choices=s.pendingEvent?.choices??[];
 if(choices.some(c=>c.id==='market:stay'))stayOptions++;
 for(const c of choices){if(!c.id.startsWith('market:')||c.id==='market:stay')continue;const id=c.id.split(':')[1];if(CLUB_BY_ID[id].prestige<CLUB_BY_ID.gremio.prestige)lowerOffers++;}
}
assert.ok(lowerOffers>0&&stayOptions>0);
const local=make(99);local.player.currentClubId='caxias';local.player.fanRelations.caxias={clubId:'caxias',passion:90,respect:80,hate:0,fear:0,expectation:10,memories:[]};assert.match(legacyNarrative(local.player),/Caxias/);
const early=make(201);early.player.age=36;early.player.careerStats.appearances=150;early.player.life.education.completed=true;advanceCareer(early);resolveChoice(early,'retirement:stop');assert.equal(early.player.phase,'APOSENTADO');assert.ok(early.pendingEvent.choices.some(c=>c.id==='after:COACH_COURSE'));resolveChoice(early,'after:COACH_COURSE');assert.equal(early.player.life.secondCareer.status,'IN_TRAINING');
const veteran=make(202);veteran.player.age=38;veteran.player.professionalTransition={mode:'PROTECTED',clubId:'gremio',youthBuzz:0,seniorMinutesAtStart:0};let guard=0;
while(veteran.player.phase!=='APOSENTADO'&&guard++<1500){const e=veteran.pendingEvent;if(e?.choices?.length){let id=e.choices[0].id;if(e.id.startsWith('retirement-'))id='retirement:continue';if(e.id.startsWith('role-'))id='role:stay';if(e.kind==='SEASON_END'&&e.choices.some(c=>c.id==='market:stay'))id='market:stay';resolveChoice(veteran,id);}else{veteran.pendingEvent=null;advanceCareer(veteran);}}
assert.equal(veteran.player.age,40);assert.equal(veteran.player.phase,'APOSENTADO');
console.log(JSON.stringify({transition:'PASS',sixBlockAbsence:'PASS',returnChoice:'PASS',preservedDNA:'PASS',smallerProjectOffers:lowerOffers,windowsWithStayOption:stayOptions,localLegacy:'PASS',retirement36To40:'PASS',coachQualificationRequired:'PASS'},null,2));
