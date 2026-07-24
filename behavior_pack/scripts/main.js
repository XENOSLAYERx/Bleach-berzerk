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

// ui
import { openRaceSelect } from "./ui/raceSelect.js";
import { openMainMenu } from "./ui/menu.js";

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
//  Kills: XP, hollow souls, boss rewards, PvP
// ---------------------------------------------------------------------
world.afterEvents.entityDie.subscribe((ev) => {
  const dead = ev.deadEntity;
  const src = ev.damageSource;
  const killer = src && src.damagingEntity;
  if (!killer || killer.typeId !== "minecraft:player") return;

  // Boss death handles its own XP + drops.
  const wasBoss = onEntityDie(dead, killer);

  if (dead.typeId === "minecraft:player") {
    // PvP kill
    gainXp(killer, XP.pvpWin, "pvp");
  } else if (!wasBoss) {
    gainXp(killer, XP.hollowKill(1), "kill");
  }

  // Hollows eat souls.
  if (getRace(killer) === RACES.HOLLOW) {
    const soul = dead.typeId === "minecraft:player" ? 15 : 4;
    addSouls(killer, soul);
  }
});

// ---------------------------------------------------------------------
//  Cleanup on leave
// ---------------------------------------------------------------------
world.afterEvents.playerLeave.subscribe((ev) => {
  clearCooldowns(ev.playerId);
  stopFlight(ev.playerId);
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
    actionBar(
      p,
      `§9Reiatsu §f${getReiatsu(p)}§7/§f${getMaxReiatsu(p)}  §8|  §eLv §f${getLevel(p)}  §8|  §d${rank.name}${formTxt}`
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
