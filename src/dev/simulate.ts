declare const process: { argv: string[] };
import { createCareerWithSeed, advanceCareer, resolveChoice } from '../core/engine.js';
import { overall } from '../core/dna.js';
import { RNG, hashSeed } from '../core/random.js';
import type { SaveGame } from '../core/types.js';

type AgeSnapshot = { age:number; ovr:number; marketValue:number; heightCm:number; morale:number; confidence:number };
type CareerResult = {
  seed:number;
  position:string;
  adultHeight:number;
  dominantFoot:string;
  snapshots:AgeSnapshot[];
  appearances:number;
  goals:number;
  assists:number;
  motm:number;
  yellows:number;
  reds:number;
  peakMarket:number;
  transfers:number;
  titles:number;
  turns:number;
};

const TARGET_AGES = new Set([12,15,18,21,24,27,30,33,36,38]);

function pct(values:number[], p:number):number {
  if (!values.length) return 0;
  const a=[...values].sort((x,y)=>x-y);
  const idx=(a.length-1)*p;
  const lo=Math.floor(idx), hi=Math.ceil(idx);
  if (lo===hi) return a[lo]!;
  return a[lo]!+(a[hi]!-a[lo]!)*(idx-lo);
}
function mean(values:number[]):number { return values.length ? values.reduce((a,b)=>a+b,0)/values.length : 0; }
function round(n:number,d=2):number { const p=10**d; return Math.round(n*p)/p; }

function autoResolve(save:SaveGame, policy:RNG):void {
  const ev=save.pendingEvent;
  if (!ev) return;
  if (ev.choices?.length) {
    // Neutral human-like policy: explores early, then tends to preserve the current position;
    // never reads hidden compatibility. Market decisions remain stochastic.
    let choice=policy.pick(ev.choices);
    if (ev.id.startsWith('position-')) {
      const p=save.player;
      const current=p.position==='IND'?null:`position:${p.position}`;
      if (p.age>=14 && current && policy.chance(.72)) choice=ev.choices.find(c=>c.id===current)??choice;
    }
    if(ev.id.startsWith('retirement-'))choice=ev.choices.find(c=>c.id===(save.player.age>=38?'retirement:stop':'retirement:continue'))??choice;
    if(ev.id.startsWith('transition-'))choice=ev.choices.find(c=>c.id==='transition:PROTECTED')??choice;
    if(ev.id.startsWith('comeback-'))choice=ev.choices.find(c=>c.id==='comeback:GRADUAL')??choice;
    if(ev.id.startsWith('role-')&&policy.chance(.8))choice=ev.choices.find(c=>c.id==='role:stay')??choice;
    if (ev.kind==='SEASON_END' && policy.chance(.62)) choice=ev.choices.find(c=>c.id==='market:stay')??choice;
    resolveChoice(save,choice.id);
  } else {
    save.pendingEvent=null;
  }
}

function simulateOne(index:number):CareerResult {
  const seed=hashSeed(`1903-mass-${index}`);
  const policy=new RNG(hashSeed(`1903-policy-${index}`));
  const save=createCareerWithSeed(`Jogador ${index}`,seed,'gremio','Caxias do Sul');
  const snaps:AgeSnapshot[]=[];
  const seen=new Set<number>();
  let guard=0;
  while (save.player.phase!=='APOSENTADO' && guard<6000) {
    autoResolve(save,policy);
    if (!save.pendingEvent) advanceCareer(save);
    const p=save.player;
    if (TARGET_AGES.has(p.age) && !seen.has(p.age)) {
      seen.add(p.age);
      snaps.push({age:p.age,ovr:overall(p),marketValue:p.marketValue,heightCm:p.heightCm,morale:p.morale,confidence:p.confidence});
    }
    guard++;
  }
  const p=save.player;
  if(p.phase!=='APOSENTADO')throw new Error(`Career ${index} did not retire within ${guard} transitions`);
  return {
    seed,
    position:p.position,
    adultHeight:p.heightCm,
    dominantFoot:p.dna.dominantFoot,
    snapshots:snaps,
    appearances:p.careerStats.appearances,
    goals:p.careerStats.goals,
    assists:p.careerStats.assists,
    motm:p.careerStats.motm,
    yellows:p.careerStats.yellows,
    reds:p.careerStats.reds,
    peakMarket:Math.max(p.marketValue,...p.seasonHistory.map(s=>s.marketValueEnd)),
    transfers:p.transferHistory.length,
    titles:p.careerStats.titles.length,
    turns:p.careerTurn
  };
}

