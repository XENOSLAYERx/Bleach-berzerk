// =====================================================================
//  Bleach: Berzerk  —  shared combat math
//  Every ability routes its damage through here so balance stays
//  consistent and transformations / stats always matter.
// =====================================================================
import { PK, TUNING, FORM_MULT } from "../config.js";
import { getStat, getForm } from "../data/profile.js";
import { damage as applyDamageRaw } from "../util.js";

/**
 * Compute outgoing ability damage for a caster.
 * @param player  the caster
 * @param power   the ability's base power multiplier (~1.0 .. 3.5)
 */
export function computeDamage(player, power) {
  const str = getStat(player, PK.str);
  const swd = getStat(player, PK.swd);
  const abm = getStat(player, PK.abm);
  const form = FORM_MULT[getForm(player)] || 1;
  const base = 2 + str * TUNING.strScaling + (swd + abm) * 0.15;
  return Math.max(1, Math.round(base * power * form));
}

/**
 * Damage reduction fraction from a defender's defence stat (capped).
 */
export function defenceFactor(defender) {
  let def = 0;
  try {
    def = getStat(defender, PK.def);
  } catch (e) {
    return 1;
  }
  const reduction = Math.min(TUNING.defCap, def * TUNING.defScaling);
  return 1 - reduction;
}

/**
 * Apply ability damage from caster to target, accounting for the
 * target's defence when the target is a player.
 */
export function dealAbilityDamage(caster, target, power) {
  let dmg = computeDamage(caster, power);
  // Reduce by player defence (mobs use their own armour/toughness).
  if (target && typeof target.typeId === "string" && target.typeId === "minecraft:player") {
    dmg = Math.max(1, Math.round(dmg * defenceFactor(target)));
  }
  applyDamageRaw(target, dmg, caster);
  return dmg;
}
