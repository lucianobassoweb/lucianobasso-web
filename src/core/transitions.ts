import { RNG, clamp } from './random.js';
import type { PlayerState, CareerEvent } from './types.js';
import { CLUB_BY_ID } from '../data/clubs-br-2026.js';

export function ensureTransition(p:PlayerState):void{
  p.professionalTransition??={mode:null,clubId:p.currentClubId,youthBuzz:0,seniorMinutesAtStart:p.careerStats.minutes};
}
export function youthExpectation(p:PlayerState):number{
  const seasons=p.seasonHistory.filter(s=>s.age<16);
  if(!seasons.length)return 0;
  return clamp(seasons.reduce((sum,s)=>sum+Math.max(0,s.avgRating-6.3)*12+(s.goals+s.assists)*.6,0)/seasons.length,0,100);
}
export function transitionEvent(p:PlayerState):CareerEvent{
  ensureTransition(p);p.professionalTransition!.youthBuzz=youthExpectation(p);
  return {id:`transition-${p.careerTurn}`,kind:'CHOICE',title:'Da base para o futebol profissional',body:'O que você mostrou na base abriu esta porta, mas o nível, o corpo dos adversários e a cobrança mudam. Você conversa com o treinador sobre o espaço que pretende assumir.',tags:['TRANSIÇÃO','EXPECTATIVA'],choices:[{id:'transition:PROTECTED',label:'Aceitar uma entrada gradual',hint:'Menos titularidades no início; menor carga de expectativa'},{id:'transition:IMMEDIATE',label:'Pedir mais responsabilidade agora',hint:'Maior chance de começar jogando; mais cobrança e risco de perder confiança'}]};
}
export function transitionLoad(p:PlayerState):{starts:number;pressure:number}{
  const t=p.professionalTransition;
  if(!t?.mode)return {starts:1,pressure:0};
  const experience=clamp((p.careerStats.minutes-t.seniorMinutesAtStart)/1800,0,1);
  const novelty=1-experience;
  const club=CLUB_BY_ID[p.currentClubId??''];
  const stage=(club?.prestige??40)/100;
  return t.mode==='PROTECTED'?{starts:1-.25*novelty,pressure:novelty*stage*.5}:{starts:1+.15*novelty,pressure:novelty*(stage*2+t.youthBuzz/40)};
}
/** Long absence preserves DNA and acquired skills; rates are provisional game parameters. */
export function maybeInjury(p:PlayerState,rng:RNG):CareerEvent|null{
  if(p.injury||p.age<16||!p.currentClubId)return null;
  const susceptibility=(100-p.dna.injuryResistance)/100;
  const returnRisk=p.comebackBlocks?(p.comebackPlan==='COMPETE'?1.5:.85):1;
  const chance=(.004+susceptibility*.012+Math.max(0,85-p.physicalCondition)/2500)*returnRisk;
  if(!rng.chance(chance))return null;
  const major=rng.chance(.18);const blocks=major?rng.int(4,6):rng.int(1,2);
  p.injury={remainingBlocks:blocks,longAbsence:major,returnDiscussed:false};p.physicalCondition=major?65:78;
  return {id:`injury-${p.careerTurn}`,kind:'MILESTONE',title:major?'Um afastamento longo':'Fora dos jogos por um período',body:`Você ficará fora por aproximadamente ${blocks} blocos do calendário. Seu futebol não foi apagado, mas minutos, ritmo e oportunidades precisam ser reconstruídos.`,tags:['AFASTAMENTO',major?'LONGO':'CURTO']};
}
export function injuryBlock(p:PlayerState):CareerEvent|null{
  const injury=p.injury;if(!injury)return null;
  if(injury.remainingBlocks>0){injury.remainingBlocks--;p.physicalCondition=clamp(p.physicalCondition+4,0,95);return {id:`rehab-${p.careerTurn}`,kind:'INFO',title:'O calendário segue durante a recuperação',body:`Você ficou fora das partidas deste bloco. ${injury.remainingBlocks?`Restam aproximadamente ${injury.remainingBlocks} blocos de afastamento.`:'A recuperação abre a conversa sobre o retorno ao elenco.'}`,tags:['RECUPERAÇÃO','SEM MINUTOS']};}
  return null;
}
export function comebackEvent(p:PlayerState):CareerEvent{
  return {id:`comeback-${p.careerTurn}`,kind:'CHOICE',title:'Como retomar seu espaço?',body:'Você foi liberado para voltar ao elenco. A pausa não retirou suas capacidades, mas a disputa por espaço continuou. Negocie o papel nesta retomada.',tags:['RETORNO','PROJETO'],choices:[{id:'comeback:GRADUAL',label:'Aceitar participação gradual',hint:'Menos titularidades nos próximos blocos; reconstruir confiança e condição'},{id:'comeback:COMPETE',label:'Disputar imediatamente o espaço anterior',hint:'Mais exposição no retorno; ritmo e condição ainda precisam acompanhar'}]};
}
export function legacyNarrative(p:PlayerState):string{
  const relations=Object.values(p.fanRelations).sort((a,b)=>(b.passion*.6+b.respect*.4)-(a.passion*.6+a.respect*.4));
  const best=relations[0];
  if(best&&Math.max(best.passion,best.respect)>=70){const club=CLUB_BY_ID[best.clubId];return `Você construiu uma relação marcante com ${club?.name??'uma torcida'}. O tamanho dessa história não depende de ter jogado sempre na elite.`;}
  if(p.careerStats.appearances>=100)return 'Você sustentou uma carreira profissional. A expectativa da adolescência não resume o valor da trajetória construída.';
  return 'Sua história inclui o futebol local e as oportunidades que decidiu perseguir. O próximo caminho continua sendo uma escolha sua.';
}
