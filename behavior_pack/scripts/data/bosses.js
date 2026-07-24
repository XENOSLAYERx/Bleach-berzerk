// =====================================================================
//  Bleach: Berzerk  —  boss roster
//  Bosses reuse vanilla mobs (no custom models required) but are made
//  formidable via effects, phases and scripted attacks in bossManager.
//  drops use vanilla item ids so the pack works out of the box.
// =====================================================================

// tier: 1 early, 2 mid, 3 late, 4 endgame
export const BOSSES = {
  // ---- Early game ----
  fishbone_d: { name: "Fishbone D", tier: 1, entity: "minecraft:husk", hp: 12, res: 1, str: 1, spd: 0, score: 60, xp: 250, phases: 1, drops: [{ item: "minecraft:bone", count: 6 }, { item: "minecraft:gold_ingot", count: 2 }] },
  grand_fisher: { name: "Grand Fisher", tier: 1, entity: "minecraft:vindicator", hp: 18, res: 1, str: 2, spd: 1, score: 90, xp: 320, phases: 2, drops: [{ item: "minecraft:emerald", count: 3 }] },
  shrieker: { name: "Shrieker", tier: 1, entity: "minecraft:witch", hp: 14, res: 1, str: 1, spd: 1, score: 80, xp: 300, phases: 2, drops: [{ item: "minecraft:redstone", count: 8 }] },

  // ---- Mid game ----
  renji: { name: "Renji Abarai", tier: 2, entity: "minecraft:piglin_brute", hp: 40, res: 2, str: 2, spd: 1, score: 220, xp: 700, phases: 2, drops: [{ item: "minecraft:iron_ingot", count: 8 }, { item: "minecraft:diamond", count: 1 }] },
  kenpachi: { name: "Kenpachi Zaraki", tier: 2, entity: "minecraft:vindicator", hp: 55, res: 2, str: 3, spd: 1, score: 300, xp: 900, phases: 3, drops: [{ item: "minecraft:diamond", count: 3 }] },
  byakuya: { name: "Byakuya Kuchiki", tier: 2, entity: "minecraft:wither_skeleton", hp: 45, res: 2, str: 2, spd: 2, score: 280, xp: 850, phases: 2, drops: [{ item: "minecraft:diamond", count: 2 }, { item: "minecraft:pink_petals", count: 4 }] },
  grimmjow: { name: "Grimmjow Jaegerjaquez", tier: 2, entity: "minecraft:piglin_brute", hp: 50, res: 2, str: 3, spd: 2, score: 320, xp: 950, phases: 2, drops: [{ item: "minecraft:diamond", count: 2 }] },

  // ---- Late game ----
  ulquiorra: { name: "Ulquiorra Cifer", tier: 3, entity: "minecraft:wither_skeleton", hp: 80, res: 3, str: 3, spd: 2, score: 520, xp: 1600, phases: 3, drops: [{ item: "minecraft:netherite_scrap", count: 2 }] },
  nnoitra: { name: "Nnoitra Gilga", tier: 3, entity: "minecraft:vindicator", hp: 90, res: 3, str: 3, spd: 1, score: 500, xp: 1500, phases: 2, drops: [{ item: "minecraft:diamond", count: 5 }] },
  barragan: { name: "Barragan Luisenbarn", tier: 3, entity: "minecraft:wither_skeleton", hp: 85, res: 3, str: 2, spd: 0, score: 540, xp: 1650, phases: 3, drops: [{ item: "minecraft:netherite_scrap", count: 1 }, { item: "minecraft:gold_block", count: 2 }] },
  stark: { name: "Coyote Stark", tier: 3, entity: "minecraft:pillager", hp: 88, res: 3, str: 3, spd: 2, score: 560, xp: 1700, phases: 2, drops: [{ item: "minecraft:netherite_scrap", count: 2 }] },

  // ---- Endgame ----
  aizen: { name: "Sosuke Aizen", tier: 4, entity: "minecraft:evoker", hp: 160, res: 3, str: 4, spd: 2, score: 900, xp: 4000, phases: 4, drops: [{ item: "minecraft:netherite_ingot", count: 1 }, { item: "minecraft:nether_star", count: 1 }] },
  yamamoto: { name: "Genryusai Yamamoto", tier: 4, entity: "minecraft:wither_skeleton", hp: 150, res: 3, str: 4, spd: 1, score: 880, xp: 3800, phases: 3, drops: [{ item: "minecraft:netherite_ingot", count: 1 }] },
  ichibe: { name: "Ichibe Hyosube", tier: 4, entity: "minecraft:ravager", hp: 180, res: 4, str: 4, spd: 1, score: 950, xp: 4200, phases: 3, drops: [{ item: "minecraft:netherite_ingot", count: 2 }] },
  ichigo: { name: "Ichigo Kurosaki", tier: 4, entity: "minecraft:vindicator", hp: 140, res: 3, str: 4, spd: 3, score: 920, xp: 4100, phases: 4, drops: [{ item: "minecraft:netherite_ingot", count: 1 }, { item: "minecraft:nether_star", count: 1 }] },
  yhwach: { name: "Yhwach", tier: 4, entity: "minecraft:evoker", hp: 200, res: 4, str: 5, spd: 2, score: 1100, xp: 5000, phases: 5, drops: [{ item: "minecraft:netherite_ingot", count: 2 }, { item: "minecraft:nether_star", count: 2 }] },
  soul_king_guardian: { name: "Soul King Guardian", tier: 4, entity: "minecraft:ravager", hp: 220, res: 4, str: 5, spd: 1, score: 1200, xp: 5500, phases: 4, drops: [{ item: "minecraft:netherite_ingot", count: 3 }, { item: "minecraft:nether_star", count: 3 }] },
};

export const BOSS_IDS = Object.keys(BOSSES);
