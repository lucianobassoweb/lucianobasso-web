import {groupKey,groupRelation} from './group.js';
import type {PlayerState} from './types.js';
export type StateKey='physicalCondition'|'mentalFatigue'|'pressure'|'confidence'|'morale'|'respect'|'happiness';
export interface StateSnapshot {group:string;values:Record<StateKey,number>;}
export interface StateDelta {turn:number;season:number;values:Partial<Record<StateKey,number>>;groupChanged?:boolean;}
/** Capture during an accepted user action, never during rendering. */
export function captureState(p:PlayerState):StateSnapshot {
  return {group:groupKey(p),values:{physicalCondition:p.physicalCondition,mentalFatigue:p.mentalFatigue,pressure:p.pressure,confidence:p.confidence,morale:p.morale,respect:groupRelation(p).respect,happiness:p.lifestyle?.happiness??50}};
}
export function recordStateDelta(p:PlayerState,before:StateSnapshot):void {
  const after=captureState(p),values:Partial<Record<StateKey,number>>={};
  for(const key of Object.keys(after.values) as StateKey[])values[key]=Number((after.values[key]-before.values[key]).toFixed(4));
  p.lastStateDelta={turn:p.careerTurn,season:p.season,values,...(before.group!==after.group?{groupChanged:true}:{})};
}
