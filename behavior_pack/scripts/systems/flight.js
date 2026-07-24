// =====================================================================
//  Bleach: Berzerk  —  Spirit Flight (mobile-friendly hover flight)
//  Reliable across versions without creative-mode fly permissions:
//  jump = rise, sneak = descend, otherwise hover.  Costs Reiatsu.
// =====================================================================
import { system } from "@minecraft/server";
import { effect, actionBar, sound, getProp } from "../util.js";
import { getLevel, getReiatsu, spendReiatsu } from "../data/profile.js";
import { getRank } from "./reiatsu.js";

const flying = new Set(); // player ids

export function canFly(player) {
  return getLevel(player) >= 30 || getRank(player).min >= 50;
}

export function isFlying(id) {
  return flying.has(id);
}

export function toggleFlight(player) {
  if (!canFly(player)) {
    actionBar(player, "§7Reach Officer rank (Lv 30+) to unlock flight.");
    return false;
  }
  if (flying.has(player.id)) {
    flying.delete(player.id);
    actionBar(player, "§7Spirit Flight disabled.");
    return false;
  }
  flying.add(player.id);
  actionBar(player, "§bSpirit Flight enabled §7— jump to rise, sneak to descend.");
  sound(player, "beacon.activate", 1.3, 0.7);
  return true;
}

export function stopFlight(id) {
  flying.delete(id);
}

/** Called every tick-ish for active fliers. */
export function flightTick(player) {
  if (!flying.has(player.id)) return;
  // Drain reiatsu; if empty, drop.
  if (!spendReiatsu(player, 1)) {
    flying.delete(player.id);
    actionBar(player, "§9Out of Reiatsu — flight ends.");
    return;
  }
  // No fall damage while flying.
  effect(player, "slow_falling", 1.2, 0, false);
  if (player.isJumping) {
    effect(player, "levitation", 0.4, 3, false);
  }
}

export function fliers() {
  return flying;
}
