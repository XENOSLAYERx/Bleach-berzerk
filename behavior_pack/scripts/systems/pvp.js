// =====================================================================
//  Bleach: Berzerk  —  ranked PvP duels
// =====================================================================
import { world } from "@minecraft/server";
import { MessageFormData } from "@minecraft/server-ui";
import { PK, PVP_RANKS } from "../config.js";
import { getProp, setProp, title, sound, actionBar, effect } from "../util.js";
import { arenaAnchor, buildZone } from "./travel.js";
import { showForm } from "../ui/forms.js";

const RATING_TIERS = [0, 200, 500, 1000, 2000, 3500]; // maps to PVP_RANKS

const pending = new Map(); // targetId -> challengerId
const duels = new Map(); // playerId -> { opponentId, returnLoc }

export function getRating(player) {
  return getProp(player, PK.pvp, 0);
}
export function getPvpRank(player) {
  const r = getRating(player);
  let idx = 0;
  for (let i = 0; i < RATING_TIERS.length; i++) if (r >= RATING_TIERS[i]) idx = i;
  return PVP_RANKS[idx];
}

/** Challenge another player to a ranked duel. */
export async function challenge(challenger, target) {
  if (!target || target.id === challenger.id) {
    actionBar(challenger, "§7Pick a valid opponent.");
    return;
  }
  if (duels.has(challenger.id) || duels.has(target.id)) {
    actionBar(challenger, "§7Someone is already in a duel.");
    return;
  }
  pending.set(target.id, challenger.id);
  actionBar(challenger, `§7Challenge sent to ${target.name}.`);

  const form = new MessageFormData()
    .title("§cRanked Duel")
    .body(`§f${challenger.name} §7challenges you to a ranked duel!`)
    .button1("§aAccept")
    .button2("§cDecline");
  const res = await showForm(target, form);
  if (res && !res.canceled && res.selection === 0) {
    startDuel(challenger, target);
  } else {
    actionBar(challenger, `§7${target.name} declined.`);
  }
  pending.delete(target.id);
}

function startDuel(a, b) {
  buildZone("arena");
  const c = arenaAnchor();
  const dim = world.getDimension("overworld");
  duels.set(a.id, { opponentId: b.id, returnLoc: a.location });
  duels.set(b.id, { opponentId: a.id, returnLoc: b.location });
  try {
    a.teleport({ x: c.x - 6, y: c.y, z: c.z + 0.5 }, { dimension: dim });
    b.teleport({ x: c.x + 6, y: c.y, z: c.z + 0.5 }, { dimension: dim });
  } catch (e) {}
  for (const p of [a, b]) {
    effect(p, "resistance", 3, 4, false); // brief invuln at start
    title(p, "§cDUEL!", "First to fall loses.");
    sound(p, "mob.wither.spawn", 1, 0.8);
  }
}

/** Called on player death; resolves a duel if the dead player was in one. */
export function onDeath(deadPlayer) {
  const d = duels.get(deadPlayer.id);
  if (!d) return false;
  const winner = world.getAllPlayers().find((p) => p.id === d.opponentId);
  finishDuel(deadPlayer, false);
  if (winner) finishDuel(winner, true);
  return true;
}

function finishDuel(player, won) {
  const d = duels.get(player.id);
  duels.delete(player.id);
  const cur = getRating(player);
  const delta = won ? 25 : -15;
  setProp(player, PK.pvp, Math.max(0, cur + delta));
  if (won) {
    title(player, "§6VICTORY", `§e+25 rating • ${getPvpRank(player)}`);
    // XP + mission progress handled by caller (main entityDie) for kills.
  } else {
    title(player, "§7Defeat", `${delta} rating • ${getPvpRank(player)}`);
  }
  if (d && d.returnLoc) {
    try {
      player.teleport(d.returnLoc, { dimension: world.getDimension("overworld") });
    } catch (e) {}
  }
}

export function inDuel(playerId) {
  return duels.has(playerId);
}
export function clearDuel(playerId) {
  duels.delete(playerId);
  pending.delete(playerId);
}
