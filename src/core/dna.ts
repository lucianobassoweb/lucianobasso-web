import { formationOffset } from './attribute-scale.js';
import { calendarScale } from './calendar.js';
import { coachProfile } from './coaches.js';
import { footballTime } from './pathways.js';
import { RNG, clamp } from './random.js';
import { POSITIONS, developmentEfficiency, effectivePositionRating, positionTrainingMultiplier, roleRating } from './positions.js';
import type { HiddenDNA, PlayerState, PlayablePosition, VisibleAttributes } from './types.js';

const stat=(rng:RNG,mean:number,sd:number,min=25,max=95)=>Math.round(clamp(rng.normal(mean,sd),min,max));

function weightedArchetype(rng:RNG):PlayablePosition{
  const bag:{p:PlayablePosition;w:number}[]=[{p:'GK',w:10},{p:'CB',w:14},{p:'FB',w:14},{p:'DM',w:11},{p:'CM',w:14},{p:'AM',w:11},{p:'WG',w:13},{p:'ST',w:13}];
  let x=rng.float(0,bag.reduce((a,b)=>a+b.w,0));
  for(const b of bag){x-=b.w;if(x<=0)return b.p;}return 'CM';
}
const bump=(v:number,n:number)=>Math.round(clamp(v+n,25,98));

export function generateDNA(rng:RNG):HiddenDNA{
  const lateBloomer=stat(rng,50,22,5,95), archetype=weightedArchetype(rng);
  const heightTarget:Record<PlayablePosition,number>={GK:188,CB:185,FB:175,DM:180,CM:177,AM:176,WG:174,ST:182};
  const d:HiddenDNA={
    adultHeightCm:Math.round(clamp(rng.normal(heightTarget[archetype],8.2),160,202)),dominantFoot:rng.chance(.77)?'D':'E',weakFootPlasticity:stat(rng,58,18),
    technicalAptitude:stat(rng,60,15),gameIntelligence:stat(rng,60,15),accelerationAptitude:stat(rng,59,16),staminaAptitude:stat(rng,60,15),coordination:stat(rng,62,14),
    defensiveAptitude:stat(rng,56,18),finishingAptitude:stat(rng,56,18),aerialAptitude:stat(rng,57,17),reflexAptitude:stat(rng,54,19),
    physicalMaturationAge:16,learningPlasticity:stat(rng,69,13,38,98),pressureResponse:stat(rng,58,18),consistency:stat(rng,57,18),injuryResistance:stat(rng,68,17),
    ambition:stat(rng,65,18),adaptability:stat(rng,62,18),leadership:stat(rng,50,21),lateBloomer
  };
  const big=rng.int(14,22),med=rng.int(8,14),small=rng.int(4,9);
  if(archetype==='GK'){d.reflexAptitude=bump(d.reflexAptitude,big);d.aerialAptitude=bump(d.aerialAptitude,med);d.coordination=bump(d.coordination,small);d.pressureResponse=bump(d.pressureResponse,small);}
  if(archetype==='CB'){d.defensiveAptitude=bump(d.defensiveAptitude,big);d.aerialAptitude=bump(d.aerialAptitude,med);d.gameIntelligence=bump(d.gameIntelligence,small);}
  if(archetype==='FB'){d.accelerationAptitude=bump(d.accelerationAptitude,big);d.staminaAptitude=bump(d.staminaAptitude,med);d.coordination=bump(d.coordination,med);d.defensiveAptitude=bump(d.defensiveAptitude,small);}
  if(archetype==='DM'){d.defensiveAptitude=bump(d.defensiveAptitude,med);d.gameIntelligence=bump(d.gameIntelligence,big);d.staminaAptitude=bump(d.staminaAptitude,med);d.technicalAptitude=bump(d.technicalAptitude,small);}
  if(archetype==='CM'){d.gameIntelligence=bump(d.gameIntelligence,big);d.technicalAptitude=bump(d.technicalAptitude,med);d.coordination=bump(d.coordination,med);d.staminaAptitude=bump(d.staminaAptitude,small);}
  if(archetype==='AM'){d.technicalAptitude=bump(d.technicalAptitude,big);d.gameIntelligence=bump(d.gameIntelligence,big);d.coordination=bump(d.coordination,med);}
  if(archetype==='WG'){d.accelerationAptitude=bump(d.accelerationAptitude,big);d.coordination=bump(d.coordination,med);d.technicalAptitude=bump(d.technicalAptitude,med);d.weakFootPlasticity=bump(d.weakFootPlasticity,small);}
  if(archetype==='ST'){d.finishingAptitude=bump(d.finishingAptitude,big);d.accelerationAptitude=bump(d.accelerationAptitude,med);d.aerialAptitude=bump(d.aerialAptitude,small);d.technicalAptitude=bump(d.technicalAptitude,small);}
  d.physicalMaturationAge=Math.round(clamp(rng.normal(16.2+(lateBloomer-50)/40,1.15),13,20));
  return d;
}

