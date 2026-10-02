import {clamp} from './random.js';
import type {VisibleAttributes} from './types.js';
export interface DevelopmentLoad {fatigue:number;pressure:number;condition:number;learningMultiplier:number;}
/** Ordinary strain is tolerated; sustained overload impairs practice and erodes acquired skill. */
export function developmentLoad(p:{mentalFatigue:number;pressure:number;physicalCondition:number}):DevelopmentLoad {
  const fatigue=clamp((p.mentalFatigue-35)/65,0,1),pressure=clamp((p.pressure-40)/60,0,1),condition=clamp((75-p.physicalCondition)/75,0,1);
  return {fatigue,pressure,condition,learningMultiplier:clamp(1-.75*fatigue-.6*pressure-.3*condition,0,1)};
}
/** Per legacy calendar block; growthStep scales to the actual season's matches. */
export function acquiredSkillWear(load:DevelopmentLoad,key:keyof VisibleAttributes):number {
  const physical=['pace','stamina','strength','heading','aerial'].includes(key),cognitive=['vision','decisions','positioning'].includes(key);
  const fatigueWeight=physical?1:cognitive?.85:.75,pressureWeight=cognitive?1:physical?.55:.85,conditionWeight=physical?1:.4;
  return .35*(load.fatigue*fatigueWeight+load.pressure*pressureWeight+load.condition*conditionWeight);
}
