// =====================================================================
//  Bleach: Berzerk  —  levelling & XP
// =====================================================================
import { MAX_LEVEL, PK, TUNING, RACES } from "../config.js";
import { getProp, setProp, title, sound, particle } from "../util.js";
import { getLevel, getRace } from "../data/profile.js";

/** XP required to advance FROM the given level to the next. */
export function xpForNext(level) {
  return Math.floor(50 * Math.pow(level, 1.6));
}

/** Total XP the player currently holds toward the next level. */
export function getXp(player) {
  return getProp(player, PK.xp, 0);
}

/**
 * Award XP. Humans gain a bonus. Handles multi-level-ups in one call.
 * @returns number of levels gained
 */
export function gainXp(player, amount, reason = "") {
  if (amount <= 0) return 0;
  let level = getLevel(player);
  if (level >= MAX_LEVEL) return 0;

  if (getRace(player) === RACES.HUMAN) amount = Math.round(amount * TUNING.humanXpBonus);

  let xp = getXp(player) + amount;
  let gained = 0;

  while (level < MAX_LEVEL && xp >= xpForNext(level)) {
    xp -= xpForNext(level);
    level++;
    gained++;
  }

  setProp(player, PK.xp, xp);
  if (gained > 0) {
    setProp(player, PK.level, level);
    const points = gained * TUNING.statPointsPerLevel;
    setProp(player, PK.statPoints, getProp(player, PK.statPoints, 0) + points);
    onLevelUp(player, level, points);
  }
  return gained;
}

function onLevelUp(player, level, points) {
  title(player, "§6LEVEL UP", `§eLevel §f${level} §7• §b+${points} stat points`);
  sound(player, "random.levelup");
  const loc = player.location;
  particle(player.dimension, "minecraft:huge_explosion_emitter", { x: loc.x, y: loc.y + 1, z: loc.z });
  // Refill reiatsu on level up as a small reward.
  setProp(player, PK.reiatsu, getProp(player, PK.reiatsu, 0) + 25);
}

/** Convenience XP rewards for various activities. */
export const XP = {
  hollowKill: (tier = 1) => 15 * tier,
  bossKill: (tier = 1) => 250 * tier,
  quest: (tier = 1) => 120 * tier,
  training: 40,
  pvpWin: 180,
  raidWave: 60,
};
