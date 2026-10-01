import type { Campaign, Club, CompetitionCategory, FanMemory, FanRelation, PlayerState, Position } from './types.js';

/** Only observations are accepted: no DNA, tactical compatibility or random source. */
export type FanPlayer = Pick<PlayerState, 'position' | 'age' | 'season' | 'pressure' | 'morale' | 'confidence'>;
export interface FanMatch {
  teamGoals:number; oppGoals:number; minutes:number; rating:number;
  goals:number; assists:number; saves:number;
  xg?:number; xa?:number; red?:boolean; yellow?:boolean; motm?:boolean;
}
export interface FanMatchOptions {
  own?:Pick<Club, 'prestige'>;
  opponent?:Pick<Club, 'prestige'>;
  category?:CompetitionCategory;
  rivalry?:boolean;
  priorFan?:Partial<Pick<FanRelation, 'passion' | 'hate' | 'respect' | 'expectation' | 'memories'>>;
  campaign?:Pick<Campaign, 'games' | 'points' | 'expectedPPG'>;
  /** Balance multiplier; bounded so callers cannot create extreme single-match effects. */
  intensity?:number;
}
export interface FanMatchEvaluation {
  text:string;
  deltas:{passion:number;hate:number;respect:number;pressure:number;morale:number;confidence:number};
  memory?:FanMemory;
  assessment:{reason:string;tags:string[]};
}
const clamp=(n:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,n));
const finite=(n:number|undefined,fallback=0)=>Number.isFinite(n)?n!:fallback;
const value=(n:number|undefined,fallback=50)=>clamp(finite(n,fallback),0,100);
// Defensive and attacking exposure; mixed positions carry responsibilities in both phases.
const responsibilities:Record<Position,[number,number]>={GK:[1,0],CB:[.95,.08],FB:[.68,.38],DM:[.72,.32],CM:[.42,.55],AM:[.2,.82],WG:[.12,.95],ST:[.08,1],IND:[.4,.5]};

