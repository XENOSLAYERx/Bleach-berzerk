// =====================================================================
//  Bleach: Berzerk  —  central configuration & tuning constants
//  Everything balance-related lives here so the whole mod can be
//  re-tuned from one file.
// =====================================================================

export const MAX_LEVEL = 1000;

// ---- Dynamic-property keys (all persisted per-player) ----------------
export const PK = {
  created: "bb:created",
  race: "bb:race",
  level: "bb:level",
  xp: "bb:xp",
  statPoints: "bb:sp",
  // core stats
  str: "bb:str",
  def: "bb:def",
  spd: "bb:spd",
  rei: "bb:rei", // reiatsu (max pool) stat
  spc: "bb:spc", // spirit control
  swd: "bb:swd", // sword mastery
  abm: "bb:abm", // ability mastery
  // resources
  reiatsu: "bb:reiatsu", // current reiatsu
  // loadout
  slots: "bb:slots", // JSON array of 4 ability ids
  form: "bb:form", // active transformation id ("none" | "shikai" | ...)
  // faction / social
  squad: "bb:squad",
  rep: "bb:rep",
  pvp: "bb:pvp",
  titles: "bb:titles",
  // ---- Soul Reaper ----
  zanElement: "bb:zan",
  shikai: "bb:shikai",
  bankai: "bb:bankai",
  // ---- Hollow ----
  hollowStage: "bb:hstage",
  souls: "bb:souls",
  aspect: "bb:aspect",
  resForm: "bb:res",
  released: "bb:released",
  // ---- Quincy ----
  schrift: "bb:schrift",
  vollstandig: "bb:vollstandig",
  // ---- Fullbringer ----
  fbObject: "bb:fbobj",
  fbStage: "bb:fbstage",
  // ---- Human / Visored ----
  evolution: "bb:evo",
  visored: "bb:visored",
  maskStage: "bb:maskstage",
  // meditation / questline progress flags
  meditation: "bb:meditation",
  zanQuest: "bb:zanquest",
  innerHollow: "bb:innerhollow",
  quincyTrials: "bb:qtrials",
};

// ---- Races -----------------------------------------------------------
export const RACES = {
  SOUL_REAPER: "soul_reaper",
  HOLLOW: "hollow",
  QUINCY: "quincy",
  FULLBRINGER: "fullbringer",
  HUMAN: "human",
};

// ---- Reiatsu ranks (keyed off effective power) -----------------------
// threshold = minimum "power score" required (see reiatsu.getPowerScore)
export const RANKS = [
  { id: "civilian", name: "Civilian", min: 0 },
  { id: "trainee", name: "Trainee", min: 10 },
  { id: "officer", name: "Officer", min: 50 },
  { id: "elite_officer", name: "Elite Officer", min: 120 },
  { id: "lieutenant", name: "Lieutenant", min: 200 },
  { id: "captain", name: "Captain", min: 300 },
  { id: "elite_captain", name: "Elite Captain", min: 450 },
  { id: "monster", name: "Monster", min: 600 },
  { id: "transcendent", name: "Transcendent", min: 800 },
  { id: "soul_king", name: "Soul King Class", min: 950 },
];

// ---- PvP ranks -------------------------------------------------------
export const PVP_RANKS = ["Bronze", "Silver", "Gold", "Diamond", "Master", "Legend"];

// ---- Transformation power multipliers --------------------------------
// applied to outgoing damage, and partially to defence / speed.
export const FORM_MULT = {
  none: 1.0,
  shikai: 1.6,
  bankai: 3.0,
  mask: 2.2, // Visored
  resurreccion: 2.8, // Arrancar
  vollstandig: 3.0, // Quincy
  fullbring: 2.4, // Complete Fullbring
};

// ---- Tuning knobs ----------------------------------------------------
export const TUNING = {
  baseReiatsu: 100,
  reiatsuPerStat: 15,
  reiatsuPerLevel: 2,
  reiatsuRegenBase: 2, // per regen tick
  reiatsuRegenPerSpc: 0.5,
  strScaling: 0.6, // damage per point of strength
  defScaling: 0.015, // damage reduction per point of defence (capped)
  defCap: 0.75, // max 75% reduction
  spdEffectEvery: 40, // recompute movement buff interval (ticks)
  statPointsPerLevel: 3,
  humanXpBonus: 1.5, // humans gain XP 50% faster
};

// Interval lengths (in ticks; 20 ticks = 1 second)
export const TICK = {
  hud: 10,
  reiatsuRegen: 20,
  passive: 20,
  pressure: 10,
};
