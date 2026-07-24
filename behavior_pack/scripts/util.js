// =====================================================================
//  Bleach: Berzerk  —  defensive utility helpers
//  These wrap version-sensitive parts of the script API so the mod
//  degrades gracefully across Bedrock versions instead of crashing.
// =====================================================================
import { world, system } from "@minecraft/server";

/** Safe run of a slash command on an entity (sync or async, whichever exists). */
export function cmd(entity, command) {
  try {
    if (typeof entity.runCommand === "function") {
      entity.runCommand(command);
      return true;
    }
  } catch (e) {
    /* fall through to async */
  }
  try {
    if (typeof entity.runCommandAsync === "function") {
      entity.runCommandAsync(command);
      return true;
    }
  } catch (e) {
    /* swallow */
  }
  return false;
}

/** Safe particle spawn — bad particle ids simply do nothing. */
export function particle(dimension, id, location) {
  try {
    dimension.spawnParticle(id, location);
  } catch (e) {
    /* ignore invalid particle */
  }
}

/** Safe status-effect application. Accepts vanilla effect string ids. */
export function effect(entity, id, seconds, amplifier = 0, showParticles = true) {
  try {
    entity.addEffect(id, Math.max(1, Math.round(seconds * 20)), {
      amplifier,
      showParticles,
    });
  } catch (e) {
    /* some versions want an EffectType — retry silently is not worth it */
  }
}

/** Version-tolerant knockback. */
export function knockback(entity, dirX, dirZ, horizontal, vertical) {
  try {
    // Newer API: applyKnockback({ x, z }, verticalStrength)
    entity.applyKnockback({ x: dirX, z: dirZ }, vertical);
    return;
  } catch (e) {
    /* try legacy */
  }
  try {
    // Legacy API: applyKnockback(x, z, horizontalStrength, verticalStrength)
    entity.applyKnockback(dirX, dirZ, horizontal, vertical);
  } catch (e) {
    /* give up quietly */
  }
}

/** Set an entity on fire if the API supports it. */
export function ignite(entity, seconds) {
  try {
    entity.setOnFire(seconds, true);
  } catch (e) {
    /* not supported */
  }
}

/** Deal damage from a source entity. */
export function damage(target, amount, source) {
  try {
    target.applyDamage(Math.max(0, amount), {
      cause: "entityAttack",
      damagingEntity: source,
    });
    return true;
  } catch (e) {
    // fallback for versions that dislike the options object
    try {
      target.applyDamage(Math.max(0, amount));
      return true;
    } catch (e2) {
      return false;
    }
  }
}

/** Action-bar text. */
export function actionBar(player, text) {
  try {
    player.onScreenDisplay.setActionBar(text);
  } catch (e) {
    /* player leaving / not ready */
  }
}

/** Big title + subtitle. */
export function title(player, text, subtitle) {
  try {
    player.onScreenDisplay.setTitle(text, subtitle ? { subtitle } : undefined);
  } catch (e) {
    /* ignore */
  }
}

/** Play a sound at the player. */
export function sound(player, id, pitch = 1, volume = 1) {
  try {
    player.playSound(id, { pitch, volume });
  } catch (e) {
    cmd(player, `playsound ${id} @s ~~~ ${volume} ${pitch}`);
  }
}

/** Read a dynamic property with a default. */
export function getProp(entity, key, def) {
  try {
    const v = entity.getDynamicProperty(key);
    return v === undefined ? def : v;
  } catch (e) {
    return def;
  }
}

/** Write a dynamic property, tolerating undefined entities. */
export function setProp(entity, key, value) {
  try {
    entity.setDynamicProperty(key, value);
  } catch (e) {
    /* ignore */
  }
}

/** Camera shake (client-side) — used for pressure/power-ups. */
export function shake(player, intensity = 1, seconds = 0.5) {
  cmd(player, `camerashake add @s ${intensity} ${seconds} positional`);
}

/** Clamp helper. */
export function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

/** Distance between two vector3s. */
export function dist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Random element from an array. */
export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Get the point the player is looking at (entity hit or block hit or a point ahead). */
export function getAimPoint(player, maxDistance = 24) {
  try {
    const hits = player.getEntitiesFromViewDirection({ maxDistance });
    if (hits && hits.length) return hits[0].entity.location;
  } catch (e) {
    /* ignore */
  }
  try {
    const block = player.getBlockFromViewDirection({ maxDistance });
    if (block && block.block) return block.block.location;
  } catch (e) {
    /* ignore */
  }
  const dir = player.getViewDirection();
  const loc = player.getHeadLocation();
  return { x: loc.x + dir.x * maxDistance, y: loc.y + dir.y * maxDistance, z: loc.z + dir.z * maxDistance };
}

/** Entities near a point (excluding a given entity). */
export function entitiesNear(dimension, location, radius, exclude) {
  try {
    return dimension
      .getEntities({ location, maxDistance: radius })
      .filter((e) => e !== exclude && e.isValid());
  } catch (e) {
    return [];
  }
}

/** All online players. */
export function players() {
  return world.getAllPlayers();
}

/** Run a callback after N ticks. */
export function later(ticks, fn) {
  system.runTimeout(fn, ticks);
}
