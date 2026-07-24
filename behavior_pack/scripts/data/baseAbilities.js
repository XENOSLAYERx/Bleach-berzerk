// =====================================================================
//  Bleach: Berzerk  —  base / starter abilities and cross-race kits
//  (Soul Reaper starter kido, Quincy bow, Human, Visored mask powers.)
// =====================================================================
import { RACES } from "../config.js";
import { registerAbility } from "../systems/abilities.js";

export function buildBaseAbilities() {
  // ---------------- Soul Reaper (pre-Shikai) ----------------
  registerAbility({ race: RACES.SOUL_REAPER, id: "sr_flashstep", name: "Flash Step (Shunpo)", req: "base", kind: "dash", cost: 8, cooldown: 14, range: 8, particle: "minecraft:basic_crit_particle", selfEffect: { id: "speed", dur: 3, amp: 1 }, desc: "The Soul Reaper's signature high-speed step." });
  registerAbility({ race: RACES.SOUL_REAPER, id: "sr_shakkaho", name: "Hado #31: Shakkaho", req: "base", kind: "beam", cost: 16, cooldown: 26, power: 1.7, range: 22, particle: "minecraft:basic_flame_particle", ignite: true, desc: "A crimson kido fireball." });
  registerAbility({ race: RACES.SOUL_REAPER, id: "sr_byakurai", name: "Hado #4: Byakurai", req: "base", kind: "beam", cost: 12, cooldown: 16, power: 1.5, range: 26, particle: "minecraft:basic_crit_particle", desc: "A concentrated bolt of lightning kido." });
  registerAbility({ race: RACES.SOUL_REAPER, id: "sr_sai", name: "Bakudo #1: Sai", req: "base", kind: "dot", cost: 14, cooldown: 30, power: 0.5, range: 18, particle: "minecraft:basic_smoke_particle", hitEffect: { id: "slowness", dur: 4, amp: 3 }, desc: "A binding kido that locks a target down." });

  // ---------------- Quincy (base) ----------------
  registerAbility({ race: RACES.QUINCY, id: "q_arrow", name: "Spirit Arrow (Heilig Pfeil)", req: "base", kind: "beam", cost: 10, cooldown: 10, power: 1.6, range: 30, particle: "minecraft:basic_crit_particle", desc: "Fire a condensed reishi arrow." });
  registerAbility({ race: RACES.QUINCY, id: "q_volley", name: "Arrow Volley", req: "base", kind: "summon", cost: 30, cooldown: 60, power: 1.6, range: 24, radius: 5, waves: 6, particle: "minecraft:basic_crit_particle", desc: "Rain spirit arrows over an area." });
  registerAbility({ race: RACES.QUINCY, id: "q_hirenkyaku", name: "Hirenkyaku", req: "base", kind: "dash", cost: 10, cooldown: 16, range: 9, particle: "minecraft:basic_crit_particle", selfEffect: { id: "speed", dur: 4, amp: 1 }, desc: "Ride a platform of reishi to move at high speed." });
  registerAbility({ race: RACES.QUINCY, id: "q_blut_vene", name: "Blut Vene", req: "base", kind: "guard", cost: 20, cooldown: 60, dur: 10, amp: 2, particle: "minecraft:basic_crit_particle", desc: "Reishi flows through your veins — hardened defence." });
  registerAbility({ race: RACES.QUINCY, id: "q_blut_arterie", name: "Blut Arterie", req: "base", kind: "buff", cost: 20, cooldown: 60, selfEffect: [{ id: "strength", dur: 12, amp: 1 }, { id: "speed", dur: 12, amp: 1 }], particle: "minecraft:basic_crit_particle", desc: "Reishi empowers your strikes." });

  // ---------------- Fullbringer already handled in fullbring.js ----------------

  // ---------------- Human (weak starter) ----------------
  registerAbility({ race: RACES.HUMAN, id: "hu_punch", name: "Spirit Punch", req: "base", kind: "slash", cost: 6, cooldown: 12, power: 1.2, range: 3, particle: "minecraft:basic_crit_particle", desc: "A focused spiritual strike." });
  registerAbility({ race: RACES.HUMAN, id: "hu_focus", name: "Focus", req: "base", kind: "buff", cost: 10, cooldown: 40, selfEffect: [{ id: "strength", dur: 10, amp: 0 }, { id: "speed", dur: 10, amp: 0 }], particle: "minecraft:basic_crit_particle", desc: "Center your spirit to fight harder." });
  registerAbility({ race: RACES.HUMAN, id: "hu_surge", name: "Latent Surge", req: "base", kind: "blast", cost: 24, cooldown: 50, power: 1.8, range: 16, radius: 4, particle: "minecraft:basic_crit_particle", desc: "An untrained burst of raw spiritual power." });

  // ---------------- Visored (mask powers — available to Soul Reapers who unlock it) ----------------
  registerAbility({ race: "any", id: "vis_mask_cero", name: "Mask: Hollow Cero", req: "mask", kind: "cero", cost: 45, cooldown: 70, power: 3.8, range: 30, radius: 5, particle: "minecraft:basic_flame_particle", desc: "Fire a Hollow cero while masked." });
  registerAbility({ race: "any", id: "vis_mask_regen", name: "Mask: Hollow Regeneration", req: "mask", kind: "heal", cost: 25, cooldown: 90, dur: 8, amp: 2, desc: "Hollow-fast regeneration behind the mask." });
  registerAbility({ race: "any", id: "vis_mask_rush", name: "Mask: Berserk Rush", req: "mask", kind: "buff", cost: 20, cooldown: 60, selfEffect: [{ id: "strength", dur: 12, amp: 2 }, { id: "speed", dur: 12, amp: 2 }], particle: "minecraft:basic_smoke_particle", desc: "The mask floods you with hollow power." });
}
