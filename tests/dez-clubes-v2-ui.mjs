import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {gunzipSync} from 'node:zlib';
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
for(let i=0;game.phase!=='DONE'&&i<192;i++){
 assert.ok(engine.validGame(game));const f=fixture(game);assert.equal(f.writes.length,0);assert.ok(!f.root.innerHTML.includes('[object Object]'));assert.ok(!f.root.innerHTML.includes('undefined'));assert.ok(!/aptitudes|dna\.learning/.test(f.root.innerHTML));
 seen.add(game.event.kind);
 if(game.mechanicsRevision===1){for(const c of game.event.choices){assert.ok(c.benefit&&c.cost);assert.ok(f.root.innerHTML.includes('Ganha'));assert.ok(f.root.innerHTML.includes('Custo'));}}
 if(game.event.kind==='PLAN')assert.equal((f.root.innerHTML.match(/Meta do papel:/g)??[]).length,3);
 const choice=game.event.choices[0];assert.ok(choice);assert.ok(engine.choose(game,choice.id));
}
assert.equal(game.phase,'DONE');assert.equal(game.age,25);assert.equal(game.playedMatches.length,126);const final=fixture(game);assert.ok(final.root.innerHTML.includes('O recorte terminou'));final.history();assert.ok([18,19,20,21,22,23,24].every(y=>final.root.innerHTML.includes(y+' anos')));assert.equal(final.writes.length,0);checks++;
// All retained records must remain accessible; coaches and fans are not erased by duplicate suppression.
const memoryGame=structuredClone(game);
const id=memoryGame.clubId;
memoryGame.fanMemory[id].criticalEntries=Array.from({length:10},(_,i)=>'Marco '+i);
memoryGame.fanMemory[id].entries=Array.from({length:4},(_,i)=>'Rotina '+i);
const mem=fixture(memoryGame);assert.ok(mem.root.innerHTML.includes('Marco 0'));assert.ok(mem.root.innerHTML.includes('Marco 9'));assert.ok(mem.root.innerHTML.includes('Rotina 3'));mem.history();assert.ok(mem.root.innerHTML.includes('Marco 0'));checks++;
const reactions=structuredClone(game);reactions.coachReaction='Reação integral do treinador';reactions.fanReaction='Reação integral da torcida';const feedback=fixture(reactions);assert.ok(feedback.root.innerHTML.includes(reactions.coachReaction));assert.ok(feedback.root.innerHTML.includes(reactions.fanReaction));for(const m of reactions.lastMatches){assert.ok(feedback.root.innerHTML.includes(m.coach));assert.ok(feedback.root.innerHTML.includes(m.fans));}checks++;
const clicks=fixture(fresh),old=clicks.buttons[0];old.handlers.click();const afterClick=clicks.map.get(key);assert.ok(engine.validGame(JSON.parse(afterClick)));assert.equal(clicks.writes.length,1);old.handlers.click();assert.equal(clicks.writes.length,1);assert.equal(clicks.map.get(key),afterClick);checks++;
const quota=fixture(fresh,{denyWrite:true});quota.buttons[0].handlers.click();assert.equal(quota.writes.length,0);assert.equal(quota.map.get(key),JSON.stringify(fresh));assert.ok(quota.root.innerHTML.includes('O navegador não permitiu salvar'));checks++;
const start156=fixture(null,{raw:null});
const dreamMenu=start156.root.innerHTML.match(/<select name="dream">([\s\S]*?)<\/select>/)[1];
assert.equal([...dreamMenu.matchAll(/<option /g)].length,156);
assert.equal([...dreamMenu.matchAll(/<optgroup /g)].length,4);
assert.ok(dreamMenu.includes('Série A')&&dreamMenu.includes('Série B'));
for(const c of engine.CLUBS.filter(c=>['A','B','C','D'].includes(c.division)))assert.ok(dreamMenu.includes(`value="${c.id}"`));
assert.ok(dreamMenu.includes('sao-luiz')&&dreamMenu.includes('Série C')&&dreamMenu.includes('Série D'));
start156.submit('sao-luiz');assert.equal(JSON.parse(start156.map.get(key)).dreamClubId,'sao-luiz');checks++;
const directory156=fixture(game);directory156.history();
assert.ok(directory156.root.innerHTML.includes('156 nas Séries A–D'));
for(const c of engine.CLUBS.filter(c=>['A','B','C','D'].includes(c.division)))assert.ok(directory156.root.innerHTML.includes(c.name));
assert.ok(directory156.root.innerHTML.includes('calendário resumido'));assert.ok(directory156.root.innerHTML.includes('grupo A16'));assert.ok(directory156.root.innerHTML.includes('Calendário experimental de 18 partidas'));checks++;
// The first contract stays unassigned until the player selects an interested project.
const entry=engine.createGame('Escolha inicial','ST',7);
for(let i=0;i<3;i++)assert.ok(engine.choose(entry,entry.event.choices[0].id));
assert.equal(entry.phase,'ENTRY');assert.equal(entry.clubId,null);assert.equal(entry.entryOffers.length,3);
const entryUI=fixture(entry);assert.ok(entryUI.root.innerHTML.includes('Escolha seu primeiro clube'));assert.equal(entryUI.buttons.length,3);
for(const p of entry.entryOffers){assert.ok(entryUI.root.innerHTML.includes(p.name));}
for(const text of ['Concorrente','chance inicial de titularidade','min/jogo previstos','R$','Ganha','Custo'])assert.ok(entryUI.root.innerHTML.includes(text));
const selected=entry.entryOffers[1];entryUI.buttons[1].handlers.click();
const signed=JSON.parse(entryUI.map.get(key));assert.equal(signed.clubId,selected.clubId);assert.equal(signed.salary,selected.monthly);assert.equal(signed.rival.quality,selected.rivalQuality);assert.ok(entryUI.root.innerHTML.includes('Estrutura de formação'));checks++;
// Signed skill variation and observed shooting are exposed next to their own evidence.
assert.ok(game.progression.some(p=>Object.values(p.skillChanges).some(x=>Math.abs(x)>=.05)));
const playedUI=fixture(game);assert.ok(playedUI.root.innerHTML.includes('Variação no último avanço'));assert.ok(playedUI.root.innerHTML.includes('chutes'));assert.ok(playedUI.root.innerHTML.includes('no alvo'));assert.ok(playedUI.root.innerHTML.includes('ataques do time com você em campo'));checks++;
assert.ok(game.marketHistory?.length);assert.ok(final.root.innerHTML.includes('Quem observou sua carreira'));assert.ok(final.root.innerHTML.includes('Interesse não garante proposta nem contrato'));checks++;
// A completed two-year gain must be distinct from the upcoming two-year plan.
const spanGame=engine.createGame('Intervalo público','ST',7);
const spanFresh=fixture(spanGame);assert.ok(spanFresh.root.innerHTML.includes('Plano de formação · 12–14 anos'));
assert.ok(engine.choose(spanGame,spanGame.event.choices[0].id));
const snapshot=JSON.stringify(spanGame),spanUI=fixture(spanGame);
assert.ok(spanUI.root.innerHTML.includes('Variação acumulada · 12–14 anos · 2 anos de formação'));
assert.ok(spanUI.root.innerHTML.includes('Plano de formação · 14–16 anos'));
assert.ok(spanUI.root.innerHTML.includes('Formação dos 12 aos 14 anos (2 anos):'));
spanUI.history();assert.ok(spanUI.root.innerHTML.includes('12–14 anos · 2 anos de formação'));
assert.equal(JSON.stringify(spanGame),snapshot);assert.equal(spanUI.map.get(key),snapshot);assert.equal(spanUI.writes.length,0);checks++;
assert.ok(playedUI.root.innerHTML.includes('bloco de 6 partidas'));checks++;
// Wellbeing states are visible, correctly oriented and render without writes.
const wellness=fixture(fresh);for(const label of ['Felicidade','Descanso físico','Stress mental','Condição','Cobrança'])assert.ok(wellness.root.innerHTML.includes(label));
assert.ok(wellness.root.innerHTML.includes('Descanso físico: 90 de 100; maior é melhor'));
assert.ok(wellness.root.innerHTML.includes('Stress mental: '+Math.round(fresh.mentalStress)+' de 100; menor é melhor'));
assert.equal(wellness.writes.length,0);checks++;
assert.ok(engine.choose(signed,signed.event.choices[0].id));assert.equal(signed.event.kind,'ROUTINE');signed.fatigue=0;
const routineUI=fixture(signed);assert.ok(routineUI.root.innerHTML.includes('Descanso 0'));assert.ok(routineUI.root.innerHTML.includes('50% da prática habitual'));assert.ok(routineUI.root.innerHTML.includes('58% da prática habitual'));
assert.equal(routineUI.writes.length,0);checks++;
// D competition context reflects the actual regional calendar without changing the save.
const lowerEntry=engine.createGame('UI D pública','AM',7);
while(lowerEntry.phase==='FORMATION')assert.ok(engine.choose(lowerEntry,lowerEntry.event.choices[0].id));
assert.ok(engine.choose(lowerEntry,lowerEntry.event.choices.find(c=>c.profile.division==='D').id));
const lowerSnapshot=JSON.stringify(lowerEntry),lowerUI=fixture(lowerEntry);
assert.ok(lowerUI.root.innerHTML.includes('Série D · grupo '+lowerEntry.scheduleGroup));
assert.ok(lowerUI.root.innerHTML.includes('18 jogos experimentais'));assert.equal(JSON.stringify(lowerEntry),lowerSnapshot);assert.equal(lowerUI.writes.length,0);checks++;

