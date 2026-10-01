import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as engine from '../prototypes/dez-clubes-v2/engine.mjs';
const app=fs.readFileSync(new URL('../prototypes/dez-clubes-v2/app.mjs',import.meta.url),'utf8').replace(/^import .*?;\n/,'');
const key='1903.prototype10.v2';
function fixture(g,{raw=JSON.stringify(g),confirm=false,denyWrite=false}={}){
 const root={innerHTML:''},nodes=new Map(),buttons=[],map=new Map([[key,raw],['1903.prototype10.v1','old-prototype-preserved']]),writes=[],reads=[];
 function node(id){if(!nodes.has(id))nodes.set(id,{handlers:{},addEventListener(k,fn){this.handlers[k]=fn;},scrollIntoView(){}});return nodes.get(id);}
 const document={querySelector:s=>s==='#app'?root:node(s),querySelectorAll:()=>{buttons.length=0;for(const match of root.innerHTML.matchAll(/data-proto-choice="([^"]+)" data-proto-event="([^"]+)"/g)){const b={dataset:{protoChoice:match[1],protoEvent:match[2]},handlers:{},addEventListener(k,fn){this.handlers[k]=fn;}};buttons.push(b);}return buttons;},createElement:()=>({click(){}})};
 const localStorage={getItem:k=>{reads.push(k);return map.get(k)??null;},setItem:(k,v)=>{if(denyWrite)throw Error('quota');map.set(k,v);writes.push({k,v});},removeItem:k=>{map.delete(k);writes.push({removed:k});}};
 const context=vm.createContext({...engine,document,localStorage,FormData:class{constructor(f){this.fields=f.fields;}get(k){return this.fields[k];}},URL:{createObjectURL:()=>'',revokeObjectURL(){}},Blob,confirm:()=>confirm});
 vm.runInContext(app,context);
 return {root,context,nodes,map,writes,reads,buttons,history(){vm.runInContext("protoPage='history';protoRender()",context);},submit(dream='gremio'){nodes.get('#proto-start').handlers.submit({preventDefault(){},currentTarget:{fields:{name:'Teste <texto>',position:'AM',dream}}});}};
}
let checks=0;
const fresh=engine.createGame('Teste <nome>','AM',4130044585),r=fixture(fresh);assert.ok(r.root.innerHTML.includes('&lt;nome&gt;'));assert.equal(r.writes.length,0);assert.deepEqual(r.reads,[key]);checks++;
const invalid=JSON.stringify({...fresh,rng:-1});
for(const confirmation of [false,true]){const f=fixture(null,{raw:invalid,confirm:confirmation});assert.ok(f.root.innerHTML.includes('Baixar os dados preservados'));f.submit();assert.equal(f.map.get(key),invalid);f.nodes.get('#proto-new').handlers.click();if(!confirmation){assert.equal(f.writes.length,0);}else{const copies=[...f.map].filter(([k])=>k.startsWith(key+'.recovery.'));assert.equal(copies.length,1);assert.equal(copies[0][1],invalid);f.submit();assert.ok(engine.validGame(JSON.parse(f.map.get(key))));assert.equal(f.map.get('1903.prototype10.v1'),'old-prototype-preserved');}checks++;}
const q=fixture(null,{raw:invalid,confirm:true,denyWrite:true});q.nodes.get('#proto-new').handlers.click();q.submit();assert.equal(q.map.get(key),invalid);assert.equal(q.writes.length,0);checks++;
let game=engine.createGame('UI fluxo','AM',4130044585),seen=new Set();
for(let i=0;game.phase!=='DONE'&&i<60;i++){
 assert.ok(engine.validGame(game));const f=fixture(game);assert.equal(f.writes.length,0);assert.ok(!f.root.innerHTML.includes('[object Object]'));assert.ok(!f.root.innerHTML.includes('undefined'));assert.ok(!/aptitudes|dna\.learning/.test(f.root.innerHTML));
 seen.add(game.event.kind);
 const choice=game.event.choices[0];assert.ok(choice);assert.ok(engine.choose(game,choice.id));
}
assert.equal(game.phase,'DONE');const final=fixture(game);assert.ok(final.root.innerHTML.includes('O recorte terminou'));final.history();assert.ok([18,19,20].every(y=>final.root.innerHTML.includes(y+' anos')));assert.equal(final.writes.length,0);checks++;
// All retained records must remain accessible; coaches and fans are not erased by duplicate suppression.
const memoryGame=structuredClone(game);
const id=memoryGame.clubId;
memoryGame.fanMemory[id].criticalEntries=Array.from({length:10},(_,i)=>'Marco '+i);
memoryGame.fanMemory[id].entries=Array.from({length:4},(_,i)=>'Rotina '+i);
const mem=fixture(memoryGame);assert.ok(mem.root.innerHTML.includes('Marco 0'));assert.ok(mem.root.innerHTML.includes('Marco 9'));assert.ok(mem.root.innerHTML.includes('Rotina 3'));mem.history();assert.ok(mem.root.innerHTML.includes('Marco 0'));checks++;
const reactions=structuredClone(game);reactions.coachReaction='Reação integral do treinador';reactions.fanReaction='Reação integral da torcida';const feedback=fixture(reactions);assert.ok(feedback.root.innerHTML.includes(reactions.coachReaction));assert.ok(feedback.root.innerHTML.includes(reactions.fanReaction));for(const m of reactions.lastMatches){assert.ok(feedback.root.innerHTML.includes(m.coach));assert.ok(feedback.root.innerHTML.includes(m.fans));}checks++;
const clicks=fixture(fresh),old=clicks.buttons[0];old.handlers.click();const afterClick=clicks.map.get(key);assert.ok(engine.validGame(JSON.parse(afterClick)));assert.equal(clicks.writes.length,1);old.handlers.click();assert.equal(clicks.writes.length,1);assert.equal(clicks.map.get(key),afterClick);checks++;
const quota=fixture(fresh,{denyWrite:true});quota.buttons[0].handlers.click();assert.equal(quota.writes.length,0);assert.equal(quota.map.get(key),JSON.stringify(fresh));assert.ok(quota.root.innerHTML.includes('O navegador não permitiu salvar'));checks++;
const start40=fixture(null,{raw:null});
const dreamMenu=start40.root.innerHTML.match(/<select name="dream">([\s\S]*?)<\/select>/)[1];
assert.equal([...dreamMenu.matchAll(/<option /g)].length,40);
assert.equal([...dreamMenu.matchAll(/<optgroup /g)].length,2);
assert.ok(dreamMenu.includes('Série A')&&dreamMenu.includes('Série B'));
for(const c of engine.CLUBS.filter(c=>['A','B'].includes(c.division)))assert.ok(dreamMenu.includes(`value="${c.id}"`));
assert.ok(!dreamMenu.includes('sao-luiz'));
start40.submit('palmeiras');assert.equal(JSON.parse(start40.map.get(key)).dreamClubId,'palmeiras');checks++;
const directory40=fixture(game);directory40.history();
assert.ok(directory40.root.innerHTML.includes('20 na Série A e 20 na Série B'));
for(const c of engine.CLUBS.filter(c=>['A','B'].includes(c.division)))assert.ok(directory40.root.innerHTML.includes(c.name));
assert.ok(directory40.root.innerHTML.includes('calendário resumido'));checks++;
console.log(JSON.stringify({checks,phases:[...seen],result:'PASS',originalStorageTouched:false}));