export function evaluateFanMatch(p:FanPlayer,m:FanMatch,o:FanMatchOptions={}):FanMatchEvaluation {
  const zero={passion:0,hate:0,respect:0,pressure:0,morale:0,confidence:0};
  const category=o.category??(p.age<=14?'U15':p.age===15?'U17':p.age<=20?'U20':'SENIOR');
  const audience=category==='SENIOR'?'A torcida':category==='AMATEUR'?'Quem acompanha o time local':'Quem acompanha a formação';
  const minutes=clamp(finite(m.minutes),0,90);
  if(!minutes)return {text:`${audience} avalia o resultado coletivo; você não entrou e não recebe cobrança individual.`,deltas:zero,assessment:{reason:'Sem participação individual',tags:['BENCH']}};
  const [defence,attack]=responsibilities[p.position]??responsibilities.IND;
  const gf=clamp(finite(m.teamGoals),0,20),ga=clamp(finite(m.oppGoals),0,20);
  const lost=gf<ga,won=gf>ga,margin=Math.max(0,ga-gf);
  const rating=clamp(finite(m.rating,6.5),0,10),good=rating>=7.2&&!m.red;
  const goals=clamp(finite(m.goals),0,gf),assists=clamp(finite(m.assists),0,Math.max(0,gf-goals));
  const contribution=goals*1.0+assists*.65;
  const saves=p.position==='GK'?clamp(finite(m.saves),0,20):0;
  const ageScale=p.age<=13?.28:p.age<=15?.45:p.age<=17?.65:1;
  const categoryScale=category==='SENIOR'?1:category==='AMATEUR'?.6:.75;
  const scale=(minutes/90)*Math.min(ageScale,categoryScale)*clamp(finite(o.intensity,1),0,1.5);
  const expectation=(value(o.priorFan?.expectation)-50)/100;
  const relative=o.own&&o.opponent?clamp((finite(o.own.prestige,50)-finite(o.opponent.prestige,50))/100,-.35,.35):0;
  const c=o.campaign;
  const campaign=c&&finite(c.games)>=5?clamp((finite(c.expectedPPG,1.3)-finite(c.points)/Math.max(1,finite(c.games)))*.15,0,.2):0;
  const experience=clamp((o.priorFan?.memories??[]).filter(x=>x.season<=p.season&&x.season>=p.season-2).reduce((sum,x)=>sum+(x.type==='PRESSURE'||x.type==='FLOP'?.03:x.type==='REDEMPTION'||x.type==='RECOGNITION'?-.02:0),0),-.08,.1);
  const relationship=(value(o.priorFan?.hate,0)-value(o.priorFan?.respect,0))*.0008;
  const demand=clamp(1+expectation*.4+relative*.5+campaign+experience+relationship+(o.rivalry?.18:0),.7,1.5);
  const defensiveBurden=defence*(ga>0?(lost?.7:.18)+Math.max(0,ga-1)*.24:0);
  const creation=['AM','CM','WG'].includes(p.position)&&gf===0?clamp(finite(m.xa),0,2):0;
  const attackingBurden=attack*(gf===0?.8:0)*(1-Math.min(.35,creation*.25));
  const burden=(defensiveBurden+attackingBurden)*demand;
  const poor=clamp((6.4-rating)*.8,0,2);
  const merit=clamp((rating-6.6)*.65,-1.8,1.8)+(ga===0?defence*.45:0)+Math.min(.35,saves*.04)+Math.min(.3,creation*.2);
  // Strong performances reduce personal resentment, but do not erase a sector's collective obligation.
  const criticism=Math.max(0,burden*(good?.35:1)+poor+(m.red?1.2:0)+(gf===0?attack*Math.min(.6,clamp(finite(m.xg),0,5)*.35):0)-contribution*.45);
  const support=contribution*.8+Math.max(0,merit)*.5+(m.motm&&!m.red?.5:0);
  const raw={
    passion:(won?.45:lost?-.4:0)+support-criticism*.3-margin*.1,
    hate:criticism*.65-support*.15,
    respect:merit-poor*.4-(m.red?1:0),
    pressure:criticism*.9+burden*.2-support*.35,
    morale:support*.3-criticism*.4,
    confidence:Math.max(0,merit)*.25-poor*.4-criticism*.16,
  };
  const delta=(current:number|undefined,n:number,cap:number)=>{
    const before=value(current);return clamp(before+clamp(n*scale,-cap,cap),0,100)-before;
  };
  const deltas={passion:delta(o.priorFan?.passion,raw.passion,3),hate:delta(o.priorFan?.hate,raw.hate,3),respect:delta(o.priorFan?.respect,raw.respect,2),pressure:delta(p.pressure,raw.pressure,3),morale:delta(p.morale,raw.morale,2),confidence:delta(p.confidence,raw.confidence,2)};
  const tags:string[]=[];
  let text:string;
  if(defensiveBurden>=attackingBurden&&defensiveBurden>.35){
    tags.push('DEFENSIVE_ACCOUNTABILITY');
    text=category==='SENIOR'?(ga>=3?'A torcida se revolta com o setor defensivo após os gols sofridos.':`A torcida cobra o setor defensivo ${lost?'após a derrota':'pelos gols sofridos'}.`):`${audience} cobra a organização defensiva após os gols sofridos.`;
  }else if(attackingBurden>.35){
    tags.push('ATTACKING_ACCOUNTABILITY');text=`${audience} cobra o ataque: o time terminou sem marcar.`;
  }else if(poor>.3){tags.push('POOR_PERFORMANCE');text=`${audience} cobra sua atuação abaixo do esperado${won?', apesar da vitória':''}.`;}
  else if(ga===0&&defence>=.68&&rating>=6.4){tags.push('DEFENSIVE_RECOGNITION');text=`${audience} reconhece seu trabalho defensivo no jogo sem sofrer gol.`;}
  else if(contribution>0||good){tags.push('RECOGNITION');text=`${audience} reconhece ${contribution>0?'sua participação nos gols':'sua boa atuação'}.`;}
  else {text=lost?`${audience} demonstra insatisfação com a derrota e espera uma resposta do time.`:`${audience} acompanha sua atuação sem um destaque individual.`;}
  if((defensiveBurden>.35||attackingBurden>.35)&&(good||contribution>0)){
    text+=p.position==='GK'&&good?` Suas ${saves} defesas e a boa nota recebem reconhecimento, mesmo com a cobrança coletiva.`:contribution>0?' Sua participação nos gols recebe apoio, mas não apaga a cobrança pelo resultado.':' Sua boa atuação recebe reconhecimento dentro da cobrança coletiva.';
    tags.push('INDIVIDUAL_RECOGNITION');
  }
  if(creation>=.5)text+=' Seu xA indica criação de oportunidades, o que atenua a cobrança individual sem apagar a falta de gols.';
  if(m.red){text+=' A expulsão aumenta a cobrança individual.';tags.push('RED_CARD');}
  if(poor>.3&&!tags.includes('POOR_PERFORMANCE')){text+=' Sua nota baixa também pesa na avaliação individual.';tags.push('POOR_PERFORMANCE');}
  if(minutes<30)text+=' Sua participação curta limita o peso dessa avaliação individual.';
  const memories=o.priorFan?.memories??[];
  // Memories are newest first. One redemption closes the latest documented episode.
  const latestPressure=memories.findIndex(x=>(x.type==='FLOP'||x.type==='PRESSURE')&&finite(x.season)<=p.season&&finite(x.season)>=p.season-2);
  const previousPressure=latestPressure>=0&&!memories.slice(0,latestPressure).some(x=>x.type==='REDEMPTION'&&x.season<=p.season);
  let memory:FanMemory|undefined;
  if(category==='SENIOR'&&minutes>=60&&lost&&rating<=5.4&&(margin>=3||o.rivalry||value(o.priorFan?.expectation)>=80)&&criticism>=2){
    memory={season:p.season,weight:5,type:'PRESSURE',description:`Cobrança após nota ${rating.toFixed(1)} na derrota por ${gf} × ${ga}${o.rivalry?' em clássico':''}.`};
  }else if(category==='SENIOR'&&minutes>=60&&previousPressure&&won&&rating>=8&&(contribution>0||p.position==='GK'&&ga===0)){
    memory={season:p.season,weight:5,type:'REDEMPTION',description:`Atuação de nota ${rating.toFixed(1)} na vitória por ${gf} × ${ga}, após uma cobrança registrada.`};
    text+=' A torcida reconhece uma resposta à cobrança registrada.';tags.push('REDEMPTION');
  }else if(category==='SENIOR'&&minutes>=60&&o.rivalry&&won&&rating>=8.5&&(contribution>=1||p.position==='GK'&&ga===0)){
    memory={season:p.season,weight:5,type:'RECOGNITION',description:`Destaque de nota ${rating.toFixed(1)} na vitória em clássico por ${gf} × ${ga}.`};
  }
  // Scores are snapshots, not an individual fault ledger or evidence of a losing streak.
  if(memory&&(memories.some(x=>x.season===memory!.season&&x.description===memory!.description)||
    memory.type==='PRESSURE'&&memories.filter(x=>x.season===p.season&&x.type==='PRESSURE').length>=4))memory=undefined;
  return {text,deltas,...(memory?{memory}:{}),assessment:{reason:tags.join(', ')||'Avaliação regular',tags}};
}
