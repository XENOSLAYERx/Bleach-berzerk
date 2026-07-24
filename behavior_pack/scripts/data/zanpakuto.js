// =====================================================================
//  Bleach: Berzerk  —  Zanpakuto kit generator (Soul Reaper)
//  Turns each of the 20 elements into:
//    passive + 4 Shikai skills + 6 Bankai skills + 1 Ultimate  (= 220
//    themed abilities total) using the shared ability engine.
// =====================================================================
import { RACES } from "../config.js";
import { ELEMENTS, ELEMENT_IDS } from "./elements.js";
import { registerAbility } from "../systems/abilities.js";

/** Register every Zanpakuto ability. Called once at boot. */
export function buildZanpakuto() {
  for (const eid of ELEMENT_IDS) {
    const E = ELEMENTS[eid];
    const base = { race: RACES.SOUL_REAPER, element: eid, particle: E.particle, ignite: E.ignite };

    // ---- Shikai (req: shikai) ----
    registerAbility({ ...base, id: `zan_${eid}_s1`, name: `${E.adj} Slash`, req: "shikai", kind: "slash", cost: 12, cooldown: 20, power: 1.6, range: 4, hitEffect: E.hit, desc: "A close arc infused with your Zanpakuto's element." });
    registerAbility({ ...base, id: `zan_${eid}_s2`, name: `${E.adj} Bolt`, req: "shikai", kind: "beam", cost: 18, cooldown: 30, power: 1.8, range: 22, hitEffect: E.hit, desc: "A ranged elemental bolt." });
    registerAbility({ ...base, id: `zan_${eid}_s3`, name: `${E.adj} Burst`, req: "shikai", kind: "blast", cost: 26, cooldown: 45, power: 1.9, range: 20, radius: 4, hitEffect: E.hit, desc: "An elemental explosion at the aimed point." });
    registerAbility({ ...base, id: `zan_${eid}_s4`, name: `Shunpo: ${E.adj} Step`, req: "shikai", kind: "dash", cost: 14, cooldown: 24, range: 8, selfEffect: { id: "speed", dur: 4, amp: 1 }, desc: "Flash-step forward, leaving an elemental trail." });

    // ---- Bankai (req: bankai) ----
    registerAbility({ ...base, id: `zan_${eid}_b1`, name: `${E.name} Dragon`, req: "bankai", kind: "beam", cost: 35, cooldown: 40, power: 3.2, range: 30, radius: 3, hitEffect: E.hit, desc: "A devastating pierce of pure element." });
    registerAbility({ ...base, id: `zan_${eid}_b2`, name: `${E.name} Cataclysm`, req: "bankai", kind: "blast", cost: 50, cooldown: 70, power: 3.6, range: 26, radius: 7, hitEffect: E.hit, desc: "A wide catastrophic detonation." });
    registerAbility({ ...base, id: `zan_${eid}_b3`, name: `${E.name} Onslaught`, req: "bankai", kind: "slash", cost: 30, cooldown: 30, power: 3.0, range: 6, hitEffect: E.hit, desc: "A sweeping storm of blade strikes." });
    registerAbility({ ...base, id: `zan_${eid}_b4`, name: `${E.name} Bulwark`, req: "bankai", kind: "guard", cost: 30, cooldown: 90, dur: 8, amp: 2, desc: "Wrap yourself in elemental armour." });
    registerAbility({ ...base, id: `zan_${eid}_b5`, name: `${E.name} Storm`, req: "bankai", kind: "summon", cost: 55, cooldown: 110, power: 3.0, range: 24, radius: 5, waves: 7, hitEffect: E.hit, desc: "Rain elemental destruction over an area." });
    registerAbility({ ...base, id: `zan_${eid}_b6`, name: `${E.name} Surge`, req: "bankai", kind: "buff", cost: 25, cooldown: 120, selfEffect: [E.buff, { id: "speed", dur: 12, amp: 1 }], desc: "Empower yourself with your Bankai's essence." });

    // ---- Ultimate (req: bankai) ----
    registerAbility({ ...base, id: `zan_${eid}_ult`, name: E.ult, req: "ult", kind: "cero", cost: 90, cooldown: 240, power: 6.0, range: 34, radius: 9, hitEffect: E.hit, desc: "Your Zanpakuto's ultimate technique." });
  }
}

/** The four Shikai skill ids for an element (in kit order). */
export function shikaiSkills(eid) {
  return [`zan_${eid}_s1`, `zan_${eid}_s2`, `zan_${eid}_s3`, `zan_${eid}_s4`];
}
/** The six Bankai skill ids + ultimate for an element. */
export function bankaiSkills(eid) {
  return [`zan_${eid}_b1`, `zan_${eid}_b2`, `zan_${eid}_b3`, `zan_${eid}_b4`, `zan_${eid}_b5`, `zan_${eid}_b6`, `zan_${eid}_ult`];
}
