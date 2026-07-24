// =====================================================================
//  Bleach: Berzerk  —  The Schrift (Quincy A–Z)
//  Each Sternritter letter grants: 1 passive + 5 active skills + an
//  ultimate (its Vollstandig technique).  Assigned on Quincy creation.
// =====================================================================
import { RACES } from "../config.js";
import { registerAbility } from "../systems/abilities.js";

// letter -> flavour + combat palette
export const SCHRIFT = {
  A: { epithet: "The Almighty",   particle: "minecraft:basic_crit_particle",  hit: { id: "levitation", dur: 3, amp: 1 }, ignite: false, buff: { id: "resistance", dur: 12, amp: 2 } },
  B: { epithet: "The Balance",    particle: "minecraft:basic_crit_particle",  hit: { id: "weakness", dur: 6, amp: 1 },   ignite: false, buff: { id: "regeneration", dur: 12, amp: 1 } },
  C: { epithet: "The Compulsory", particle: "minecraft:basic_smoke_particle", hit: { id: "slowness", dur: 6, amp: 2 },    ignite: false, buff: { id: "speed", dur: 12, amp: 1 } },
  D: { epithet: "The Deathdealer",particle: "minecraft:basic_smoke_particle", hit: { id: "wither", dur: 5, amp: 1 },      ignite: false, buff: { id: "strength", dur: 12, amp: 1 } },
  E: { epithet: "The Explode",    particle: "minecraft:basic_flame_particle", hit: null,                                 ignite: true,  buff: { id: "fire_resistance", dur: 20, amp: 0 } },
  F: { epithet: "The Fear",       particle: "minecraft:basic_smoke_particle", hit: { id: "blindness", dur: 5, amp: 0 },   ignite: false, buff: { id: "invisibility", dur: 10, amp: 0 } },
  G: { epithet: "The Glutton",    particle: "minecraft:basic_crit_particle",  hit: { id: "hunger", dur: 8, amp: 2 },      ignite: false, buff: { id: "strength", dur: 12, amp: 1 } },
  H: { epithet: "The Heat",       particle: "minecraft:basic_flame_particle", hit: null,                                 ignite: true,  buff: { id: "fire_resistance", dur: 20, amp: 0 } },
  I: { epithet: "The Iron",       particle: "minecraft:basic_crit_particle",  hit: { id: "slowness", dur: 3, amp: 1 },    ignite: false, buff: { id: "resistance", dur: 14, amp: 2 } },
  J: { epithet: "The Jail",       particle: "minecraft:basic_smoke_particle", hit: { id: "slowness", dur: 8, amp: 4 },    ignite: false, buff: { id: "resistance", dur: 12, amp: 1 } },
  K: { epithet: "The Knowledge",  particle: "minecraft:basic_crit_particle",  hit: { id: "weakness", dur: 6, amp: 2 },    ignite: false, buff: { id: "speed", dur: 12, amp: 1 } },
  L: { epithet: "The Love",       particle: "minecraft:heart_particle",       hit: { id: "poison", dur: 5, amp: 1 },      ignite: false, buff: { id: "regeneration", dur: 12, amp: 1 } },
  M: { epithet: "The Miracle",    particle: "minecraft:basic_crit_particle",  hit: null,                                 ignite: false, buff: { id: "resistance", dur: 12, amp: 3 } },
  N: { epithet: "The Night",      particle: "minecraft:basic_smoke_particle", hit: { id: "blindness", dur: 6, amp: 0 },   ignite: false, buff: { id: "invisibility", dur: 12, amp: 0 } },
  O: { epithet: "The Overkill",   particle: "minecraft:basic_flame_particle", hit: { id: "wither", dur: 4, amp: 1 },      ignite: true,  buff: { id: "strength", dur: 12, amp: 2 } },
  P: { epithet: "The Power",      particle: "minecraft:basic_crit_particle",  hit: { id: "weakness", dur: 5, amp: 1 },    ignite: false, buff: { id: "strength", dur: 12, amp: 2 } },
  Q: { epithet: "The Question",   particle: "minecraft:basic_smoke_particle", hit: { id: "nausea", dur: 6, amp: 0 },      ignite: false, buff: { id: "speed", dur: 12, amp: 1 } },
  R: { epithet: "The Roar",       particle: "minecraft:basic_crit_particle",  hit: { id: "nausea", dur: 5, amp: 0 },      ignite: false, buff: { id: "strength", dur: 12, amp: 1 } },
  S: { epithet: "The Superstar",  particle: "minecraft:basic_crit_particle",  hit: { id: "glowing", dur: 8, amp: 0 },     ignite: false, buff: { id: "speed", dur: 12, amp: 2 } },
  T: { epithet: "The Thunderbolt",particle: "minecraft:basic_crit_particle",  hit: { id: "weakness", dur: 6, amp: 1 },    ignite: false, buff: { id: "speed", dur: 12, amp: 2 } },
  U: { epithet: "The Underbelly", particle: "minecraft:basic_smoke_particle", hit: { id: "poison", dur: 6, amp: 1 },      ignite: false, buff: { id: "invisibility", dur: 10, amp: 0 } },
  V: { epithet: "The Visionary",  particle: "minecraft:basic_crit_particle",  hit: { id: "levitation", dur: 3, amp: 1 },  ignite: false, buff: { id: "resistance", dur: 12, amp: 1 } },
  W: { epithet: "The Wind",       particle: "minecraft:basic_crit_particle",  hit: null,                                 ignite: false, buff: { id: "speed", dur: 12, amp: 2 } },
  X: { epithet: "The X-Axis",     particle: "minecraft:basic_crit_particle",  hit: { id: "weakness", dur: 5, amp: 1 },    ignite: false, buff: { id: "speed", dur: 12, amp: 1 } },
  Y: { epithet: "The Yourself",   particle: "minecraft:basic_smoke_particle", hit: { id: "slowness", dur: 5, amp: 2 },    ignite: false, buff: { id: "strength", dur: 12, amp: 1 } },
  Z: { epithet: "The Zombie",     particle: "minecraft:basic_smoke_particle", hit: { id: "wither", dur: 6, amp: 1 },      ignite: false, buff: { id: "regeneration", dur: 12, amp: 1 } },
};

