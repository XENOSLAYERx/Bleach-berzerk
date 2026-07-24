// =====================================================================
//  Bleach: Berzerk  —  Reiatsu resource, ranks & power score
// =====================================================================
import { PK, RANKS, TUNING, FORM_MULT } from "../config.js";
import { getStat, getLevel, getMaxReiatsu, getReiatsu, setReiatsu, getForm } from "../data/profile.js";

/**
 * A single scalar that captures a player's overall spiritual power.
 * Used for rank, pressure comparisons and PvP match-making feel.
 */
export function getPowerScore(player) {
  const lvl = getLevel(player);
  const rei = getStat(player, PK.rei);
  const str = getStat(player, PK.str);
  const form = FORM_MULT[getForm(player)] || 1;
  return Math.round((lvl * 1.0 + rei * 0.8 + str * 0.5) * form);
}

/** Current Reiatsu rank object. */
export function getRank(player) {
  const score = getPowerScore(player);
  let rank = RANKS[0];
  for (const r of RANKS) if (score >= r.min) rank = r;
  return rank;
}

/** Regenerate Reiatsu — call on the regen interval. */
export function regen(player) {
  const cur = getReiatsu(player);
  const max = getMaxReiatsu(player);
  if (cur >= max) return;
  const spc = getStat(player, PK.spc);
  const amount = TUNING.reiatsuRegenBase + spc * TUNING.reiatsuRegenPerSpc;
  setReiatsu(player, cur + amount);
}

/** Fully restore Reiatsu (used by some abilities / rewards). */
export function restore(player) {
  setReiatsu(player, getMaxReiatsu(player));
}
