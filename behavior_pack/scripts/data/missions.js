// =====================================================================
//  Bleach: Berzerk  —  mission board definitions
//  type maps to a progress "kind" fired by gameplay:
//    kill  (any hollow/mob)   boss <id>   train   pvp   event   raid   level
// =====================================================================
export const MISSIONS = {
  patrol_karakura: { name: "Patrol Karakura", desc: "Purify 10 Hollows.", type: "kill", amount: 10, xp: 300, rep: 10, minLevel: 1 },
  hollow_cull: { name: "Hollow Cull", desc: "Purify 30 Hollows.", type: "kill", amount: 30, xp: 800, rep: 25, minLevel: 20 },
  grand_fisher_hunt: { name: "The Grand Fisher", desc: "Defeat Grand Fisher.", type: "boss", target: "grand_fisher", amount: 1, xp: 700, rep: 20, minLevel: 10 },
  discipline: { name: "Discipline", desc: "Complete 5 training sessions.", type: "train", amount: 5, xp: 400, rep: 15, minLevel: 1 },
  espada_threat: { name: "Espada Threat", desc: "Defeat Grimmjow.", type: "boss", target: "grimmjow", amount: 1, xp: 1200, rep: 40, minLevel: 60 },
  arena_debut: { name: "Arena Debut", desc: "Win 3 ranked duels.", type: "pvp", amount: 3, xp: 900, rep: 30, minLevel: 30 },
  defend_the_town: { name: "Defend the Town", desc: "Clear 2 dynamic events.", type: "event", amount: 2, xp: 1000, rep: 35, minLevel: 25 },
  invasion_response: { name: "Invasion Response", desc: "Clear a raid.", type: "raid", amount: 1, xp: 2500, rep: 80, minLevel: 100 },
  rise_officer: { name: "Rise to Officer", desc: "Reach level 50.", type: "level", amount: 50, xp: 1500, rep: 40, minLevel: 1 },
  rise_captain: { name: "Captain's Trial", desc: "Reach level 300.", type: "level", amount: 300, xp: 6000, rep: 150, minLevel: 100 },
  slay_ulquiorra: { name: "Slay Ulquiorra", desc: "Defeat Ulquiorra Cifer.", type: "boss", target: "ulquiorra", amount: 1, xp: 3000, rep: 100, minLevel: 200 },
  war_hero: { name: "War Hero", desc: "Defeat Yhwach.", type: "boss", target: "yhwach", amount: 1, xp: 8000, rep: 300, minLevel: 500 },
};

export const MISSION_IDS = Object.keys(MISSIONS);
