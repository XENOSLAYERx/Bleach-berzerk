// =====================================================================
//  Bleach: Berzerk  —  player profile (persistence layer)
//  All state is stored as per-player dynamic properties so it survives
//  relogs and world reloads without any external files.
// =====================================================================
import { PK, RACES, TUNING } from "../config.js";
import { getProp, setProp } from "../util.js";

const STAT_KEYS = [PK.str, PK.def, PK.spd, PK.rei, PK.spc, PK.swd, PK.abm];

/** Has this player finished race selection? */
export function isCreated(player) {
  return getProp(player, PK.created, false) === true;
}

/** Initialise a brand-new profile once a race is chosen. */
export function initProfile(player, race) {
  setProp(player, PK.created, true);
  setProp(player, PK.race, race);
  setProp(player, PK.level, 1);
  setProp(player, PK.xp, 0);
  setProp(player, PK.statPoints, 0);
  for (const k of STAT_KEYS) setProp(player, k, 1);
  setProp(player, PK.reiatsu, getMaxReiatsu(player));
  setProp(player, PK.form, "none");
  setProp(player, PK.squad, 0);
  setProp(player, PK.rep, 0);
  setProp(player, PK.pvp, 0);
  setProp(player, PK.slots, JSON.stringify([]));
  setProp(player, PK.titles, JSON.stringify([]));
}

// ---- stats -----------------------------------------------------------
export function getStat(player, key) {
  return getProp(player, key, 1);
}
export function setStat(player, key, value) {
  setProp(player, key, Math.max(1, Math.round(value)));
}
export function addStat(player, key, amount) {
  setStat(player, key, getStat(player, key) + amount);
}

// ---- level / xp ------------------------------------------------------
export function getLevel(player) {
  return getProp(player, PK.level, 1);
}
export function getXp(player) {
  return getProp(player, PK.xp, 0);
}

// ---- reiatsu ---------------------------------------------------------
export function getMaxReiatsu(player) {
  const rei = getStat(player, PK.rei);
  const lvl = getLevel(player);
  return Math.round(
    TUNING.baseReiatsu + rei * TUNING.reiatsuPerStat + lvl * TUNING.reiatsuPerLevel
  );
}
export function getReiatsu(player) {
  return Math.max(0, Math.min(getProp(player, PK.reiatsu, 0), getMaxReiatsu(player)));
}
export function setReiatsu(player, value) {
  setProp(player, PK.reiatsu, Math.max(0, Math.min(value, getMaxReiatsu(player))));
}
export function spendReiatsu(player, amount) {
  const cur = getReiatsu(player);
  if (cur < amount) return false;
  setReiatsu(player, cur - amount);
  return true;
}

// ---- race ------------------------------------------------------------
export function getRace(player) {
  return getProp(player, PK.race, RACES.HUMAN);
}

// ---- transformation --------------------------------------------------
export function getForm(player) {
  return getProp(player, PK.form, "none");
}
export function setForm(player, form) {
  setProp(player, PK.form, form);
}

// ---- loadout ---------------------------------------------------------
export function getSlots(player) {
  try {
    const arr = JSON.parse(getProp(player, PK.slots, "[]"));
    return Array.isArray(arr) ? arr.slice(0, 4) : [];
  } catch (e) {
    return [];
  }
}
export function setSlots(player, slots) {
  setProp(player, PK.slots, JSON.stringify(slots.slice(0, 4)));
}

// ---- titles ----------------------------------------------------------
export function getTitles(player) {
  try {
    return JSON.parse(getProp(player, PK.titles, "[]"));
  } catch (e) {
    return [];
  }
}
export function addTitle(player, title) {
  const t = getTitles(player);
  if (!t.includes(title)) {
    t.push(title);
    setProp(player, PK.titles, JSON.stringify(t));
  }
}
