// =====================================================================
//  Bleach: Berzerk  —  Reiatsu pressure
//  High-power players exert crushing spiritual pressure on weaker
//  entities: slowness, weakness, knockback, screen shake and a crater
//  of particles when they power up.
// =====================================================================
import { TICK } from "../config.js";
import { getPowerScore, getRank } from "./reiatsu.js";
import { particle, effect, knockback, shake, sound, entitiesNear, dist } from "../util.js";
import { getForm } from "../data/profile.js";

/** A burst of pressure — called on power-up / transformation. */
export function pressureBurst(player) {
  const loc = player.location;
  const dim = player.dimension;
  const score = getPowerScore(player);
  const radius = Math.min(12, 4 + score / 80);

  // crater / shockwave particles
  for (let r = 0; r < radius; r += 0.75) {
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      particle(dim, "minecraft:basic_crit_particle", {
        x: loc.x + Math.cos(a) * r,
        y: loc.y + 0.2,
        z: loc.z + Math.sin(a) * r,
      });
    }
  }
  particle(dim, "minecraft:huge_explosion_emitter", { x: loc.x, y: loc.y + 1, z: loc.z });
  sound(player, "mob.enderdragon.growl", 0.9, 0.6);
  shake(player, 1.0, 0.6);

  // affect weaker entities
  for (const e of entitiesNear(dim, loc, radius, player)) {
    let theirScore = 0;
    try {
      theirScore = e.typeId === "minecraft:player" ? getPowerScore(e) : (e.__bbBossScore || 20);
    } catch (x) {
      theirScore = 20;
    }
    if (theirScore >= score) continue; // can't pressure equals/superiors
    const d = dist(loc, e.location) || 1;
    const dx = (e.location.x - loc.x) / d;
    const dz = (e.location.z - loc.z) / d;
    knockback(e, dx, dz, Math.min(2.5, radius / 4), 0.5);
    effect(e, "slowness", 4, 1);
    effect(e, "weakness", 4, 1);
    if (e.typeId === "minecraft:player") shake(e, 0.6, 0.4);
  }
}

/** Passive aura — a faint particle trail for high-rank players. */
export function passiveAura(player) {
  const rank = getRank(player);
  if (rank.min < 200 && getForm(player) === "none") return; // only strong / transformed
  const loc = player.location;
  particle(player.dimension, "minecraft:basic_flame_particle", { x: loc.x, y: loc.y + 1, z: loc.z });
}
