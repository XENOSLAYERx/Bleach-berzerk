// =====================================================================
//  Bleach: Berzerk  —  squad & faction management
// =====================================================================
import { PK, RACES } from "../config.js";
import { getProp, setProp, effect, title, sound } from "../util.js";
import { getRace } from "../data/profile.js";
import { SQUADS, FACTIONS } from "../data/squads.js";

export function getSquad(player) {
  return getProp(player, PK.squad, 0);
}

export function joinSquad(player, squadId) {
  if (getRace(player) !== RACES.SOUL_REAPER) {
    return { ok: false, reason: "Only Soul Reapers can join the Gotei 13." };
  }
  if (!SQUADS[squadId]) return { ok: false, reason: "Unknown squad." };
  setProp(player, PK.squad, squadId);
  const s = SQUADS[squadId];
  title(player, "§bEnlisted", `${s.name} — Captain ${s.captain}`);
  sound(player, "random.levelup");
  return { ok: true };
}

export function getReputation(player) {
  return getProp(player, PK.rep, 0);
}
export function addReputation(player, amount) {
  setProp(player, PK.rep, getReputation(player) + amount);
}

/** Faction is derived from race. */
export function getFaction(player) {
  return FACTIONS[getRace(player)] || FACTIONS[RACES.HUMAN];
}

/** Apply the enlisted squad's passive buff — call on the passive tick. */
export function applySquadBuff(player) {
  const sq = getSquad(player);
  if (!sq || !SQUADS[sq]) return;
  const b = SQUADS[sq].buff;
  effect(player, b.id, 3, b.amp, false);
}
