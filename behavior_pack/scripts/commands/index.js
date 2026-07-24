// =====================================================================
//  Bleach: Berzerk  —  chat command interface
//  Stable across versions: intercepts chat messages beginning with "!bb"
//  and also handles "/scriptevent bb:<cmd>" for map-makers/command blocks.
//  Admin/debug commands require the "bb_admin" tag (give yourself with
//  /tag @s add bb_admin).  Player commands (menu/reroll/help) are open.
// =====================================================================
import { world, system } from "@minecraft/server";
import { PK } from "../config.js";
import { setProp } from "../util.js";
import { openMainMenu } from "../ui/menu.js";
import { openRaceSelect } from "../ui/raceSelect.js";
import {
  unlockShikai, unlockBankai, unlockVisored, unlockVollstandig,
} from "../systems/transformations.js";
import { spawnBoss } from "../systems/bossManager.js";
import { BOSS_IDS } from "../data/bosses.js";
import { triggerEvent, startRaid, EVENT_IDS, RAID_IDS } from "../systems/worldEvents.js";
import { getLevel } from "../data/profile.js";

export function registerCommands() {
  world.beforeEvents.chatSend.subscribe((ev) => {
    const msg = ev.message.trim();
    if (!msg.toLowerCase().startsWith("!bb")) return;
    ev.cancel = true;
    const args = msg.split(/\s+/).slice(1);
    const player = ev.sender;
    system.run(() => handle(player, args));
  });

  system.afterEvents.scriptEventReceive.subscribe((ev) => {
    if (!ev.id.startsWith("bb:")) return;
    const cmd = ev.id.slice(3);
    const args = [cmd, ...(ev.message ? ev.message.split(/\s+/) : [])];
    const player = ev.sourceEntity && ev.sourceEntity.typeId === "minecraft:player" ? ev.sourceEntity : null;
    if (player) handle(player, args);
  });
}

function isAdmin(player) {
  try {
    return player.hasTag("bb_admin");
  } catch (e) {
    return false;
  }
}

function handle(player, args) {
  const sub = (args[0] || "help").toLowerCase();
  switch (sub) {
    case "menu":
      openMainMenu(player);
      return;
    case "reroll":
      setProp(player, PK.created, false);
      openRaceSelect(player);
      return;
    case "help":
      help(player);
      return;

    // ---- admin / debug ----
    case "unlock": {
      if (!admin(player)) return;
      const what = (args[1] || "").toLowerCase();
      if (what === "shikai") unlockShikai(player);
      else if (what === "bankai") unlockBankai(player);
      else if (what === "visored") unlockVisored(player);
      else if (what === "vollstandig") unlockVollstandig(player);
      else player.sendMessage("§7unlock shikai|bankai|visored|vollstandig");
      return;
    }
    case "boss": {
      if (!admin(player)) return;
      const id = args[1];
      if (!BOSS_IDS.includes(id)) {
        player.sendMessage(`§7Bosses: §f${BOSS_IDS.join(", ")}`);
        return;
      }
      const d = player.getViewDirection();
      const l = player.location;
      spawnBoss(player.dimension, { x: l.x + d.x * 6, y: l.y, z: l.z + d.z * 6 }, id);
      return;
    }
    case "event": {
      if (!admin(player)) return;
      const id = args[1];
      if (!EVENT_IDS.includes(id)) {
        player.sendMessage(`§7Events: §f${EVENT_IDS.join(", ")}`);
        return;
      }
      triggerEvent(id, player);
      return;
    }
    case "raid": {
      if (!admin(player)) return;
      const id = args[1];
      if (!RAID_IDS.includes(id)) {
        player.sendMessage(`§7Raids: §f${RAID_IDS.join(", ")}`);
        return;
      }
      startRaid(player, id);
      return;
    }
    case "setlevel": {
      if (!admin(player)) return;
      const n = Math.max(1, Math.min(1000, parseInt(args[1] || "1", 10)));
      setProp(player, PK.level, n);
      player.sendMessage(`§aLevel set to ${n}.`);
      return;
    }
    case "addxp": {
      if (!admin(player)) return;
      const n = parseInt(args[1] || "1000", 10);
      import("../systems/leveling.js").then((m) => m.gainXp(player, n, "cmd"));
      return;
    }
    default:
      help(player);
  }
}

function admin(player) {
  if (isAdmin(player)) return true;
  player.sendMessage("§cThat is an admin command. Run §f/tag @s add bb_admin §cfirst.");
  return false;
}

function help(player) {
  player.sendMessage(
    "§d§lBleach: Berzerk §r§7commands:\n" +
    "§f!bb menu §7- open your abilities\n" +
    "§f!bb reroll §7- re-pick your race\n" +
    "§f!bb help §7- this help\n" +
    "§8Admin (need tag bb_admin): unlock, boss, event, raid, setlevel, addxp"
  );
}
