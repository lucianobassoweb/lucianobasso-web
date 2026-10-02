import type {PlayerState} from './types.js';

/** Adult reference, experimental calibration; this is not a potential ceiling. */
export function formationOffset(age:number):number{return Math.max(0,18-age)*3.2;}
/** One-time conversion of acquired childhood ability, never DNA or historical output. */
export function migrateAttributeScale(p:PlayerState):void{
  if(p.attributeScale==='ADULT_REFERENCE_1')return;
  const offset=formationOffset(p.age);
  if(offset>0){
    for(const key of Object.keys(p.attributes) as (keyof PlayerState['attributes'])[])p.attributes[key]=Number(Math.max(5,p.attributes[key]-offset).toFixed(2));
  }
  p.attributeScale='ADULT_REFERENCE_1';
}
