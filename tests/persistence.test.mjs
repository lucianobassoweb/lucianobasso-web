import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createCareerWithSeed} from '../dist/core/engine.js';
import {migrateAttributeScale} from '../dist/core/attribute-scale.js';
import {ensureCoaching} from '../dist/core/coaches.js';

// Compile only this module in memory; do not touch browser data or regenerate the build.
const source=fs.readFileSync(new URL('../src/core/persistence.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText
  .replace(/^import .*$/gm,'').replace(/^export /gm,'')+'\nglobalThis.api={loadSave,storeSave,clearSave,getPersistenceStatus,getRecoveryRaw};';
const key='1903.save.playable2';
const fresh=()=>createCareerWithSeed('Persistência',55,'gremio','Caxias do Sul','RS');
const copy=value=>JSON.parse(JSON.stringify(value));
function isolated(raw=null){
  const memory=new Map(raw===null?[]:[[key,raw]]);
  const errors={read:null,write:null,clear:null};
  const storage={
    getItem(k){if(errors.read)throw errors.read;return memory.get(k)??null;},
    setItem(k,value){if(errors.write)throw errors.write;memory.set(k,value);},
    removeItem(k){if(errors.clear)throw errors.clear;memory.delete(k);}
  };
  const context=vm.createContext({localStorage:storage,migrateAttributeScale});vm.runInContext(compiled,context);
  return {...context.api,context,memory,errors};
}
let checks=0;
function check(name,fn){fn();checks++;console.log(`PASS ${name}`);}
check('empty, save, reload and clear',()=>{
  const api=isolated();assert.equal(api.loadSave(),null);assert.equal(api.getPersistenceStatus().kind,'empty');
  const save=fresh();assert.equal(api.storeSave(save),true);assert.equal(api.getPersistenceStatus().kind,'saved');
  assert.equal(api.loadSave().player.id,save.player.id);assert.equal(api.getPersistenceStatus().kind,'loaded');
  assert.equal(api.clearSave(),true);assert.equal(api.memory.size,0);
});
check('legacy mandatory shape accepts absent later fields',()=>{
  const legacy=fresh();for(const field of ['life','tactical','professionalStatus','coaching'])delete legacy.player[field];
  const raw=JSON.stringify(legacy);const api=isolated(raw);const loaded=api.loadSave();
  assert.equal(loaded.player.hometown,'Caxias do Sul');assert.equal(loaded.player.heartClubId,'gremio');
  assert.equal(loaded.player.life,undefined);assert.equal(api.storeSave(loaded),true);
});
check('new optional coaching, categories and match feedback survive',()=>{
  const save=fresh();ensureCoaching(save.player);
  save.player.currentSeason.categories={U15:{appearances:1,starts:1,minutes:60,goals:0,assists:0,avgRating:6.7}};
  save.pendingEvent.matchFeedback={opponent:'Local',coachName:'Formação',fanReaction:'Boa partida',coachReaction:'Continue',started:true,cleanSheet:false,minutes:60,goals:0,assists:0,rating:6.7,saves:0,teamGoals:1,oppGoals:1,blockGames:1,blockStarts:1,blockGoals:0,blockAssists:0,blockMinutes:60,category:'U15'};
  const api=isolated(JSON.stringify(save));assert.ok(api.loadSave().player.coaching);assert.equal(api.storeSave(save),true);
});
for(const [name,raw] of [
  ['truncated JSON','{"version":"0.1.0-playable.2",'],
  ['empty bytes',''],
  ['version only','{"version":"0.1.0-playable.2"}'],
  ['unsupported version',JSON.stringify({...fresh(),version:'future'})],
  ['null player',JSON.stringify({...fresh(),player:null})],
  ['invalid event tags',JSON.stringify({...fresh(),pendingEvent:{...fresh().pendingEvent,tags:null}})]
])check(`preserve rejected ${name}`,()=>{
  const api=isolated(raw);assert.equal(api.loadSave(),null);assert.equal(api.getRecoveryRaw(),raw);
  assert.equal(api.getPersistenceStatus().kind,'corrupt');assert.equal(api.getPersistenceStatus().recoveryAvailable,true);
  assert.equal(api.storeSave(fresh()),false);assert.equal(api.clearSave(),false);assert.equal(api.memory.get(key),raw);
});
check('reject broken nested required and optional structures',()=>{
  for(const mutate of [s=>delete s.player.attributes.pace,s=>s.player.history=[{}],s=>s.player.life={},s=>s.player.coaching={}]){
    const save=fresh();mutate(save);const raw=JSON.stringify(save);const api=isolated(raw);
    assert.equal(api.loadSave(),null);assert.equal(api.getRecoveryRaw(),raw);assert.equal(api.clearSave(),false);
  }
});
check('corruption written by another tab is protected',()=>{
  const api=isolated(JSON.stringify(fresh()));assert.ok(api.loadSave());const changed='{broken';
  api.memory.set(key,changed);assert.equal(api.storeSave(fresh()),false);assert.equal(api.clearSave(),false);
  assert.equal(api.getRecoveryRaw(),changed);assert.equal(api.memory.get(key),changed);
});
check('manual external recovery allows reload',()=>{
  const api=isolated('{broken');api.loadSave();api.memory.set(key,JSON.stringify(fresh()));
  assert.ok(api.loadSave());assert.equal(api.getRecoveryRaw(),null);assert.equal(api.getPersistenceStatus().recoveryAvailable,false);
});
check('quota failure preserves disk and memory; retry succeeds',()=>{
  const initial=fresh(),raw=JSON.stringify(initial),api=isolated(raw),save=api.loadSave();save.player.name='Em memória';
  api.errors.write=Object.assign(new Error('quota'),{name:'QuotaExceededError'});
  assert.equal(api.storeSave(save),false);assert.equal(api.getPersistenceStatus().kind,'write-error');
  assert.match(api.getPersistenceStatus().message,/cheio/);assert.equal(api.memory.get(key),raw);assert.equal(save.player.name,'Em memória');
  api.errors.write=null;assert.equal(api.storeSave(save),true);assert.equal(api.loadSave().player.name,'Em memória');
});
check('denied read prevents write and clear',()=>{
  const raw=JSON.stringify(fresh()),api=isolated(raw);api.errors.read=Object.assign(new Error('denied'),{name:'SecurityError'});
  assert.equal(api.loadSave(),null);assert.equal(api.getPersistenceStatus().kind,'unavailable');
  assert.equal(api.storeSave(fresh()),false);assert.equal(api.clearSave(),false);assert.equal(api.memory.get(key),raw);
});
check('missing storage and throwing storage getter are captured',()=>{
  for(const getter of [false,true]){
    const api=isolated();delete api.context.localStorage;
    if(getter)Object.defineProperty(api.context,'localStorage',{get(){throw Object.assign(new Error('denied'),{name:'SecurityError'});}});
    assert.equal(api.loadSave(),null);assert.equal(api.storeSave(fresh()),false);assert.equal(api.clearSave(),false);
    assert.equal(api.getPersistenceStatus().kind,'unavailable');
  }
});
check('denied write and clear preserve original save',()=>{
  const raw=JSON.stringify(fresh()),api=isolated(raw);api.loadSave();
  api.errors.write=Object.assign(new Error('denied'),{name:'SecurityError'});assert.equal(api.storeSave(fresh()),false);
  assert.equal(api.getPersistenceStatus().kind,'write-error');api.errors.clear=api.errors.write;
  assert.equal(api.clearSave(),false);assert.equal(api.getPersistenceStatus().kind,'clear-error');assert.equal(api.memory.get(key),raw);
});
check('nonfinite and circular outgoing data never overwrite save',()=>{
  const raw=JSON.stringify(fresh()),api=isolated(raw);
  for(const value of [NaN,Infinity]){const save=fresh();save.player.marketValue=value;assert.equal(api.storeSave(save),false);assert.equal(api.memory.get(key),raw);}
  const circular=fresh();circular.pendingEvent.payload={circular};assert.equal(api.storeSave(circular),false);assert.equal(api.memory.get(key),raw);
  const nonfiniteRaw=raw.replace('"marketValue":0','"marketValue":1e400');api.memory.set(key,nonfiniteRaw);
  assert.equal(api.loadSave(),null);assert.equal(api.getRecoveryRaw(),nonfiniteRaw);
});
check('status accessor returns a copy',()=>{
  const api=isolated('{broken');api.loadSave();const status=api.getPersistenceStatus();status.kind='saved';
  assert.equal(api.getPersistenceStatus().kind,'corrupt');
});
console.log(JSON.stringify({persistenceChecks:checks,result:'PASS',browserStorageTouched:false}));
