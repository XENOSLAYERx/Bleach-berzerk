// =====================================================================
//  Bleach: Berzerk  —  dynamic world events & raids
//  Events spawn themed waves of "hollows" (tagged vanilla mobs) near a
//  player; raids are structured multi-wave gauntlets.  Everything is
//  entity-capped for mobile performance.
// =====================================================================
import { system, world } from "@minecraft/server";
import { pick, actionBar, title, entitiesNear, players } from "../util.js";
import { spawnBoss } from "./bossManager.js";
import { gainXp, XP } from "./leveling.js";

const MOB_CAP = 24; // never keep more than this many event mobs alive at once

// ---- dynamic events --------------------------------------------------
const EVENTS = {
  hollow_invasion: { name: "Hollow Invasion", mobs: ["minecraft:zombie", "minecraft:husk"], count: 8, xp: 200 },
  menos_attack: { name: "Menos Attack", mobs: ["minecraft:wither_skeleton"], count: 4, xp: 300, boss: "grand_fisher" },
  soul_society_emergency: { name: "Soul Society Emergency", mobs: ["minecraft:vindicator"], count: 6, xp: 350 },
  espada_assault: { name: "Espada Assault", boss: "grimmjow", mobs: ["minecraft:piglin_brute"], count: 3, xp: 600 },
  sternritter_raid: { name: "Sternritter Raid", mobs: ["minecraft:pillager", "minecraft:vindicator"], count: 6, xp: 650 },
  aizen_rebellion: { name: "Aizen Rebellion", boss: "aizen", mobs: [], count: 0, xp: 1500 },
  yhwach_invasion: { name: "Yhwach Invasion", boss: "yhwach", mobs: [], count: 0, xp: 1800 },
};
export const EVENT_IDS = Object.keys(EVENTS);

/** Roll for a random event; call on a slow interval. */
export function maybeTriggerEvent(chance = 0.15) {
  const ps = players();
  if (ps.length === 0) return;
  if (Math.random() > chance) return;
  triggerEvent(pick(EVENT_IDS), pick(ps));
}

export function triggerEvent(eventId, targetPlayer) {
  const ev = EVENTS[eventId];
  if (!ev || !targetPlayer) return;
  const dim = targetPlayer.dimension;
  const base = targetPlayer.location;
  world.sendMessage(`§5§l[EVENT] §r§d${ev.name} §7has begun near ${targetPlayer.name}!`);
  title(targetPlayer, "§5" + ev.name, "§7Defend yourself!");

  if (ev.boss) {
    spawnBoss(dim, { x: base.x + 4, y: base.y, z: base.z + 4 }, ev.boss);
  }
  const spawn = Math.min(ev.count, MOB_CAP);
  for (let i = 0; i < spawn; i++) {
    const ang = Math.random() * Math.PI * 2;
    const r = 6 + Math.random() * 8;
    const loc = { x: base.x + Math.cos(ang) * r, y: base.y + 1, z: base.z + Math.sin(ang) * r };
    try {
      const m = dim.spawnEntity(pick(ev.mobs), loc);
      m.addTag("bb_event");
      m.nameTag = `§dHollow`;
    } catch (e) {}
  }

  // completion watcher
  const startTick = system.currentTick;
  const iv = system.runInterval(() => {
    const remaining = entitiesNear(dim, base, 60, null).filter((e) => {
      try {
        return e.hasTag("bb_event");
      } catch (x) {
        return false;
      }
    });
    const timedOut = system.currentTick - startTick > 20 * 180; // 3 min
    if (remaining.length === 0 || timedOut) {
      system.clearRun(iv);
      if (!timedOut) {
        world.sendMessage(`§a§l[EVENT] §r${ev.name} cleared!`);
        for (const p of entitiesNear(dim, base, 60, null).filter((e) => e.typeId === "minecraft:player")) {
          gainXp(p, ev.xp, "event");
          title(p, "§aEvent Complete", `§e+${ev.xp} XP`);
        }
      }
    }
  }, 40);
}

