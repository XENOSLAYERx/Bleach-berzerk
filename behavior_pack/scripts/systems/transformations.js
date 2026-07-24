// =====================================================================
//  Bleach: Berzerk  —  transformations (Shikai/Bankai/Mask/Resurreccion/
//  Vollstandig/Complete Fullbring) and their unlock gates.
// =====================================================================
import { PK, RACES, FORM_MULT } from "../config.js";
import { getProp, setProp, title, sound, effect, particle } from "../util.js";
import { getRace, getForm, setForm, getLevel } from "../data/profile.js";
import { restore } from "./reiatsu.js";
import { pressureBurst } from "./pressure.js";

// Which form id each race toggles, and the unlock property/level.
const FORM_INFO = {
  [RACES.SOUL_REAPER]: [
    { form: "shikai", label: "Shikai", unlockProp: PK.shikai, callout: "Release command accepted!" },
    { form: "bankai", label: "Bankai", unlockProp: PK.bankai, callout: "BANKAI!" },
    { form: "mask", label: "Hollow Mask", unlockProp: PK.visored, callout: "The mask descends..." },
  ],
  [RACES.HOLLOW]: [
    { form: "resurreccion", label: "Resurreccion", unlockProp: PK.released, callout: "Resurreccion!" },
  ],
  [RACES.QUINCY]: [
    { form: "vollstandig", label: "Vollstandig", unlockProp: PK.vollstandig, callout: "Vollstandig!" },
  ],
  [RACES.FULLBRINGER]: [
    { form: "fullbring", label: "Fullbring", unlockProp: null, callout: "Fullbring!" }, // always usable once a Fullbringer
  ],
  [RACES.HUMAN]: [],
};

/** All transform options this player currently has (unlocked ones). */
export function availableForms(player) {
  const race = getRace(player);
  const list = FORM_INFO[race] || [];
  return list.filter((f) => f.unlockProp === null || getProp(player, f.unlockProp, false) === true);
}

/** Toggle a transformation on/off. */
export function toggleForm(player, formId) {
  const race = getRace(player);
  const info = (FORM_INFO[race] || []).find((f) => f.form === formId);
  if (!info) return { ok: false, reason: "That form isn't available to your race." };
  if (info.unlockProp !== null && getProp(player, info.unlockProp, false) !== true) {
    return { ok: false, reason: `${info.label} is not unlocked yet.` };
  }

  const current = getForm(player);
  if (current === formId) {
    setForm(player, "none");
    title(player, "§7Sealed", `${info.label} released.`);
    sound(player, "mob.evocation_illager.deactivate");
    return { ok: true, active: false };
  }

  // Bankai supersedes Shikai etc. — simply switch.
  setForm(player, formId);
  title(player, `§6${info.callout}`, `§e${info.label} active`);
  applyFormBuffs(player, formId);
  restore(player);
  pressureBurst(player);
  return { ok: true, active: true };
}

/** Refresh the stat effects granted by an active form (called each passive tick). */
export function applyFormBuffs(player, formId = getForm(player)) {
  if (!formId || formId === "none") return;
  const mult = FORM_MULT[formId] || 1;
  const tier = mult >= 3 ? 3 : mult >= 2.4 ? 2 : 1;
  effect(player, "strength", 3, tier - 1, false);
  effect(player, "resistance", 3, Math.max(0, tier - 2), false);
  effect(player, "speed", 3, tier >= 2 ? 1 : 0, false);
  const loc = player.location;
  particle(player.dimension, "minecraft:basic_flame_particle", { x: loc.x, y: loc.y + 1.2, z: loc.z });
}

// ---------------- unlock helpers (called by quests / events / commands) ----------------
export function unlockShikai(player) {
  if (getProp(player, PK.shikai, false)) return false;
  setProp(player, PK.shikai, true);
  title(player, "§bShikai Unlocked!", "Learn your Zanpakuto's name — transform to release it.");
  sound(player, "random.levelup");
  return true;
}
export function unlockBankai(player) {
  setProp(player, PK.shikai, true);
  if (getProp(player, PK.bankai, false)) return false;
  setProp(player, PK.bankai, true);
  title(player, "§6Bankai Unlocked!", "You have subdued your Zanpakuto spirit.");
  sound(player, "random.levelup");
  return true;
}
export function unlockVisored(player) {
  if (getProp(player, PK.visored, false)) return false;
  setProp(player, PK.visored, true);
  setProp(player, PK.maskStage, 1);
  title(player, "§8Visored!", "You have subdued your inner Hollow.");
  return true;
}
export function unlockVollstandig(player) {
  if (getProp(player, PK.vollstandig, false)) return false;
  setProp(player, PK.vollstandig, true);
  title(player, "§eVollstandig Unlocked!", "The Quincy's holy form is yours.");
  return true;
}
