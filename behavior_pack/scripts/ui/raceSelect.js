// =====================================================================
//  Bleach: Berzerk  —  race selection (first join)
// =====================================================================
import { ActionFormData } from "@minecraft/server-ui";
import { RACES } from "../config.js";
import { cmd, title, sound } from "../util.js";
import { initProfile } from "../data/profile.js";
import { assignStarterKit } from "../systems/raceManager.js";
import { showForm } from "./forms.js";

const CHOICES = [
  { race: RACES.SOUL_REAPER, label: "§bSoul Reaper", desc: "Wield a unique Zanpakuto. Unlock Shikai & Bankai. Join the 13 Squads." },
  { race: RACES.HOLLOW, label: "§8Hollow", desc: "Devour souls to evolve: Gillian → Adjuchas → Vasto Lorde → Arrancar." },
  { race: RACES.QUINCY, label: "§eQuincy", desc: "Fire reishi arrows, master Blut, receive a Schrift letter, reach Vollstandig." },
  { race: RACES.FULLBRINGER, label: "§aFullbringer", desc: "Bond with an object and evolve it to Complete Fullbring." },
  { race: RACES.HUMAN, label: "§fHuman", desc: "Weak but fast-growing. Hidden quests can evolve you into another path." },
];

/** Show the race picker and set the player up. Retries until chosen. */
export async function openRaceSelect(player) {
  const form = new ActionFormData()
    .title("§l§dChoose Your Path")
    .body("§7Your soul awakens... choose the spiritual race you will walk as.\n§8(This is permanent — choose wisely.)");
  for (const c of CHOICES) form.button(`${c.label}\n§r§7${c.desc}`);

  const res = await showForm(player, form, 30);
  if (!res || res.canceled) {
    // Player closed it — reopen shortly so they can't skip creation.
    return openRaceSelect(player);
  }

  const choice = CHOICES[res.selection];
  initProfile(player, choice.race);
  assignStarterKit(player, choice.race);
  grantStarterItems(player, choice.race);

  title(player, choice.label.replace("§l", ""), "§7Your journey begins.");
  sound(player, "beacon.power");
  player.sendMessage(`§dWelcome, ${choice.label}§d! §7Use your §fSpirit Focus §7item (or §f/bb menu§7) to open your abilities.`);
}

function grantStarterItems(player, race) {
  cmd(player, "give @s bb:spirit_focus 1");
  switch (race) {
    case RACES.SOUL_REAPER:
      cmd(player, "give @s bb:asauchi 1");
      break;
    case RACES.QUINCY:
      cmd(player, "give @s bb:quincy_cross 1");
      break;
    case RACES.FULLBRINGER:
      cmd(player, "give @s bb:fullbring_object 1");
      break;
    case RACES.HOLLOW:
      cmd(player, "give @s bb:hollow_mask 1");
      break;
    default:
      break;
  }
}
