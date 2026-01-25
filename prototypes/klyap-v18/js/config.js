/**
 * KLYAP v18 — Configuration
 * All constants and configuration objects
 */

// ====== TIMING ======
export const CYCLE_DURATION = 20000; // 20 seconds (v18.4)
export const MAX_FRAGMENT_REPETITIONS = 3; // Increased for 20s cycle

// ====== MAIN CONFIG ======
export const CONFIG = {
    fragmentCount: 43,
    maxActiveFragments: 12,

    // Time-based phases (v18.4 20s cycle — 0.5x duration, tighter intervals)
    phases: {
        sparse: { start: 0, end: 7500, interval: 1000, variance: 250 },      // 0-7.5s
        hook: { start: 7500, end: 15000, interval: 450, variance: 100 },      // 7.5-15s
        overwhelm: { start: 15000, end: 19000, interval: 200, variance: 40 }, // 15-19s
        fade: { start: 19000, end: 20000, interval: 2000, variance: 0 }       // 19-20s
    },

    // Increased lifetime for smoother overlap in faster cycle
    fragmentLifetime: { min: 4, max: 7 },
    burstChance: 0.08,
    burstCount: [4, 8],
    voidChance: 0.015,
    voidDuration: [800, 1500],
    exhaustionThreshold: 1500,
    exhaustionPenalty: 2.0,
    exhaustionDecay: 0.995,

    // Timing constants
    timing: {
        INITIAL_DELAY: 1200,
        SCROLL_BOOST_FACTOR: 0.3,
        MIN_SPAWN_INTERVAL: 100
    },

    // Meta-messages rescaled for 20s cycle
    metaMessages: [
        { time: 2500, text: "ты здесь" },          // 5000 → 2500 (sparse phase)
        { time: 9000, text: "время замедляется" }, // 18000 → 9000 (hook phase)
        { time: 14000, text: "кто смотрит?" },     // 28000 → 14000 (late hook)
        { time: 17500, text: "можно остановиться" } // 35000 → 17500 (overwhelm)
    ]
};

// ====== MEMBRANE CONFIG ======
export const MEMBRANE_CONFIG = {
    blobCount: 5,
    baseOpacity: 0.6,
    saturation: 40,
    lightness: 15,
    breathSpeed: 0.25,
    cursorInfluence: 0.08
};

// ====== LAYER SYSTEM ======
export const FRAGMENT_BASE = '/assets/klyap-v16/fragments';

export const LAYER_MAP = {
    intimate: ['001', '002', '003', '004', '005', '006', '007'],
    mirror: ['001', '002', '003', '004', '005', '006'],
    visceral: ['001', '002', '003', '004', '005', '006'],
    noise: ['001', '002', '003', '004'],
    vivid: ['001', '002', '003', '004', '005'],
    flesh: ['001', '002', '003']
};

export const LAYER_THRESHOLDS = [
    { depth: 0, layer: 'noise' },
    { depth: 12, layer: 'intimate' },
    { depth: 25, layer: 'vivid' },
    { depth: 40, layer: 'mirror' },
    { depth: 55, layer: 'flesh' },
    { depth: 70, layer: 'visceral' },
    { depth: 85, layer: 'noise' }
];

// ====== DISPLACEMENT ======
export const DISPLACEMENT_INTENSITY = {
    'noise→intimate': 30,
    'intimate→vivid': 45,
    'vivid→mirror': 55,
    'mirror→flesh': 50,
    'flesh→visceral': 70,
    'visceral→noise': 40,
    'default': 35
};

export const DISPLACEMENT_DECAY = 0.92;

// ====== BUBBLE CONFIG ======
export const BUBBLE_CONFIG = {
    IDLE_THRESHOLD_FOR_TRIGGER: 5,
    MAX_BUBBLES: 5,
    PROXIMITY_RADIUS: 150,
    PROXIMITY_PULL: 0.1,
    WHISPER_DELAY: 1500
};

// ====== PARTICLE CONFIG ======
export const PARTICLE_CONFIG = {
    MAX_PARTICLES: 300,
    PER_FRAGMENT: { min: 15, max: 25 },
    ASSEMBLY: { min: 20, max: 35 },
    WIND_SWEEP_CHANCE: 0.05
};

// ====== TEMPORAL DISPLACEMENT (v18.1) ======
export const TEMPORAL_DISPLACEMENT = {
    enabled: true,
    initialFragmentCount: 4,         // 40-60% от пиковой активности
    initialLayer: 'intimate',         // Hook layer — "почти знакомое"
    initialMorphCount: 2,             // Морфов при старте
    shockPauseDuration: 1500          // Пауза после первого удара (ms)
};

// ====== MORPH VARIANTS (v18.5) ======
export const MORPH_VARIANTS = {
    subtle: { intensity: 0.3, duration: 1500 },       // Мягкое перетекание
    aggressive: { intensity: 0.8, duration: 800 },    // Резкий разрыв
    'slow-burn': { intensity: 0.5, duration: 2500 },  // Медленная трансформация
    glitch: { intensity: 1.0, duration: 400 },        // Мгновенный сбой
    jelly: { intensity: 0.4, duration: 2000, easing: 'sine.inOut' }  // Желейное перетекание
};

export const PERIODIC_MORPH = {
    enabled: true,
    frequency: 2   // Каждый N-й фрагмент (v18.5: increased)
};

