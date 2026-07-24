// =====================================================================
//  Bleach: Berzerk  —  Hollow evolution, aspects, Resurreccion & kit
// =====================================================================
import { RACES } from "../config.js";
import { registerAbility } from "../systems/abilities.js";

// Evolution ladder. `souls` = souls required to advance to this stage.
export const HOLLOW_STAGES = [
  { id: "lesser",   name: "Lesser Hollow", souls: 0,   powerBonus: 0 },
  { id: "gillian",  name: "Gillian",       souls: 25,  powerBonus: 20 },
  { id: "adjuchas", name: "Adjuchas",      souls: 80,  powerBonus: 60 },
  { id: "vasto",    name: "Vasto Lorde",   souls: 200, powerBonus: 140 },
  { id: "arrancar", name: "Arrancar",      souls: 400, powerBonus: 260 },
];

export function stageIndex(id) {
  return HOLLOW_STAGES.findIndex((s) => s.id === id);
}
export function nextStage(id) {
  const i = stageIndex(id);
  return i >= 0 && i < HOLLOW_STAGES.length - 1 ? HOLLOW_STAGES[i + 1] : null;
}

// Random Arrancar aspect of death (flavour + a passive tilt).
export const ASPECTS = ["Death", "Despair", "Rage", "Sacrifice", "Isolation", "Destruction", "Madness"];

// Resurreccion forms — each grants its own ability + flavour.
export const RESURRECCION = {
  Dragon:        { particle: "minecraft:basic_flame_particle", ignite: true,  hit: null,                          ult: "Draconic Cero Oscuras" },
  Panther:       { particle: "minecraft:basic_crit_particle",  ignite: false, hit: { id: "weakness", dur: 6, amp: 1 }, ult: "Desgarron" },
  "Skeleton King":{ particle: "minecraft:basic_smoke_particle", ignite: false, hit: { id: "wither", dur: 6, amp: 1 },   ult: "Respira" },
  "Bat Demon":   { particle: "minecraft:basic_smoke_particle", ignite: false, hit: { id: "blindness", dur: 5, amp: 0 }, ult: "Cero Oscuras" },
  Serpent:       { particle: "minecraft:basic_smoke_particle", ignite: false, hit: { id: "poison", dur: 8, amp: 2 },    ult: "Venom Deluge" },
  Shark:         { particle: "minecraft:water_splash_particle_manual", ignite: false, hit: { id: "slowness", dur: 5, amp: 2 }, ult: "Abyssal Maw" },
  Wolf:          { particle: "minecraft:basic_crit_particle",  ignite: false, hit: { id: "weakness", dur: 5, amp: 1 }, ult: "Lobo Barrage" },
  Phoenix:       { particle: "minecraft:basic_flame_particle", ignite: true,  hit: null,                          ult: "Rebirth Inferno" },
};

export const RESURRECCION_FORMS = Object.keys(RESURRECCION);

/** Register core Hollow abilities and each Resurreccion ultimate. */
export function buildHollow() {
  const base = { race: RACES.HOLLOW };
  // Universal hollow kit (unlocks by stage — see hollowSkills()).
  registerAbility({ ...base, id: "hol_claw",   name: "Claw Slash",              req: "lesser",   kind: "slash", cost: 8,  cooldown: 12, power: 1.4, range: 4, particle: "minecraft:basic_crit_particle", desc: "Rake the enemy with your hollow claws." });
  registerAbility({ ...base, id: "hol_regen",  name: "High-Speed Regeneration", req: "lesser",   kind: "heal",  cost: 20, cooldown: 90, dur: 8, amp: 1, desc: "Regenerate wounds rapidly." });
  registerAbility({ ...base, id: "hol_sonido", name: "Sonido",                  req: "gillian",  kind: "dash",  cost: 12, cooldown: 20, range: 8, particle: "minecraft:basic_smoke_particle", selfEffect: { id: "speed", dur: 4, amp: 1 }, desc: "Hollow high-speed movement." });
  registerAbility({ ...base, id: "hol_bala",   name: "Bala",                    req: "gillian",  kind: "beam",  cost: 14, cooldown: 12, power: 1.8, range: 22, particle: "minecraft:basic_flame_particle", desc: "A fast, weaker energy blast." });
  registerAbility({ ...base, id: "hol_cero",   name: "Cero",                    req: "adjuchas", kind: "cero",  cost: 40, cooldown: 60, power: 3.4, range: 30, radius: 5, particle: "minecraft:basic_flame_particle", desc: "The signature hollow energy beam." });
  registerAbility({ ...base, id: "hol_hierro", name: "Hierro",                  req: "adjuchas", kind: "guard", cost: 24, cooldown: 70, dur: 10, amp: 2, particle: "minecraft:basic_crit_particle", desc: "Iron skin — steel-hard hollow defence." });
  registerAbility({ ...base, id: "hol_gran",   name: "Gran Rey Cero",           req: "arrancar", kind: "cero",  cost: 70, cooldown: 150, power: 5.0, range: 34, radius: 8, particle: "minecraft:basic_flame_particle", desc: "An Espada-class cero." });

  // Resurreccion ultimates (require released form).
  for (const form of RESURRECCION_FORMS) {
    const R = RESURRECCION[form];
    registerAbility({
      race: RACES.HOLLOW, id: `res_${slug(form)}_ult`, name: R.ult, req: "resurreccion",
      kind: "cero", cost: 100, cooldown: 260, power: 6.5, range: 36, radius: 10,
      particle: R.particle, ignite: R.ignite, hitEffect: R.hit,
      resForm: form, desc: `${form} Resurreccion — ultimate release technique.`,
    });
  }
}

function slug(s) {
  return s.toLowerCase().replace(/[^a-z]+/g, "_");
}

/** Ability ids available at a given hollow stage / released state. */
export function hollowSkills(stageId, released, resForm) {
  const order = ["lesser", "gillian", "adjuchas", "arrancar"];
  const maxReq = order.indexOf(stageId === "vasto" ? "adjuchas" : stageId);
  const ids = [];
  for (const ab of ["hol_claw", "hol_regen", "hol_sonido", "hol_bala", "hol_cero", "hol_hierro", "hol_gran"]) {
    // resolved through registry req in raceManager; here just list by stage
  }
  // Simpler: explicit mapping.
  const byStage = {
    lesser: ["hol_claw", "hol_regen"],
    gillian: ["hol_claw", "hol_regen", "hol_sonido", "hol_bala"],
    adjuchas: ["hol_claw", "hol_regen", "hol_sonido", "hol_bala", "hol_cero", "hol_hierro"],
    vasto: ["hol_claw", "hol_regen", "hol_sonido", "hol_bala", "hol_cero", "hol_hierro"],
    arrancar: ["hol_claw", "hol_regen", "hol_sonido", "hol_bala", "hol_cero", "hol_hierro", "hol_gran"],
  };
  const list = [...(byStage[stageId] || byStage.lesser)];
  if (released && resForm && RESURRECCION[resForm]) list.push(`res_${slug(resForm)}_ult`);
  return list;
}
