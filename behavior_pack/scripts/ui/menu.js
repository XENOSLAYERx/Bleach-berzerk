// =====================================================================
//  Bleach: Berzerk  —  the main touch menu (Spirit Focus) & sub-screens
// =====================================================================
import { world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { PK, RACES } from "../config.js";
import { getProp, setProp, actionBar } from "../util.js";
import {
  getLevel, getReiatsu, getMaxReiatsu, getRace, getForm,
  getSlots, setSlots, getStat, addStat, getTitles,
} from "../data/profile.js";
import { getXp, xpForNext } from "../systems/leveling.js";
import { getRank } from "../systems/reiatsu.js";
import { availableAbilities, identityLabel, assignStarterKit } from "../systems/raceManager.js";
import { getAbility, castAbility } from "../systems/abilities.js";
import { availableForms, toggleForm } from "../systems/transformations.js";
import { ACTIVITIES, startTraining } from "../systems/training.js";
import { toggleFlight, isFlying, canFly } from "../systems/flight.js";
import { getSquad, joinSquad, getFaction, getReputation } from "../systems/squads.js";
import { SQUADS, SQUAD_IDS } from "../data/squads.js";
import { getActive as getActiveMission, accept as acceptMission, abandon as abandonMission } from "../systems/missions.js";
import { MISSIONS, MISSION_IDS } from "../data/missions.js";
import { getCurrent as getQuestState, advanceManual } from "../systems/quests.js";
import { ZONES, ZONE_IDS, travelTo } from "../systems/travel.js";
import { getRating, getPvpRank, challenge } from "../systems/pvp.js";
import { getActiveTitle, setActiveTitle } from "../systems/titles.js";
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
  form.button("§2⚑ Squad / Faction");
  handlers.push(() => openSquad(player));
  form.button("§e✎ Missions");
  handlers.push(() => openMissions(player));
  form.button("§6❂ Quests");
  handlers.push(() => openQuests(player));
  form.button("§b⛩ Travel");
  handlers.push(() => openTravel(player));
  form.button("§c⚔ Ranked PvP");
  handlers.push(() => openPvp(player));
  form.button("§d★ Titles");
  handlers.push(() => openTitles(player));
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

// ---- NPC interaction dispatcher (walk-up captains / mentors) ---------
export async function openNpc(player, role, squadId) {
  if (role === "captain" && SQUADS[squadId]) {
    const s = SQUADS[squadId];
    const menu = new ActionFormData()
      .title(`§cCaptain — ${s.captain}`)
      .body(`§7${s.name} • ${s.specialty}\n§7Buff: keeps you strong in the field.`)
      .button(`§aEnlist in ${s.name}`)
      .button("§e✎ Mission Board")
      .button("§8Close");
    const res = await showForm(player, menu);
    if (!res || res.canceled) return;
    if (res.selection === 0) {
      const r = joinSquad(player, squadId);
      if (!r.ok) actionBar(player, `§c${r.reason}`);
    } else if (res.selection === 1) {
      openMissions(player);
    }
    return;
  }
  // Mentor / sensei
  const menu = new ActionFormData()
    .title("§bSpirit Mentor")
    .body("§7How can I guide you?")
    .button("§6❂ Questline")
    .button("§e✎ Missions")
    .button("§d❁ Training")
    .button("§8Close");
  const res = await showForm(player, menu);
  if (!res || res.canceled) return;
  if (res.selection === 0) openQuests(player);
  else if (res.selection === 1) openMissions(player);
  else if (res.selection === 2) openTrain(player);
}

// ---- squad / faction -------------------------------------------------
async function openSquad(player) {
  const faction = getFaction(player);
  if (getRace(player) !== RACES.SOUL_REAPER) {
    const menu = new ActionFormData()
      .title("§2Faction")
      .body(`§7Faction: §f${faction.name}\n§bReputation: §f${getReputation(player)}\n\n§8Only Soul Reapers enlist in the Gotei 13.`)
      .button("§8Close");
    await showForm(player, menu);
    return;
  }
  const cur = getSquad(player);
  const menu = new ActionFormData()
    .title("§2Gotei 13")
    .body(`§7Current: §f${cur ? SQUADS[cur].name + " — " + SQUADS[cur].captain : "Unaffiliated"}\n§bReputation: §f${getReputation(player)}\n\n§7Choose a squad to enlist:`);
  for (const id of SQUAD_IDS) menu.button(`§f${SQUADS[id].name}\n§8Capt. ${SQUADS[id].captain} • ${SQUADS[id].specialty}`);
  const res = await showForm(player, menu);
  if (!res || res.canceled) return;
  const id = SQUAD_IDS[res.selection];
  const r = joinSquad(player, id);
  if (!r.ok) actionBar(player, `§c${r.reason}`);
}

// ---- missions --------------------------------------------------------
async function openMissions(player) {
  const active = getActiveMission(player);
  const menu = new ActionFormData().title("§eMission Board");
  if (active) {
    const need = active.def.amount;
    menu.body(`§eActive: §f${active.def.name}\n§7${active.def.desc}\n§bProgress: §f${active.prog}/${need}`);
    menu.button("§cAbandon Mission");
    const res = await showForm(player, menu);
    if (res && !res.canceled && res.selection === 0) abandonMission(player);
    return;
  }
  menu.body("§7Accept a mission for XP & reputation:");
  const lvl = getLevel(player);
  const ids = MISSION_IDS.filter((id) => lvl >= (MISSIONS[id].minLevel || 1));
  for (const id of ids) {
    const m = MISSIONS[id];
    menu.button(`§f${m.name}\n§8${m.desc} • +${m.xp} XP`);
  }
  const res = await showForm(player, menu);
  if (!res || res.canceled) return;
  const id = ids[res.selection];
  const r = acceptMission(player, id);
  if (!r.ok) actionBar(player, `§c${r.reason}`);
}

// ---- quests ----------------------------------------------------------
async function openQuests(player) {
  const q = getQuestState(player);
  const menu = new ActionFormData().title("§6Questline");
  if (q.done) {
    menu.body("§aYou have completed your race's questline!").button("§8Close");
    await showForm(player, menu);
    return;
  }
  menu.body(`§6Quest ${q.idx + 1}/${q.total}: §f${q.step.name}\n§7${q.step.desc}`);
  const isHumanChoice = getRace(player) === RACES.HUMAN && q.step.obj.kind === "manual";
  if (isHumanChoice) {
    for (const r of [RACES.SOUL_REAPER, RACES.FULLBRINGER, RACES.QUINCY]) {
      menu.button(`§fEvolve → ${r.replace("_", " ")}`);
    }
  }
  menu.button("§8Close");
  const res = await showForm(player, menu);
  if (!res || res.canceled) return;
  if (isHumanChoice) {
    const paths = [RACES.SOUL_REAPER, RACES.FULLBRINGER, RACES.QUINCY];
    const chosen = paths[res.selection];
    if (chosen) {
      setProp(player, PK.race, chosen);
      assignStarterKit(player, chosen);
      advanceManual(player);
      actionBar(player, `§aYou have evolved into a ${chosen.replace("_", " ")}!`);
    }
  }
}

// ---- travel ----------------------------------------------------------
async function openTravel(player) {
  const menu = new ActionFormData().title("§bSenkaimon — Travel").body("§7Choose a destination:");
  for (const id of ZONE_IDS) menu.button(`§f${ZONES[id].name}`);
  const res = await showForm(player, menu);
  if (!res || res.canceled) return;
  const id = ZONE_IDS[res.selection];
  const r = travelTo(player, id);
  if (!r.ok) actionBar(player, `§c${r.reason}`);
}

// ---- ranked pvp ------------------------------------------------------
async function openPvp(player) {
  const menu = new ActionFormData()
    .title("§cRanked PvP")
    .body(`§7Rank: §f${getPvpRank(player)} §7(§f${getRating(player)}§7 rating)\n\n§7Challenge an online player:`);
  const others = world.getAllPlayers().filter((p) => p.id !== player.id);
  for (const p of others) menu.button(`§f${p.name}`);
  menu.button("§8Close");
  const res = await showForm(player, menu);
  if (!res || res.canceled || res.selection >= others.length) return;
  challenge(player, others[res.selection]);
}

// ---- titles ----------------------------------------------------------
async function openTitles(player) {
  const owned = getTitles(player);
  const active = getActiveTitle(player);
  const menu = new ActionFormData()
    .title("§dTitles")
    .body(owned.length ? `§7Active: §f${active || "none"}\n\n§7Select a title to display:` : "§7You haven't earned any titles yet.\nReach endgame milestones to unlock them.");
  for (const t of owned) menu.button(`${t === active ? "§a» " : "§f"}${t}`);
  menu.button("§7Clear title");
  const res = await showForm(player, menu);
  if (!res || res.canceled) return;
  if (res.selection === owned.length) {
    setActiveTitle(player, "");
    actionBar(player, "§7Title cleared.");
  } else if (owned[res.selection]) {
    setActiveTitle(player, owned[res.selection]);
    actionBar(player, `§dTitle set: ${owned[res.selection]}`);
  }
}
