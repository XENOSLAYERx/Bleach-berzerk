// =====================================================================
//  Bleach: Berzerk  —  Schrift signature MECHANICS (reactive)
//  Beyond the passive buffs, iconic letters get special-case behaviour
//  that fires when the Quincy is hurt or deals damage.
// =====================================================================
import { system } from "@minecraft/server";
import { PK, RACES } from "../config.js";
import { getProp, effect, damage, tell, actionBar } from "../util.js";
import { getRace } from "../data/profile.js";

const lastProc = new Map(); // `${id}:${key}` -> tick

function ready(player, key, cd) {
  const k = `${player.id}:${key}`;
  const now = system.currentTick;
  if ((lastProc.get(k) || -1e9) + cd > now) return false;
  lastProc.set(k, now);
  return true;
}

function hpFraction(entity) {
  try {
    const h = entity.getComponent("minecraft:health");
    return h.currentValue / h.effectiveMax;
  } catch (e) {
    return 1;
  }
}

/** Fired when a Quincy player takes damage. */
export function onHurt(defender, attacker) {
  if (getRace(defender) !== RACES.QUINCY) return;
  const L = getProp(defender, PK.schrift, null);
  if (!L) return;

  switch (L) {
    case "A": // The Almighty — foresight: sometimes shrug off the blow
      if (ready(defender, "A", 40) && Math.random() < 0.3) {
        effect(defender, "resistance", 3, 3, false);
        effect(defender, "instant_health", 1, 1);
        actionBar(defender, "§bThe Almighty: §7foresight!");
      }
      break;
    case "M": // The Miracle — comeback when low
      if (hpFraction(defender) < 0.35 && ready(defender, "M", 500)) {
        effect(defender, "absorption", 8, 2, false);
        effect(defender, "regeneration", 6, 1, false);
        effect(defender, "resistance", 4, 1, false);
        tell(defender, "§eThe Miracle §7activates!");
      }
      break;
    case "V": // The Visionary — reflexive dodge speed
      effect(defender, "speed", 3, 2, false);
      break;
    case "I": // The Iron — hardens on impact
      effect(defender, "resistance", 3, 1, false);
      break;
    case "F": // The Fear — attacker recoils
      if (attacker) {
        effect(attacker, "blindness", 4, 0);
        effect(attacker, "weakness", 4, 1);
      }
      break;
    case "Y": // The Yourself — reflect part of the damage
      if (attacker && ready(defender, "Y", 20)) {
        damage(attacker, 4, defender);
      }
      break;
    default:
      break;
  }
}

/** Fired when a Quincy player deals damage. */
export function onDealt(attacker, victim, amount) {
  if (getRace(attacker) !== RACES.QUINCY) return;
  const L = getProp(attacker, PK.schrift, null);
  if (!L || !victim) return;

  switch (L) {
    case "D": // The Deathdealer — lifesteal + rot
      effect(attacker, "instant_health", 1, 0);
      effect(victim, "wither", 4, 0);
      break;
    case "O": // The Overkill — the more you hit, the harder
      if (ready(attacker, "O", 10)) damage(victim, Math.max(1, (amount || 2) * 0.4), attacker);
      break;
    case "P": // The Power — raw bonus damage (cooldown-gated to avoid feedback)
      if (ready(attacker, "P", 8)) damage(victim, Math.max(1, (amount || 2) * 0.3), attacker);
      break;
    default:
      break;
  }
}
