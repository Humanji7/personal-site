/**
 * KLYAP v18 — Configuration
 * All constants and configuration objects
 */

// ====== TIMING ======
export const CYCLE_DURATION = 40000; // 40 seconds
export const MAX_FRAGMENT_REPETITIONS = 3;

// ====== MAIN CONFIG ======
export const CONFIG = {
    fragmentCount: 43,
    maxActiveFragments: 12,

    // Time-based phases (v17 40s cycle)
    phases: {
        sparse: { start: 0, end: 15000, interval: 1500, variance: 400 },
        hook: { start: 15000, end: 30000, interval: 600, variance: 150 },
        overwhelm: { start: 30000, end: 38000, interval: 250, variance: 50 },
        fade: { start: 38000, end: 40000, interval: 3000, variance: 0 }
    },

    fragmentLifetime: { min: 3, max: 5 },
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

    metaMessages: [
        { time: 5000, text: "ты здесь" },
        { time: 18000, text: "время замедляется" },
        { time: 28000, text: "кто смотрит?" },
        { time: 35000, text: "можно остановиться" }
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
    intimate: ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010'],
    mirror: ['001', '002', '003', '004', '005', '006', '007', '008', '009'],
    visceral: ['001', '002', '003', '004', '005', '006', '007', '008', '009'],
    noise: ['001', '002', '003', '004', '005', '006'],
    vivid: ['001', '002', '003', '004', '005'],
    flesh: ['001', '002', '003', '004']
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
    'распирает', 'глубже', 'ещё', 'не останавливайся',
    'внутрь', 'растворяет', 'тяжело', 'сладко'
];
