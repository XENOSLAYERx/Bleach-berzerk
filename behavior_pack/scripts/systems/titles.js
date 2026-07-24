// =====================================================================
//  Bleach: Berzerk  —  endgame titles
// =====================================================================
import { PK, RACES } from "../config.js";
import { getProp, setProp, title as showTitle, sound } from "../util.js";
import { getRace, getLevel, getTitles, addTitle } from "../data/profile.js";
import { getSquad } from "./squads.js";
import { getPvpRank } from "./pvp.js";

// condition(player) -> boolean
const TITLES = [
  { id: "Soul King", cond: (p) => getLevel(p) >= 1000 },
  { id: "Soul King Candidate", cond: (p) => getLevel(p) >= 900 },
  { id: "Captain Commander", cond: (p) => getRace(p) === RACES.SOUL_REAPER && getSquad(p) === 1 && getLevel(p) >= 300 },
  { id: "Captain", cond: (p) => getRace(p) === RACES.SOUL_REAPER && getProp(p, PK.bankai, false) && getLevel(p) >= 300 },
  { id: "Strongest Espada", cond: (p) => getRace(p) === RACES.HOLLOW && getProp(p, PK.hollowStage, "") === "arrancar" && getLevel(p) >= 400 },
  { id: "Hollow Emperor", cond: (p) => getRace(p) === RACES.HOLLOW && getProp(p, PK.hollowStage, "") === "arrancar" && getLevel(p) >= 600 },
  { id: "Quincy King", cond: (p) => getRace(p) === RACES.QUINCY && getProp(p, PK.vollstandig, false) && getLevel(p) >= 300 },
  { id: "Fullbring Master", cond: (p) => getRace(p) === RACES.FULLBRINGER && getProp(p, PK.fbStage, 1) >= 3 },
  { id: "Legend", cond: (p) => getPvpRank(p) === "Legend" },
];

/** Award any newly-earned titles. Call on the passive tick. */
export function checkTitles(player) {
  const owned = getTitles(player);
  for (const t of TITLES) {
    if (!owned.includes(t.id) && t.cond(player)) {
      addTitle(player, t.id);
      showTitle(player, "§6TITLE EARNED", t.id);
      sound(player, "random.levelup", 1.4, 0.6);
      if (!getActiveTitle(player)) setActiveTitle(player, t.id);
    }
  }
}

export function getActiveTitle(player) {
  return getProp(player, PK.activeTitle, "");
}
export function setActiveTitle(player, t) {
  setProp(player, PK.activeTitle, t);
}
