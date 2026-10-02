import assert from 'node:assert/strict';
import {createCareerWithSeed,advanceCareer,resolveChoice} from '../dist/core/engine.js';
import {growthStep} from '../dist/core/dna.js';
import {formationOffset,migrateAttributeScale} from '../dist/core/attribute-scale.js';
import {rankedNaturalPositions,selectPosition} from '../dist/core/positions.js';
import {RNG} from '../dist/core/random.js';
import {loadSave,storeSave,getRecoveryRaw} from '../dist/core/persistence.js';
const fresh=seed=>createCareerWithSeed('Escala',seed,'gremio','Porto Alegre','RS');
let max12=0,max13=0;
for(let seed=1;seed<=500;seed++){
  const p=fresh(seed).player;selectPosition(p,rankedNaturalPositions(p)[0].position);p.life.education.priority='FOOTBALL';const rng=new RNG(p.rngState);
  max12=Math.max(max12,...Object.values(p.attributes));
  for(const age of [12,13]){p.age=age;for(let game=0;game<20;game++){growthStep(p,rng);if(age===13)max13=Math.max(max13,...Object.values(p.attributes));}}
}
assert.ok(max12<40);assert.ok(max13<50);console.log(JSON.stringify({samples:500,allSixteenAttributes:true,fullFootballPriority:true,max12,max13,result:'PASS'}));
const legacy=fresh(45);delete legacy.player.attributeScale;legacy.player.age=13;Object.keys(legacy.player.attributes).forEach(k=>legacy.player.attributes[k]=50);
const before=structuredClone(legacy);const expected=Number((50-formationOffset(13)).toFixed(2));migrateAttributeScale(legacy.player);
assert.equal(legacy.player.attributes.finishing,expected);assert.deepEqual(legacy.pendingEvent,before.pendingEvent);assert.deepEqual(legacy.player.dna,before.player.dna);assert.deepEqual(legacy.player.currentSeason,before.player.currentSeason);assert.equal(legacy.player.rngState,before.player.rngState);
const once=structuredClone(legacy);migrateAttributeScale(legacy.player);assert.deepEqual(legacy,once);
for(const age of [18,23,38]){const s=fresh(age);s.player.age=age;delete s.player.attributeScale;const attrs=structuredClone(s.player.attributes);migrateAttributeScale(s.player);assert.deepEqual(s.player.attributes,attrs);}
const key='1903.save.playable2',raw=JSON.stringify(before),memory=new Map([[key,raw]]);globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
const loaded=loadSave();assert.equal(loaded.player.attributes.finishing,expected);assert.equal(memory.get(key),raw);assert.deepEqual(loaded.pendingEvent,before.pendingEvent);assert.ok(storeSave(loaded));assert.equal(loadSave().player.attributes.finishing,expected);
for(const marker of ['OTHER',1,null]){const bad=fresh(2);bad.player.attributeScale=marker;const bytes=JSON.stringify(bad);memory.set(key,bytes);assert.equal(loadSave(),null);assert.equal(getRecoveryRaw(),bytes);assert.equal(memory.get(key),bytes);}
const direct=structuredClone(before);advanceCareer(direct);assert.equal(direct.player.attributeScale,'ADULT_REFERENCE_1');assert.equal(direct.player.attributes.finishing,expected);
const school=fresh(66).player,football=structuredClone(school);selectPosition(school,'CM');selectPosition(football,'CM');school.life.education.priority='SCHOOL';football.life.education.priority='FOOTBALL';growthStep(school,new RNG(333));growthStep(football,new RNG(333));assert.ok(football.attributes.passing>school.attributes.passing);
const gifted=fresh(777).player;selectPosition(gifted,rankedNaturalPositions(gifted)[0].position);gifted.life.education.priority='FOOTBALL';const rng=new RNG(777);const initial=gifted.attributes.passing;
for(let age=12;age<=30;age++){gifted.age=age;for(let i=0;i<20;i++)growthStep(gifted,rng);}
assert.ok(Math.max(...Object.values(gifted.attributes))>80);assert.ok(gifted.attributes.passing>initial);console.log('PASS migration/reload/raw preservation/adult identity/marker guards/learning/no childhood potential cap');
