// =====================================================================
//  Bleach: Berzerk  —  mission tracking
// =====================================================================
import { PK } from "../config.js";
import { getProp, setProp, actionBar, title, sound } from "../util.js";
import { getLevel } from "../data/profile.js";
import { MISSIONS } from "../data/missions.js";
import { gainXp } from "./leveling.js";
import { addReputation } from "./squads.js";

export function getActive(player) {
  const id = getProp(player, PK.mission, "");
  if (!id || !MISSIONS[id]) return null;
  return { id, def: MISSIONS[id], prog: getProp(player, PK.missionProg, 0) };
}

export function accept(player, id) {
  if (!MISSIONS[id]) return { ok: false, reason: "Unknown mission." };
  if (getActive(player)) return { ok: false, reason: "Finish or abandon your current mission first." };
  const m = MISSIONS[id];
  if (getLevel(player) < (m.minLevel || 1)) {
    return { ok: false, reason: `Requires level ${m.minLevel}.` };
  }
  setProp(player, PK.mission, id);
  setProp(player, PK.missionProg, m.type === "level" ? getLevel(player) : 0);
  title(player, "§eMission Accepted", m.name);
  return { ok: true };
}

export function abandon(player) {
  setProp(player, PK.mission, "");
  setProp(player, PK.missionProg, 0);
  actionBar(player, "§7Mission abandoned.");
}

/**
 * Report progress. kind is one of: kill, boss, train, pvp, event, raid, level.
 * data (optional) — e.g. the boss id for kind "boss".
 */
export function onProgress(player, kind, data) {
  const active = getActive(player);
  if (!active) return;
  const m = active.def;
  if (m.type !== kind) return;
  if (kind === "boss" && m.target !== data) return;

  let prog = active.prog;
  if (kind === "level") {
    prog = getLevel(player);
  } else {
    prog += 1;
  }
  setProp(player, PK.missionProg, prog);

  const need = m.amount;
  if (prog >= need) {
    complete(player, active.id, m);
  } else if (kind !== "level") {
    actionBar(player, `§e${m.name}: §f${prog}/${need}`);
  }
}

function complete(player, id, m) {
  setProp(player, PK.mission, "");
  setProp(player, PK.missionProg, 0);
  gainXp(player, m.xp, "mission");
  addReputation(player, m.rep);
  title(player, "§aMission Complete", `${m.name} — §e+${m.xp} XP §7• §b+${m.rep} rep`);
  sound(player, "random.levelup", 1.3, 0.7);
}
