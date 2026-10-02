declare const process:{argv:string[]};
import { advanceCareer, createCareerWithSeed, resolveChoice } from '../core/engine.js';
import { effectivePositionRating, rankedNaturalPositions } from '../core/positions.js';
import { RNG, hashSeed } from '../core/random.js';
import type { PlayablePosition, SaveGame } from '../core/types.js';

type Policy='BEST'|'WORST'|'LATE_CORRECTION'|'SWITCHER'|'RANDOM';
type Result={policy:Policy;seed:number;natural:PlayablePosition;selected18:PlayablePosition;rating12:number;rating14:number;rating16:number;rating18:number;effective18:number;proficiency18:number;debt18:number;changes:number;compat18:number};
const POLICIES:Policy[]=['BEST','WORST','LATE_CORRECTION','SWITCHER','RANDOM'];

function chooseForPolicy(save:SaveGame,policy:Policy,policyRng:RNG):PlayablePosition{
  const p=save.player;
  const ranked=rankedNaturalPositions(p);
  if(policy==='BEST')return ranked[0]!.position;
  if(policy==='WORST')return ranked[ranked.length-1]!.position;
  if(policy==='LATE_CORRECTION')return p.age<=15?ranked[ranked.length-1]!.position:ranked[0]!.position;
  if(policy==='SWITCHER'){
    const available=ranked.map(x=>x.position).filter(x=>x!==p.position);
    return policyRng.pick(available);
  }
  return policyRng.pick(ranked.map(x=>x.position));
}

function ratingAt(save:SaveGame,age:number):number{
  return save.player.seasonHistory.find(s=>s.age===age)?.avgRating??0;
}

function run(seed:number,policy:Policy):Result{
  const save=createCareerWithSeed('Teste',seed,'gremio','Caxias do Sul');
  const prng=new RNG(hashSeed(`${seed}|${policy}|choices`));
  let guard=0;
  while(save.player.age<19&&guard<1000){
    const ev=save.pendingEvent;
    if(ev){
      if(ev.choices?.length){
        if(ev.id.startsWith('position-')){
          const pos=chooseForPolicy(save,policy,prng);
          resolveChoice(save,`position:${pos}`);
        }else if(ev.id.startsWith('trial-')){
          resolveChoice(save,ev.choices[0]!.id);
        }else{
          // Keep training policy constant across strategies: always first role-relevant focus.
          resolveChoice(save,ev.choices[0]!.id);
        }
      }else save.pendingEvent=null;
    }else advanceCareer(save);
    guard++;
  }
  const p=save.player;
  const natural=rankedNaturalPositions(p)[0]!.position;
  const selected=p.position==='IND'?'CM':p.position;
  return {policy,seed,natural,selected18:selected,rating12:ratingAt(save,12),rating14:ratingAt(save,14),rating16:ratingAt(save,16),rating18:ratingAt(save,18),effective18:effectivePositionRating(p,selected),proficiency18:p.positionProficiency[selected],debt18:p.adaptationDebt,changes:p.positionChanges,compat18:rankedNaturalPositions(p).find(x=>x.position===selected)!.compatibility};
}

function mean(xs:number[]):number{return xs.reduce((a,b)=>a+b,0)/(xs.length||1)}
function pct(xs:number[],p:number):number{const a=[...xs].sort((x,y)=>x-y);if(!a.length)return 0;return a[Math.round((a.length-1)*p)]!}
function round(v:number,d=2){const f=10**d;return Math.round(v*f)/f}

const count=Math.max(100,Number(process.argv[2]??5000));
const all:Result[]=[];
const naturalDistribution:Record<string,number>={};
for(let i=0;i<count;i++){
  const seed=hashSeed(`1903-position-${i}`);
  for(const policy of POLICIES)all.push(run(seed,policy));
  const natural=all[all.length-POLICIES.length]!.natural;
  naturalDistribution[natural]=(naturalDistribution[natural]??0)+1;
}

const summary:Record<string,unknown>={};
for(const policy of POLICIES){
  const r=all.filter(x=>x.policy===policy);
  summary[policy]={
    avgRating:{age12:round(mean(r.map(x=>x.rating12))),age14:round(mean(r.map(x=>x.rating14))),age16:round(mean(r.map(x=>x.rating16))),age18:round(mean(r.map(x=>x.rating18)))},
    effective18:{mean:round(mean(r.map(x=>x.effective18))),p10:round(pct(r.map(x=>x.effective18),.1)),p50:round(pct(r.map(x=>x.effective18),.5)),p90:round(pct(r.map(x=>x.effective18),.9))},
    proficiency18:round(mean(r.map(x=>x.proficiency18)),1),adaptationDebt18:round(mean(r.map(x=>x.debt18)),1),changes:round(mean(r.map(x=>x.changes)),1),compatibility18:round(mean(r.map(x=>x.compat18)),1)
  };
}
for(const k of Object.keys(naturalDistribution))naturalDistribution[k]=round(naturalDistribution[k]!/count*100,1);
const best=all.filter(x=>x.policy==='BEST'), worst=all.filter(x=>x.policy==='WORST'), late=all.filter(x=>x.policy==='LATE_CORRECTION');
const paired={
  ratingGapBestVsWorst:{age12:round(mean(best.map((x,i)=>x.rating12-worst[i]!.rating12))),age14:round(mean(best.map((x,i)=>x.rating14-worst[i]!.rating14))),age16:round(mean(best.map((x,i)=>x.rating16-worst[i]!.rating16))),age18:round(mean(best.map((x,i)=>x.rating18-worst[i]!.rating18)))},
  lateRecoveryVsWorstAt18:round(mean(late.map((x,i)=>x.rating18-worst[i]!.rating18))),
  latePenaltyVsBestAt18:round(mean(best.map((x,i)=>x.rating18-late[i]!.rating18)))
};
console.log(JSON.stringify({players:count,naturalDistribution,summary,paired},null,2));