export const SCHRIFT_LETTERS = Object.keys(SCHRIFT);

/** Register all Schrift abilities. */
export function buildSchrift() {
  for (const L of SCHRIFT_LETTERS) {
    const S = SCHRIFT[L];
    const base = { race: RACES.QUINCY, schrift: L, particle: S.particle, ignite: S.ignite };
    registerAbility({ ...base, id: `sr_${L}_1`, name: `${S.epithet}: Strike`, req: "schrift", kind: "slash", cost: 14, cooldown: 20, power: 1.8, range: 4, hitEffect: S.hit, desc: `${S.epithet} — a close reality-warping blow.` });
    registerAbility({ ...base, id: `sr_${L}_2`, name: `${S.epithet}: Pfeil`, req: "schrift", kind: "beam", cost: 18, cooldown: 26, power: 2.0, range: 26, hitEffect: S.hit, desc: `${S.epithet} — a Heilig Pfeil charged with your letter.` });
    registerAbility({ ...base, id: `sr_${L}_3`, name: `${S.epithet}: Detonation`, req: "schrift", kind: "blast", cost: 28, cooldown: 46, power: 2.2, range: 22, radius: 5, hitEffect: S.hit, desc: `${S.epithet} — an area detonation.` });
    registerAbility({ ...base, id: `sr_${L}_4`, name: `${S.epithet}: Aegis`, req: "schrift", kind: "guard", cost: 26, cooldown: 80, dur: 8, amp: 2, desc: `${S.epithet} — Blut-reinforced defence.` });
    registerAbility({ ...base, id: `sr_${L}_5`, name: `${S.epithet}: Ascension`, req: "schrift", kind: "buff", cost: 24, cooldown: 100, selfEffect: [S.buff, { id: "speed", dur: 10, amp: 1 }], desc: `${S.epithet} — empower yourself.` });
    registerAbility({ ...base, id: `sr_${L}_ult`, name: `${S.epithet}: Vollstandig`, req: "vollstandig", kind: "cero", cost: 90, cooldown: 240, power: 6.2, range: 34, radius: 9, hitEffect: S.hit, desc: `${S.epithet}'s ultimate Vollstandig technique.` });
  }
}

export function schriftSkills(L) {
  return [`sr_${L}_1`, `sr_${L}_2`, `sr_${L}_3`, `sr_${L}_4`, `sr_${L}_5`, `sr_${L}_ult`];
}
