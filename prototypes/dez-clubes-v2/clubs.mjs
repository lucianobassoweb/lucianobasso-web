// Identities and divisions: CBF 2026. Numerical strength/prestige are fictional
// game parameters, not official rankings. Keep stable ids and legacy strengths.
export const CLUB_CATALOG_VERSION='brasil-ab-2026';
export const CLUB_SOURCES={
 A:'https://www.cbf.com.br/futebol-brasileiro/times/campeonato-brasileiro/serie-a/2026',
 B:'https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/Tabela_Basica_Brasileiro_Serie_B_2026_efe6ba77b5.pdf',
 checkedOn:'2026-10-01'
};
const entries=[
 // Série A — twenty participants, alphabetical order.
 ['athletico-pr','Athletico-PR','PR','A',73,70,'#9f2630'],
 ['atletico-mg','Atlético-MG','MG','A',76,80,'#353b45'],
 ['bahia','Bahia','BA','A',72,67,'#397bac'],
 ['botafogo','Botafogo','RJ','A',76,78,'#353b45'],
 ['chapecoense','Chapecoense','SC','A',63,52,'#418652'],
 ['corinthians','Corinthians','SP','A',76,85,'#353b45'],
 ['coritiba','Coritiba','PR','A',67,61,'#418652'],
 ['cruzeiro','Cruzeiro','MG','A',75,79,'#397bac'],
 ['flamengo','Flamengo','RJ','A',79,85,'#b6383c'],
 ['fluminense','Fluminense','RJ','A',75,77,'#742d49'],
 ['gremio','Grêmio','RS','A',75,77,'#3983b3'],
 ['internacional','Internacional','RS','A',74,76,'#b6383c'],
 ['mirassol','Mirassol','SP','A',65,45,'#9a822d'],
 ['palmeiras','Palmeiras','SP','A',80,86,'#418652'],
 ['bragantino','Red Bull Bragantino','SP','A',69,58,'#aa3036'],
 ['remo','Remo','PA','A',62,53,'#374a70'],
 ['santos','Santos','SP','A',71,79,'#353b45'],
 ['sao-paulo','São Paulo','SP','A',75,82,'#aa3036'],
 ['vasco','Vasco','RJ','A',71,69,'#343944'],
 ['vitoria','Vitória','BA','A',66,59,'#aa3036'],
 // Série B — twenty participants, alphabetical order.
 ['america-mg','América-MG','MG','B',58,52,'#418652'],
 ['athletic','Athletic','MG','B',53,32,'#353b45'],
 ['atletico-go','Atlético-GO','GO','B',61,48,'#aa3036'],
 ['avai','Avaí','SC','B',58,48,'#397bac'],
 ['botafogo-sp','Botafogo-SP','SP','B',52,37,'#aa3036'],
 ['ceara','Ceará','CE','B',64,57,'#353b45'],
 ['crb','CRB','AL','B',56,44,'#b6383c'],
 ['criciuma','Criciúma','SC','B',63,51,'#9a822d'],
 ['cuiaba','Cuiabá','MT','B',60,44,'#467741'],
 ['fortaleza','Fortaleza','CE','B',67,63,'#397bac'],
 ['goias','Goiás','GO','B',63,55,'#418652'],
 ['juventude','Juventude','RS','B',59,47,'#418652'],
 ['londrina','Londrina','PR','B',50,36,'#3983b3'],
 ['nautico','Náutico','PE','B',55,46,'#b6383c'],
 ['novorizontino','Novorizontino','SP','B',62,42,'#9a822d'],
 ['operario-pr','Operário-PR','PR','B',57,38,'#353b45'],
 ['ponte-preta','Ponte Preta','SP','B',61,49,'#353b45'],
 ['sao-bernardo','São Bernardo','SP','B',54,35,'#9a822d'],
 ['sport','Sport','PE','B',64,59,'#aa3036'],
 ['vila-nova','Vila Nova','GO','B',59,45,'#b6383c'],
 // Saved regional projects remain resolvable, outside the forty-team A/B pool.
 ['sao-luiz','São Luiz','RS','REGIONAL',43,20,'#b12c35'],
 ['brasil-pelotas','Brasil de Pelotas','RS','REGIONAL',47,28,'#9f2630'],
 ['caxias','Caxias','RS','REGIONAL',51,34,'#742d49'],
 ['ypiranga','Ypiranga','RS','REGIONAL',54,38,'#467741']
];
export const CLUBS=entries.map(([id,name,state,division,level,prestige,color])=>({id,name,shortName:name,state,division,divisionLabel:division==='REGIONAL'?'Circuito de transição':`Série ${division}`,level,prestige,color}));
export const ENTRY_CLUB_IDS=['londrina','botafogo-sp','athletic'];
export const LEGACY_CLUB_IDS=['sao-luiz','brasil-pelotas','caxias','ypiranga','juventude','ponte-preta','vitoria','vasco','gremio','flamengo'];
