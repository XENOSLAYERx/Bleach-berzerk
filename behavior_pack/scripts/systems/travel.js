// =====================================================================
//  Bleach: Berzerk  —  world travel (Senkaimon) & buildable zones
//  Bedrock add-ons can't add dimensions, so the iconic locations are
//  built as landmark hubs in the Overworld at fixed anchors and reached
//  through a travel menu.  Each zone is constructed on first visit.
// =====================================================================
import { world } from "@minecraft/server";
import { WK } from "../config.js";
import { cmd, title, sound, getProp, setProp } from "../util.js";

export const ZONES = {
  karakura: {
    name: "Karakura Town", anchor: { x: 10000, y: 120, z: 10000 },
    build: (a) => [
      `fill ${a.x - 12} ${a.y - 1} ${a.z - 12} ${a.x + 12} ${a.y - 1} ${a.z + 12} stone`,
      `fill ${a.x - 12} ${a.y} ${a.z - 12} ${a.x + 12} ${a.y + 5} ${a.z + 12} air`,
      `fill ${a.x - 5} ${a.y} ${a.z - 5} ${a.x + 5} ${a.y + 4} ${a.z + 5} quartz_block 0 hollow`,
      `fill ${a.x - 5} ${a.y + 5} ${a.z - 5} ${a.x + 5} ${a.y + 5} ${a.z + 5} smooth_stone`,
      `setblock ${a.x} ${a.y} ${a.z + 5} air`,
    ],
  },
  soul_society: {
    name: "Soul Society (Seireitei)", anchor: { x: 10000, y: 120, z: 12000 },
    build: (a) => [
      `fill ${a.x - 14} ${a.y - 1} ${a.z - 14} ${a.x + 14} ${a.y - 1} ${a.z + 14} smooth_stone`,
      `fill ${a.x - 14} ${a.y} ${a.z - 14} ${a.x + 14} ${a.y + 6} ${a.z + 14} air`,
      `fill ${a.x - 14} ${a.y} ${a.z - 14} ${a.x + 14} ${a.y + 5} ${a.z + 14} white_concrete 0 outline`,
      `fill ${a.x - 2} ${a.y} ${a.z - 14} ${a.x + 2} ${a.y + 4} ${a.z - 14} air`,
    ],
  },
  hueco_mundo: {
    name: "Hueco Mundo", anchor: { x: 12000, y: 120, z: 10000 },
    build: (a) => [
      `fill ${a.x - 14} ${a.y - 1} ${a.z - 14} ${a.x + 14} ${a.y - 1} ${a.z + 14} end_stone`,
      `fill ${a.x - 14} ${a.y} ${a.z - 14} ${a.x + 14} ${a.y + 8} ${a.z + 14} air`,
      `fill ${a.x - 10} ${a.y} ${a.z - 10} ${a.x - 10} ${a.y + 7} ${a.z - 10} quartz_pillar`,
      `fill ${a.x + 10} ${a.y} ${a.z + 10} ${a.x + 10} ${a.y + 7} ${a.z + 10} quartz_pillar`,
      `fill ${a.x + 10} ${a.y} ${a.z - 10} ${a.x + 10} ${a.y + 7} ${a.z - 10} quartz_pillar`,
      `fill ${a.x - 10} ${a.y} ${a.z + 10} ${a.x - 10} ${a.y + 7} ${a.z + 10} quartz_pillar`,
    ],
  },
  wandenreich: {
    name: "Wandenreich", anchor: { x: 12000, y: 120, z: 12000 },
    build: (a) => [
      `fill ${a.x - 14} ${a.y - 1} ${a.z - 14} ${a.x + 14} ${a.y - 1} ${a.z + 14} blackstone`,
      `fill ${a.x - 14} ${a.y} ${a.z - 14} ${a.x + 14} ${a.y + 8} ${a.z + 14} air`,
      `fill ${a.x - 12} ${a.y} ${a.z - 12} ${a.x + 12} ${a.y + 6} ${a.z + 12} polished_blackstone 0 outline`,
    ],
  },
  arena: {
    name: "Ranked Arena", anchor: { x: 11000, y: 120, z: 11000 },
    build: (a) => [
      `fill ${a.x - 16} ${a.y - 1} ${a.z - 16} ${a.x + 16} ${a.y - 1} ${a.z + 16} smooth_stone`,
      `fill ${a.x - 16} ${a.y} ${a.z - 16} ${a.x + 16} ${a.y + 10} ${a.z + 16} air`,
      `fill ${a.x - 16} ${a.y} ${a.z - 16} ${a.x + 16} ${a.y + 6} ${a.z + 16} barrier 0 outline`,
    ],
  },
};

export const ZONE_IDS = Object.keys(ZONES);

function builtList() {
  try {
    return JSON.parse(getProp(world, WK.zonesBuilt, "[]"));
  } catch (e) {
    return [];
  }
}

export function buildZone(zoneId) {
  const z = ZONES[zoneId];
  if (!z) return;
  const built = builtList();
  if (built.includes(zoneId)) return;
  const dim = world.getDimension("overworld");
  for (const c of z.build(z.anchor)) cmd(dim, c);
  built.push(zoneId);
  setProp(world, WK.zonesBuilt, JSON.stringify(built));
}

export function travelTo(player, zoneId) {
  const z = ZONES[zoneId];
  if (!z) return { ok: false, reason: "Unknown zone." };
  buildZone(zoneId);
  const a = z.anchor;
  try {
    player.teleport({ x: a.x + 0.5, y: a.y, z: a.z + 0.5 }, { dimension: world.getDimension("overworld") });
  } catch (e) {
    return { ok: false, reason: "Teleport failed." };
  }
  title(player, "§bSenkaimon", `Arrived at ${z.name}`);
  sound(player, "mob.endermen.portal", 1, 0.7);
  return { ok: true };
}

/** Arena anchor for PvP. */
export function arenaAnchor() {
  return ZONES.arena.anchor;
}
