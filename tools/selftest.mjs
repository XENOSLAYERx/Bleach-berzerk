// Offline self-test: builds the ability registry with a mocked
// @minecraft/server and verifies race availability resolves to real
// ability definitions. Run: node tools/selftest.mjs
import { buildBaseAbilities } from "../behavior_pack/scripts/data/baseAbilities.js";
import { buildZanpakuto } from "../behavior_pack/scripts/data/zanpakuto.js";
import { buildSchrift } from "../behavior_pack/scripts/data/schrift.js";
import { buildHollow } from "../behavior_pack/scripts/data/hollow.js";
import { buildFullbring } from "../behavior_pack/scripts/data/fullbring.js";
import { allAbilities, getAbility } from "../behavior_pack/scripts/systems/abilities.js";
import { assignStarterKit, availableAbilities } from "../behavior_pack/scripts/systems/raceManager.js";
import { PK, RACES } from "../behavior_pack/scripts/config.js";

buildBaseAbilities();
buildZanpakuto();
buildSchrift();
buildHollow();
buildFullbring();

const all = allAbilities();
console.log("Total abilities registered:", all.length);

// Fake player backed by a Map of dynamic properties.
function fakePlayer() {
  const m = new Map();
  return {
    id: "p1",
    getDynamicProperty: (k) => m.get(k),
    setDynamicProperty: (k, v) => m.set(k, v),
    _m: m,
  };
}

let failures = 0;
for (const race of Object.values(RACES)) {
  const p = fakePlayer();
  p.setDynamicProperty(PK.created, true);
  p.setDynamicProperty(PK.race, race);
  p.setDynamicProperty(PK.level, 1);
  assignStarterKit(p, race);
  // Force every transformation "on" to exercise all branches.
  p.setDynamicProperty(PK.shikai, true);
  p.setDynamicProperty(PK.bankai, true);
  p.setDynamicProperty(PK.visored, true);
  p.setDynamicProperty(PK.released, true);
  p.setDynamicProperty(PK.vollstandig, true);
  p.setDynamicProperty(PK.hollowStage, "arrancar");
  p.setDynamicProperty(PK.fbStage, 3);

  for (const form of ["none", "shikai", "bankai", "mask", "resurreccion", "vollstandig", "fullbring"]) {
    p.setDynamicProperty(PK.form, form);
    const avail = availableAbilities(p);
    for (const a of avail) {
      if (!a || !a.id || !getAbility(a.id)) {
        console.error(`  [FAIL] ${race}/${form}: unresolved ability`, a);
        failures++;
      }
    }
  }
  // Sanity: with everything unlocked, each race should expose abilities.
  p.setDynamicProperty(PK.form, race === RACES.SOUL_REAPER ? "bankai" : race === RACES.QUINCY ? "vollstandig" : race === RACES.HOLLOW ? "resurreccion" : "none");
  const n = availableAbilities(p).length;
  console.log(`  ${race}: ${n} abilities available (fully unlocked)`);
  if (n === 0) { console.error(`  [FAIL] ${race} exposes no abilities`); failures++; }
}

// Verify starter loadouts reference real abilities.
for (const race of Object.values(RACES)) {
  const p = fakePlayer();
  p.setDynamicProperty(PK.race, race);
  assignStarterKit(p, race);
  const slots = JSON.parse(p.getDynamicProperty(PK.slots) || "[]");
  for (const id of slots) {
    if (!getAbility(id)) { console.error(`  [FAIL] ${race} starter slot bad id: ${id}`); failures++; }
  }
  console.log(`  ${race} starter slots:`, slots.join(", ") || "(none)");
}

console.log(failures === 0 ? "\nSELFTEST PASSED ✔" : `\nSELFTEST FAILED (${failures})`);
process.exit(failures === 0 ? 0 : 1);