// Public completed06 career resumes only after an explicit click; render never writes.
const done06=JSON.parse(gunzipSync(Buffer.from('H4sIAAAAAAAC/+19W28jV7beXykQeZjByPS+X+SXbndrnE66rU6r7UFgGAclsiSVTbI0RVLHPUYD8xQgr5k/kEEQHHiA83QQBDiP0T/xL8ladS+yiqoiq0iqLc2lJV5qr733+tZ1r7V/HsxHN97UHZyyk0G4nHjzd96dP/eD2eCUngxG7sSbjd2w9OLUG924M39U/ug/e5PJpefPrkuv3ri3t/7Mm88Hp8oOqeKWciKNIVbgg2YLd3KxCKP3yZBJoozIfiRQFCwX8PXB6c+DaTCGfwfvzi7eD04Gc8+d4xCMnAxuvdAPxoNT/vFkMHOn+KmLmXs7vwkWzu39v19O/FHgEAXfcq/hTQZk3QZzfxHROIgeN5osL1/BIwaXwcK9Cq6Dz+a3+HIwGyefs2yopGD5z8ngyl3410t4ohoKplT+FocBcE7LEN7kesiE0cJSJQglhkePvfLH3mwEb2s21MxySgRnllp4dxEu5wsYENaDFH4sTPpHfzKZ42Jc+TN/fgOLDYPD57RV0nJjmYRnweDufB69B2NzSYjRxghiKRIWeu44ek+SoTZAlYB3CNMKiXaRIiGGRDFuYXSuJFB8Mhh7V8AG0dcYGxLNgVZOBExKEH0yuA7cyY+edxt9gFr4AExGwZetlEx8xNUIrvyRDzP+ADNWMON8Xgy2eTxzcVYTzw1n0UPI0BpCJJHcGGu5hkHc24W/WI691fnTIdBJrDGaSKFglrKwAHRIjVZGaisJ41JTXViB6JvwKvCige0T1qRLAF8j0hKuKTeUSaNKSwDvSiqN5Iwagyy7ugJDfCzRWjMJ3E65+AhrEEZvSQ27ITShyMLeOMIIMPkMfzM1bA2cFoRTN+ZD3KYbd45M/vL867MICqHvTuAdhlSOIuzBInF48gK4eTJfuIto0QCK8K9ARlq44SL5zNSfLRe4qgwmHM9kjrsIKw6LOMePATEhDD+7vlhO4UvcDhFqMa0X5adTlT+dksLTrVTZw3XtsymlQ9jwwg8M9AHYIhnmu59jDBfXCn+vwW9Cky7QVJwxbHI+Y7WBKP3xJB3YFga2Dw1ctxgGpV+DcclQZCMjSxTZY7uRt96G74HvJu4Hb/zGXYDGiPeiuAUpF9dSFtzeBjOQ+PDG8+n9L6E/cj9781Xhjeg7IL+jd6bX8M71VUTZdayesklwkcwOAXQFc/GyOZGqOUUSGr7i3nnJy958OUFCXkdC3h3dwO9ns0Xojl1n7DlcONFgwdwBWQ0vOwWKTx3qgPxxJ/5f3Pt/uf8/3tz5HXVmgeNO7oLfnzjEuQ4mc8eDX2JS7v8xG/nufOic3fnj+A/n1g3hn8mJM/emzg/LybWLyjDAwZfT6O2FD7T4s4Xnh+5wgNoGUT04mxao25aULxzXCW6DcLGcwSgw5lXgO6NluIhGmgbTeJtQuMDkF971B9y09++fv/jP8NrCc6cvwAIYRXsR7V/2Jwhf1LvziBGi385n793w2lvErBF/7gXI4GjzYC9+9D68BeKSnUHJ/Xyx8Ka3yQ6OguntxIMPFz6EqxLeAY2xpCO4OP7EG78qv06RK4KcRbyfRt4tvofSMnkNNNM1qurCN+CNFwFQOc4I9EAUX8Szyv5+EzPjuwQBg69jYVxtG+FCnN8mC774EHEzvvZ8NIpMHzpUSgmNBoI18J9UYHlhvLCoELnmVoNO5ZlgrMQfa4S/xQ2sqT9aA1/+egF6RfnBVHvo8UrovayGHlNr0EuIqmJ2sk/c5aRtS0qHuGPNcUda447uhDvSGndkX7ijZdyBCawEWJiGKkuolMJUAU8RJZlRFMxd+DG8Bnm8GfIm978AMweffXW+jr6Iz4PProN63adpAYDgKjTAH3tQ9b1IkZYTd+qwrVj8BD6zcB11wobOc8f7yRst4ev/CxDmOlfLWfw7eEdgp7rO1JvcBKEbFnD2ZbpyF28d8utf/8ZKVOEzFwFAGJ4WXILlexcstyS0NeJEGXE6QxzrAHGiAnG0R023N8TxMuLYkFkJLhl6VYAnRUUV4gyLXC9wTNEtkzWAE40Ad+fe/+sa0u5cvx5izPZsXjK7puOQyoMbljldR2BYsj4Ny9+SglOUa6ZBiXFtaKVlyRnhVnDClNJEMFGDN9kEby/AWb//+yrgRvCqW0Zc0RG3pD+lFhO0rcXWtTqjCT2VimxbozJwQv/OnTgeTHfq+nNAHSylM/NgTZ25P11O3IjQ1hikZQyKTo1MWYFB3qPK4wfDoCVCGi65ASsTgGarMMgIgk8bwqXVgtVAUDWC4Lsv1/AXXiboo+s+XS4UdtV3f6rWd1Sv6jsg8eDaLqfqCLSdaI60J21XH0aRgDKhrNUaTEvLKpHGhaXGUivBqxO6zrjUjZAW+iP//t+n7jre4I3ldIPKM7pHlZeSdSxOHM1J6tCD61HxrUQ1We++HutR8bGD+XpCMM6Nphr8OGUMq4yuMMUppYxyIgRhdXg0jfC49N3LCusTX3a7dfj4bg5fQukp8PRhY5oFl48cOqZZqwRJB6hje1aC9IAun+WCc1SF0lBFK5MJBHPTxlrBFJN1yQTbBHR/BFLcifeXNSV4VXijxvTE0xDVWpBWA08PzYOWZ6IFM7oeMu/oZi2oT8zQiZ7pXy79RPdF50fuInC5AICxP79dwmdhWxxvfgvDBDXqkII6JDltRXUI+jSY3Xgjb7klwfvzBGk7+5SWoEmbQJO2h2bMP8eMTKMYZxo0oWAUVGOleaqokGCgKmYpFdroGmhS0lOivQhP0lYvkgdTfRegozbl1mcIr5tgeec57mIZc6szX6ZIA+b23fAL58twCXh4A9vnh/AkgI53Cbgpq6INFikpj+pmILzzl4CihT/1Yn2aEzEOnB+Ca3cchLuih3eq2Min6t2RFfhUoEXg8TUtBR6hM4boutAlpR2mxVmbACarBood0qZ6LM9/yzWtwApagW1WY/aEdqjGWOTVpaTVaLHt6G2NLlmHLrmGLtZaN/FGuoluoZvilw4Uo5RlbIkhJ5xrKsEZ08QqVYU1xgjFk5+McKHq/DTKekuDFzWTVq3DJ+JB3VSZBhdbhQazCIoAbGQqJPSu/XnkFYLX5M8wmuJO4GOAmPy7KRin3sLdrMEeSoxvR3p3+BMdxC5ZN/g7vmDJGgIJAZNPMcrwLDOvAKDklGnBFTh3VKjaHAHlHebFS86aaIk53RhxcfpbbNQX5CE3jXSo3xKEIV01ym07YneNiagN4KpQbqwELtYkEsk7UW6HxZYoY4uD7iJaaUoNZeBf8Sr1JgUTmKDTQlCi6vWb6CYLnhiRcjcjUrbNgq9zLW9jQsqOTUhZkQ7fiLEm1PYYBpF1h1LW0chbm5rN0Mhq0MhbmpqHU3RUW0GZALRxyaqxqCglaG5qybUyqg6Lcud0eKLmeNG05K1NS94Yhpj3Jrvl5HhfFiVH8ioNSbKfE5as7oQl6elMM/004/9aEW24kQKsREurooyKKs25MNoyyaStDTKqLrPgtCILLjuK/7/cmAXfHIjYe/y/Jh3eOHJCD674WKcxFrnf+P/hNB+T2hqlDFfK6sogi+KEK6EtAQ8P/q/Wx9NdpcPZejqcmp5rfKg51nR4TtkRpMN5netHnkp8dsoaKEmlUOAPSq4sJ7Xmpek0/d1NMY9oamoW0t/sSEOYrDoPvuFYGD3ssTBRF+lkHUQ6q7Sg+BSKXdeOhXHw+wB/oOGElKKyJkEJKizTRhNiuV7Rg7ZltXmratciPk37ugTZvNguTevxXcKeCmMyfcGzKr+XoZPvHgB9G8wXSyBl7l3jP/Gj0UhAO9qQXBfHtCYzSg+egnL1MrU/3MKKzQ+Y8SZW7Bb4ZZ+CRl2LplKqOZFcEyG4VlX+pTTGcsXA2NWKEUVr4NtDrrDCydzTKZZS1nAPx1hokoIvDtvzORbxdI6lH4tUaqIJKETJKOi7WnXXSWaPryNkQ0OV2jgMb1MBVNFQpUnFKz2eVir0gP7e4VupPKrwpyGSMmMVwX5rlcefJaglKyUR0hrAG6+Bm+i04JXv2EZFtqo4WGujUl8HS4+nicpha8z1o666OxziLKNKWGIoHsMUrPLsigWogVOH7fwMfLQGcbKr+tZSlMW2TjKoVgk9vlt5geo4vcBW83iFxMJ2pHanyngHwBI7FY4fb7nAepxECCkpeFtUCqMrwyREMMWFJJRy+G+dIusjjVdEmFKtEaY7KWZthTPdPc4eSOOxYyvjqW2q0kUAs7+j0odN461VmWsijYpauXLJVCUu8TC1YQKT7NyaOn+usyxeBSa769TX3MRMs3hPjfq2apBJnry6DTam4MoyLsCQlFSxStApxZQC5w7wSVmdMuwlq1fqkcm76qdS1yOTryKvkOw7dEE5P6IMOukzg/7JYq9JBh2jlEZKJrFt2EqHPtuufvyrwL//+3wVZ9cBsEJ9+xTdY2YuJmjHcoQe83I0obBhzQ87bM68xZFp1kl1EPsUcubr1UGKCQr2pMALCSorxxVeu6AsIQYAKWpDLA0Lx7fOmWt9mJw5fZw5814q8nhdno4fvCLvUbUvskprS41QBjy9/Kxy+SiZIFIKYQ1oQl17ToX2lukuWZ6iK5+vJo/HxOa096EdP3FEjp/ss3km++00sDWKUqYplp1rzSodP/D3JJXMCoVdNms1H+sifV4BO806Cn/+acvS2L2HPncpjaU91Z2LTi3L3U5zsbbBTHGww1xSE1BxkoMGM4ISXZm8I5oSS0DFKQJ+Xx2+eDf58m5SeKZtaazcWGy69yIhtrk0djtqD+HnySalsVugcYvrEY4OjesVQowYvFvOSiu4FpUnozV2aDHcKMl5LRZFV6Wx++8HFuXU99YHLBptv/2/5NO5ya7ikEZzw60Gq08oTVUdGmQPCfBmrVFq9ZNtagEWEuBiNxVlO7cCH0qAi2PTUqJ5ryJ+qBsNjr+dCrNKKCKEppTwSo/McsIEodRqvM+uNiyiOu7qXEwRKNtfIDLLdB9rHJKmJB4yDCn7PAXGGzloj7Ax2BraOCFaKaIJtdg6pRpuhlKl8R5j8NHqym2aVY237ecsdiwdb3Wueb10vHGb570Wjx/8aLPq82jzb+jYCWeGawa6DK80J5UpAKM0KDvLDGCQGFEHPtNpMrx0/FL3V0aeJsN3bFrUYw35hmQ4ObZ7Rdi+bzjoMzF3VAdSLAOkKkY4JVKoEgjxtvR29eJt0nCsIg1Her5Qi5HNabhDnwEjv5VLRT7ZGp/1M8+g/aIryvGXyiyBJgrbqhjCOZNM1EGQddidttRKrH0vlcZVPkkSju12IEz15+ytZeM29FBhe2jdJzYUFrA9X5jVHmXikCizlFnLmGHcSFYd8iSAREHA5cPqghqYdZuLE42A1l0ujh/XhT1icy6OH1uZz27ld53ciNBZ+R0/2PEvpSwxjBBriJak8silFRINTvjXClLuU1vAoujj1lbGeu7ZwNgWt7b23rEhp+oIOjaIfd9RTj/RIIsmFrsxCIlnKW2lcSmwEbTkBD4m65Se7OHSVtbooNfugZaNab5j6de3+RpXcWz9+lqcEDtYGfrx4XM9AcEoE8QKdOsUrfb9BFdYdCAt05TVKULVY72r6TEImqX7jrGTZnJYbEO6jx2k6qD/4nL2SXbHlAyvJudaglHJTXWXaMMJF5JpYa0UnNbATfd9fSunPQc6OT3eStectuPrFc0f9dUJByw2sApMUIJ3kSuijKhUdUxRRqPaVwI2aQ32us32kT6M0Jf12T52pNk+sinbx44t2yeaB0X3ne1jj6ldtKUY8QT3z3DFTM0xUEo0V0pSvMOyBpONytH/0xJXaTn2VmH5Q+GNuutMSEeFQBXQzOja+Tpz3fl1JhltnV5nvusxa9ZpOGbPYU9xQB2oLeEcO/kZpWVV/0wFPh4Fr1BqranhrC7bTnq7C5bvmG5XrTodPZBu3zLH1ke6nW3Z/qGvqlfVaSLwkw2JricCuTEakCiw6wOt7LEO2hDsVICqNXhTXp0T2LD0vFnVa0nZqY7aar5skXA/aGNNurHqle1HybXItHej5Eh/FQzkYPiS1kjGBFiVnBpKq491YlMHIYyxgvLaE2WstybRW0Q0dbeJ9gcdPd3jXZRrGfcdyxcea75ddXNJ8+Pot2IJoQZgZxRjlYkGBYDUFPOFVBqu61DJu0q500+2/DW5iXIP5a+8zi97Kn/d7dSzFpIwyUGNmagzZh0aRM958Y6A8foBYOQZ8j1Vh7PimD2DpNfSgN80SBhXjDMFWoVoVe8nySNrxiw7asZMjqcZ87GlyQ6hieincGCrOjGGDZrBOCOK25U734o4U330Xy4eUNamtd/EO7lVtVWOjPflOonWt6oeV1Gc6jRNJvd8buRwtxLgXSCAPYP9mK2qPqUFqhBASpWAD9b6Trqb1HXFzeJMtj+zLFt1RperarA+o73fY8tyU4z+sBfNtQwhdlIeQD+BGL3hVlCLVTjEGEVYdU2cANuTMcKNYqbusEiz2vDGmekK5JlanciqgWdrdOLmzPTmfj9ss060qBM7C9izyH97KDO9HcG7ZsVath16AHEdNUGvCNrHLx1NbzxJuNRaKCbAzKw6B6IpZYILYjWXjGn18fuTwcSdL964i9ENLst3T9HCp2jhU7TwKVr4FC18AslTtPApWvgULXyKFj5FC5+ihU/Rwqdo4VO08Cla+BQtfIoWPkULf7vRwhvYtiD8EEUK3WtvI9jClNK3ITj3fhgkWgSEvDcfBZMbHxx8WLnQcxbh/T/mDizNDx5qm9i6QscfVj8KUgYAou8GDDhnFnW2UbGCGPm3CauBqCfOwl+A3RRGEh1eOf/2nSMZsleBlU8jlTKLARHzV/JJ+ut/+x+SnQAXrz2blR/9hePligzNy2XyPHe0RMsNXgKlNvfArPsBRp03JoEgCfTEqZie2A8JwiAJpC8SqG29g8I0pl0D7cKcOPJwy6eQBF25fHxPJEgkQVWuQgckUJPuoK7YQVq5g7Ix7QJpl5XLJ/e0fBxJEAdlIoYk8MpV2FkSfR/p9zfeNBLjP5dkNvwJEvfWG4HmtKBFUDj7UV5oUDBLTNTH/WQHbZ+5ETJ+0valQYUIgjZ1DyMNu7nkbWxU/Kgtg324xqMQLK2ROznLl/DFcnob+ssk5oCODlidqO7Q/cjHgc373egGVX06lvOHaKTfg0X4OV9lCef//V+HUf05lVGZI/5JP6fOZeDO01B68imNX243YrTEno8aGy2ZUWTJIEfFPHCa7PLJug1KYIwrb45O34vw/pcxPgPNzJSeda+vwuPrYMVU9YpxrYorxjpdsR7JVrzBRpuDkS1ryC7zZ81qU3Jsy80sa7Dc6tiWmxnZYLntdmS/DeaLJXiPc+8a/0lN9diJNIVS62RecQD2FrxEfx7NMldY/W6eYLS4CryG6WiHUtGS/qXi9x8/omuFfvsi8vaYHVpBSfYDejsKLaM2n8GD0JMvZW6B+j8vYZaRW0iGlrLsh2vwE6+CcBqlzKQg1Bq8PIdp7PXj3t6i902LGYDC3dp4+wcmhWeLd3kqAIiduuGP6It/N3CTu9+jkIsXghETfHYboroEsyOY3KH/+93glpI79hmFD8W/sew3nv0mst9k9pvKftPZbyb7zWa/UZL/mo9C82FoPg7NB6L5SDQfiuZj0Xwwmo/G8tFYYU75aCwfjeWjsXw0lo/G8tFYPhrLR+P5aJxGdshN4IPL/zpyoH8eeHdpmCtf5R99jJoN/nj+7s3z96/Ov4aX/CQ5NI147HThjW5m/p+X3jP8/MS99CaY0HFvgTNDTOXf/zKagbXjRGJgHkeb4JNxhKBQATxbTiZZnI5g/G6VINaIoNBzx8Bhz1iBnDM0XP0IvUjTBACKAgowhJZvRo1oQw1vRE3K1s94gZyv3NkNEAJm4BTkhAPs7Y+9v2RkqDZkiJyMs6/fv/uvKQlon384LVjwz0SBgucge2ZAwiiYOgW3IyPBtCFB5iS8e/Xt89c5EZGwOfXccPZMFkZ/E2AcLwSxvow2wJnl3kkVCavBow20qAIt59+8fxXFwWJagiVIHu/03dnF+2eqQM1bEDVhxBngNI3c2Rz3BITVEsVQFzTpnKa3r59nTBJ5eIvT2Lt7pou7s3BHQE6QBl6z1inT+19CwNJnb77akSRTWKazF+ffnhX2zBsFdx7wzruz5y+fmQJZ7+ApAJ95ppI8Z7ocFxHVnCpVRZVttnm2p82rpCnSCA/uXvSph7aveO5rJ5Jos3WitKeFoqySLNZopVgTRk9aquxGT0FCv/r6/RmuSUoTjuOOFqeTYDYOQRI+o0X5/CKYAafPE/n4OvmM87sLhJ/nfPn7FqSZStIKUvvF+dewMBllwdWVFxboKkrtt97YR7TdhgGo0vjUwigE23hnegoi/PnFxdnFxRtQJv8EK/bN64yy2FY7hXE/PKOyJBcWwTTaxgdUSSuSCpL85dmLVxevvs24fIwOg3/nnc7dK7A7ysI8uIv2rXico0q92K3kJtUNoae3g96WVJlGyDNNkJeb4TtR1FCUU9vTOlUKTtZIlrNGsjw7nrgTQQ0lOaM9LVO15GSNJDlrIsmz7j27EdRAlGeWNqsX5Sl3V4lyu52cYg+J8pyudqJ8W3rainLWXJRvS1JDo5xtZ5UzspWIYo3MctbILi+3YdyJKtNwrUxPa1Utp2yjtbIN1qp43nQXkjhptlCc9LRQ1ZKK0yYrxWkT0RkVTTWn5vvSAZJSwRbGWWCKfhAfIrn0roLQOwfB6E4mccDBvVp4YfZK1D/qR38ywRMf1xjC+3lw5c/8+U0Uu6NiiHc64eGY+G/sP2WjUx3jJLhHeXR6Bk+LqKHW8AdGN2fjtCgFo4R4diX++yMeh0ECvdnI+8r1Z3ED1HjRYMpZkGlQuiFYbJoVzqE8Ky43zkoPCaWFWckhl7wwKcqHFhuIp7NilrWfFSvMKn1yaU5q05xwBuU5CbZxTmrIiSrMSQxtaU5iqKxMp0TpkNLyTinYaNt2t7JQbmliJp8YXZsYTmNlYnwzCw4FHkzKJvYZGZI4yJzMjAwFF+nMyBBnXZgXfpzTlYnhi0xXzW4oTWF+ycmzutmx9dnxtdmJB2bHRGFyQBctz80Ymc9NWbPT5CxvPjm+PjmxNrnNOGNDqnh5dtiZvDA7JWk+O231DrNjQ/7Q7OxGxlxHnHpg62S8N/nsiCjzJTanzPjSqp32Tpnms6tgzDXJL/SDs1vZO5QvxdnZImciJHeYnWmxdxWcuaYBhHlgdoqzFdyVJidZYW5c9oo61Pkb+NKszk2SB+ampVmZmy1PTrOuZAobEtN8dut8iXNZmR19cHZ0RaasbJ0pzG7FHulzcutsiYSuTI49MDkqxKquK0tMXpQpQrOdOJNVTQ+sy+DyB2+08O88pK9mrjVW6tRbhGAQoG0A1u6PeGrbX0y82EH/89LHA8Zo91757uz+X8At9iZuXu0LH78MxtGhb3SYx8ukDNkL7/+e1CCPXczE37rwxcIJ4vEydGEi8SG3JF0+HzrfTOHh0ygJFRd2OBN/6uOBBHz8XZQYLEUQT5ypO3euMK8/LyT2/bTSeeqMkpQ95v9TKxyXKc6LF4vmGJb9xAfB8dKF5eJ2CeuMO7FIDqan3yo2NKaSVHwLU+iwdIslnsl/c/Y+OlldOOq9uovRiffJxJuhU5EUecAqBMgQyZ+jIEq/x+cHVupA3ns/4cP2fdJskC5NMj6vOFwaj4sHAlfH/N2v//1/8+gw4edY/AB/aSdYxptZPKTxe3AF25P2sQCL/1g4AF9j9j7BowoeqlTAncGDlBl9V3i8urg4e7kfhNSdGVMlhJBqhPBPDSG1blJrNCTZHTfKO0dIGGOBiHvpTm4ePwxk8XpAJVOGZo9TS9Sd91Syn9O1jxEDTwZTA40gWFY5x3OmpvQRYWHvx1AfDRjsk3nUSi8wU6UX7OPXC70dTH+MUGBPUGjgKVhWwdTq8auF3kpLHiMUnkykJt5CHlMqaAVKPgF3obfysMcChpU8wBMYHtILHLOLa1xtHr9e6K3C8zFC4clEagIFrR55FGnfNdqPEQpPJtJT2u23lnZLutOfLxejYBolpFPORi6L6sVHUfl43OVk5E5vC/y8914ZzrmzCD346DgI0x6kAVa2j0pd2E6LYPwDPyHR8VSs544f/wd2QrC/Wjy/YAawv/9XLKz1wgVm8B23dHD7BP6eO0lnLIRIUXrUiIwVvt4OHO7oxveiku02UMTi9WDiYSNIL+oz9vPad6LScl5upLfaxI2VmrhV9WyTaz3bWLEFX0YaHhIO/dsYlIN+en+t9wAmWc86s9azTkQF/nGB5jfzvMVg+tqfgvDHrGQ3ee15OMKlrNvvQloi2/u3786/jXKl8dGVC2z/Ni8c1HkNm5uca/znaMQBFosOknMt6cfTg4Hpp5H4tHSrSHz6Wkr4fHTjjZcIZmwLEB0lDT6Ly7TjW9XTy5/jOyQKXfOz7uCl5sVJq9Ri88ZeHgsyKToOjqvtF46EF6ppXsaN+YqyCrThD97i/t9CH1Xv/S8OQpbmsuo86qKIDYBhKQEPoBVnaRP+kRuGUesHR9iKjl4rHbdAmDBLeNqGY+hceMsse4p16EuQdShaQOf6IDFBis0zYQVS8NL1f4o0bdI4APbn+49xJ6gP51jrEt8SUsNoab+JUl3J2E/V5uDLyF6Zwfq+9KYurhbXQ2wtMQUReTOJkKEISTpY/Je0SwUe0IQ5+DN/dp29iMnTW1Sdy9DLnrPWxJBzImz+YzIRdTZf+FMQJokEirvKT92f8GBaIqSQ5YNULGNpUdIvE+2QifshZ/oIMzPvykcVeuFO7v8ORhuub9Ia5N1/cCgelCSfT+//gRIEFnsZdSfARClBDZDWKkVLD+ZTbL4BT4QeWlmwAuQLh6lf//q3RHd5Ef1j2DNsIJIYYCewvz/EptT9/8yNvKHzFhcqulPBS9ssOtzg2KhqRsFlGOsj2BRgT5BfC/zCFzhreLSHo3kObEkQ11iBPEduSRs2DiOzNeOJMvASnlipn9nIFIIOuSoyBatiClPBFHjoL2eK5DlrTMGYLDKFVvVcgWHKiCsEz7ki7ZF8Df+/xNYvziU8OtiKL1glX2jakC8M8gW12Kmcd8QXgvbEF6k0TTgia3q9mRf4sMQK3Mg1VsDTluusUJIP8WPWOIGyknjQegMn8IQT8Fb1PjiBD2Fq65zQUELAGiAncOAErrviBNEhJ3wfm6Nv8ZXRYoO18qREfqNKBPyE0L/GZcza3Mz965k3vsjsV3TKXTB28k2+jfnpItra+OqRxLR8WWYZMKOQH16lfjt2rBmkfvyLNd99GnXIfO9PvYk/8zYZPYvYdX6k7R3TRpWpoV7TUH3u/XkZO2yalIR65Vp02i00pzANq1Rfs5CTqOzDJB6wrWWTJS/Pxzw8n+56qjZab1WiTzdY7y47tTYiUZZIVA+T2Fn/14YEihKBsgGB+f1pZC8U8hKFogGFeAHifmhjJdp4k+19lN1km0iL8lqwBmsRtewA6azjveIbpcXOe0VL9NGH6YuaQwF5ai/CjJTIa6Dfis7sKQZfa6hkHS6iLRIpbTslnIXw+1zHkpkgW+gszfahEEoqVbZTWZzuQ6aVlKpUBxVpfXaabiDSykshWyjvVKSxXkVaybiQopXuTtld9EphybqQvKHuZmwfkqJkV8g2+oo20Ve7kldSp7KFuqL7UAQlZSq31lb9irKSShV2L6LsIN3n62RZVHhf5T+LFopR6d72qkhfSTOKdpqRmiYCY2cSS/pAtHHmlO3NxC0SWFIIop0zZ0STGAndlcSSRhCH9+aKtJU0guDNNYJOtlf2u3YllSDYIU2zXm+laCLOymvRXD3W2z2sy60q6UfRXj+KOoHWKcOXFCS3TaiMO27BOup9SLSSv8nbeHOkyTbvSl5Jp/J2Oovxfci0klbl28Qf+2XBkkrl8pAmWq831jQQaeWlaOfNqf5iVAUKS+YFb+rNadubu1SgrWRX8BbeXD2fdynISqYFb66uuOjNFS5QV1KmvLW22o91VqSRtdJVaeSR96oMSsqUNdBVHd9i1UDElEnUhzQg+70Zq3YtTI1DzFS77CHtLb5XJLGkvVmbAGTqEfeBSVPjEbN2OsvIOqdpd0vc1PjErLHS4ntZv5LWYi20liW9nWgo0ldSW4xueaJhH1fSNcN8eT6keVBV9OdOmBqnljbQce+8edzVH4/Fn+bdqvC0E1Y6jZNSK5TeXzj77pTUdFfK0zYHjdMe11rotqaYVr2ldYpUlowxqtoYY6nk2iz2d5ZcJVOHykcvucrzaaBpC3e49Wqhm+pgDeWtDCrD+/NzTHW8hrI20RC7jxUs2XuUtjOndG/nFwoUlgw+2kCBvlmOg6UTZOU/p87Dt/t9kZTpzqKTuff/9pM/DeYr5WwNMFOitYEyfYO6JCp5yio605rj+jh4X5028aRzNHPXCVMlHxdEh15aEr3NOpiGBjDV/YVFTHVESbc3f2mvzF4+G9nYWExlRb9LVz6+0NpOoPuQFuUkTRsroc/os6mOKfGWOrVZaG5XEsshmwYIufGuQTScOpvuvsVSiagYtqrNgltopdBMwJRtEyyyiQsXLgrn9bEYxB3dvPPcUVLmTItCEm9sXvh3MDYYTMIJkjrlqJwUi9pXOz9E3R1AsYBsXE4W7jj4Iqr48FZvZLz/JWr6kEjSrDxk6JSvI3fmyzmWYKDEX7hOfIO456gThcs2iutX8lDblTsrTORsWm5AgZt+58eVtvOo68DYC8MAy13HpbJ53IZFEI5Q02Dt7ewGxl0CQxWL9Uur88VqJXj0eOSwz1f5y0HfMLJp06LwwLF0OMjrtV+780Xjgm3vFrc2vUj9TTCObw/IruA5HZz/8Y9n71ZuVU9fzb74AmYGjLry3Z8HMw/LtMnQWC2FIlJRy7jCazmiWiQyFIIwQrlgzFCj8U6LOF6aV3ejzwuPizeFDCmxlgtilBBSxzHQuBDq/H16hfZoEsy9t2Fw6V76cSkW3kehiZFaWKsol1Z+XJlQgVTKmFCaW04k/OiMVKC7HakaPmwMY5wpDkTntL58dfH2m/dnNaRKwqiEKWrCjDCcf8xWua5BfM1OJzcbrlRVp1fDYqUbbHdhh8E6u/InXol3Cp9Oaude5688VDgnaaGyzZZKLcG4Wq+io02q6NYeulZSp6SwTGqpObAd/K++pA7r9qKSOqzqyXYnLqKL/L0iKNeq6mSDqjoK27lDVV1UeCnkr3/9W3zU6NhKs1EpZF0fvj7/p5SV5t7EGy288Ys1Plrt09iKd938dtkGvFv4dFYonr2ymXdVdIFWgV1NBbuKKnblJXaNn7POoSCEGGM0kkWUbuLQtOhTky041DTiUFPFobwhh4qIQ7HuU3dW96m65NCiaVUU+Y1YqPyFhIvOb9G0wlffvnuQk8yQltsN2ApOslWcpEqcFD9njZOEAW2qDWHSgFrUVtazEk+FnbRt64dNo2YDtoqPVEM+sshHHCWdfNySLr+98PtMjOGbpbf+P1KGR5D8aQEA','base64')).toString());
const oldBytes=JSON.stringify(done06),continuedUI=fixture(done06);
assert.ok(continuedUI.root.innerHTML.includes('Continuar até os 25 anos'));
assert.equal(continuedUI.writes.length,0);assert.equal(continuedUI.map.get(key),oldBytes);
const resumeHandler=continuedUI.nodes.get('#proto-extend').handlers.click;resumeHandler();
const resumed=JSON.parse(continuedUI.map.get(key));assert.ok(engine.validGame(resumed));
assert.equal(resumed.careerEndAge,25);assert.equal(resumed.season,21);assert.notEqual(resumed.phase,'DONE');
for(const field of ['playedMatches','yearStats','progression','choicesLog','resolved'])assert.deepEqual(resumed[field],done06[field]);
assert.equal(JSON.stringify(done06),oldBytes);assert.equal(continuedUI.writes.length,1);
resumeHandler();assert.equal(continuedUI.writes.length,1);
const resumedReload=fixture(resumed);assert.equal(resumedReload.writes.length,0);assert.ok(resumedReload.root.innerHTML.includes('Ano 4 de 7'));
assert.ok(!resumedReload.root.innerHTML.includes('Continuar até os 25 anos'));checks++;
const resumeQuota=fixture(done06,{denyWrite:true});resumeQuota.nodes.get('#proto-extend').handlers.click();
assert.equal(resumeQuota.map.get(key),oldBytes);assert.equal(resumeQuota.writes.length,0);
assert.ok(resumeQuota.root.innerHTML.includes('O navegador não permitiu salvar'));checks++;


