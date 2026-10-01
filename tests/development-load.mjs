import assert from 'node:assert/strict';
import {createCareerWithSeed} from '../dist/core/engine.js';
import {growthStep} from '../dist/core/dna.js';
import {developmentLoad,acquiredSkillWear} from '../dist/core/development-load.js';
import {RNG} from '../dist/core/random.js';
const fresh=(age=24)=>{const p=createCareerWithSeed('Desgaste',55).player;p.age=age;p.position='ST';for(const k of Object.keys(p.attributes))p.attributes[k]=65;return p;};
for(const axis of ['mentalFatigue','pressure','physicalCondition']){
 const levels=axis==='physicalCondition'?[97,75,50,25,0]:[0,35,40,60,80,100];let last=null;
 for(const level of levels){const p=fresh();p[axis]=level;growthStep(p,new RNG(1));if(last)for(const k of Object.keys(p.attributes))assert.ok(p.attributes[k]<=last[k],`${axis} monotonic ${k}`);last=p.attributes;}
}
for(const age of [12,16,24,34]){
 const healthy=fresh(age),loaded=structuredClone(healthy),dna=structuredClone(loaded.dna);loaded.mentalFatigue=90;loaded.pressure=90;loaded.physicalCondition=40;
 const before=structuredClone(loaded.attributes),a=new RNG(1),b=new RNG(1);growthStep(healthy,a);growthStep(loaded,b);assert.equal(a.state,b.state);assert.deepEqual(loaded.dna,dna);for(const k of Object.keys(before)){assert.ok(loaded.attributes[k]<before[k]);assert.ok(loaded.attributes[k]<healthy.attributes[k]);}
 for(let i=0;i<19;i++)growthStep(loaded,new RNG(i+2));const tired=structuredClone(loaded.attributes);loaded.mentalFatigue=20;loaded.pressure=20;loaded.physicalCondition=97;growthStep(loaded,new RNG(8));for(const k of ['vision','decisions','passing','finishing'])assert.ok(loaded.attributes[k]>=tired[k]);
}
const ordinary=fresh();assert.equal(developmentLoad(ordinary).learningMultiplier,1);for(const k of Object.keys(ordinary.attributes))assert.equal(acquiredSkillWear(developmentLoad(ordinary),k),0);
const a=fresh(),b=structuredClone(a);a.mentalFatigue=b.mentalFatigue=100;a.pressure=b.pressure=100;growthStep(a,new RNG(1));growthStep(b,new RNG(999));assert.deepEqual(a.attributes,b.attributes);
for(const k of Object.keys(a.attributes))a.attributes[k]=5;for(let i=0;i<40;i++)growthStep(a,new RNG(i+1));assert.ok(Object.values(a.attributes).every(v=>v===5&&Number.isFinite(v)));
console.log('PASS overload monotonic axes/all ages/persistent losses/rest recovery/ordinary neutral/DNA+RNG/clamp');
