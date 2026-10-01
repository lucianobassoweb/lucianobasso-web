import {competitionCategory} from './calendar.js';
import {clamp,hashSeed} from './random.js';
import type {CareerEvent,PlayerState,Relationship} from './types.js';

/** A dressing room belongs to a club AND category. Local schools also have identities. */
export function groupKey(p:PlayerState):string{return `squad:${p.currentClubId??`local:${p.life?.localSchool??p.hometown}`}:${competitionCategory(p)}`;}
const neutral=(key:string):Relationship=>({personId:key,affinity:50,respect:50,rivalry:0,resentment:0,memories:[]});
export function groupRelation(p:PlayerState):Relationship {
  const key=groupKey(p);return p.relationships[key]??(!p.squad?p.relationships[`group:${p.currentClubId??'local'}`]:undefined)??neutral(key);
}
export function ensureGroupContext(p:PlayerState):void{
  if(p.squad){
    const key=groupKey(p),previous=p.squad.currentKey;
    if(previous&&previous!==key){
      const oldContext=p.squad.contexts[previous];if(oldContext)oldContext.captain=false;
      // Returning to a former club preserves memories, but requires new presence and election.
      if(p.squad.contexts[key])p.squad.contexts[key]={appearances:0,starts:0,minutes:0,captain:false};
    }
    p.squad.currentKey=key;return;
  }
  const key=groupKey(p),old=p.relationships[`group:${p.currentClubId??'local'}`];
  // Only the current known group can inherit legacy evidence; history remains intact.
  if(old&&!p.relationships[key])p.relationships[key]={...old,personId:key,memories:[...old.memories]};
  p.squad={version:'CONTEXT_1',currentKey:key,lastObservedTurn:p.careerTurn,contexts:{}};
}
export function ensureGroupRelation(p:PlayerState):Relationship {ensureGroupContext(p);const key=groupKey(p);return p.relationships[key]??=(neutral(key));}
export function groupCooperation(p:PlayerState):number{const r=groupRelation(p);return clamp((r.respect-50-r.resentment*.8)/50,-1,1);}
export function groupAttackSupply(p:PlayerState):number{return p.position==='GK'?1:1+groupCooperation(p)*.18;}
export function groupCoverRisk(p:PlayerState):number{return ['CB','FB','DM'].includes(p.position)?1-groupCooperation(p)*.25:1;}
export function groupMatchText(p:PlayerState,minutes:number,covers=0):string{
  if(minutes<=0)return 'Sem participação: o vínculo com o grupo não substitui uma atuação.';
  const r=groupRelation(p),cooperation=groupCooperation(p),percent=Math.round((groupAttackSupply(p)-1)*100);
  const role=p.position==='ST'||p.position==='WG'||p.position==='AM'||p.position==='CM'?`Abastecimento ofensivo ${percent>=0?'+':''}${percent}% pela coordenação do grupo; habilidade e finalização continuam necessárias.`:['CB','FB','DM'].includes(p.position)?`Coordenação defensiva ${cooperation>0?'favorece a cobertura':cooperation<0?'dificulta a cobertura':'neutra'}.${covers?' Uma cobertura coletiva evitou uma intervenção de risco nesta partida.':''}`:'A relação com o grupo segue sendo construída.';
  return `Respeito do grupo ${Math.round(r.respect)}/100${r.resentment>=10?`; ressentimento ${Math.round(r.resentment)}/100`:''}. ${role}`;
}
export function observeGroupMatch(p:PlayerState,m:{minutes:number;started:boolean;rating:number;red:boolean}):void{
  ensureGroupContext(p);const s=p.squad!;
  if(p.careerTurn<=s.lastObservedTurn)return;s.lastObservedTurn=p.careerTurn;
  if(m.minutes<=0)return;
  const key=groupKey(p),ctx=s.contexts[key]??=( {appearances:0,starts:0,minutes:0,captain:false} );
  ctx.appearances++;ctx.minutes+=m.minutes;ctx.starts+=m.started?1:0;
  const r=ensureGroupRelation(p),substantial=m.minutes>=45;
  const change=m.red?-3:substantial?(m.rating>=7?.6:m.rating<6.2?-.8:0):0;
  r.respect=clamp(r.respect+change);
  // Failure remains possible after election: the group can withdraw its confidence.
  if(ctx.captain&&(r.respect<55||r.resentment>40)){
    ctx.captain=false;r.memories.unshift(`${p.season}: O grupo retirou a capitania`);r.memories=r.memories.slice(0,16);
    p.history.unshift({turn:p.careerTurn,season:p.season,age:p.age,type:'GRUPO',headline:'O grupo retirou a capitania',detail:'O desgaste do vínculo encerrou a responsabilidade neste grupo.'});p.history=p.history.slice(0,220);
  }
  if(ctx.captain&&substantial&&m.rating<6.2)p.pressure=clamp(p.pressure+1.5);
}
export function captainEvent(p:PlayerState):CareerEvent|null{
  ensureGroupContext(p);const key=groupKey(p),ctx=p.squad!.contexts[key],r=groupRelation(p);
  if(!ctx||ctx.captain||ctx.lastOfferedSeason===p.season||ctx.starts<10||ctx.minutes<600||r.respect<75||r.resentment>20||p.injury||p.phase==='APOSENTADO')return null;
  ctx.lastOfferedSeason=p.season;
  return {id:`captain-${p.careerTurn}-${p.season}`,kind:'CHOICE',title:'O grupo escolheu você para capitão',body:`O grupo reconheceu sua presença: ${ctx.starts} titularidades, ${ctx.minutes} minutos e respeito ${Math.round(r.respect)}/100. Você aceita representar estes companheiros? A escolha vale somente neste clube e nesta categoria.`,tags:['GRUPO','CAPITANIA'],payload:{groupKey:key},choices:[{id:'captain:accept',label:'Aceitar a responsabilidade',hint:'Pressão +4 e fadiga mental +2; atuações ruins trazem cobrança adicional. Não garante titularidade.'},{id:'captain:decline',label:'Prefiro contribuir sem a faixa',hint:'Mantém o respeito; nova indicação só poderá acontecer em outra temporada.'}]};
}
export function canResolveCaptainChoice(p:PlayerState,event:CareerEvent,id:string):boolean{
  if(event.id!==`captain-${p.careerTurn}-${p.season}`||p.injury||p.phase==='APOSENTADO'||!event.choices?.some(c=>c.id===id)||event.payload?.groupKey!==groupKey(p))return false;
  const ctx=p.squad?.contexts[groupKey(p)];if(!ctx||ctx.captain||ctx.starts<10||ctx.minutes<600||ctx.lastOfferedSeason!==p.season||ctx.lastResolvedEvent===event.id||!['captain:accept','captain:decline'].includes(id))return false;
  const r=groupRelation(p);if(r.respect<75||r.resentment>20)return false;
  return true;
}
export function resolveCaptainChoice(p:PlayerState,event:CareerEvent,id:string):boolean {
  if(!canResolveCaptainChoice(p,event,id))return false;
  const ctx=p.squad!.contexts[groupKey(p)]!;
  ctx.lastResolvedEvent=event.id;
  if(id==='captain:accept'){ctx.captain=true;p.pressure=clamp(p.pressure+4);p.mentalFatigue=clamp(p.mentalFatigue+2);}
  const detail=id==='captain:accept'?'Aceitou representar o grupo; pressão +4 e fadiga mental +2, sem privilégio na escalação.':'Recusou a faixa e preservou o vínculo com os companheiros.';
  p.history.unshift({turn:p.careerTurn,season:p.season,age:p.age,type:'GRUPO',headline:event.choices!.find(c=>c.id===id)!.label,detail});p.history=p.history.slice(0,220);return true;
}

/** Fictional stable coach for the local school; no claim of a real local appointment. */
export function localCoachName(p:PlayerState):string {
 const names=['Rafael','André','Márcio','Paulo','Ricardo','João','Daniel','Felipe'];
 const surnames=['Costa','Lima','Alves','Duarte','Mendes','Silveira','Ramos','Vieira'];
 const seed=hashSeed(`local-coach:${groupKey(p)}`);return `${names[seed%names.length]} ${surnames[Math.floor(seed/names.length)%surnames.length]}`;
}
