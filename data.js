/**
 * UNIBIKE — Dados de produtos
 * Estrutura preparada para integração futura com Firebase Firestore.
 * Cada produto segue o schema completo compatível com Firestore documents.
 */

window.UNIBIKE = window.UNIBIKE || {};

window.UNIBIKE.config = {
    whatsapp: "554396152886",
    whatsappUrl: "https://wa.me/554396152886",
    storeName: "UNIBIKE",
    city: "Ribeirão Claro - PR",
    address: "Rua Dr. Xavier da Silva, Centro",
    owner: "Juarez Furquim Leonel",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bicicletaria%20UNIBIKE%20Ribeir%C3%A3o%20Claro%20PR",
    mapsEmbed: "https://www.google.com/maps?q=Bicicletaria+UNIBIKE%2C+Ribeir%C3%A3o+Claro+PR&output=embed"
};

window.UNIBIKE.categories = [
    { key: "todas",       label: "Todas",              icon: "grid" },
    { key: "mtb",         label: "Mountain Bike",      icon: "mtb" },
    { key: "urbana",      label: "Urbana",             icon: "urbana" },
    { key: "infantil",    label: "Infantil",           icon: "infantil" },
    { key: "eletrica",    label: "Elétrica",           icon: "eletrica" },
    { key: "pecas",       label: "Peças",              icon: "pecas" },
    { key: "acessorios",  label: "Acessórios",         icon: "acessorios" },
    { key: "skates",      label: "Skates",             icon: "skates" }
];

window.UNIBIKE.conditions = [
    { key: "todas",    label: "Todas as condições" },
    { key: "nova",     label: "Nova" },
    { key: "seminova", label: "Seminova" },
    { key: "usada",    label: "Usada" }
];

/**
 * Schema de produto (Firebase Firestore ready):
 * {
 *   id:          string   — identificador único (vira document ID no Firestore)
 *   name:        string   — nome do produto
 *   brand:       string   — marca
 *   model:       string   — modelo
 *   category:    string   — chave de categoria
 *   condition:   string   — nova | seminova | usada
 *   price:       number|null — null = sob consulta
 *   description: string
 *   specs:       object   — especificações técnicas (aro, marchas, freio, quadro...)
 *   images:      string[] — URLs (Firebase Storage); vazio = placeholder SVG
 *   tags:        string[]
 *   featured:    boolean  — aparece na home
 *   available:   boolean
 *   createdAt:   string   — ISO date
 * }
 */
