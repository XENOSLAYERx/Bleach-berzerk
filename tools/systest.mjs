// Exercises squad / mission / quest / title logic offline.
import { PK, RACES } from "../behavior_pack/scripts/config.js";
import { buildBaseAbilities } from "../behavior_pack/scripts/data/baseAbilities.js";
import { buildZanpakuto } from "../behavior_pack/scripts/data/zanpakuto.js";
import { assignStarterKit } from "../behavior_pack/scripts/systems/raceManager.js";
import { joinSquad, getSquad, getReputation } from "../behavior_pack/scripts/systems/squads.js";
import { accept, getActive, onProgress } from "../behavior_pack/scripts/systems/missions.js";
import { check as questCheck, getCurrent } from "../behavior_pack/scripts/systems/quests.js";
import { checkTitles } from "../behavior_pack/scripts/systems/titles.js";
import { getTitles } from "../behavior_pack/scripts/data/profile.js";

buildBaseAbilities();
buildZanpakuto();

function fakePlayer() {
  const m = new Map();
  return {
    id: "p1", name: "Tester", location: { x: 0, y: 64, z: 0 },
    getDynamicProperty: (k) => m.get(k),
    setDynamicProperty: (k, v) => m.set(k, v),
  };
}

let fail = 0;
const ok = (c, msg) => { if (!c) { console.error("  [FAIL]", msg); fail++; } else console.log("  [ok]", msg); };

const p = fakePlayer();
p.setDynamicProperty(PK.race, RACES.SOUL_REAPER);
p.setDynamicProperty(PK.level, 1);
assignStarterKit(p, RACES.SOUL_REAPER);

// Squad
ok(joinSquad(p, 2).ok, "join Squad 2");
ok(getSquad(p) === 2, "squad persisted = 2");

// Mission accept + progress + complete
ok(accept(p, "patrol_karakura").ok, "accept mission");
ok(getActive(p) !== null, "mission active");
for (let i = 0; i < 10; i++) onProgress(p, "kill");
ok(getActive(p) === null, "mission completed & cleared after 10 kills");
ok(getReputation(p) >= 10, "reputation awarded (" + getReputation(p) + ")");

// Quest advance: meditation flag -> step 1, then level 100 -> unlock shikai
ok(getCurrent(p).idx === 0, "quest starts at step 0");
p.setDynamicProperty(PK.meditation, true);
questCheck(p);
ok(getCurrent(p).idx === 1, "quest advanced past meditation");
p.setDynamicProperty(PK.level, 100);
questCheck(p);
ok(p.getDynamicProperty(PK.shikai) === true, "Shikai unlocked at Lv100 via quest");
ok(getCurrent(p).idx === 2, "quest advanced to Bankai step");

// Titles: level 1000 -> Soul King
p.setDynamicProperty(PK.level, 1000);
checkTitles(p);
ok(getTitles(p).includes("Soul King"), "Soul King title earned at Lv1000");

console.log(fail === 0 ? "\nSYSTEST PASSED ✔" : `\nSYSTEST FAILED (${fail})`);
process.exit(fail === 0 ? 0 : 1);
