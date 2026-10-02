import {clamp} from './random.js';
/** One interval of games/practice: measured participation costs condition and mental energy. */
export function matchLoad(p:{age:number;physicalCondition:number;mentalFatigue:number;pressure:number;attributes:{stamina:number}},minutes:number):{condition:number;fatigue:number} {
  const exposure=clamp(minutes/90,0,1),youth=p.age<=14?1.15:p.age<=17?1.05:1;
  const physicalCost=exposure*(3.4+1.5*(1-clamp(p.attributes.stamina/100,0,1)))*youth;
  const mentalCost=minutes>0?.35+exposure*(1.6+.8*clamp((p.pressure-40)/60,0,1))*youth:0;
  // Ordinary recovery exists; explicit rest contributes its separate +4 / -5 before this interval.
  return {condition:Number((clamp(p.physicalCondition+1.8-physicalCost)-p.physicalCondition).toFixed(4)),fatigue:Number((clamp(p.mentalFatigue+mentalCost)-p.mentalFatigue).toFixed(4))};
}
