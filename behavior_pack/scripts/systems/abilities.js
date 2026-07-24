// =====================================================================
//  Bleach: Berzerk  —  the ability engine
//  A small set of reusable "kinds" (beam, blast, slash, dash, buff,
//  guard, dot, heal, summon, cero) is parameterised by data so that
//  hundreds of themed abilities can exist without hundreds of code
//  paths. Every race's skills are just ability definitions.
// =====================================================================
import { system } from "@minecraft/server";
import {
  particle, effect, ignite, knockback, sound, shake,
  getAimPoint, entitiesNear, dist, actionBar,
} from "../util.js";
import { dealAbilityDamage } from "./combat.js";
import { spendReiatsu, getReiatsu } from "../data/profile.js";

const REGISTRY = new Map(); // id -> ability def
const cooldowns = new Map(); // playerId -> Map(abilityId -> expiryTick)

/** Register an ability definition. */
export function registerAbility(def) {
  const full = {
    kind: "beam",
    cost: 20,
    cooldown: 40,
    power: 1.5,
    range: 20,
    radius: 3,
    particle: "minecraft:basic_flame_particle",
    hitEffect: null, // { id, dur, amp }
    selfEffect: null,
    ignite: false,
    knock: 0.6,
    ...def,
  };
  REGISTRY.set(full.id, full);
  return full;
}

export function getAbility(id) {
  return REGISTRY.get(id);
}
export function allAbilities() {
  return [...REGISTRY.values()];
}
export function abilitiesForRace(race) {
  return allAbilities().filter((a) => a.race === race || a.race === "any");
}

// ---- cooldown helpers ------------------------------------------------
function remainingCd(player, id) {
  const m = cooldowns.get(player.id);
  if (!m) return 0;
  const exp = m.get(id) || 0;
  return Math.max(0, exp - system.currentTick);
}
function setCd(player, id, ticks) {
  let m = cooldowns.get(player.id);
  if (!m) {
    m = new Map();
    cooldowns.set(player.id, m);
  }
  m.set(id, system.currentTick + ticks);
}

/**
 * Attempt to cast an ability by id.
 * @returns { ok:boolean, reason?:string }
 */
export function castAbility(player, id) {
  const ab = REGISTRY.get(id);
  if (!ab) return { ok: false, reason: "Unknown ability" };

  const cd = remainingCd(player, id);
  if (cd > 0) {
    actionBar(player, `§7${ab.name} on cooldown (${(cd / 20).toFixed(1)}s)`);
    return { ok: false, reason: "cooldown" };
  }
  if (getReiatsu(player) < ab.cost) {
    actionBar(player, `§9Not enough Reiatsu §7(${ab.cost} needed)`);
    return { ok: false, reason: "reiatsu" };
  }

  spendReiatsu(player, ab.cost);
  setCd(player, id, ab.cooldown);
  try {
    KINDS[ab.kind] ? KINDS[ab.kind](player, ab) : KINDS.beam(player, ab);
  } catch (e) {
    // never let a single ability crash the tick loop
    console.warn(`ability ${id} failed: ${e}`);
  }
  return { ok: true };
}

// ---- shared vfx ------------------------------------------------------
function drawLine(dimension, from, to, id, steps = 18) {
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    particle(dimension, id, {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      z: from.z + (to.z - from.z) * t,
    });
  }
}

function applyHitEffects(ab, target) {
  if (ab.hitEffect) effect(target, ab.hitEffect.id, ab.hitEffect.dur, ab.hitEffect.amp || 0);
  if (ab.ignite) ignite(target, 4);
}

