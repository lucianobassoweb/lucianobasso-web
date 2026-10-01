import assert from 'node:assert/strict';
import {createCareerWithSeed} from '../dist/core/engine.js';
import {growthStep} from '../dist/core/dna.js';
import {RNG} from '../dist/core/random.js';
import {rankedNaturalPositions} from '../dist/core/positions.js';
const clone=structuredClone;
let groups=0;function check(name,fn){fn();groups++;console.log('PASS',name);}
function player(seed=8,age=13){const p=createCareerWithSeed('Causas',seed).player;p.position=rankedNaturalPositions(p)[0].position;p.age=age;p.life.education.priority='FOOTBALL';return p;}
check('same state produces identical acquired skill changes for unrelated RNG seeds, 128 DNAs x ages',()=>{
 for(let seed=1;seed<=128;seed++)for(const age of [12,13,16,18,22,30,34,38]){const a=player(seed,age),b=clone(a);const dna=clone(a.dna);growthStep(a,new RNG(1));growthStep(b,new RNG(99999));assert.deepEqual(a.attributes,b.attributes);assert.deepEqual(a.dna,dna);}
});
check('formation cannot randomly lose an acquired skill; veteran body ages without technical jitter',()=>{
 for(let seed=1;seed<=128;seed++){const young=player(seed),before=clone(young.attributes);growthStep(young,new RNG(seed));for(const [key,value] of Object.entries(before))assert.ok(young.attributes[key]>=value);
 const old=player(seed,38);for(const k of Object.keys(old.attributes))old.attributes[k]=75;growthStep(old,new RNG(seed));assert.ok(old.attributes.pace<75&&old.attributes.stamina<75&&old.attributes.strength<75);for(const k of ['vision','decisions','positioning','technique','passing','finishing'])assert.ok(old.attributes[k]>=75);}
});
check('focus, football time and injury cause ordered differences without altering unrelated skills',()=>{
 const base=player(),focused=clone(base),school=clone(base),injured=clone(base);school.life.education.priority='SCHOOL';injured.injury={remainingBlocks:2,longAbsence:false,returnDiscussed:false};growthStep(base,new RNG(1));growthStep(focused,new RNG(7),'finishing');growthStep(school,new RNG(4));growthStep(injured,new RNG(99));assert.ok(focused.attributes.finishing>base.attributes.finishing);for(const k of Object.keys(base.attributes)){if(k!=='finishing')assert.equal(focused.attributes[k],base.attributes[k]);if(!['vision','decisions'].includes(k))assert.ok(school.attributes[k]<=base.attributes[k]);else assert.ok(school.attributes[k]>base.attributes[k]);assert.ok(injured.attributes[k]<=base.attributes[k]);}
});
check('legacy random stream schedule is preserved while no random samples change skills',()=>{
 const p=player(),a=new RNG(17),b=new RNG(17);growthStep(p,a);for(const k of Object.keys(p.attributes))b.normal(0,.045);assert.equal(a.state,b.state);
});
check('school trades practice for acquired cognition, balance is intermediate, and adult gains remain',()=>{
 for(const age of [12,13,16,18]){
 const football=player(55,age),balanced=clone(football),school=clone(football);balanced.life.education.priority='BALANCED';school.life.education.priority='SCHOOL';
 const dna=clone(school.dna);for(let turn=0;turn<20;turn++){growthStep(football,new RNG(1));growthStep(balanced,new RNG(7));growthStep(school,new RNG(99));}
 for(const k of ['vision','decisions'])assert.ok(school.attributes[k]>balanced.attributes[k]&&balanced.attributes[k]>football.attributes[k]);
 for(const k of ['technique','passing','finishing','pace','stamina','strength','positioning'])assert.ok(football.attributes[k]>balanced.attributes[k]&&balanced.attributes[k]>school.attributes[k]);
 assert.deepEqual(school.dna,dna);
 const a=clone(school),b=clone(school);a.age=b.age=24;a.life.education.priority='SCHOOL';b.life.education.priority='FOOTBALL';const before=clone(a.attributes);growthStep(a,new RNG(1));growthStep(b,new RNG(99));assert.deepEqual(a.attributes,b.attributes);for(const k of ['vision','decisions'])assert.ok(a.attributes[k]>=before[k]);
 }
});
console.log(`${groups} causal development groups PASS`);
