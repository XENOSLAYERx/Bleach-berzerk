// =====================================================================
//  Bleach: Berzerk  —  Schrift signature passives
//  A modest always-on effect themed to each Sternritter letter, applied
//  while playing a Quincy who has received a Schrift.
// =====================================================================
import { PK, RACES } from "../config.js";
import { getProp, effect } from "../util.js";
import { getRace } from "../data/profile.js";

// letter -> passive effect (amp kept low; this is a constant background buff)
const PASSIVES = {
  A: { id: "resistance", amp: 0 },
  B: { id: "regeneration", amp: 0 },
  E: { id: "fire_resistance", amp: 0 },
  F: { id: "night_vision", amp: 0 },
  H: { id: "fire_resistance", amp: 0 },
  I: { id: "resistance", amp: 0 },
  K: { id: "night_vision", amp: 0 },
  M: { id: "resistance", amp: 0 },
  N: { id: "night_vision", amp: 0 },
  O: { id: "fire_resistance", amp: 0 },
  P: { id: "strength", amp: 0 },
  R: { id: "strength", amp: 0 },
  S: { id: "speed", amp: 0 },
  T: { id: "speed", amp: 0 },
  U: { id: "night_vision", amp: 0 },
  W: { id: "speed", amp: 0 },
  X: { id: "speed", amp: 0 },
};

export function applyPassive(player) {
  if (getRace(player) !== RACES.QUINCY) return;
  const L = getProp(player, PK.schrift, null);
  if (!L) return;
  const p = PASSIVES[L];
  if (p) effect(player, p.id, 3, p.amp, false);
}
