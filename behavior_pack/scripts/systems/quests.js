// =====================================================================
//  Bleach: Berzerk  —  race questlines
//  A linear story per race whose steps unlock transformations. Passive
//  objectives (level/flag/souls/stage) auto-advance; boss objectives
//  advance when the named boss is defeated.
// =====================================================================
import { PK, RACES } from "../config.js";
import { getProp, setProp, title, sound, tell } from "../util.js";
import { getRace, getLevel } from "../data/profile.js";
import { stageIndex } from "../data/hollow.js";
import { unlockShikai, unlockBankai, unlockVisored, unlockVollstandig } from "./transformations.js";

const QUESTLINES = {
  [RACES.SOUL_REAPER]: [
    { id: "meditate", name: "Still the Mind", desc: "Complete Meditation training.", obj: { kind: "flag", flag: PK.meditation }, done: () => {} },
    { id: "shikai", name: "Hear Your Sword", desc: "Reach level 100 to learn your Zanpakuto's name.", obj: { kind: "level", amount: 100 }, done: (p) => unlockShikai(p) },
    { id: "bankai", name: "Subdue the Spirit", desc: "Defeat your Zanpakuto Spirit (!bb quest boss).", obj: { kind: "boss", boss: "zanpakuto_spirit" }, done: (p) => unlockBankai(p) },
    { id: "visored", name: "Master the Hollow Within", desc: "Reach Lv 400, then defeat your Inner Hollow (!bb quest boss).", obj: { kind: "boss", boss: "inner_hollow", minLevel: 400 }, done: (p) => unlockVisored(p) },
  ],
  [RACES.QUINCY]: [
    { id: "attune", name: "Reishi Attunement", desc: "Complete any training.", obj: { kind: "flag", flag: PK.meditation }, done: () => {} },
    { id: "vollstandig", name: "The Quincy Trials", desc: "Reach level 300.", obj: { kind: "level", amount: 300 }, done: (p) => unlockVollstandig(p) },
  ],
  [RACES.HOLLOW]: [
    { id: "gillian", name: "Become Menos", desc: "Devour 25 souls.", obj: { kind: "souls", amount: 25 }, done: () => {} },
    { id: "adjuchas", name: "Retain Your Mind", desc: "Evolve to Adjuchas.", obj: { kind: "stage", stage: "adjuchas" }, done: () => {} },
    { id: "vasto", name: "Vasto Lorde", desc: "Evolve to Vasto Lorde.", obj: { kind: "stage", stage: "vasto" }, done: () => {} },
    { id: "arrancar", name: "Tear the Mask", desc: "Become an Arrancar.", obj: { kind: "stage", stage: "arrancar" }, done: () => {} },
  ],
  [RACES.FULLBRINGER]: [
    { id: "stage2", name: "Deepen the Bond", desc: "Reach level 150.", obj: { kind: "level", amount: 150 }, done: () => {} },
    { id: "complete", name: "Complete Fullbring", desc: "Reach level 350.", obj: { kind: "level", amount: 350 }, done: () => {} },
  ],
  [RACES.HUMAN]: [
    { id: "awaken", name: "Awaken", desc: "Reach level 50 to reveal latent power.", obj: { kind: "level", amount: 50 }, done: () => {} },
    { id: "evolve", name: "Choose a Path", desc: "Evolve via the Quests menu.", obj: { kind: "manual" }, done: () => {} },
  ],
};

export function getCurrent(player) {
  const steps = QUESTLINES[getRace(player)] || [];
  const idx = getProp(player, PK.questStep, 0);
  if (idx >= steps.length) return { done: true, idx, total: steps.length };
  return { done: false, idx, total: steps.length, step: steps[idx] };
}

function objectiveMet(player, obj) {
  switch (obj.kind) {
    case "flag":
      return getProp(player, obj.flag, false) === true;
    case "level":
      return getLevel(player) >= obj.amount;
    case "souls":
      return getProp(player, PK.souls, 0) >= obj.amount;
    case "stage":
      return stageIndex(getProp(player, PK.hollowStage, "lesser")) >= stageIndex(obj.stage);
    default:
      return false; // boss / manual advance elsewhere
  }
}

/** Passive check — advances auto-satisfiable steps. Call each passive tick. */
export function check(player) {
  const cur = getCurrent(player);
  if (cur.done || !cur.step) return;
  if (objectiveMet(player, cur.step.obj)) advance(player, cur.idx, cur.step);
}

/** Called when a boss dies. */
export function onBoss(player, bossId) {
  const cur = getCurrent(player);
  if (cur.done || !cur.step) return;
  const o = cur.step.obj;
  if (o.kind !== "boss" || o.boss !== bossId) return;
  if (o.minLevel && getLevel(player) < o.minLevel) return;
  advance(player, cur.idx, cur.step);
}

/** Manual advance (Human evolution choice). */
export function advanceManual(player) {
  const cur = getCurrent(player);
  if (!cur.done && cur.step && cur.step.obj.kind === "manual") advance(player, cur.idx, cur.step);
}

function advance(player, idx, step) {
  try {
    step.done(player);
  } catch (e) {}
  setProp(player, PK.questStep, idx + 1);
  title(player, "§6Quest Complete", step.name);
  sound(player, "random.levelup");
  const next = getCurrent(player);
  if (!next.done && next.step) {
    tell(player, `§eNext quest: §f${next.step.name} §7— ${next.step.desc}`);
  } else {
    tell(player, "§6You have completed your race's questline!");
  }
}

/** The two special story bosses this system relies on. */
export const STORY_BOSS_IDS = ["zanpakuto_spirit", "inner_hollow"];