// A public natural career finds an A investment offer without modifying skills or DNA.
const promise=engine.createGame('Promessa UI pública','ST',1),bare=c=>c.id.split('@')[0];
for(let guard=0;guard<180&&!(promise.event.kind==='OFFER'&&promise.offer.profile?.recruitment==='PROSPECT');guard++){
 const kind=promise.event.kind;
 assert.notEqual(kind,'DONE','public young-promise route disappeared');
 const action=kind==='FORMATION'?'formation:technique':kind==='ENTRY'?null:kind==='RIVALRY'?'rival:challenge':kind==='ROUTINE'?'routine:REST':kind==='PLAN'?'intent:ATTACK':kind==='RECOVERY'?'recovery:READ':kind==='DECISIVE'?'decisive:safe':kind==='INTEREST'?'market:stay':null;
 const c=kind==='ENTRY'?promise.event.choices.find(c=>c.profile.division==='D'):kind==='INTEREST'?promise.event.choices.find(c=>c.profile?.recruitment==='PROSPECT')??promise.event.choices.find(c=>bare(c)==='market:stay'):promise.event.choices.find(c=>bare(c)===action)??promise.event.choices[0];
 assert.ok(engine.choose(promise,c.id));
}
assert.equal(promise.event.kind,'OFFER');assert.equal(promise.offer.profile.recruitment,'PROSPECT');
const promiseRaw=JSON.stringify(promise),promiseUI=fixture(promise);
for(const copy of ['Aposta no seu desenvolvimento','banco e entradas curtas','média inclui banco','chance inicial de titularidade'])assert.ok(promiseUI.root.innerHTML.includes(copy));
assert.equal(JSON.stringify(promise),promiseRaw);assert.equal(promiseUI.writes.length,0);checks++;
promiseUI.buttons[0].handlers.click();const signedPromise=JSON.parse(promiseUI.map.get(key));
assert.ok(engine.validGame(signedPromise));assert.equal(signedPromise.clubProject.recruitment,'PROSPECT');
assert.ok(promiseUI.root.innerHTML.includes('Contratado como promessa'));assert.ok(promiseUI.root.innerHTML.includes('Previsão atual'));
const live=engine.projectProfile(signedPromise,signedPromise.clubId);
assert.ok(promiseUI.root.innerHTML.includes(Math.round(live.starterChance*100)+'% de titularidade'));
const reloadPromise=fixture(signedPromise);assert.equal(reloadPromise.writes.length,0);
assert.ok(reloadPromise.root.innerHTML.includes('Contratado como promessa'));reloadPromise.history();
assert.ok(reloadPromise.root.innerHTML.includes('Observação como promessa'));checks++;

