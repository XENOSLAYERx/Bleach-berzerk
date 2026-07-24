// =====================================================================
//  Bleach: Berzerk  —  Hollow soul-eating & evolution
// =====================================================================
import { PK, RACES } from "../config.js";
import { getProp, setProp, title, sound, pick, actionBar } from "../util.js";
import { getRace } from "../data/profile.js";
import { HOLLOW_STAGES, nextStage, ASPECTS, RESURRECCION_FORMS } from "../data/hollow.js";
import { addStat } from "../data/profile.js";

/** Feed the hollow. Souls come from kills (players, hollows, mobs). */
export function addSouls(player, amount) {
  if (getRace(player) !== RACES.HOLLOW) return;
  const stageId = getProp(player, PK.hollowStage, "lesser");
  if (stageId === "arrancar") return; // top of ladder
  const souls = getProp(player, PK.souls, 0) + amount;
  setProp(player, PK.souls, souls);
  const next = nextStage(stageId);
  if (next && souls >= next.souls) {
    evolve(player, next);
  } else if (next) {
    actionBar(player, `§8Souls ${souls}/${next.souls} → ${next.name}`);
  }
}

function evolve(player, next) {
  setProp(player, PK.hollowStage, next.id);
  // Each evolution is a big permanent power spike.
  addStat(player, PK.str, 6);
  addStat(player, PK.def, 5);
  addStat(player, PK.spd, 3);
  addStat(player, PK.rei, 6);

  if (next.id === "arrancar") {
    const aspect = pick(ASPECTS);
    const res = pick(RESURRECCION_FORMS);
    setProp(player, PK.aspect, aspect);
    setProp(player, PK.resForm, res);
    setProp(player, PK.released, true); // unlocks Resurreccion transform
    title(player, "§4ARRANCAR", `Aspect of ${aspect} • ${res} Resurreccion`);
  } else {
    title(player, "§5Evolution!", `You are now a ${next.name}`);
  }
  sound(player, "mob.wither.spawn", 0.8, 0.7);
}
