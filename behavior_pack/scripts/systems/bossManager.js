// =====================================================================
//  Bleach: Berzerk  —  boss manager
//  Spawns roster bosses from vanilla mobs, buffs them into multi-phase
//  threats, gives them scripted ranged attacks, and rewards players on
//  death.  Tracks bosses in-memory keyed by entity id.
// =====================================================================
import { world, ItemStack } from "@minecraft/server";
import { BOSSES } from "../data/bosses.js";
import {
  effect, particle, damage, entitiesNear, title,
} from "../util.js";
import { gainXp } from "./leveling.js";

const active = new Map(); // entityId -> { def, id, phase, entity }

/** Spawn a boss by id at a location. */
export function spawnBoss(dimension, location, bossId) {
  const def = BOSSES[bossId];
  if (!def) return null;
  let entity;
  try {
    entity = dimension.spawnEntity(def.entity, location);
  } catch (e) {
    return null;
  }
  try {
    entity.nameTag = `§c§l${def.name} §r§7[Boss]`;
    entity.addTag("bb_boss");
    entity.addTag(`bb_boss_${bossId}`);
  } catch (e) {}
  // stat effects (very long duration; refreshed by loop)
  buffBoss(entity, def, 1);
  entity.__bbBossScore = def.score;

  active.set(entity.id, { def, id: bossId, phase: 1, entity, maxPhases: def.phases });
  world.sendMessage(`§c§lA boss has appeared: §f${def.name}§c!`);
  return entity;
}

function buffBoss(entity, def, phase) {
  const dur = 1000000;
  effect(entity, "health_boost", 100000, def.hp + phase, false);
  effect(entity, "resistance", 100000, Math.min(3, def.res), false);
  effect(entity, "strength", 100000, def.str + (phase - 1), false);
  if (def.spd > 0) effect(entity, "speed", 100000, def.spd, false);
  effect(entity, "fire_resistance", 100000, 0, false);
  // Heal to full when (re)buffing so health_boost takes effect.
  try {
    const hp = entity.getComponent("minecraft:health");
    if (hp) hp.setCurrentValue(hp.effectiveMax);
  } catch (e) {}
}

/** Main boss AI loop — call on an interval. */
export function bossTick() {
  for (const [eid, b] of [...active.entries()]) {
    const e = b.entity;
    if (!e || !e.isValid()) {
      active.delete(eid);
      continue;
    }
    // phase transitions based on health %
    let pct = 1;
    try {
      const hp = e.getComponent("minecraft:health");
      pct = hp.currentValue / hp.effectiveMax;
    } catch (x) {}
    const targetPhase = Math.min(b.maxPhases, Math.max(1, Math.ceil((1 - pct) * b.maxPhases) + 1));
    if (targetPhase > b.phase && b.phase < b.maxPhases) {
      b.phase = targetPhase;
      buffBoss(e, b.def, b.phase);
      world.sendMessage(`§6${b.def.name} §eenters phase ${b.phase}!`);
      particle(e.dimension, "minecraft:huge_explosion_emitter", e.location);
    }

    // ranged "cero" attack at nearest player
    const near = entitiesNear(e.dimension, e.location, 28, e).filter((x) => x.typeId === "minecraft:player");
    if (near.length && Math.random() < 0.35) {
      const target = near[0];
      bossCero(e, b.def, target);
    }
  }
}

function bossCero(boss, def, target) {
  const from = boss.location;
  const to = target.location;
  // particle beam
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    particle(boss.dimension, "minecraft:basic_flame_particle", {
      x: from.x + (to.x - from.x) * t,
      y: from.y + 1 + (to.y - from.y) * t,
      z: from.z + (to.z - from.z) * t,
    });
  }
  particle(boss.dimension, "minecraft:huge_explosion_emitter", to);
  const dmg = 3 + def.tier * 2 + def.str;
  damage(target, dmg, boss);
  try {
    target.playSound("mob.wither.shoot");
  } catch (e) {}
}

/** Handle a boss death (called from entityDie event). */
export function onEntityDie(deadEntity, killer) {
  const b = active.get(deadEntity.id);
  if (!b) return false;
  active.delete(deadEntity.id);
  const def = b.def;
  const loc = deadEntity.location;
  // drops
  for (const d of def.drops) {
    try {
      deadEntity.dimension.spawnItem(new ItemStack(d.item, d.count), { x: loc.x, y: loc.y + 1, z: loc.z });
    } catch (e) {}
  }
  world.sendMessage(`§a§l${def.name} §rhas been defeated!`);
  // reward all nearby players with XP
  for (const p of entitiesNear(deadEntity.dimension, loc, 40, deadEntity).filter((x) => x.typeId === "minecraft:player")) {
    gainXp(p, def.xp, "boss");
    title(p, "§6Boss Defeated", `§e+${def.xp} XP`);
  }
  return b.id; // the defeated boss id (falsy-safe: null when not a boss)
}

export function activeBossCount() {
  return active.size;
}
