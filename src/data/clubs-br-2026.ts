import type { Club, Division } from '../core/types.js';

type Seed = [string, string, string?];
const A: Seed[] = [
  ['athletico-pr','Athletico Paranaense','PR'],['atletico-mg','Atlético Mineiro','MG'],['bahia','Bahia','BA'],['botafogo-rj','Botafogo','RJ'],['chapecoense','Chapecoense','SC'],['corinthians','Corinthians','SP'],['coritiba','Coritiba','PR'],['cruzeiro','Cruzeiro','MG'],['flamengo','Flamengo','RJ'],['fluminense','Fluminense','RJ'],['gremio','Grêmio','RS'],['internacional','Internacional','RS'],['mirassol','Mirassol','SP'],['palmeiras','Palmeiras','SP'],['bragantino','Red Bull Bragantino','SP'],['remo','Remo','PA'],['santos','Santos','SP'],['sao-paulo','São Paulo','SP'],['vasco','Vasco da Gama','RJ'],['vitoria-ba','Vitória','BA']
];
const B: Seed[] = [
  ['america-mg','América-MG','MG'],['athletic-mg','Athletic Club','MG'],['atletico-go','Atlético-GO','GO'],['avai','Avaí','SC'],['botafogo-sp','Botafogo-SP','SP'],['ceara','Ceará','CE'],['crb','CRB','AL'],['criciuma','Criciúma','SC'],['cuiaba','Cuiabá','MT'],['fortaleza','Fortaleza','CE'],['goias','Goiás','GO'],['juventude','Juventude','RS'],['londrina','Londrina','PR'],['nautico','Náutico','PE'],['novorizontino','Novorizontino','SP'],['operario-pr','Operário-PR','PR'],['ponte-preta','Ponte Preta','SP'],['sao-bernardo','São Bernardo','SP'],['sport','Sport Recife','PE'],['vila-nova','Vila Nova','GO']
];
const C: Seed[] = [
  ['amazonas','Amazonas FC','AM'],['anapolis','Anápolis','GO'],['barra-sc','Barra-SC','SC'],['botafogo-pb','Botafogo-PB','PB'],['brusque','Brusque','SC'],['caxias','Caxias','RS'],['confianca','Confiança','SE'],['ferroviaria','Ferroviária','SP'],['figueirense','Figueirense','SC'],['floresta','Floresta','CE'],['guarani','Guarani','SP'],['inter-limeira','Inter de Limeira','SP'],['itabaiana','Itabaiana','SE'],['ituano','Ituano','SP'],['maranhao','Maranhão','MA'],['maringa','Maringá','PR'],['paysandu','Paysandu','PA'],['santa-cruz','Santa Cruz','PE'],['volta-redonda','Volta Redonda','RJ'],['ypiranga-rs','Ypiranga-RS','RS']
];
const D: Seed[] = [
  ['abc','ABC','RN'],['abecat','ABECAT','GO'],['agua-santa','Água Santa','SP'],['aguia-maraba','Águia de Marabá','PA'],['altos','Altos','PI'],['america-rj','America-RJ','RJ'],['america-rn','América-RN','RN'],['aparecidense','Aparecidense','GO'],['araguaina','Araguaína','TO'],['asa','ASA','AL'],['atletico-alagoinhas','Atlético de Alagoinhas','BA'],['atletico-ce','Atlético-CE','CE'],['azuriz','Azuriz','PR'],['betim','Betim','MG'],['blumenau','Blumenau','SC'],['brasil-pelotas','Brasil de Pelotas','RS'],['brasiliense','Brasiliense','DF'],['capital-df','Capital','DF'],['ceilandia','Ceilândia','DF'],['central','Central','PE'],['cianorte','Cianorte','PR'],['crac','CRAC','GO'],['csa','CSA','AL'],['cse','CSE','AL'],['decisao','Decisão','PE'],['democrata-gv','Democrata GV','MG'],['fc-cascavel','FC Cascavel','PR'],['ferroviario','Ferroviário','CE'],['fluminense-pi','Fluminense-PI','PI'],['galvez','Galvez','AC'],['gama','Gama','DF'],['gas','GAS','RR'],['goiatuba','Goiatuba','GO'],['guapore','Guaporé','RO'],['guarany-bage','Guarany de Bagé','RS'],['humaita-ac','Humaitá-AC','AC'],['iape','IAPE','MA'],['iguatu','Iguatu','CE'],['imperatriz','Imperatriz','MA'],['independencia-ac','Independência','AC'],['inhumas','Inhumas','GO'],['jacuipense','Jacuipense','BA'],['joinville','Joinville','SC'],['juazeirense','Juazeirense','BA'],['lagarto','Lagarto','SE'],['laguna','Laguna','RN'],['luverdense','Luverdense','MT'],['madureira','Madureira','RJ'],['maguary','Maguary','PE'],['manaus','Manaus','AM'],['manauara','Manauara','AM'],['marcilio-dias','Marcílio Dias','SC'],['maracana','Maracanã','CE'],['marica','Maricá','RJ'],['mixto','Mixto','MT'],['monte-roraima','Monte Roraima','RR'],['moto-club','Moto Club','MA'],['nacional-am','Nacional','AM'],['noroeste','Noroeste','SP'],['nova-iguacu','Nova Iguaçu','RJ'],['operario-ms','Operário-MS','MS'],['operario-vg','Operário Várzea-grandense','MT'],['oratorio','Oratório','AP'],['pantanal','Pantanal','MS'],['parnahyba','Parnahyba','PI'],['piaui','Piauí','PI'],['porto-ba','Porto-BA','BA'],['porto-velho','Porto Velho','RO'],['portuguesa-sp','Portuguesa','SP'],['portuguesa-rj','Portuguesa-RJ','RJ'],['pouso-alegre','Pouso Alegre','MG'],['primavera-mt','Primavera-MT','MT'],['real-noroeste','Real Noroeste','ES'],['retro','Retrô','PE'],['rio-branco-es','Rio Branco-ES','ES'],['sampaio-correa-ma','Sampaio Corrêa','MA'],['sampaio-correa-rj','Sampaio Corrêa-RJ','RJ'],['santa-catarina','Santa Catarina','SC'],['sao-jose-rs','São José-RS','RS'],['sao-joseense','São Joseense','PR'],['sao-luiz','São Luiz','RS'],['sao-raimundo-rr','São Raimundo-RR','RR'],['serra-branca','Serra Branca','PB'],['sergipe','Sergipe','SE'],['sousa','Sousa','PB'],['tirol','Tirol','CE'],['tocantinopolis','Tocantinópolis','TO'],['tombense','Tombense','MG'],['treze','Treze','PB'],['trem','Trem','AP'],['tuna-luso','Tuna Luso','PA'],['uberlandia','Uberlândia','MG'],['uniao-rondonopolis','União Rondonópolis','MT'],['velo-clube','Velo Clube','SP'],['vitoria-es','Vitória-ES','ES'],['xv-piracicaba','XV de Piracicaba','SP']
];

