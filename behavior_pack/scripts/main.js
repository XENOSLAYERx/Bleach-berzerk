// =====================================================================
//  Bleach: Berzerk  —  entry point
//  Builds ability registries, wires world events, and starts the tick
//  loops that drive Reiatsu, the HUD, progression, flight and bosses.
// =====================================================================
import { world, system } from "@minecraft/server";
import { TICK, RACES } from "./config.js";
import { actionBar, getProp } from "./util.js";

// data / registries
import { buildBaseAbilities } from "./data/baseAbilities.js";
import { buildZanpakuto } from "./data/zanpakuto.js";
import { buildSchrift } from "./data/schrift.js";
import { buildHollow } from "./data/hollow.js";
import { buildFullbring } from "./data/fullbring.js";

// systems
import { isCreated, getRace, getLevel, getReiatsu, getMaxReiatsu, getForm, getSlots } from "./data/profile.js";
import { regen } from "./systems/reiatsu.js";
import { getRank } from "./systems/reiatsu.js";
import { gainXp, XP } from "./systems/leveling.js";
import { clearCooldowns, castAbility } from "./systems/abilities.js";
import { applyFormBuffs } from "./systems/transformations.js";
import { passiveAura } from "./systems/pressure.js";
import { checkUnlocks } from "./systems/progression.js";
import { flightTick, stopFlight, fliers } from "./systems/flight.js";
import { bossTick, onEntityDie } from "./systems/bossManager.js";
import { maybeTriggerEvent } from "./systems/worldEvents.js";
import { addSouls } from "./systems/hollowEvolution.js";
import { applySquadBuff, getSquad } from "./systems/squads.js";
import { onProgress as missionProgress } from "./systems/missions.js";
import { check as questCheck, onBoss as questOnBoss } from "./systems/quests.js";
import { checkTitles, getActiveTitle } from "./systems/titles.js";
import { applyPassive as schriftPassive } from "./systems/schriftPassive.js";
import { onDeath as pvpOnDeath, clearDuel } from "./systems/pvp.js";
import { onHurt as schriftOnHurt, onDealt as schriftOnDealt } from "./systems/schriftSpecial.js";

// ui
import { openRaceSelect } from "./ui/raceSelect.js";
import { openMainMenu, openNpc } from "./ui/menu.js";

// commands
import { registerCommands } from "./commands/index.js";

// ---------------------------------------------------------------------
//  Boot
// ---------------------------------------------------------------------
buildBaseAbilities();
buildZanpakuto();
buildSchrift();
buildHollow();
buildFullbring();
registerCommands();

world.sendMessage("§d§lBleach: Berzerk §r§7loaded. Type §f!bb help§7.");

// ---------------------------------------------------------------------
//  First-join race selection
// ---------------------------------------------------------------------
world.afterEvents.playerSpawn.subscribe((ev) => {
  if (!ev.initialSpawn) return;
  const player = ev.player;
  system.runTimeout(() => {
    if (!isCreated(player)) openRaceSelect(player);
  }, 25);
});

// ---------------------------------------------------------------------
//  Spirit Focus item -> open menu (or quick-cast slot 1 while sneaking)
// ---------------------------------------------------------------------
world.afterEvents.itemUse.subscribe((ev) => {
  const item = ev.itemStack;
  const player = ev.source;
  if (!item || player.typeId !== "minecraft:player") return;
  if (item.typeId !== "bb:spirit_focus") return;
  if (!isCreated(player)) {
    openRaceSelect(player);
    return;
  }
  if (player.isSneaking) {
    const slots = getSlots(player);
    if (slots[0]) castAbility(player, slots[0]);
    else actionBar(player, "§7No ability in slot 1.");
  } else {
    openMainMenu(player);
  }
});

// ---------------------------------------------------------------------
//  Walk-up NPC interaction (captains / mentors)
// ---------------------------------------------------------------------
world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
  const t = ev.target;
  const p = ev.player;
  if (!t || t.typeId !== "bb:npc" || !isCreated(p)) return;
  let tags = [];
  try {
    tags = t.getTags();
  } catch (e) {}
  const role = tags.includes("bb_role_captain") ? "captain" : "sensei";
  const sqTag = tags.find((x) => x.startsWith("bb_squad_"));
  const squad = sqTag ? parseInt(sqTag.slice("bb_squad_".length), 10) : 0;
  openNpc(p, role, squad);
});

