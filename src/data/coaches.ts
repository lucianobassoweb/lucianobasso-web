import type { CoachIdentity } from '../core/types.js';

// Identity sources are historical. Behavioural ratings belong to the simulation.
export const COACH_SOURCES = {
  "FIFA2022": {
    "url": "https://fdp.fifa.org/assetspublic/ce44/pdf/SquadLists-English.pdf",
    "date": "2022-12-18",
    "scope": "Identidades e nacionalidades dos selecionadores; referência histórica, sem cargo atual."
  },
  "UEFA2025": {
    "url": "https://www.uefa.com/uefachampionsleague/news/0291-1bc1ed5a7dfc-022b586a26e4-1000--meet-the-champions-league-inaugural-league-phase-teams/",
    "date": "2025-01-28",
    "scope": "Identidades dos treinadores da fase de liga 2024/25; referência histórica."
  },
  "BRA2025": {
    "url": "https://www.itatiaia.com.br/esportes/futebol/futebol-nacional/brasileirao-serie-a/brasileirao-2025-tudo-sobre-os-20-tecnicos-da-competicao/",
    "date": "2025-03-27",
    "scope": "Identidades/nacionalidades no início da Série A 2025."
  },
  "COPA2026": {
    "url": "https://ge.globo.com/rs/futebol/copa-do-brasil/noticia/2026/08/07/copa-do-brasil-tem-maior-numero-de-tecnicos-estrangeiros-nas-quartas-da-historia-veja-lista.ghtml",
    "date": "2026-08-07",
    "scope": "Identidades em listas históricas de quartas; não usar como plantel atual."
  },
  "C2025": {
    "url": "https://ge.globo.com/pb/futebol/brasileirao-serie-c/noticia/2025/04/07/serie-c-2025-bate-a-porta-apenas-um-clube-segue-sem-treinador.ghtml",
    "date": "2025-04-07",
    "scope": "Identidades da Série C; inclui João Burse citado no texto."
  }
};
export const REAL_COACHES: CoachIdentity[] = [
  {
    "id": "lionel-scaloni",
    "name": "Lionel Scaloni",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Argentina"
  },
  {
    "id": "graham-arnold",
    "name": "Graham Arnold",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Australia"
  },
  {
    "id": "roberto-martinez",
    "name": "Roberto Martínez",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Spain"
  },
  {
    "id": "tite",
    "name": "Tite",
    "market": "BRAZIL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "rigobert-song",
    "name": "Rigobert Song",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Cameroon"
  },
  {
    "id": "john-herdman",
    "name": "John Herdman",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "England"
  },
  {
    "id": "luis-fernando-suarez",
    "name": "Luis Fernando Suárez",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Colombia"
  },
  {
    "id": "zlatko-dalic",
    "name": "Zlatko Dalić",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Croatia"
  },
  {
    "id": "kasper-hjulmand",
    "name": "Kasper Hjulmand",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Denmark"
  },
  {
    "id": "gustavo-alfaro",
    "name": "Gustavo Alfaro",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Argentina"
  },
  {
    "id": "gareth-southgate",
    "name": "Gareth Southgate",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "England"
  },
  {
    "id": "didier-deschamps",
    "name": "Didier Deschamps",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "France"
  },
  {
    "id": "hansi-flick",
    "name": "Hansi Flick",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022",
      "UEFA2025"
    ],
    "nationality": "Germany"
  },
  {
    "id": "otto-addo",
    "name": "Otto Addo",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Ghana"
  },
  {
    "id": "carlos-queiroz",
    "name": "Carlos Queiroz",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Portugal"
  },
  {
    "id": "hajime-moriyasu",
    "name": "Hajime Moriyasu",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Japan"
  },
  {
    "id": "paulo-bento",
    "name": "Paulo Bento",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Portugal"
  },
  {
    "id": "gerardo-martino",
    "name": "Gerardo Martino",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Argentina"
  },
  {
    "id": "walid-regragui",
    "name": "Walid Regragui",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Morocco"
  },
  {
    "id": "louis-van-gaal",
    "name": "Louis van Gaal",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Netherlands",
    "historicalOnly": true
  },
  {
    "id": "czesaw-michniewicz",
    "name": "Czesław Michniewicz",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Poland"
  },
  {
    "id": "fernando-santos",
    "name": "Fernando Santos",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Portugal"
  },
  {
    "id": "felix-sanchez",
    "name": "Félix Sánchez",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Spain"
  },
  {
    "id": "herve-renard",
    "name": "Hervé Renard",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "France"
  },
  {
    "id": "aliou-cisse",
    "name": "Aliou Cissé",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Senegal"
  },
  {
    "id": "dragan-stojkovic",
    "name": "Dragan Stojković",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Serbia"
  },
  {
    "id": "luis-enrique",
    "name": "Luis Enrique",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022",
      "UEFA2025"
    ],
    "nationality": "Spain"
  },
  {
    "id": "murat-yakin",
    "name": "Murat Yakin",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Switzerland"
  },
  {
    "id": "jalel-kadri",
    "name": "Jalel Kadri",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Tunisia"
  },
  {
    "id": "diego-alonso",
    "name": "Diego Alonso",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Uruguay"
  },
  {
    "id": "gregg-berhalter",
    "name": "Gregg Berhalter",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "USA"
  },
  {
    "id": "rob-page",
    "name": "Rob Page",
    "market": "GLOBAL",
    "sources": [
      "FIFA2022"
    ],
    "nationality": "Wales"
  },
  {
    "id": "mikel-arteta",
    "name": "Mikel Arteta",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "unai-emery",
    "name": "Unai Emery",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "gian-piero-gasperini",
    "name": "Gian Piero Gasperini",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "diego-simeone",
    "name": "Diego Simeone",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "vincent-kompany",
    "name": "Vincent Kompany",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "bruno-lage",
    "name": "Bruno Lage",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "vincenzo-italiano",
    "name": "Vincenzo Italiano",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "eric-roy",
    "name": "Éric Roy",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "brendan-rodgers",
    "name": "Brendan Rodgers",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "nicky-hayen",
    "name": "Nicky Hayen",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "vladan-milojevic",
    "name": "Vladan Milojević",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "mike-tullberg",
    "name": "Mike Tullberg",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "brian-priske",
    "name": "Brian Priske",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "michel",
    "name": "Míchel",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "fabio-cannavaro",
    "name": "Fabio Cannavaro",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "simone-inzaghi",
    "name": "Simone Inzaghi",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "marco-rose",
    "name": "Marco Rose",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "xabi-alonso",
    "name": "Xabi Alonso",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "bruno-genesio",
    "name": "Bruno Génésio",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "arne-slot",
    "name": "Arne Slot",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "josep-guardiola",
    "name": "Josep Guardiola",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "sergio-conceicao",
    "name": "Sérgio Conceição",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "adi-hutter",
    "name": "Adi Hütter",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "peter-bosz",
    "name": "Peter Bosz",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "carlo-ancelotti",
    "name": "Carlo Ancelotti",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "thomas-letsch",
    "name": "Thomas Letsch",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "marino-pusic",
    "name": "Marino Pušić",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "vladimir-weiss",
    "name": "Vladimír Weiss",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "lars-friis",
    "name": "Lars Friis",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "rui-borges",
    "name": "Rui Borges",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "jurgen-saumel",
    "name": "Jürgen Säumel",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "sebastian-hoeness",
    "name": "Sebastian Hoeness",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "giorgio-contini",
    "name": "Giorgio Contini",
    "market": "GLOBAL",
    "sources": [
      "UEFA2025"
    ]
  },
  {
    "id": "cuca",
    "name": "Cuca",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "leonardo-jardim",
    "name": "Leonardo Jardim",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Portugal"
  },
  {
    "id": "juan-pablo-vojvoda",
    "name": "Juan Pablo Vojvoda",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Argentina"
  },
  {
    "id": "leo-conde",
    "name": "Léo Condé",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "pepa",
    "name": "Pepa",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Portugal"
  },
  {
    "id": "rogerio-ceni",
    "name": "Rogério Ceni",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "thiago-carpini",
    "name": "Thiago Carpini",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "ramon-diaz",
    "name": "Ramón Díaz",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Argentina"
  },
  {
    "id": "luis-zubeldia",
    "name": "Luis Zubeldía",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Argentina"
  },
  {
    "id": "abel-ferreira",
    "name": "Abel Ferreira",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Portugal"
  },
  {
    "id": "pedro-caixinha",
    "name": "Pedro Caixinha",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Portugal"
  },
  {
    "id": "fernando-seabra",
    "name": "Fernando Seabra",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "rafael-guanaes",
    "name": "Rafael Guanaes",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "filipe-luis",
    "name": "Filipe Luís",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "mano-menezes",
    "name": "Mano Menezes",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "fabio-carille",
    "name": "Fábio Carille",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "renato-paiva",
    "name": "Renato Paiva",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Portugal"
  },
  {
    "id": "gustavo-quinteros",
    "name": "Gustavo Quinteros",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Argentina"
  },
  {
    "id": "roger-machado",
    "name": "Roger Machado",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "fabio-matias",
    "name": "Fábio Matias",
    "market": "BRAZIL",
    "sources": [
      "BRA2025"
    ],
    "nationality": "Brazil"
  },
  {
    "id": "artur-jorge",
    "name": "Artur Jorge",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "eduardo-dominguez",
    "name": "Eduardo Domínguez",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "luis-castro",
    "name": "Luís Castro",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "pedro-emanuel",
    "name": "Pedro Emanuel",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "paulo-pezzolano",
    "name": "Paulo Pezzolano",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "jair-ventura",
    "name": "Jair Ventura",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "davide-ancelotti",
    "name": "Davide Ancelotti",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "fernando-diniz",
    "name": "Fernando Diniz",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "dorival-junior",
    "name": "Dorival Júnior",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "jorge-sampaoli",
    "name": "Jorge Sampaoli",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "odair-hellmann",
    "name": "Odair Hellmann",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "renato-gaucho",
    "name": "Renato Gaúcho",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "gabriel-milito",
    "name": "Gabriel Milito",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "rafael-paiva",
    "name": "Rafael Paiva",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "martin-varini",
    "name": "Martín Varini",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "vagner-mancini",
    "name": "Vagner Mancini",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "vanderlei-luxemburgo",
    "name": "Vanderlei Luxemburgo",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ],
    "historicalOnly": true
  },
  {
    "id": "wesley-carvalho",
    "name": "Wesley Carvalho",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "jorginho",
    "name": "Jorginho",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "vitor-pereira",
    "name": "Vítor Pereira",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "luiz-felipe-scolari",
    "name": "Luiz Felipe Scolari",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ],
    "historicalOnly": true
  },
  {
    "id": "paulo-autuori",
    "name": "Paulo Autuori",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "hernan-crespo",
    "name": "Hernán Crespo",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "marcao",
    "name": "Marcão",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "guto-ferreira",
    "name": "Guto Ferreira",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "allan-aal",
    "name": "Allan Aal",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "lisca",
    "name": "Lisca",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "abel-braga",
    "name": "Abel Braga",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ],
    "historicalOnly": true
  },
  {
    "id": "rodrigo-santana",
    "name": "Rodrigo Santana",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "jorge-jesus",
    "name": "Jorge Jesus",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "tiago-nunes",
    "name": "Tiago Nunes",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "enderson-moreira",
    "name": "Enderson Moreira",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "mauricio-barbieri",
    "name": "Maurício Barbieri",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "osmar-loss",
    "name": "Osmar Loss",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "gilson-kleina",
    "name": "Gilson Kleina",
    "market": "BRAZIL",
    "sources": [
      "COPA2026"
    ]
  },
  {
    "id": "evaristo-piza",
    "name": "Evaristo Piza",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "angelo-luiz",
    "name": "Ângelo Luiz",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "filipe-gouveia",
    "name": "Filipe Gouveia",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "luizinho-vieira",
    "name": "Luizinho Vieira",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "waguinho-dias",
    "name": "Waguinho Dias",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "higo-magalhaes",
    "name": "Higo Magalhães",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "thiago-carvalho",
    "name": "Thiago Carvalho",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "leston-junior",
    "name": "Leston Júnior",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "mauricio-souza",
    "name": "Maurício Souza",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "roberto-cavalo",
    "name": "Roberto Cavalo",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "mazola-junior",
    "name": "Mazola Júnior",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "claudinei-oliveira",
    "name": "Claudinei Oliveira",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "jorge-castilho",
    "name": "Jorge Castilho",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "marquinhos-santos",
    "name": "Marquinhos Santos",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "alberto-valentim",
    "name": "Alberto Valentim",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "milton-mendes",
    "name": "Milton Mendes",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "ricardo-catala",
    "name": "Ricardo Catalá",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "raul-cabral",
    "name": "Raul Cabral",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "matheus-costa",
    "name": "Matheus Costa",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  },
  {
    "id": "joao-burse",
    "name": "João Burse",
    "market": "REGIONAL",
    "sources": [
      "C2025"
    ]
  }
];
export const COACH_BY_ID: Record<string,CoachIdentity> = Object.fromEntries(REAL_COACHES.map(c=>[c.id,c]));

