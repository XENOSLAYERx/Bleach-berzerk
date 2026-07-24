// =====================================================================
//  Bleach: Berzerk  —  the 20 Zanpakuto element archetypes
//  Each element supplies flavour (names) and a "palette" (particle,
//  on-hit status effect, self-buff) that the generator in
//  data/zanpakuto.js turns into a full Shikai + Bankai + Ultimate kit.
// =====================================================================

// hitEffect / selfEffect use vanilla effect string ids so they work
// without any custom effect definitions.
export const ELEMENTS = {
  fire:      { name: "Inferno",      adj: "Flame",   ult: "Ennetsu Jigoku",       particle: "minecraft:basic_flame_particle", ignite: true,  hit: null,                          buff: { id: "strength", dur: 12, amp: 1 } },
  ice:       { name: "Glacier",      adj: "Frost",   ult: "Sennen Hyoro",         particle: "minecraft:basic_smoke_particle", ignite: false, hit: { id: "slowness", dur: 5, amp: 2 }, buff: { id: "resistance", dur: 12, amp: 1 } },
  water:     { name: "Maelstrom",    adj: "Tide",    ult: "Abyssal Drowning",     particle: "minecraft:water_splash_particle_manual", ignite: false, hit: { id: "slowness", dur: 4, amp: 1 }, buff: { id: "conduit_power", dur: 12, amp: 0 } },
  wind:      { name: "Tempest",      adj: "Gale",    ult: "Divine Cyclone",       particle: "minecraft:basic_crit_particle",  ignite: false, hit: null,                          buff: { id: "speed", dur: 12, amp: 1 } },
  earth:     { name: "Tectonic",     adj: "Stone",   ult: "Continental Crush",    particle: "minecraft:basic_smoke_particle", ignite: false, hit: { id: "slowness", dur: 4, amp: 1 }, buff: { id: "resistance", dur: 12, amp: 2 } },
  lightning: { name: "Thunder",      adj: "Spark",   ult: "Raijin's Verdict",     particle: "minecraft:basic_crit_particle",  ignite: false, hit: { id: "weakness", dur: 6, amp: 1 }, buff: { id: "speed", dur: 12, amp: 2 } },
  poison:    { name: "Plague",       adj: "Venom",   ult: "Toxic Apocalypse",     particle: "minecraft:basic_smoke_particle", ignite: false, hit: { id: "poison", dur: 8, amp: 2 },   buff: { id: "regeneration", dur: 8, amp: 0 } },
  shadow:    { name: "Void",         adj: "Umbral",  ult: "Eternal Eclipse",      particle: "minecraft:basic_smoke_particle", ignite: false, hit: { id: "blindness", dur: 5, amp: 0 }, buff: { id: "invisibility", dur: 10, amp: 0 } },
  light:     { name: "Solar",        adj: "Radiant", ult: "Judgment Ray",         particle: "minecraft:basic_crit_particle",  ignite: false, hit: { id: "blindness", dur: 4, amp: 0 }, buff: { id: "regeneration", dur: 10, amp: 1 } },
  gravity:   { name: "Singularity",  adj: "Gravity", ult: "Event Horizon",        particle: "minecraft:basic_smoke_particle", ignite: false, hit: { id: "slowness", dur: 6, amp: 3 }, buff: { id: "slow_falling", dur: 20, amp: 0 } },
  crystal:   { name: "Prism",        adj: "Crystal", ult: "Diamond Requiem",      particle: "minecraft:basic_crit_particle",  ignite: false, hit: { id: "slowness", dur: 4, amp: 1 }, buff: { id: "resistance", dur: 12, amp: 1 } },
  blood:     { name: "Sanguine",     adj: "Crimson", ult: "Blood Rite",           particle: "minecraft:basic_crit_particle",  ignite: false, hit: { id: "wither", dur: 5, amp: 1 },   buff: { id: "strength", dur: 12, amp: 1 } },
  sound:     { name: "Resonance",    adj: "Sonic",   ult: "Shattering Scream",    particle: "minecraft:basic_crit_particle",  ignite: false, hit: { id: "nausea", dur: 6, amp: 0 },   buff: { id: "speed", dur: 10, amp: 1 } },
  beast:     { name: "Beastking",    adj: "Feral",   ult: "Primal Devour",        particle: "minecraft:basic_crit_particle",  ignite: false, hit: { id: "weakness", dur: 6, amp: 1 }, buff: { id: "strength", dur: 12, amp: 2 } },
  time:      { name: "Temporal",     adj: "Chrono",  ult: "Toki wo Tomeru",       particle: "minecraft:basic_smoke_particle", ignite: false, hit: { id: "slowness", dur: 8, amp: 4 }, buff: { id: "speed", dur: 12, amp: 2 } },
  space:     { name: "Dimensional",  adj: "Warp",    ult: "Reality Rend",         particle: "minecraft:basic_crit_particle",  ignite: false, hit: { id: "levitation", dur: 3, amp: 1 }, buff: { id: "slow_falling", dur: 20, amp: 0 } },
  nature:    { name: "Verdant",      adj: "Thorn",   ult: "World Tree's Wrath",   particle: "minecraft:basic_smoke_particle", ignite: false, hit: { id: "poison", dur: 6, amp: 1 },   buff: { id: "regeneration", dur: 12, amp: 1 } },
  smoke:     { name: "Cinder",       adj: "Ash",     ult: "Choking Shroud",       particle: "minecraft:basic_smoke_particle", ignite: false, hit: { id: "blindness", dur: 5, amp: 0 }, buff: { id: "invisibility", dur: 10, amp: 0 } },
  lava:      { name: "Volcanic",     adj: "Magma",   ult: "Eruption Zero",        particle: "minecraft:basic_flame_particle", ignite: true,  hit: { id: "slowness", dur: 3, amp: 1 }, buff: { id: "fire_resistance", dur: 20, amp: 0 } },
  metal:     { name: "Steel",        adj: "Iron",    ult: "Thousand Blades",      particle: "minecraft:basic_crit_particle",  ignite: false, hit: { id: "slowness", dur: 3, amp: 1 }, buff: { id: "resistance", dur: 12, amp: 2 } },
};

export const ELEMENT_IDS = Object.keys(ELEMENTS);