const divisionBase: Record<Division, Pick<Club,'prestige'|'finance'|'youth'|'fanbaseDomestic'|'fanbaseGlobal'>> = {
  A:{prestige:73,finance:70,youth:72,fanbaseDomestic:65,fanbaseGlobal:28},
  B:{prestige:52,finance:47,youth:58,fanbaseDomestic:42,fanbaseGlobal:12},
  C:{prestige:39,finance:34,youth:48,fanbaseDomestic:31,fanbaseGlobal:6},
  D:{prestige:26,finance:23,youth:38,fanbaseDomestic:20,fanbaseGlobal:3}
};

const rich: Partial<Record<string, Partial<Club>>> = {
  'gremio': {city:'Porto Alegre',stadium:'Arena do Grêmio',colors:['#66a7dc','#111111','#ffffff'],fanbaseDomestic:86,fanbaseGlobal:52,prestige:88,finance:79,youth:88,rivals:['internacional']},
  'internacional': {city:'Porto Alegre',stadium:'Beira-Rio',colors:['#d71920','#ffffff'],fanbaseDomestic:84,fanbaseGlobal:49,prestige:86,finance:77,youth:84,rivals:['gremio']},
  'juventude': {city:'Caxias do Sul',stadium:'Alfredo Jaconi',colors:['#168447','#ffffff'],fanbaseDomestic:39,fanbaseGlobal:8,prestige:52,finance:44,youth:60,rivals:['caxias']},
  'caxias': {city:'Caxias do Sul',stadium:'Centenário',colors:['#8d1420','#ffffff'],fanbaseDomestic:29,fanbaseGlobal:4,prestige:40,finance:32,youth:48,rivals:['juventude']},
  'ypiranga-rs': {city:'Erechim',stadium:'Colosso da Lagoa',colors:['#159447','#f3c623'],rivals:[]},
  'brasil-pelotas': {city:'Pelotas',stadium:'Bento Freitas',colors:['#d71920','#111111'],rivals:[]},
  'sao-luiz': {city:'Ijuí',stadium:'19 de Outubro',colors:['#d71920','#ffffff'],rivals:[]},
  'guarany-bage': {city:'Bagé',stadium:'Estrela D’Alva',colors:['#d71920','#ffffff'],rivals:[]},
  'flamengo': {city:'Rio de Janeiro',stadium:'Maracanã',colors:['#c8102e','#111111'],fanbaseDomestic:100,fanbaseGlobal:73,prestige:94,finance:97,youth:88,rivals:['vasco','fluminense','botafogo-rj']},
  'corinthians': {city:'São Paulo',stadium:'Neo Química Arena',colors:['#111111','#ffffff'],fanbaseDomestic:98,fanbaseGlobal:64,prestige:90,finance:88,youth:82,rivals:['palmeiras','sao-paulo','santos']},
  'palmeiras': {city:'São Paulo',stadium:'Allianz Parque',colors:['#126b45','#ffffff'],fanbaseDomestic:90,fanbaseGlobal:61,prestige:95,finance:98,youth:91,rivals:['corinthians','sao-paulo','santos']},
  'sao-paulo': {city:'São Paulo',stadium:'MorumBIS',colors:['#ffffff','#d71920','#111111'],fanbaseDomestic:89,fanbaseGlobal:62,prestige:92,finance:84,youth:90,rivals:['corinthians','palmeiras','santos']},
  'santos': {city:'Santos',stadium:'Vila Belmiro',colors:['#ffffff','#111111'],fanbaseDomestic:77,fanbaseGlobal:63,prestige:90,finance:70,youth:96,rivals:['corinthians','palmeiras','sao-paulo']},
  'atletico-mg': {city:'Belo Horizonte',stadium:'Arena MRV',colors:['#111111','#ffffff'],fanbaseDomestic:77,fanbaseGlobal:40,prestige:87,finance:87,youth:79,rivals:['cruzeiro']},
  'cruzeiro': {city:'Belo Horizonte',stadium:'Mineirão',colors:['#1256a0','#ffffff'],fanbaseDomestic:80,fanbaseGlobal:45,prestige:89,finance:82,youth:82,rivals:['atletico-mg']},
  'vasco': {city:'Rio de Janeiro',stadium:'São Januário',colors:['#111111','#ffffff'],fanbaseDomestic:84,fanbaseGlobal:48,prestige:86,finance:75,youth:84,rivals:['flamengo','fluminense','botafogo-rj']},
  'fluminense': {city:'Rio de Janeiro',stadium:'Maracanã',colors:['#7a1731','#167447','#ffffff'],fanbaseDomestic:69,fanbaseGlobal:41,prestige:86,finance:78,youth:87,rivals:['flamengo','vasco','botafogo-rj']},
  'botafogo-rj': {city:'Rio de Janeiro',stadium:'Nilton Santos',colors:['#111111','#ffffff'],fanbaseDomestic:70,fanbaseGlobal:42,prestige:87,finance:90,youth:79,rivals:['flamengo','fluminense','vasco']},
  'athletico-pr': {city:'Curitiba',stadium:'Ligga Arena',colors:['#d71920','#111111'],fanbaseDomestic:58,fanbaseGlobal:24,prestige:81,finance:80,youth:86,rivals:['coritiba']},
  'coritiba': {city:'Curitiba',stadium:'Couto Pereira',colors:['#18734a','#ffffff'],fanbaseDomestic:57,fanbaseGlobal:19,prestige:74,finance:60,youth:76,rivals:['athletico-pr']},
  'bahia': {city:'Salvador',stadium:'Arena Fonte Nova',colors:['#1b5ca8','#d71920','#ffffff'],fanbaseDomestic:72,fanbaseGlobal:31,prestige:81,finance:91,youth:84,rivals:['vitoria-ba']},
  'vitoria-ba': {city:'Salvador',stadium:'Barradão',colors:['#d71920','#111111'],fanbaseDomestic:60,fanbaseGlobal:20,prestige:73,finance:61,youth:72,rivals:['bahia']},
  'chapecoense': {city:'Chapecó',stadium:'Arena Condá',colors:['#168447','#ffffff'],fanbaseDomestic:44,fanbaseGlobal:17,prestige:67,finance:53,youth:61,rivals:[]},
  'mirassol': {city:'Mirassol',stadium:'José Maria de Campos Maia',colors:['#f5d21f','#168447'],fanbaseDomestic:28,fanbaseGlobal:7,prestige:65,finance:61,youth:75,rivals:[]},
  'bragantino': {city:'Bragança Paulista',stadium:'Nabi Abi Chedid',colors:['#ffffff','#d71920'],fanbaseDomestic:26,fanbaseGlobal:14,prestige:72,finance:91,youth:88,rivals:[]},
  'remo': {city:'Belém',stadium:'Baenão',colors:['#173f8a','#ffffff'],fanbaseDomestic:55,fanbaseGlobal:14,prestige:70,finance:58,youth:67,rivals:['paysandu']}
};

function build(division: Division, seeds: Seed[]): Club[] {
  return seeds.map(([id,name,state='']) => {
    const base = divisionBase[division];
    const override = rich[id] ?? {};
    return {
      id,name,shortName:name,state,
      city:'A DEFINIR',stadium:'A DEFINIR',division,
      colors:['#4f5966','#f5f5f2'],rivals:[],
      ...base,
      ...override
    };
  });
}

export const BRAZIL_CLUBS_2026: Club[] = [...build('A',A),...build('B',B),...build('C',C),...build('D',D)];
export const CLUB_BY_ID = Object.fromEntries(BRAZIL_CLUBS_2026.map(c => [c.id,c])) as Record<string,Club>;

if (BRAZIL_CLUBS_2026.length !== 156) {
  throw new Error(`Brazil 2026 club seed must contain 156 clubs, found ${BRAZIL_CLUBS_2026.length}`);
}
