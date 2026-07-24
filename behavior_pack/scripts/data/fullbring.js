// =====================================================================
//  Bleach: Berzerk  —  Fullbringer objects & progression
//  Stage 1 -> Stage 2 -> Complete Fullbring, abilities evolving with
//  each stage.
// =====================================================================
import { RACES } from "../config.js";
import { registerAbility } from "../systems/abilities.js";

export const FULLBRING_OBJECTS = {
  Sword:    { adj: "Blade",   particle: "minecraft:basic_crit_particle",  hit: { id: "weakness", dur: 5, amp: 1 }, ult: "Getsuga Cross" },
  Book:     { adj: "Chapter", particle: "minecraft:basic_smoke_particle", hit: { id: "slowness", dur: 5, amp: 2 }, ult: "Final Page" },
  Chain:    { adj: "Chain",   particle: "minecraft:basic_crit_particle",  hit: { id: "slowness", dur: 6, amp: 2 }, ult: "Binding Storm" },
  Gun:      { adj: "Round",   particle: "minecraft:basic_flame_particle", hit: null,                              ult: "Last Bullet" },
  Necklace: { adj: "Charm",   particle: "minecraft:heart_particle",       hit: { id: "poison", dur: 5, amp: 1 },   ult: "Heart's End" },
  Coin:     { adj: "Fortune", particle: "minecraft:basic_crit_particle",  hit: { id: "weakness", dur: 5, amp: 1 }, ult: "Jackpot" },
  Ring:     { adj: "Signet",  particle: "minecraft:basic_crit_particle",  hit: { id: "levitation", dur: 3, amp: 1 }, ult: "Seal of Ruin" },
  Jacket:   { adj: "Coat",    particle: "minecraft:basic_smoke_particle", hit: { id: "resistance", dur: 0, amp: 0 }, ult: "Shroud Reckoning" },
  Cards:    { adj: "Card",    particle: "minecraft:basic_crit_particle",  hit: { id: "nausea", dur: 5, amp: 0 },   ult: "Full House" },
};

export const FULLBRING_OBJECT_IDS = Object.keys(FULLBRING_OBJECTS);

function slug(s) {
  return s.toLowerCase();
}

export function buildFullbring() {
  for (const obj of FULLBRING_OBJECT_IDS) {
    const F = FULLBRING_OBJECTS[obj];
    const base = { race: RACES.FULLBRINGER, fbObject: obj, particle: F.particle, ignite: false };
    // Stage 1
    registerAbility({ ...base, id: `fb_${slug(obj)}_1`, name: `${F.adj} Strike`, req: "fb1", kind: "slash", cost: 10, cooldown: 14, power: 1.5, range: 4, hitEffect: F.hit, desc: `${obj} Fullbring — a basic manifested attack.` });
    registerAbility({ ...base, id: `fb_${slug(obj)}_2`, name: "Bringer Light", req: "fb1", kind: "dash", cost: 10, cooldown: 18, range: 7, selfEffect: { id: "speed", dur: 4, amp: 1 }, desc: "Ride the souls beneath your feet to dash." });
    // Stage 2
    registerAbility({ ...base, id: `fb_${slug(obj)}_3`, name: `${F.adj} Volley`, req: "fb2", kind: "beam", cost: 20, cooldown: 26, power: 2.2, range: 24, hitEffect: F.hit, desc: `${obj} Fullbring — a ranged strike.` });
    registerAbility({ ...base, id: `fb_${slug(obj)}_4`, name: `${F.adj} Guard`, req: "fb2", kind: "guard", cost: 22, cooldown: 70, dur: 8, amp: 2, desc: "Reinforce your body with your Fullbring." });
    // Complete Fullbring
    registerAbility({ ...base, id: `fb_${slug(obj)}_5`, name: `${F.adj} Cataclysm`, req: "fbc", kind: "blast", cost: 40, cooldown: 60, power: 3.4, range: 22, radius: 6, hitEffect: F.hit, desc: "Complete Fullbring — a devastating area blast." });
    registerAbility({ ...base, id: `fb_${slug(obj)}_ult`, name: F.ult, req: "fbc", kind: "cero", cost: 85, cooldown: 220, power: 5.8, range: 32, radius: 8, hitEffect: F.hit, desc: `${obj} Fullbring — ultimate technique.` });
  }
}

export function fullbringSkills(obj, stage) {
  const s = slug(obj);
  const list = [`fb_${s}_1`, `fb_${s}_2`];
  if (stage >= 2) list.push(`fb_${s}_3`, `fb_${s}_4`);
  if (stage >= 3) list.push(`fb_${s}_5`, `fb_${s}_ult`);
  return list;
}
