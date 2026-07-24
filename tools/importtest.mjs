// Import every module (except main.js, which subscribes to live events) to
// catch any export/import name mismatch that --check can't see.
const mods = [
  "config.js",
  "util.js",
  "data/profile.js",
  "data/elements.js",
  "data/zanpakuto.js",
  "data/schrift.js",
  "data/hollow.js",
  "data/fullbring.js",
  "data/bosses.js",
  "data/baseAbilities.js",
  "data/squads.js",
  "data/missions.js",
  "systems/abilities.js",
  "systems/combat.js",
  "systems/reiatsu.js",
  "systems/leveling.js",
  "systems/raceManager.js",
  "systems/transformations.js",
  "systems/progression.js",
  "systems/pressure.js",
  "systems/flight.js",
  "systems/training.js",
  "systems/hollowEvolution.js",
  "systems/bossManager.js",
  "systems/worldEvents.js",
  "systems/squads.js",
  "systems/missions.js",
  "systems/quests.js",
  "systems/travel.js",
  "systems/pvp.js",
  "systems/titles.js",
  "systems/schriftPassive.js",
  "systems/schriftSpecial.js",
  "ui/forms.js",
  "ui/menu.js",
  "ui/raceSelect.js",
  "commands/index.js",
];

let ok = 0, bad = 0;
for (const m of mods) {
  try {
    await import(`../behavior_pack/scripts/${m}`);
    ok++;
  } catch (e) {
    bad++;
    console.error(`[FAIL] ${m}: ${e.message}`);
  }
}
console.log(`\nImported ${ok}/${mods.length} modules cleanly.`);
process.exit(bad === 0 ? 0 : 1);
