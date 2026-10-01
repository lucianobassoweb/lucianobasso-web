import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/core/match-emotions.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/^export /gm,'').replace(/^import .*$/gm,'');
const math=Object.create(Math);math.random=()=>{throw Error('Unexpected RNG');};
const sandbox=vm.createContext({Math:math});vm.runInContext(compiled+'\nglobalThis.apply=applyMatchEmotions;',sandbox);
const apply=(...args)=>JSON.parse(JSON.stringify(sandbox.apply(...args)));
const context={clubId:'school:local',category:'U15',season:2026};
const states={morale:80,happiness:80,respect:80,pressure:20};
const fixture=(turn,changes={})=>({turn,result:'L',position:'AM',minutes:90,goals:0,goalsAgainst:1,rating:6.5,...changes});
let count=0;const check=(name,fn)=>{fn();count++;console.log(`PASS ${name}`);};
const close=(actual,expected)=>assert(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
check('first defeat and consecutive defeats grow without double counting',()=>{
 let memory;const effects=[];
 for(let turn=1;turn<=8;turn++){const effect=apply(memory,context,fixture(turn),states);memory=effect.memory;effects.push(effect);}
 close(effects[0].deltas.morale,-1.2);close(effects[0].deltas.happiness,-1.5);
 close(effects[1].deltas.morale,-1.8);close(effects[1].deltas.happiness,-2.3);
 assert.equal(effects[7].breakdown.defeatStreak,8);assert.equal(effects[7].breakdown.otherRecentDefeats,0);
 assert.equal(memory.observations.length,8);assert.equal(effects[7].deltas.respect,0);
});
check('wins and draws break streak while interleaved defeats remain',()=>{
 let memory;let effect;
 for(const [index,result] of ['L','W','L','D','L'].entries()){effect=apply(memory,context,fixture(index+1,{result}),states);memory=effect.memory;if(result!=='L')assert.deepEqual(effect.deltas,{morale:0,happiness:0,respect:0,pressure:0});}
 assert.equal(effect.breakdown.defeatStreak,1);assert.equal(effect.breakdown.otherRecentDefeats,2);
 close(effect.deltas.morale,-1.8);close(effect.deltas.happiness,-2.3);
 for(let turn=6;turn<=14;turn++)memory=apply(memory,context,fixture(turn,{result:'W'}),states).memory;
 effect=apply(memory,context,fixture(15),states);close(effect.deltas.morale,-1.2);assert.equal(effect.memory.observations.length,8);
});
check('actual bench fixture has only collective effects and absence has none',()=>{
 const bench=apply(undefined,context,fixture(1,{position:'ST',minutes:0}),states);
 assert.equal(bench.breakdown.personalStreak,0);assert.equal(bench.deltas.pressure,0);close(bench.deltas.morale,-1.2);
 const absent=apply(bench.memory,context,null,states);assert.deepEqual(absent.memory,bench.memory);assert.deepEqual(absent.deltas,{morale:0,happiness:0,respect:0,pressure:0});
});
check('idempotence, stale turns, legacy start and context transition',()=>{
 const first=apply(undefined,context,fixture(3),states);assert.equal(first.memory.observations.length,1);
 for(const turn of [3,2]){const replay=apply(first.memory,context,fixture(turn),states);assert.deepEqual(replay.memory,first.memory);assert.equal(replay.deltas.morale,0);}
 for(const changed of [{...context,clubId:'new-school'},{...context,category:'U17'},{...context,season:2027}]){
  const next=apply(first.memory,changed,fixture(4),states);assert.equal(next.memory.observations.length,1);close(next.deltas.morale,-1.2);
  assert.equal(apply(first.memory,changed,fixture(3),states).deltas.morale,0);
 }
});
check('attacker absence of goals grows across six real appearances; goals recover',()=>{
 let memory;let first,last;
 for(let turn=1;turn<=6;turn++){last=apply(memory,context,fixture(turn,{position:'ST',result:'W',goalsAgainst:0}),states);memory=last.memory;first??=last;}
 assert.equal(last.breakdown.personalStreak,6);close(first.deltas.morale,-.5);close(last.deltas.morale,-1);
 assert(last.deltas.happiness<first.deltas.happiness);assert(last.deltas.respect<0);assert(last.deltas.pressure>0);
 memory=apply(memory,context,fixture(7,{position:'ST',result:'W',minutes:5,goals:1}),states).memory;
 const recovered=apply(memory,context,fixture(8,{position:'ST',result:'W'}),states);assert.equal(recovered.breakdown.personalStreak,1);
});
check('role weights, goals conceded in victory and strong rating mitigation',()=>{
 const st=apply(undefined,context,fixture(1,{position:'ST',result:'W'}),states);
 const wg=apply(undefined,context,fixture(1,{position:'WG',result:'W'}),states);close(wg.deltas.morale,st.deltas.morale/2);
 for(const position of ['GK','CB','FB','DM']){
  const d=apply(undefined,context,fixture(1,{position,result:'W',goalsAgainst:2}),states);assert(d.deltas.morale<0);assert(d.deltas.pressure>0);
 }
 for(const position of ['AM','CM','IND'])assert.equal(apply(undefined,context,fixture(1,{position,result:'W',goalsAgainst:5}),states).deltas.morale,0);
 const cb=apply(undefined,context,fixture(1,{position:'CB',result:'W',goalsAgainst:3}),states);
 const good=apply(undefined,context,fixture(1,{position:'CB',result:'W',goalsAgainst:3,rating:7.5}),states);close(good.deltas.morale,cb.deltas.morale/2);
 assert(good.deltas.morale<0);const capped=apply(undefined,context,fixture(1,{position:'CB',result:'W',goalsAgainst:10}),states);assert.deepEqual(capped.deltas,cb.deltas);
});
check('minute sample, normalization, recorded chances and no bench erasure',()=>{
 for(const minutes of [0,5,19])assert.equal(apply(undefined,context,fixture(1,{position:'ST',result:'W',minutes}),states).deltas.morale,0);
 const half=apply(undefined,context,fixture(1,{position:'ST',result:'W',minutes:45}),states);close(half.deltas.morale,-.25);
 const chance=apply(undefined,context,fixture(1,{position:'ST',result:'W',xg:1}),states);close(chance.deltas.morale,-.625);
 let memory=apply(undefined,context,fixture(1,{position:'ST',result:'W'}),states).memory;
 memory=apply(memory,context,fixture(2,{position:'ST',result:'W',minutes:0}),states).memory;
 assert.equal(apply(memory,context,fixture(3,{position:'ST',result:'W'}),states).breakdown.personalStreak,2);
 assert.equal(apply(memory,context,fixture(3,{position:'CB',result:'W'}),states).breakdown.personalStreak,1);
});
check('combined caps and actual 0–100 deltas',()=>{
 let memory,effect;
 for(let turn=1;turn<=30;turn++){effect=apply(memory,context,fixture(turn,{position:'CB',goalsAgainst:10}),states);memory=effect.memory;}
 assert(effect.deltas.morale>=-7);assert(effect.deltas.happiness>=-9);assert(effect.deltas.respect>=-2);assert(effect.deltas.pressure<=4);
 const low=apply(memory,context,fixture(31,{position:'CB',goalsAgainst:10}),{morale:.2,happiness:.1,respect:.1,pressure:99.9});
 assert.deepEqual(low.deltas,{morale:-.2,happiness:-.1,respect:-.1,pressure:.1});
});
check('frozen inputs, inaccessible DNA and invalid turns',()=>{
 const observation=fixture(1,{position:'ST'});Object.defineProperty(observation,'dna',{get(){throw Error('DNA read');}});
 Object.freeze(observation);Object.freeze(context);Object.freeze(states);
 const a=apply(undefined,context,observation,states);Object.freeze(a.memory.observations);Object.freeze(a.memory);
 assert.deepEqual(apply(undefined,context,observation,states),a);
 for(const turn of [NaN,Infinity,-1,.5])assert.equal(apply(a.memory,context,fixture(turn),states).deltas.morale,0);
});
console.log(`${count} match emotion groups passed`);