// Header evidence, footer binding and yearly evolution must refer to actual records.
const board=fixture(game),boardRaw=JSON.stringify(game),html=board.root.innerHTML;
const header=html.match(/<header class="game-header">([\s\S]*?)<\/header>/)[1];
assert.ok(header.includes('gols')&&header.includes('assistências'));
assert.ok(header.includes('Treino '+Math.round(game.clubProject.trainingQuality)+'/100'));
assert.equal((header.match(/class="skill /g)??[]).length,6);
assert.ok(header.includes('Felicidade')&&header.includes('Descanso físico')&&header.includes('Stress mental'));
assert.ok(html.includes('class="game-body"')&&html.includes('class="game-footer"'));
assert.equal(board.buttons.length,0);assert.equal(board.writes.length,0);checks++;
const decisions=fixture(signedPromise),decisionHTML=decisions.root.innerHTML;
assert.equal(decisions.buttons.length,signedPromise.event.choices.length);
assert.equal((decisionHTML.match(/class="choice choice-info"/g)??[]).length,signedPromise.event.choices.length);
assert.ok(decisionHTML.indexOf('class="turn-result"')<decisionHTML.indexOf('class="decision"'));
assert.ok(decisionHTML.includes('Efeito da última decisão'));checks++;
board.history();const history=board.root.innerHTML;
assert.ok(history.includes('class="evolution-chart"')&&history.includes('<table>'));
const table=history.match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
assert.equal((table.match(/<tr>/g)??[]).length,7);
const annualRows=[...table.matchAll(/<tr>[\s\S]*?<\/tr>/g)].map(m=>m[0]);
for(const y of game.yearStats){const row=annualRows.find(r=>r.startsWith('<tr><th scope="row">'+y.age+' anos'));assert.ok(row);assert.ok(row.includes('<td>'+y.goals+'</td>'));assert.ok(row.includes('<td>'+y.assists+'</td>'));const p=game.progression.filter(p=>p.season===y.season&&p.period>0).at(-1);assert.ok(p&&row.includes(String(Math.round(p.afterOverall))));}
assert.equal(board.map.get(key),boardRaw);assert.equal(board.writes.length,0);checks++;
const partialGame=structuredClone(signedPromise);
while(!partialGame.seasonStats.apps&&partialGame.phase==='PRO'){assert.ok(engine.choose(partialGame,partialGame.event.choices[0].id));}
assert.ok(partialGame.seasonStats.apps);const partial=fixture(partialGame),partialRaw=JSON.stringify(partialGame);partial.history();
assert.ok(partial.root.innerHTML.includes('parcial'));
assert.equal(partial.map.get(key),partialRaw);assert.equal(partial.writes.length,0);checks++;

console.log(JSON.stringify({checks,phases:[...seen],result:'PASS',originalStorageTouched:false}));
