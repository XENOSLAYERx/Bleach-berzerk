// =====================================================================
//  Bleach: Berzerk  —  progression gates
//  Without full NPC questlines yet, transformations unlock through the
//  levelling + training the spec describes (meditation, level tiers,
//  trials).  This keeps the intended progression curve intact.
// =====================================================================
import { PK, RACES } from "../config.js";
import { getProp, setProp, title } from "../util.js";
import { getRace, getLevel } from "../data/profile.js";
import { unlockShikai, unlockBankai, unlockVisored, unlockVollstandig } from "./transformations.js";

/** Called periodically; opens the next transformation when earned. */
export function checkUnlocks(player) {
  const race = getRace(player);
  const lvl = getLevel(player);

  if (race === RACES.SOUL_REAPER) {
    // Shikai: Lv 100 + meditation training completed
    if (lvl >= 100 && getProp(player, PK.meditation, false) && !getProp(player, PK.shikai, false)) {
      unlockShikai(player);
    }
    // Bankai: Lv 300 (subdue your Zanpakuto spirit) — requires Shikai
    if (lvl >= 300 && getProp(player, PK.shikai, false) && !getProp(player, PK.bankai, false)) {
      setProp(player, PK.zanQuest, true);
      unlockBankai(player);
    }
    // Visored: Lv 400 (defeat inner Hollow)
    if (lvl >= 400 && !getProp(player, PK.visored, false)) {
      setProp(player, PK.innerHollow, true);
      unlockVisored(player);
    }
  }

  if (race === RACES.QUINCY) {
    // Vollstandig: Lv 300 + Quincy Trials
    if (lvl >= 300 && !getProp(player, PK.vollstandig, false)) {
      setProp(player, PK.quincyTrials, true);
      unlockVollstandig(player);
    }
  }

  if (race === RACES.FULLBRINGER) {
    // Complete Fullbring progression by level tiers.
    const stage = getProp(player, PK.fbStage, 1);
    if (lvl >= 150 && stage < 2) {
      setProp(player, PK.fbStage, 2);
      title(player, "§aFullbring: Stage 2", "Your bond deepens.");
    }
    if (lvl >= 350 && stage < 3) {
      setProp(player, PK.fbStage, 3);
      title(player, "§aComplete Fullbring!", "Your Fullbring is perfected.");
    }
  }
}