// ---- raids -----------------------------------------------------------
const RAIDS = {
  hueco_mundo: {
    name: "Hueco Mundo Raid",
    waves: 50,
    mobBuilder: (wave) => ({
      mobs: ["minecraft:zombie", "minecraft:husk", "minecraft:wither_skeleton"],
      count: Math.min(MOB_CAP, 3 + Math.floor(wave / 3)),
      boss: wave % 10 === 0 ? "grimmjow" : null,
    }),
    reward: 3000,
  },
  espada: {
    name: "Espada Raid",
    bosses: ["grimmjow", "nnoitra", "barragan", "stark", "ulquiorra"],
    reward: 5000,
  },
  soul_society_war: {
    name: "Soul Society War",
    waves: 15,
    mobBuilder: (wave) => ({ mobs: ["minecraft:vindicator", "minecraft:pillager"], count: Math.min(MOB_CAP, 5 + wave), boss: wave % 5 === 0 ? "kenpachi" : null }),
    reward: 4000,
  },
  tybw: {
    name: "Thousand-Year Blood War",
    bosses: ["ichigo", "yamamoto", "ichibe", "yhwach"],
    reward: 8000,
  },
};
export const RAID_IDS = Object.keys(RAIDS);

const runningRaids = new Set();

export function startRaid(player, raidId) {
  const raid = RAIDS[raidId];
  if (!raid) return;
  if (runningRaids.has(raidId)) {
    actionBar(player, "§7That raid is already in progress.");
    return;
  }
  runningRaids.add(raidId);
  world.sendMessage(`§4§l[RAID] §r§c${raid.name} §7started by ${player.name}!`);
  const dim = player.dimension;
  const anchor = player.location;

  if (raid.bosses) {
    runBossGauntlet(dim, anchor, raid, raidId);
  } else {
    runWaveRaid(dim, anchor, raid, raidId);
  }
}

function runWaveRaid(dim, anchor, raid, raidId) {
  let wave = 0;
  const iv = system.runInterval(() => {
    const alive = countRaidMobs(dim, anchor);
    if (alive > 0) return; // wait for wave clear
    wave++;
    if (wave > raid.waves) {
      finishRaid(dim, anchor, raid, raidId);
      system.clearRun(iv);
      return;
    }
    world.sendMessage(`§c${raid.name} §7— Wave §f${wave}/${raid.waves}`);
    const spec = raid.mobBuilder(wave);
    if (spec.boss) spawnBoss(dim, { x: anchor.x + 3, y: anchor.y, z: anchor.z }, spec.boss);
    for (let i = 0; i < spec.count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const r = 8 + Math.random() * 10;
      try {
        const m = dim.spawnEntity(pick(spec.mobs), { x: anchor.x + Math.cos(ang) * r, y: anchor.y + 1, z: anchor.z + Math.sin(ang) * r });
        m.addTag("bb_raid");
      } catch (e) {}
    }
  }, 40);
}

function runBossGauntlet(dim, anchor, raid, raidId) {
  let idx = 0;
  const iv = system.runInterval(() => {
    const alive = countRaidMobs(dim, anchor);
    if (alive > 0) return;
    if (idx >= raid.bosses.length) {
      finishRaid(dim, anchor, raid, raidId);
      system.clearRun(iv);
      return;
    }
    const bossId = raid.bosses[idx++];
    world.sendMessage(`§c${raid.name} §7— Boss §f${idx}/${raid.bosses.length}`);
    const b = spawnBoss(dim, { x: anchor.x + 3, y: anchor.y, z: anchor.z + 3 }, bossId);
    if (b) b.addTag("bb_raid");
  }, 40);
}

function countRaidMobs(dim, anchor) {
  return entitiesNear(dim, anchor, 80, null).filter((e) => {
    try {
      return e.hasTag("bb_raid");
    } catch (x) {
      return false;
    }
  }).length;
}

function finishRaid(dim, anchor, raid, raidId) {
  runningRaids.delete(raidId);
  world.sendMessage(`§a§l[RAID] §r${raid.name} complete! Rewards distributed.`);
  for (const p of entitiesNear(dim, anchor, 100, null).filter((e) => e.typeId === "minecraft:player")) {
    gainXp(p, raid.reward, "raid");
    title(p, "§6RAID CLEARED", `§e+${raid.reward} XP`);
  }
}
