// =====================================================================
//  Bleach: Berzerk  —  the main touch menu (Spirit Focus) & sub-screens
// =====================================================================
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PK } from "../config.js";
import { getProp, setProp, actionBar } from "../util.js";
import {
  getLevel, getReiatsu, getMaxReiatsu, getRace, getForm,
  getSlots, setSlots, getStat, addStat,
} from "../data/profile.js";
import { getXp, xpForNext } from "../systems/leveling.js";
import { getRank } from "../systems/reiatsu.js";
import { availableAbilities, identityLabel } from "../systems/raceManager.js";
import { getAbility, castAbility } from "../systems/abilities.js";
import { availableForms, toggleForm } from "../systems/transformations.js";
import { ACTIVITIES, startTraining } from "../systems/training.js";
import { toggleFlight, isFlying, canFly } from "../systems/flight.js";
import { showForm } from "./forms.js";

const STAT_ROWS = [
  { key: PK.str, name: "Strength" },
  { key: PK.def, name: "Defense" },
  { key: PK.spd, name: "Speed" },
  { key: PK.rei, name: "Reiatsu" },
  { key: PK.spc, name: "Spirit Control" },
  { key: PK.swd, name: "Sword Mastery" },
  { key: PK.abm, name: "Ability Mastery" },
];

export async function openMainMenu(player) {
  const slots = getSlots(player);
  const rank = getRank(player);
  const form = new ActionFormData()
    .title("§l§dSpirit Focus")
    .body(
      `§7${identityLabel(player)}\n` +
      `§eLv §f${getLevel(player)} §7• §d${rank.name}\n` +
      `§9Reiatsu §f${getReiatsu(player)}§7/§f${getMaxReiatsu(player)}\n` +
      `§8Form: ${getForm(player)}`
    );

  const handlers = [];

  // ability slots
  for (let i = 0; i < 4; i++) {
    const ab = slots[i] ? getAbility(slots[i]) : null;
    form.button(ab ? `§f${ab.name}\n§8${ab.cost} Reiatsu` : `§8[ Empty Slot ${i + 1} ]`);
    handlers.push(() => {
      if (ab) castAbility(player, ab.id);
      else actionBar(player, "§7Assign an ability in Loadout.");
    });
  }

  form.button("§6⚔ Loadout");
  handlers.push(() => openLoadout(player));
  form.button("§b✦ Transform");
  handlers.push(() => openTransform(player));
  form.button("§a◈ Stats");
  handlers.push(() => openStats(player));
  form.button("§d❁ Training");
  handlers.push(() => openTrain(player));
  form.button(`§3☁ Flight: ${isFlying(player.id) ? "§aON" : "§7OFF"}`);
  handlers.push(() => toggleFlight(player));
  form.button("§fℹ Profile");
  handlers.push(() => openProfile(player));

  const res = await showForm(player, form);
  if (!res || res.canceled) return;
  const h = handlers[res.selection];
  if (h) h();
}

// ---- loadout ---------------------------------------------------------
async function openLoadout(player) {
  const avail = availableAbilities(player);
  const options = ["§8— Empty —", ...avail.map((a) => a.name)];
  const slots = getSlots(player);

  const form = new ModalFormData().title("§6Loadout");
  for (let i = 0; i < 4; i++) {
    const cur = slots[i] ? avail.findIndex((a) => a.id === slots[i]) : -1;
    form.dropdown(`Slot ${i + 1}`, options, cur >= 0 ? cur + 1 : 0);
  }

  const res = await showForm(player, form);
  if (!res || res.canceled) return;
  const chosen = res.formValues.map((v) => (v > 0 ? avail[v - 1].id : null)).filter(Boolean);
  setSlots(player, chosen);
  actionBar(player, "§aLoadout saved.");
}

// ---- transform -------------------------------------------------------
async function openTransform(player) {
  const forms = availableForms(player);
  const menu = new ActionFormData().title("§bTransform").body("Toggle a transformation (again to release).");
  if (forms.length === 0) {
    menu.body("§7You have no transformations unlocked yet.\nProgress your race's questline to awaken them.");
    menu.button("§8Close");
    await showForm(player, menu);
    return;
  }
  for (const f of forms) menu.button(`§e${f.label}`);
  const res = await showForm(player, menu);
  if (!res || res.canceled) return;
  const target = forms[res.selection];
  if (target) {
    const r = toggleForm(player, target.form);
    if (!r.ok) actionBar(player, `§c${r.reason}`);
  }
}

// ---- stats -----------------------------------------------------------
async function openStats(player) {
  const points = getProp(player, PK.statPoints, 0);
  const menu = new ActionFormData()
    .title("§aStats")
    .body(
      `§eUnspent points: §f${points}\n\n` +
      STAT_ROWS.map((s) => `§7${s.name}: §f${getStat(player, s.key)}`).join("\n")
    );
  for (const s of STAT_ROWS) menu.button(`§a+1 ${s.name}`);
  menu.button("§8Close");

  const res = await showForm(player, menu);
  if (!res || res.canceled) return;
  if (res.selection >= STAT_ROWS.length) return;
  if (points <= 0) {
    actionBar(player, "§7No stat points to spend.");
    return openStats(player);
  }
  const stat = STAT_ROWS[res.selection];
  addStat(player, stat.key, 1);
  setProp(player, PK.statPoints, points - 1);
  actionBar(player, `§a+1 ${stat.name}`);
  return openStats(player); // reopen to keep spending
}

// ---- training --------------------------------------------------------
async function openTrain(player) {
  const menu = new ActionFormData().title("§dTraining").body("Train to permanently raise mastery. Stand still to channel.");
  const keys = Object.keys(ACTIVITIES);
  for (const k of keys) menu.button(`§d${ACTIVITIES[k].name}\n§8${ACTIVITIES[k].seconds}s`);
  const res = await showForm(player, menu);
  if (!res || res.canceled) return;
  const key = keys[res.selection];
  if (key) startTraining(player, key);
}

// ---- profile ---------------------------------------------------------
async function openProfile(player) {
  const rank = getRank(player);
  const lvl = getLevel(player);
  const body =
    `§7${identityLabel(player)}\n\n` +
    `§eLevel: §f${lvl}\n` +
    `§eXP: §f${getXp(player)}§7/§f${xpForNext(lvl)}\n` +
    `§dRank: §f${rank.name}\n` +
    `§9Reiatsu: §f${getReiatsu(player)}§7/§f${getMaxReiatsu(player)}\n` +
    `§8Flight: ${canFly(player) ? "§aUnlocked" : "§7Locked (Lv 30)"}\n\n` +
    STAT_ROWS.map((s) => `§7${s.name}: §f${getStat(player, s.key)}`).join("\n");
  const menu = new ActionFormData().title("§fProfile").body(body).button("§8Close");
  await showForm(player, menu);
}
