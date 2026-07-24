// =====================================================================
//  Bleach: Berzerk  —  training (permanent mastery gains)
//  Mobile-friendly: pick an activity, stand still while a short channel
//  fills, then receive a permanent stat gain + XP.  Diminishing returns
//  discourage AFK abuse (channel must complete without moving far).
// =====================================================================
import { system } from "@minecraft/server";
import { PK } from "../config.js";
import { setProp, getProp, actionBar, title, sound, particle, dist } from "../util.js";
import { addStat } from "../data/profile.js";
import { gainXp, XP } from "./leveling.js";
import { onProgress } from "./missions.js";

// activity id -> { name, stat, seconds }
export const ACTIVITIES = {
  meditation: { name: "Meditation", stat: PK.spc, seconds: 8, flag: PK.meditation },
  sword: { name: "Sword Practice", stat: PK.swd, seconds: 7 },
  reiatsu: { name: "Reiatsu Control", stat: PK.rei, seconds: 8 },
  hunt: { name: "Hollow Hunting", stat: PK.str, seconds: 6 },
  quincy: { name: "Quincy Training", stat: PK.abm, seconds: 7 },
  speed: { name: "Speed Training", stat: PK.spd, seconds: 6 },
};

const channeling = new Set(); // player ids currently training

export function startTraining(player, activityId) {
  const act = ACTIVITIES[activityId];
  if (!act) return;
  if (channeling.has(player.id)) {
    actionBar(player, "§7Already training…");
    return;
  }
  channeling.add(player.id);
  const startLoc = player.location;
  const totalTicks = act.seconds * 20;
  let elapsed = 0;

  const iv = system.runInterval(() => {
    if (!player.isValid()) {
      system.clearRun(iv);
      channeling.delete(player.id);
      return;
    }
    // must stay roughly in place
    if (dist(startLoc, player.location) > 3) {
      system.clearRun(iv);
      channeling.delete(player.id);
      actionBar(player, "§cTraining interrupted (you moved).");
      return;
    }
    elapsed += 5;
    const pct = Math.min(100, Math.round((elapsed / totalTicks) * 100));
    actionBar(player, `§b${act.name} §7[${bar(pct)}] ${pct}%`);
    particle(player.dimension, "minecraft:basic_crit_particle", { x: player.location.x, y: player.location.y + 1, z: player.location.z });

    if (elapsed >= totalTicks) {
      system.clearRun(iv);
      channeling.delete(player.id);
      finishTraining(player, act);
    }
  }, 5);
}

function finishTraining(player, act) {
  addStat(player, act.stat, 1);
  gainXp(player, XP.training, "training");
  if (act.flag) setProp(player, act.flag, true);
  onProgress(player, "train");
  title(player, "§aTraining Complete", `§7+1 mastery • +${XP.training} XP`);
  sound(player, "random.levelup", 1.2, 0.7);
}

function bar(pct) {
  const filled = Math.round(pct / 10);
  return "§a" + "|".repeat(filled) + "§8" + "|".repeat(10 - filled);
}