function summary(results:CareerResult[]) {
  const byAge:Record<string,unknown>={};
  for (const age of [...TARGET_AGES]) {
    const ovrs=results.flatMap(r=>r.snapshots.filter(s=>s.age===age).map(s=>s.ovr));
    if (!ovrs.length) continue;
    byAge[String(age)]={mean:round(mean(ovrs),1),p10:round(pct(ovrs,.1),1),p50:round(pct(ovrs,.5),1),p90:round(pct(ovrs,.9),1),max:round(Math.max(...ovrs),1)};
  }
  const positions:Record<string,number>={};
  for (const r of results) positions[r.position]=(positions[r.position]??0)+1;
  for (const k of Object.keys(positions)) positions[k]=round((positions[k]!/results.length)*100,1);

  const apps=results.map(r=>r.appearances), goals=results.map(r=>r.goals), assists=results.map(r=>r.assists), motm=results.map(r=>r.motm), reds=results.map(r=>r.reds), yellows=results.map(r=>r.yellows), heights=results.map(r=>r.adultHeight), peaks=results.map(r=>r.peakMarket), transfers=results.map(r=>r.transfers), titles=results.map(r=>r.titles), turns=results.map(r=>r.turns);
  const ga90=results.map(r=>r.appearances ? (r.goals+r.assists)/(r.appearances*80/90) : 0);
  return {
    careers:results.length,
    ovrByAge:byAge,
    career:{
      appearances:{mean:round(mean(apps),1),p10:round(pct(apps,.1),1),p50:round(pct(apps,.5),1),p90:round(pct(apps,.9),1)},
      goals:{mean:round(mean(goals),1),p10:round(pct(goals,.1),1),p50:round(pct(goals,.5),1),p90:round(pct(goals,.9),1),max:Math.max(...goals)},
      assists:{mean:round(mean(assists),1),p10:round(pct(assists,.1),1),p50:round(pct(assists,.5),1),p90:round(pct(assists,.9),1),max:Math.max(...assists)},
      motm:{mean:round(mean(motm),1),p90:round(pct(motm,.9),1)},
      yellows:{mean:round(mean(yellows),1),p90:round(pct(yellows,.9),1)},
      reds:{mean:round(mean(reds),2),p90:round(pct(reds,.9),1),max:Math.max(...reds)},
      gaPer90Approx:{mean:round(mean(ga90),2),p10:round(pct(ga90,.1),2),p50:round(pct(ga90,.5),2),p90:round(pct(ga90,.9),2)},
      peakMarketBRL:{mean:Math.round(mean(peaks)),p50:Math.round(pct(peaks,.5)),p90:Math.round(pct(peaks,.9)),max:Math.max(...peaks)},
      transfers:{mean:round(mean(transfers),1),p50:round(pct(transfers,.5),1),p90:round(pct(transfers,.9),1),max:Math.max(...transfers)},
      titles:{mean:round(mean(titles),1),p50:round(pct(titles,.5),1),p90:round(pct(titles,.9),1),max:Math.max(...titles)},
      turns:{mean:round(mean(turns),1),min:Math.min(...turns),max:Math.max(...turns)}
    },
    body:{adultHeightCm:{mean:round(mean(heights),1),p10:round(pct(heights,.1),1),p50:round(pct(heights,.5),1),p90:round(pct(heights,.9),1)},leftFootPct:round(results.filter(r=>r.dominantFoot==='E').length/results.length*100,1)},
    positions
  };
}

const count=Math.max(1,Number(process.argv[2]??10000));
const results:CareerResult[]=[];
for (let i=0;i<count;i++) results.push(simulateOne(i));
const out=summary(results);
console.log(JSON.stringify(out,null,2));
