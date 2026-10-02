declare const process:{argv:string[]};
import { createCareerWithSeed, advanceCareer, resolveChoice } from '../core/engine.js';
import { hashSeed, RNG } from '../core/random.js';
import { overall } from '../core/dna.js';
import { rankedNaturalPositions } from '../core/positions.js';
import type { PlayablePosition, SaveGame } from '../core/types.js';

type Policy='natural'|'explore'|'wrong'|'late-switch';
type Result={policy:Policy;ovr18:number;ovr24:number;ovr30:number;apps:number;goals:number;assists:number;position:PlayablePosition|string;compat:number;changes:number;rating:number;market:number};
const mean=(a:number[])=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);const round=(n:number,d=2)=>Math.round(n*10**d)/10**d;
function choosePosition(save:SaveGame,policy:Policy,rng:RNG):PlayablePosition{
 const p=save.player,ranked=rankedNaturalPositions(p);
 if(policy==='natural')return ranked[0]!.position;
 if(policy==='wrong')return ranked[ranked.length-1]!.position;
 if(policy==='late-switch')return p.age<18?ranked[0]!.position:ranked[ranked.length-1]!.position;
 if(p.age<=13)return rng.pick(ranked.map(x=>x.position));
 if(p.age===14)return rng.pick(ranked.slice(0,4).map(x=>x.position));
 if(p.position!=='IND'&&ranked.findIndex(x=>x.position===p.position)<=2)return p.position;
 return rng.pick(ranked.slice(0,2).map(x=>x.position));
}
function run(i:number,policy:Policy):Result{
 const save=createCareerWithSeed(`P${i}`,hashSeed(`paired-${i}`),'gremio','Caxias do Sul');const rng=new RNG(hashSeed(`policy-${i}`));let o18=0,o24=0,o30=0,guard=0;
 while(save.player.phase!=='APOSENTADO'&&guard++<6000){
   const e=save.pendingEvent;
   if(e?.choices?.length){
     let id=e.choices[0]!.id;
     if(e.id.startsWith('retirement-'))id=save.player.age>=38?'retirement:stop':'retirement:continue';
     else if(e.id.startsWith('position-'))id=`position:${choosePosition(save,policy,rng)}`;
     else if(e.id.startsWith('transition-'))id='transition:PROTECTED';
     else if(e.id.startsWith('comeback-'))id='comeback:GRADUAL';
     else if(e.id.startsWith('education-'))id='education:BALANCED';
     else if(e.id.startsWith('role-'))id='role:stay';
     else if(e.id.startsWith('trial-')) id=e.choices.find(x=>x.id==='join:gremio')?.id??e.choices[0]!.id;
     else if(e.kind==='SEASON_END'&&e.choices.some(c=>c.id==='market:stay')) id='market:stay';
     resolveChoice(save,id);
   }else if(e){save.pendingEvent=null;}
   else advanceCareer(save);
   if(save.player.age===18&&!o18)o18=overall(save.player);if(save.player.age===24&&!o24)o24=overall(save.player);if(save.player.age===30&&!o30)o30=overall(save.player);
 }
 const p=save.player;if(p.phase!=='APOSENTADO')throw new Error(`Position audit ${policy}/${i} did not retire within ${guard} transitions`);const pos=p.position==='IND'?'CM':p.position;const fit=rankedNaturalPositions(p).find(x=>x.position===pos)?.compatibility??0;const profSeasons=p.seasonHistory.filter(x=>x.age>=16);const rating=mean(profSeasons.filter(x=>x.avgRating>0).map(x=>x.avgRating));
 return {policy,ovr18:o18,ovr24:o24,ovr30:o30,apps:p.careerStats.appearances,goals:p.careerStats.goals,assists:p.careerStats.assists,position:pos,compat:fit,changes:p.positionChanges,rating,market:Math.max(p.marketValue,...p.seasonHistory.map(x=>x.marketValueEnd))};
}
const n=Math.max(100,Number(process.argv[2]??2000));const policies:Policy[]=['natural','explore','wrong','late-switch'];const out:any={perPolicy:n};
for(const policy of policies){const rs:Result[]=[];for(let i=0;i<n;i++)rs.push(run(i,policy));out[policy]={ovr18:round(mean(rs.map(x=>x.ovr18)),1),ovr24:round(mean(rs.map(x=>x.ovr24)),1),ovr30:round(mean(rs.map(x=>x.ovr30)),1),careerApps:round(mean(rs.map(x=>x.apps)),0),goals:round(mean(rs.map(x=>x.goals)),1),assists:round(mean(rs.map(x=>x.assists)),1),avgRating:round(mean(rs.map(x=>x.rating)),2),compatibility:round(mean(rs.map(x=>x.compat)),1),positionChanges:round(mean(rs.map(x=>x.changes)),1),peakMarket:Math.round(mean(rs.map(x=>x.market)))};if(policy==='natural'){const by:any={};for(const pos of ['GK','CB','FB','DM','CM','AM','WG','ST']){const x=rs.filter(r=>r.position===pos);by[pos]={n:x.length,pct:round(x.length/n*100,1),goals:round(mean(x.map(r=>r.goals)),1),assists:round(mean(x.map(r=>r.assists)),1),ovr30:round(mean(x.map(r=>r.ovr30)),1),rating:round(mean(x.map(r=>r.rating)),2)};}out.naturalByPosition=by;}}
console.log(JSON.stringify(out,null,2));