// Editorial translations of documented sporting tendencies; numeric values remain game parameters.
export const COACH_TENDENCIES:Record<string,{values:Partial<import('../core/types.js').CoachProfile>;url:string;basis:string}>={
  'josep-guardiola':{values:{style:'POSSESSION',flexibility:82,preferredRole:'MOBILE'},url:'https://www.mancity.com/news/first-team/first-team-news/2016/july/pep-guardiola-talking-tactics',basis:'Posse e reconversão de funções descritas pelo clube; intensidade numérica é editorial.'},
  'abel-ferreira':{values:{youth:78},url:'https://www.palmeiras.com.br/centro-de-formacao/',basis:'Integração base-profissional documentada pelo clube; nota de apoio é editorial.'},
  'hansi-flick':{values:{preferredRole:'MOBILE'},url:'https://www.fcbarcelona.com/en/football/first-team/staff/4030694/flick',basis:'Pressão alta documentada pelo clube; função móvel é uma tradução simplificada.'},
  'carlo-ancelotti':{values:{flexibility:82,preferredRole:'BALANCED'},url:'https://cbf-hml.cbf.com.br/selecao-brasileira/noticias/selecao-masculina/a/ancelotti-um-pouco-de-concorrencia-e-bom-para-a-motivacao-de-cada-jogador',basis:'Testes de sistemas e concorrência por posição em entrevista publicada pela CBF; nota editorial.'}
};