// ====== MORPH WEIGHTS (v18.5) ======
// 80% smooth (jelly, slow-burn, subtle), 20% sharp (aggressive, glitch)
export const MORPH_WEIGHTS = {
    jelly: 35,
    'slow-burn': 30,
    subtle: 15,
    aggressive: 12,
    glitch: 8
};

// ====== LAYER PARTICLE COLORS ======
export const LAYER_PARTICLE_COLORS = {
    noise: ['hsla(0, 0%, 20%, 0.8)', 'hsla(0, 0%, 30%, 0.7)', 'hsla(280, 10%, 15%, 0.9)'],
    intimate: ['hsla(35, 40%, 35%, 0.8)', 'hsla(25, 50%, 25%, 0.9)', 'hsla(40, 30%, 20%, 0.7)'],
    vivid: ['hsla(300, 60%, 40%, 0.8)', 'hsla(320, 50%, 30%, 0.9)', 'hsla(280, 70%, 35%, 0.7)'],
    mirror: ['hsla(180, 50%, 35%, 0.8)', 'hsla(200, 40%, 25%, 0.9)', 'hsla(160, 60%, 30%, 0.7)'],
    flesh: ['hsla(10, 40%, 40%, 0.8)', 'hsla(350, 35%, 30%, 0.9)', 'hsla(20, 50%, 35%, 0.7)'],
    visceral: ['hsla(0, 60%, 30%, 0.85)', 'hsla(350, 70%, 25%, 0.9)', 'hsla(10, 50%, 20%, 0.8)']
};

// ====== TEXT PHRASES ======
export const TEXT_PHRASES = [
    '...продолжается', 'распирает', 'глубже', 'ещё', 'не останавливайся',
    'внутрь', 'растворяет', 'тяжело', 'сладко', 'снова'
];

// ====== ECHO FRAGMENTS (v18.6) ======
export const ECHO_CONFIG = {
    frequency: 3,          // Каждый N-й спавн
    copies: 2,             // Количество копий
    opacity: 0.3,
    delays: [100, 200],    // ms задержки
    offsets: [15, -15],    // px смещение
    lifespan: 400          // ms до fade out
};

// ====== Z-AXIS INVASION (v18.6) ======
export const Z_INVASION_CONFIG = {
    frequency: 7,          // Каждый N-й спавн
    scales: [1, 3, 1.2],   // scale keyframes
    duration: 600,
    easing: 'elastic.out(1, 0.5)'
};

// ====== FILMSTRIP (v18.6) ======
export const FILMSTRIP_CONFIG = {
    startTime: 8000,       // 8s
    endTime: 13000,        // 13s
    width: 80,             // px
    initialSpeed: 100,     // px/s
    acceleration: 1.5      // exponential factor
};

// ====== GHOST TEXT (v18.6) ======
export const GHOST_TEXT_CONFIG = {
    phrases: ['...ещё', 'глубже', 'не смотри', 'продолжай', 'здесь', 'теплее'],
    fadeTime: 800,         // ms after mouse stops
    maxOpacity: 0.6,
    maxActive: 3
};

// ====== TACTILE EFFECTS (v18.6) ======
export const TACTILE_CONFIG = {
    vibrationRange: 3,           // px
    focusBlurPeriod: 8000,       // ms (8s cycle)
    focusBlurMax: 1.5,           // px
    chromaticOffset: 2,          // px RGB split
    chromaticDuration: 300       // ms
};

// ====== AUTISTIC DATA (v18.6) ======
export const AUTISTIC_DATA_CONFIG = {
    enabled: true,
    updateInterval: 16           // ~60fps
};

// ====== IDIOTIC ELEMENTS (v18.6) ======
export const IDIOTIC_CONFIG = {
    cursorWaitChance: 0.02,      // 2% on spawn
    cursorWaitDuration: [500, 1500],
    ghostCursorDelays: [50, 100, 150],
    ghostCursorOpacity: 0.2
};

// ====== RANSOM NOTE TYPOGRAPHY (v18.7.1 — UPGRADED) ======
export const RANSOM_CONFIG = {
    enabled: true,
    chance: 0.20,                     // 20% — реже, но impact больше

    fonts: [
        'Georgia, serif',
        'Impact, sans-serif',              // TABLOID HEADER
        'Arial Black, sans-serif',         // Bold sans
        'Courier New, monospace',
        'Times New Roman, serif',
        '"Palatino Linotype", serif',
        '"Trebuchet MS", sans-serif',
        'Verdana, sans-serif'
    ],

    rotation: { min: -25, max: 25 },       // Более агрессивный
    scale: { min: 0.7, max: 1.8 },         // Шире
    hueShift: { min: -30, max: 30 },       // degrees

    // Вариации приклеенности
    tapeChance: 0.12,                      // 12% имеют "скотч"
    invertedChance: 0.08,                  // 8% инвертированные (белый на чёрном)
    bloodSpeckChance: 0.05,                // 5% с красным пятном
    overlapChance: 0.10,                   // 10% налезают на соседнюю

    staggerDelay: 45,                      // Быстрее

    // Контрастные фоны
    backgrounds: [
        '#f5f5dc',   // beige (newspaper)
        '#ffffff',   // pure white (magazine)
        '#d4d4aa',   // old paper yellow
        '#e8e0d0',   // aged parchment
        '#c0c0c0',   // grey (tabloid)
    ],

    missChance: 0.15,
    tornEdgeChance: 0.35                   // 35% — больше неровности
};
