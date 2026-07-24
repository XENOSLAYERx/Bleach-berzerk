// =====================================================================
//  Bleach: Berzerk  —  race manager
//  Central authority for: assigning a starter kit on race selection, and
//  computing which abilities a player can currently equip/cast given
//  their race + progression + active transformation.
// =====================================================================
import { PK, RACES } from "../config.js";
import { getProp, setProp, pick } from "../util.js";
import { getRace, getForm, setSlots, getSlots } from "../data/profile.js";
import { getAbility } from "./abilities.js";
import { ELEMENT_IDS } from "../data/elements.js";
import { shikaiSkills, bankaiSkills } from "../data/zanpakuto.js";
import { SCHRIFT_LETTERS, schriftSkills } from "../data/schrift.js";
import { HOLLOW_STAGES, hollowSkills } from "../data/hollow.js";
import { FULLBRING_OBJECT_IDS, fullbringSkills } from "../data/fullbring.js";

/** Assign the random spirit/object + starting loadout for a new race. */
export function assignStarterKit(player, race) {
  let defaultSlots = [];
  switch (race) {
    case RACES.SOUL_REAPER: {
      setProp(player, PK.zanElement, pick(ELEMENT_IDS));
      setProp(player, PK.shikai, false);
      setProp(player, PK.bankai, false);
      setProp(player, PK.visored, false);
      setProp(player, PK.maskStage, 0);
      defaultSlots = ["sr_flashstep", "sr_shakkaho", "sr_byakurai", "sr_sai"];
      break;
    }
    case RACES.HOLLOW: {
      setProp(player, PK.hollowStage, "lesser");
      setProp(player, PK.souls, 0);
      setProp(player, PK.aspect, "none");
      setProp(player, PK.resForm, "none");
      setProp(player, PK.released, false);
      defaultSlots = ["hol_claw", "hol_regen"];
      break;
    }
    case RACES.QUINCY: {
      setProp(player, PK.schrift, pick(SCHRIFT_LETTERS));
      setProp(player, PK.vollstandig, false);
      const L = getProp(player, PK.schrift, "A");
      defaultSlots = ["q_arrow", "q_hirenkyaku", "q_blut_vene", "q_blut_arterie"];
      break;
    }
    case RACES.FULLBRINGER: {
      setProp(player, PK.fbObject, pick(FULLBRING_OBJECT_IDS));
      setProp(player, PK.fbStage, 1);
      const s = getProp(player, PK.fbObject, "Sword").toLowerCase();
      defaultSlots = [`fb_${s}_1`, `fb_${s}_2`];
      break;
    }
    case RACES.HUMAN: {
      setProp(player, PK.evolution, "none");
      defaultSlots = ["hu_punch", "hu_focus", "hu_surge"];
      break;
    }
  }
  setSlots(player, defaultSlots);
}

/**
 * Return the ability definitions the player can currently use, given
 * race, progression and active transformation.
 */
export function availableAbilities(player) {
  const race = getRace(player);
  const form = getForm(player);
  const ids = new Set();

  switch (race) {
    case RACES.SOUL_REAPER: {
      ["sr_flashstep", "sr_shakkaho", "sr_byakurai", "sr_sai"].forEach((i) => ids.add(i));
      const el = getProp(player, PK.zanElement, "fire");
      if (form === "shikai") shikaiSkills(el).forEach((i) => ids.add(i));
      if (form === "bankai") {
        shikaiSkills(el).forEach((i) => ids.add(i));
        bankaiSkills(el).forEach((i) => ids.add(i));
      }
      if (form === "mask") ["vis_mask_cero", "vis_mask_regen", "vis_mask_rush"].forEach((i) => ids.add(i));
      break;
    }
    case RACES.HOLLOW: {
      const stage = getProp(player, PK.hollowStage, "lesser");
      const released = getProp(player, PK.released, false) && form === "resurreccion";
      const resForm = getProp(player, PK.resForm, "none");
      hollowSkills(stage, released, resForm).forEach((i) => ids.add(i));
      break;
    }
    case RACES.QUINCY: {
      ["q_arrow", "q_volley", "q_hirenkyaku", "q_blut_vene", "q_blut_arterie"].forEach((i) => ids.add(i));
      const L = getProp(player, PK.schrift, null);
      if (L) {
        // actives always; ult only during Vollstandig
        schriftSkills(L).forEach((i) => {
          if (i.endsWith("_ult")) {
            if (form === "vollstandig") ids.add(i);
          } else ids.add(i);
        });
      }
      break;
    }
    case RACES.FULLBRINGER: {
      const obj = getProp(player, PK.fbObject, "Sword");
      const stage = getProp(player, PK.fbStage, 1);
      fullbringSkills(obj, stage).forEach((i) => ids.add(i));
      break;
    }
    case RACES.HUMAN: {
      ["hu_punch", "hu_focus", "hu_surge"].forEach((i) => ids.add(i));
      // Visored humans (rare path) could gain mask powers here in future.
      break;
    }
  }

  return [...ids].map((i) => getAbility(i)).filter(Boolean);
}

/** Human-readable label describing the player's spirit/form identity. */
export function identityLabel(player) {
  const race = getRace(player);
  switch (race) {
    case RACES.SOUL_REAPER:
      return `Soul Reaper • ${cap(getProp(player, PK.zanElement, "?"))} Zanpakuto`;
    case RACES.HOLLOW: {
      const stage = HOLLOW_STAGES.find((s) => s.id === getProp(player, PK.hollowStage, "lesser"));
      const asp = getProp(player, PK.aspect, "none");
      return `${stage ? stage.name : "Hollow"}${asp !== "none" ? ` • Aspect of ${asp}` : ""}`;
    }
    case RACES.QUINCY:
      return `Quincy • Schrift "${getProp(player, PK.schrift, "?")}"`;
    case RACES.FULLBRINGER:
      return `Fullbringer • ${getProp(player, PK.fbObject, "?")}`;
    case RACES.HUMAN:
      return "Human";
    default:
      return "Unknown";
  }
}

function cap(s) {
  return typeof s === "string" && s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