export function initialAttributes(rng:RNG,dna:HiddenDNA):VisibleAttributes{
  const base=(apt:number,spread=4)=>Number((Math.round(clamp(29+apt*.22+rng.normal(0,spread),28,54))-formationOffset(12)).toFixed(2));
  const body=clamp((dna.adultHeightCm-160)/42*100,0,100);
  return {
    technique:base(dna.technicalAptitude),passing:base((dna.technicalAptitude+dna.gameIntelligence)/2),finishing:base((dna.technicalAptitude+dna.finishingAptitude)/2,5),
    dribbling:base((dna.technicalAptitude+dna.coordination)/2),vision:base(dna.gameIntelligence),decisions:base(dna.gameIntelligence),pace:base(dna.accelerationAptitude),stamina:base(dna.staminaAptitude),
    strength:base((dna.staminaAptitude+body)/2,5),positioning:base((dna.gameIntelligence+dna.defensiveAptitude)/2),tackling:base(dna.defensiveAptitude,5),crossing:base((dna.technicalAptitude+dna.gameIntelligence)/2,5),
    heading:base((dna.aerialAptitude+body)/2,5),reflexes:base((dna.reflexAptitude+dna.coordination)/2,5),handling:base((dna.reflexAptitude+dna.gameIntelligence)/2,5),aerial:base((dna.aerialAptitude+body)/2,5)
  };
}

function aptitudeForAttribute(p:PlayerState,key:keyof VisibleAttributes):number{
  const d=p.dna;
  if(['technique','passing','dribbling','crossing'].includes(key))return d.technicalAptitude;
  if(['vision','decisions','positioning'].includes(key))return d.gameIntelligence;
  if(key==='finishing')return d.finishingAptitude;
  if(key==='pace')return d.accelerationAptitude;
  if(key==='stamina'||key==='strength')return d.staminaAptitude;
  if(key==='tackling')return d.defensiveAptitude;
  if(key==='heading'||key==='aerial')return d.aerialAptitude;
  if(key==='reflexes'||key==='handling')return d.reflexAptitude;
  return 60;
}

export function growthStep(p:PlayerState,rng:RNG,focus:keyof VisibleAttributes|null=null):void{
  const coaching=p.tactical&&p.age<=21?.92+coachProfile(p.tactical.coachId).youth/600:1;
  const age=p.age;const time=footballTime(p);const plasticity=p.dna.learningPlasticity/100;const lateBoost=p.dna.lateBloomer>62&&age>=18&&age<=23?1.18:1;
  const ageFactor=age<=14?1.08:age<=17?1.13:age<=21?.93:age<=25?.64:age<=29?.31:age<=32?.07:-.16;
  const pos=p.position==='IND'?null:p.position;const devEff=pos?developmentEfficiency(p,pos):1;
  const keys=Object.keys(p.attributes) as (keyof VisibleAttributes)[];
  for(const key of keys){
    // Study contributes to acquired reading/decision skills; football-specific practice still competes for time.
    // No retroactive diploma bonus or change to hidden aptitude. These gains persist after adolescence.
    const cognitive=key==='vision'||key==='decisions';
    const learningTime=cognitive&&age<=18?(p.life?.education.priority==='SCHOOL'?1.22:p.life?.education.priority==='FOOTBALL'?1:1.08):time;
    const current=p.attributes[key],apt=aptitudeForAttribute(p,key);const roleFactor=pos?positionTrainingMultiplier(pos,key):.90;const focusFactor=focus===key?1.55:1;
    const maturation=['pace','stamina','strength','heading','aerial'].includes(key)&&age<=21?clamp(.72+(age-p.dna.physicalMaturationAge+2)*.08,.56,1.12):1;
    const ceilingResistance=Math.max(.095,(103-current)/72);let delta=(age<=21?.30:.40)*ageFactor*plasticity*lateBoost*roleFactor*focusFactor*ceilingResistance*devEff*learningTime*coaching*maturation*(p.injury?(['pace','stamina','strength'].includes(key)?.25:.55):1)*(.78+apt/170);
    if(age>=30&&['pace','stamina','strength'].includes(key))delta-=.06+(age-30)*.045;
    // Reading the game and technique age differently from running capacity.
    if(age>=33&&['vision','decisions','positioning','technique','passing','finishing'].includes(key))delta=Math.max(delta,0);
    // Greater learning during formation compensates the lower acquired starting level, without a cap on potential.
    delta*=age<=13?1.4:age<=17?2.75:age<=21?1.25:1;
    // Keep the legacy stream schedule so unrelated match draws are not shifted.
    // These samples no longer enter acquired-skill progression.
    rng.normal(0,.045);delta*=calendarScale(p);p.attributes[key]=Number(clamp(current+delta,5,99).toFixed(2));
  }
}

export function updateBody(p:PlayerState,rng:RNG):void{
  if(p.age>=21)return;const target=p.dna.adultHeightCm,maturity=p.dna.physicalMaturationAge,yearsLeft=Math.max(1,maturity+2-p.age),gap=Math.max(0,target-p.heightCm);
  if(gap>0){const expected=gap/yearsLeft/4.5;p.heightCm=Number(Math.min(target,p.heightCm+Math.max(0,rng.normal(expected,.42))).toFixed(1));}
  const excess=p.lifestyle?.excessKg??0,baseWeight=p.weightKg-excess;
  const targetWeight=Math.max(43,(p.heightCm-100)*(p.age<16?.72:p.age<19?.80:.87));p.weightKg=Number((Number((baseWeight+(targetWeight-baseWeight)*.18+rng.normal(0,.2)).toFixed(1))+excess).toFixed(4));
}

export function overall(p:PlayerState):number{
  if(p.position==='IND')return Number(Math.max(...POSITIONS.map(pos=>roleRating(p,pos))).toFixed(1));
  return effectivePositionRating(p,p.position);
}
