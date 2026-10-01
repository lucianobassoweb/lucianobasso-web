import assert from 'node:assert/strict';
import {createCareerWithSeed,resolveChoice,advanceCareer} from '../dist/core/engine.js';
import {captureState,recordStateDelta} from '../dist/core/state-delta.js';
import {loadSave,storeSave,getRecoveryRaw} from '../dist/core/persistence.js';
const s=createCareerWithSeed('Deltas',55),p=s.player;
const before=captureState(p);p.physicalCondition=100;p.pressure=4;p.morale=0;recordStateDelta(p,before);
assert.equal(p.lastStateDelta.values.physicalCondition,3);assert.equal(p.lastStateDelta.values.pressure,-8);assert.equal(p.lastStateDelta.values.morale,-68);
const snapshot=JSON.stringify(p);captureState(p);assert.equal(JSON.stringify(p),snapshot);
const initial=captureState(p);p.currentClubId='gremio';recordStateDelta(p,initial);assert.equal(p.lastStateDelta.groupChanged,true);
const map=new Map();globalThis.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
assert.ok(storeSave(s));assert.deepEqual(loadSave().player.lastStateDelta,p.lastStateDelta);const key=[...map.keys()][0],good=JSON.stringify(s);
for(const modify of [d=>d.values.pressure=NaN,d=>d.values.pressure=101,d=>d.values.unknown=1,d=>d.turn=p.careerTurn+1]){const bad=JSON.parse(good);modify(bad.player.lastStateDelta);const raw=JSON.stringify(bad);map.set(key,raw);assert.equal(loadSave(),null);assert.equal(getRecoveryRaw(),raw);assert.equal(map.get(key),raw);}
map.set(key,good);assert.ok(loadSave());const legacy=JSON.parse(good);delete legacy.player.lastStateDelta;map.set(key,JSON.stringify(legacy));assert.equal(loadSave().player.lastStateDelta,undefined);
const untouched=JSON.stringify(s);resolveChoice(s,'invalid');assert.equal(JSON.stringify(s),untouched);
const flow=createCareerWithSeed('Clique',9);advanceCareer(flow);const clickBefore=captureState(flow.player);const id=flow.pendingEvent.choices[0].id;resolveChoice(flow,id);advanceCareer(flow);recordStateDelta(flow.player,clickBefore);const end=captureState(flow.player);for(const k of Object.keys(end.values))assert.equal(flow.player.lastStateDelta.values[k],Number((end.values[k]-clickBefore.values[k]).toFixed(4)));
console.log('PASS state delta actual/clamp/read-only/context/persistence/corrupt/legacy/click total');