window.UNIBIKE.products = [
    {
        id: "bike-001",
        name: "Bicicleta MTB Aro 29",
        brand: "Genérica",
        model: "Trail 29",
        category: "mtb",
        condition: "nova",
        price: null,
        description: "Bicicleta mountain bike aro 29 com quadro em alumínio, ideal para trilhas e uso esportivo. Consulte disponibilidade e valor com a UNIBIKE.",
        specs: {
            aro: "29",
            marchas: "21",
            freio: "V-brake",
            quadro: "Alumínio",
            suspensao: "Dianteira"
        },
        images: [],
        tags: ["mtb", "adulto", "aro29"],
        featured: true,
        available: true,
        createdAt: "2024-01-01"
    },
    {
        id: "bike-002",
        name: "MTB Full Suspension Aro 26",
        brand: "Genérica",
        model: "XC 26",
        category: "mtb",
        condition: "seminova",
        price: null,
        description: "Mountain bike seminova com suspensão dianteira e traseira. Ótimo estado de conservação. Consulte condições com a UNIBIKE.",
        specs: {
            aro: "26",
            marchas: "18",
            freio: "Disco mecânico",
            quadro: "Alumínio",
            suspensao: "Full"
        },
        images: [],
        tags: ["mtb", "adulto", "aro26", "full-suspension"],
        featured: true,
        available: true,
        createdAt: "2024-01-02"
    },
    {
        id: "bike-003",
        name: "Bicicleta Urbana Aro 700",
        brand: "Genérica",
        model: "City Ride",
        category: "urbana",
        condition: "nova",
        price: null,
        description: "Bicicleta urbana ideal para deslocamento diário, passeios e uso na cidade. Quadro leve e pneus para asfalto. Consulte com a UNIBIKE.",
        specs: {
            aro: "700c",
            marchas: "7",
            freio: "V-brake",
            quadro: "Aço",
            suspensao: "Sem"
        },
        images: [],
        tags: ["urbana", "adulto", "aro700", "cidade"],
        featured: true,
        available: true,
        createdAt: "2024-01-03"
    },
    {
        id: "bike-004",
        name: "Bicicleta de Passeio Aro 26",
        brand: "Genérica",
        model: "Passeio Classic",
        category: "urbana",
        condition: "usada",
        price: null,
        description: "Bicicleta de passeio usada em bom estado. Revisada na UNIBIKE. Ideal para uso casual e rotina local. Consulte disponibilidade.",
        specs: {
            aro: "26",
            marchas: "1",
            freio: "Contra pedal",
            quadro: "Aço",
            suspensao: "Sem"
        },
        images: [],
        tags: ["urbana", "adulto", "aro26", "passeio"],
        featured: false,
        available: true,
        createdAt: "2024-01-04"
    },
    {
        id: "bike-005",
        name: "Bicicleta Infantil Aro 16",
        brand: "Genérica",
        model: "Kids 16",
        category: "infantil",
        condition: "nova",
        price: null,
        description: "Bicicleta infantil com rodinhas de apoio removíveis. Indicada para crianças de 4 a 6 anos. Consulte disponibilidade na UNIBIKE.",
        specs: {
            aro: "16",
            marchas: "1",
            freio: "V-brake",
            quadro: "Aço",
            suspensao: "Sem"
        },
        images: [],
        tags: ["infantil", "aro16", "crianca"],
        featured: true,
        available: true,
        createdAt: "2024-01-05"
    },
    {
        id: "bike-006",
        name: "Bicicleta Infantil Aro 20",
        brand: "Genérica",
        model: "Kids 20",
        category: "infantil",
        condition: "seminova",
        price: null,
        description: "Bicicleta infantil seminova aro 20. Ideal para crianças de 6 a 9 anos. Bom estado, revisada na oficina da UNIBIKE.",
        specs: {
            aro: "20",
            marchas: "1",
            freio: "V-brake",
            quadro: "Aço",
            suspensao: "Sem"
        },
        images: [],
        tags: ["infantil", "aro20", "crianca"],
        featured: false,
        available: true,
        createdAt: "2024-01-06"
    },
    {
        id: "peca-001",
        name: "Câmara de Ar Aro 26",
        brand: "Genérica",
        model: "Válvula Schrader",
        category: "pecas",
        condition: "nova",
        price: null,
        description: "Câmara de ar aro 26 com válvula Schrader. Compatível com a maioria das bicicletas populares. Consulte disponibilidade.",
        specs: {
            aro: "26",
            valvula: "Schrader",
            espessura: "1.75-2.125"
        },
        images: [],
        tags: ["camara", "aro26", "peca", "pneu"],
        featured: false,
        available: true,
        createdAt: "2024-01-07"
    },
    {
        id: "peca-002",
        name: "Câmara de Ar Aro 29",
        brand: "Genérica",
        model: "Válvula Presta",
        category: "pecas",
        condition: "nova",
        price: null,
        description: "Câmara de ar aro 29 com válvula Presta. Indicada para MTB e bicicletas esportivas. Consulte disponibilidade na UNIBIKE.",
        specs: {
            aro: "29",
            valvula: "Presta",
            espessura: "2.0-2.4"
        },
        images: [],
        tags: ["camara", "aro29", "peca", "pneu"],
        featured: false,
        available: true,
        createdAt: "2024-01-08"
    },
    {
        id: "peca-003",
        name: "Corrente de Bicicleta",
        brand: "Genérica",
        model: "6/7/8v",
        category: "pecas",
        condition: "nova",
        price: null,
        description: "Corrente compatível com bicicletas de 6, 7 ou 8 velocidades. Recomendada para substituição preventiva. Consulte a UNIBIKE.",
        specs: {
            velocidades: "6/7/8v",
            elos: "116",
            material: "Aço"
        },
        images: [],
        tags: ["corrente", "peca", "transmissao"],
        featured: false,
        available: true,
        createdAt: "2024-01-09"
    },
    {
        id: "peca-004",
        name: "Pastilha de Freio a Disco",
        brand: "Genérica",
        model: "Semi-metálica",
        category: "pecas",
        condition: "nova",
        price: null,
        description: "Pastilha de freio a disco semi-metálica. Compatível com os principais modelos de freio mecânico disponíveis no mercado.",
        specs: {
            tipo: "Semi-metálica",
            freio: "Disco mecânico",
            compatibilidade: "Universal"
        },
        images: [],
        tags: ["freio", "pastilha", "peca", "disco"],
        featured: false,
        available: true,
        createdAt: "2024-01-10"
    },
    {
        id: "aces-001",
        name: "Capacete Ciclismo Adulto",
        brand: "Genérica",
        model: "Urban",
        category: "acessorios",
        condition: "nova",
        price: null,
        description: "Capacete para ciclismo urbano com ventilação e ajuste de encaixe. Disponível em tamanhos P, M e G. Consulte na UNIBIKE.",
        specs: {
            tamanhos: "P / M / G",
            ventilacao: "Sim",
            ajuste: "Dial traseiro"
        },
        images: [],
        tags: ["capacete", "seguranca", "acessorio"],
        featured: false,
        available: true,
        createdAt: "2024-01-11"
    },
    {
        id: "aces-002",
        name: "Bomba de Ar de Piso",
        brand: "Genérica",
        model: "Com manômetro",
        category: "acessorios",
        condition: "nova",
        price: null,
        description: "Bomba de ar de piso com manômetro para calibragem precisa. Compatível com válvulas Schrader e Presta. Consulte a UNIBIKE.",
        specs: {
            tipo: "Piso",
            manometro: "Sim",
            valvula: "Schrader e Presta",
            pressao: "até 160 PSI"
        },
        images: [],
        tags: ["bomba", "pneu", "acessorio"],
        featured: false,
        available: true,
        createdAt: "2024-01-12"
    },
    {
        id: "skat-001",
        name: "Skate Completo",
        brand: "Genérica",
        model: "Street",
        category: "skates",
        condition: "nova",
        price: null,
        description: "Skate completo para iniciantes e intermediários. Shape resistente, trucks de alumínio e rodas de alta qualidade. Consulte modelos disponíveis na UNIBIKE.",
        specs: {
            shape: "Laminado",
            trucks: "Alumínio",
            rodas: "PU 99A"
        },
        images: [],
        tags: ["skate", "street", "skates", "completo"],
        featured: true,
        available: true,
        createdAt: "2024-01-13"
    },
    {
        id: "skat-002",
        name: "Shape de Skate",
        brand: "Genérica",
        model: "Pro",
        category: "skates",
        condition: "nova",
        price: null,
        description: "Shape de skate em maple canadense de 7 camadas. Resistência e pop para manobras. Consulte estampas disponíveis na UNIBIKE.",
        specs: {
            material: "Maple 7 camadas",
            largura: "8.0\"",
            concavo: "Médio"
        },
        images: [],
        tags: ["shape", "skate", "skates", "maple"],
        featured: false,
        available: true,
        createdAt: "2024-01-14"
    },
    {
        id: "skat-003",
        name: "Rolamentos para Skate",
        brand: "Genérica",
        model: "ABEC-7",
        category: "skates",
        condition: "nova",
        price: null,
        description: "Rolamentos ABEC-7 para skate com alta velocidade e durabilidade. Jogo com 8 unidades. Consulte na UNIBIKE.",
        specs: {
            tipo: "ABEC-7",
            quantidade: "8 unidades",
            material: "Aço cromado"
        },
        images: [],
        tags: ["rolamentos", "skate", "skates", "abec7"],
        featured: false,
        available: true,
        createdAt: "2024-01-15"
    },
    {
        id: "bike-007",
        name: "Bicicleta Speed Aro 700",
        brand: "Genérica",
        model: "Road 700",
        category: "urbana",
        condition: "nova",
        price: null,
        description: "Bicicleta speed com guidão drop, pneus finos e quadro em alumínio. Ideal para percursos longos em asfalto. Consulte com a UNIBIKE.",
        specs: {
            aro: "700c",
            marchas: "14",
            freio: "Cantilever",
            quadro: "Alumínio",
            suspensao: "Sem"
        },
        images: [],
        tags: ["speed", "adulto", "aro700", "asfalto"],
        featured: true,
        available: true,
        createdAt: "2024-01-16"
    },
    {
        id: "bike-008",
        name: "MTB Aro 27.5 Hardtail",
        brand: "Genérica",
        model: "Trail 27",
        category: "mtb",
        condition: "nova",
        price: null,
        description: "Mountain bike aro 27.5 com suspensão dianteira e freios a disco. Versátil para trilhas e uso urbano. Consulte com a UNIBIKE.",
        specs: {
            aro: "27.5",
            marchas: "24",
            freio: "Disco mecânico",
            quadro: "Alumínio",
            suspensao: "Dianteira"
        },
        images: [],
        tags: ["mtb", "adulto", "aro27", "disco"],
        featured: false,
        available: true,
        createdAt: "2024-01-17"
    }
];

/* Produtos migrados para o Firestore — array acima mantido apenas como referência de schema. */
window.UNIBIKE.products = [];
