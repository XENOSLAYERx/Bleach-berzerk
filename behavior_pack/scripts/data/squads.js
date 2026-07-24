// =====================================================================
//  Bleach: Berzerk  —  the 13 Gotei Squads & race factions
// =====================================================================
import { RACES } from "../config.js";

// Each squad grants a thematic passive buff (vanilla effect id + amp)
// while enlisted, plus a captain identity and specialty flavour.
export const SQUADS = {
  1: { name: "Squad 1", captain: "Genryusai Yamamoto", specialty: "Command", buff: { id: "strength", amp: 0 } },
  2: { name: "Squad 2", captain: "Soi Fon", specialty: "Stealth Force", buff: { id: "speed", amp: 0 } },
  3: { name: "Squad 3", captain: "Rojuro Otoribashi", specialty: "Vanguard", buff: { id: "haste", amp: 0 } },
  4: { name: "Squad 4", captain: "Retsu Unohana", specialty: "Medical & Supply", buff: { id: "regeneration", amp: 0 } },
  5: { name: "Squad 5", captain: "Shinji Hirako", specialty: "Balance", buff: { id: "resistance", amp: 0 } },
  6: { name: "Squad 6", captain: "Byakuya Kuchiki", specialty: "Nobility & Law", buff: { id: "resistance", amp: 1 } },
  7: { name: "Squad 7", captain: "Sajin Komamura", specialty: "Frontline", buff: { id: "strength", amp: 1 } },
  8: { name: "Squad 8", captain: "Shunsui Kyoraku", specialty: "Flower Wind", buff: { id: "speed", amp: 1 } },
  9: { name: "Squad 9", captain: "Kensei Muguruma", specialty: "Communications", buff: { id: "haste", amp: 1 } },
  10: { name: "Squad 10", captain: "Toshiro Hitsugaya", specialty: "Ice Guard", buff: { id: "resistance", amp: 0 } },
  11: { name: "Squad 11", captain: "Kenpachi Zaraki", specialty: "Combat", buff: { id: "strength", amp: 1 } },
  12: { name: "Squad 12", captain: "Mayuri Kurotsuchi", specialty: "R&D", buff: { id: "night_vision", amp: 0 } },
  13: { name: "Squad 13", captain: "Jushiro Ukitake", specialty: "Guardians", buff: { id: "regeneration", amp: 0 } },
};

export const SQUAD_IDS = Object.keys(SQUADS).map(Number);

// Non-Soul-Reaper races belong to a faction (for faction wars / flavour).
export const FACTIONS = {
  [RACES.SOUL_REAPER]: { name: "Gotei 13", home: "soul_society" },
  [RACES.HOLLOW]: { name: "Hueco Mundo", home: "hueco_mundo" },
  [RACES.QUINCY]: { name: "Wandenreich", home: "wandenreich" },
  [RACES.FULLBRINGER]: { name: "Xcution", home: "karakura" },
  [RACES.HUMAN]: { name: "Karakura", home: "karakura" },
};