// ---- the kinds -------------------------------------------------------
const KINDS = {
  // Hitscan bolt — hits the first entity along the aim line.
  beam(player, ab) {
    const head = player.getHeadLocation();
    const aim = getAimPoint(player, ab.range);
    drawLine(player.dimension, head, aim, ab.particle);
    const hits = player.getEntitiesFromViewDirection({ maxDistance: ab.range });
    sound(player, "mob.blaze.shoot", 1.2, 0.7);
    if (hits && hits.length) {
      const target = hits[0].entity;
      dealAbilityDamage(player, target, ab.power);
      applyHitEffects(ab, target);
      const view = player.getViewDirection();
      knockback(target, view.x, view.z, ab.knock, 0.2);
      particle(player.dimension, "minecraft:huge_explosion_emitter", target.location);
    }
  },

  // Big charged cero — beam with an explosion and a wider splash.
  cero(player, ab) {
    const head = player.getHeadLocation();
    const aim = getAimPoint(player, ab.range);
    drawLine(player.dimension, head, aim, ab.particle, 26);
    sound(player, "mob.wither.shoot", 0.9, 0.5);
    shake(player, 0.6, 0.4);
    particle(player.dimension, "minecraft:huge_explosion_emitter", aim);
    for (const e of entitiesNear(player.dimension, aim, ab.radius, player)) {
      dealAbilityDamage(player, e, ab.power);
      applyHitEffects(ab, e);
    }
  },

  // Area blast centred on the aim point.
  blast(player, ab) {
    const aim = getAimPoint(player, ab.range);
    particle(player.dimension, "minecraft:huge_explosion_emitter", aim);
    for (let i = 0; i < 8; i++) particle(player.dimension, ab.particle, aim);
    sound(player, "random.explode", 1, 0.7);
    for (const e of entitiesNear(player.dimension, aim, ab.radius, player)) {
      const falloff = 1 - dist(aim, e.location) / (ab.radius + 1);
      dealAbilityDamage(player, e, ab.power * Math.max(0.3, falloff));
      applyHitEffects(ab, e);
    }
  },

  // Melee arc in front of the caster.
  slash(player, ab) {
    const view = player.getViewDirection();
    const loc = player.location;
    sound(player, "item.trident.riptide_1", 1.3, 0.9);
    for (const e of entitiesNear(player.dimension, loc, ab.range, player)) {
      const to = { x: e.location.x - loc.x, y: 0, z: e.location.z - loc.z };
      const len = Math.hypot(to.x, to.z) || 1;
      const dot = (to.x / len) * view.x + (to.z / len) * view.z;
      if (dot > 0.25) {
        dealAbilityDamage(player, e, ab.power);
        applyHitEffects(ab, e);
        knockback(e, view.x, view.z, ab.knock, 0.35);
        particle(player.dimension, ab.particle, e.location);
      }
    }
  },

  // Instant reposition (Flash Step / Sonido / Hirenkyaku).
  dash(player, ab) {
    const view = player.getViewDirection();
    const loc = player.location;
    const target = {
      x: loc.x + view.x * ab.range,
      y: loc.y + Math.max(0, view.y * ab.range * 0.5),
      z: loc.z + view.z * ab.range,
    };
    drawLine(player.dimension, loc, target, ab.particle, 12);
    try {
      player.teleport(target, { dimension: player.dimension });
    } catch (e) {
      /* blocked */
    }
    sound(player, "mob.endermen.portal", 1.4, 0.6);
    if (ab.selfEffect) effect(player, ab.selfEffect.id, ab.selfEffect.dur, ab.selfEffect.amp || 0);
  },

  // Self buffs.
  buff(player, ab) {
    const list = Array.isArray(ab.selfEffect) ? ab.selfEffect : [ab.selfEffect];
    for (const eff of list) if (eff) effect(player, eff.id, eff.dur, eff.amp || 0);
    for (let i = 0; i < 10; i++) particle(player.dimension, ab.particle, player.location);
    sound(player, "beacon.activate", 1, 0.8);
  },

  // Defensive shell (Blut Vene / Hierro / Danku).
  guard(player, ab) {
    effect(player, "resistance", ab.dur || 6, ab.amp || 2);
    effect(player, "absorption", ab.dur || 6, ab.amp || 1);
    for (let i = 0; i < 8; i++) particle(player.dimension, ab.particle, player.location);
    sound(player, "block.beacon.power_select", 1, 0.9);
  },

  // Damage-over-time application via raycast.
  dot(player, ab) {
    const hits = player.getEntitiesFromViewDirection({ maxDistance: ab.range });
    const aim = getAimPoint(player, ab.range);
    drawLine(player.dimension, player.getHeadLocation(), aim, ab.particle, 14);
    if (hits && hits.length) {
      const t = hits[0].entity;
      dealAbilityDamage(player, t, ab.power * 0.4);
      effect(t, ab.hitEffect ? ab.hitEffect.id : "poison", ab.hitEffect ? ab.hitEffect.dur : 6, ab.hitEffect ? ab.hitEffect.amp : 1);
    }
    sound(player, "mob.witch.throw", 1, 0.8);
  },

  // Self heal / regeneration.
  heal(player, ab) {
    effect(player, "instant_health", 1, ab.amp || 1);
    effect(player, "regeneration", ab.dur || 6, ab.amp || 1);
    for (let i = 0; i < 10; i++) particle(player.dimension, "minecraft:heart_particle", { x: player.location.x, y: player.location.y + 1, z: player.location.z });
    sound(player, "random.levelup", 1.4, 0.6);
  },

  // Summon a barrage / minion at the aim area.
  summon(player, ab) {
    const aim = getAimPoint(player, ab.range);
    sound(player, "mob.wither.spawn", 0.7, 0.6);
    let count = 0;
    const iv = system.runInterval(() => {
      if (count++ >= (ab.waves || 5) || !player.isValid()) {
        system.clearRun(iv);
        return;
      }
      const p = { x: aim.x + (Math.random() - 0.5) * ab.radius * 2, y: aim.y + 4, z: aim.z + (Math.random() - 0.5) * ab.radius * 2 };
      particle(player.dimension, ab.particle, p);
      particle(player.dimension, "minecraft:huge_explosion_emitter", { x: p.x, y: aim.y, z: p.z });
      for (const e of entitiesNear(player.dimension, { x: p.x, y: aim.y, z: p.z }, 2.5, player)) {
        dealAbilityDamage(player, e, ab.power * 0.5);
        applyHitEffects(ab, e);
      }
    }, 6);
  },
};

/** Clear a player's cooldowns (used on death / logout cleanup). */
export function clearCooldowns(playerId) {
  cooldowns.delete(playerId);
}