// ---------------------------------------------------------------------
//  Kills: XP, hollow souls, boss rewards, PvP
// ---------------------------------------------------------------------
world.afterEvents.entityDie.subscribe((ev) => {
  const dead = ev.deadEntity;
  const src = ev.damageSource;
  const killer = src && src.damagingEntity;

  // Resolve ranked duels on any player death.
  if (dead.typeId === "minecraft:player") {
    const wasDuel = pvpOnDeath(dead);
    if (wasDuel && killer && killer.typeId === "minecraft:player") {
      missionProgress(killer, "pvp");
    }
  }

  if (!killer || killer.typeId !== "minecraft:player") return;

  // Boss death handles its own XP + drops and returns the boss id.
  const bossId = onEntityDie(dead, killer);
  if (bossId) {
    questOnBoss(killer, bossId);
    missionProgress(killer, "boss", bossId);
  } else if (dead.typeId === "minecraft:player") {
    gainXp(killer, XP.pvpWin, "pvp");
  } else {
    gainXp(killer, XP.hollowKill(1), "kill");
    missionProgress(killer, "kill");
  }

  // Hollows eat souls.
  if (getRace(killer) === RACES.HOLLOW) {
    const soul = dead.typeId === "minecraft:player" ? 15 : 4;
    addSouls(killer, soul);
  }
});

// ---------------------------------------------------------------------
//  Schrift reactive mechanics (Quincy)
// ---------------------------------------------------------------------
world.afterEvents.entityHurt.subscribe((ev) => {
  const hurt = ev.hurtEntity;
  const dealer = ev.damageSource && ev.damageSource.damagingEntity;
  if (hurt && hurt.typeId === "minecraft:player" && isCreated(hurt)) {
    schriftOnHurt(hurt, dealer);
  }
  if (dealer && dealer.typeId === "minecraft:player" && isCreated(dealer)) {
    schriftOnDealt(dealer, hurt, ev.damage);
  }
});

// ---------------------------------------------------------------------
//  Cleanup on leave
// ---------------------------------------------------------------------
world.afterEvents.playerLeave.subscribe((ev) => {
  clearCooldowns(ev.playerId);
  stopFlight(ev.playerId);
  clearDuel(ev.playerId);
});

// ---------------------------------------------------------------------
//  Tick loops
// ---------------------------------------------------------------------

// HUD
system.runInterval(() => {
  for (const p of world.getAllPlayers()) {
    if (!isCreated(p)) continue;
    const rank = getRank(p);
    const form = getForm(p);
    const formTxt = form && form !== "none" ? ` §7| §c${form.toUpperCase()}` : "";
    const at = getActiveTitle(p);
    const titleTxt = at ? `§6[${at}] ` : "";
    const sq = getSquad(p);
    const sqTxt = sq ? ` §7| §2Sq.${sq}` : "";
    actionBar(
      p,
      `${titleTxt}§9Reiatsu §f${getReiatsu(p)}§7/§f${getMaxReiatsu(p)}  §8|  §eLv §f${getLevel(p)}  §8|  §d${rank.name}${formTxt}${sqTxt}`
    );
  }
}, TICK.hud);

// Reiatsu regen
system.runInterval(() => {
  for (const p of world.getAllPlayers()) if (isCreated(p)) regen(p);
}, TICK.reiatsuRegen);

// Passive: progression, form buffs, aura
system.runInterval(() => {
  for (const p of world.getAllPlayers()) {
    if (!isCreated(p)) continue;
    checkUnlocks(p);
    questCheck(p);
    checkTitles(p);
    applySquadBuff(p);
    schriftPassive(p);
    missionProgress(p, "level");
    if (getForm(p) !== "none") applyFormBuffs(p);
    passiveAura(p);
  }
}, TICK.passive);

// Flight (fast tick, only for active fliers)
system.runInterval(() => {
  if (fliers().size === 0) return;
  for (const p of world.getAllPlayers()) if (fliers().has(p.id)) flightTick(p);
}, 2);

// Boss AI
system.runInterval(bossTick, 20);

// Dynamic events (~every 90s, 15% chance)
system.runInterval(() => maybeTriggerEvent(0.15), 20 * 90);
