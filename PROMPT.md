# Bleach: Berzerk — Design Spec (Mobile Bedrock Add-On)

This is the design the code in this repo implements. It targets **Minecraft
Bedrock Edition (mobile-first)** as an **Add-On** (Behavior + Resource Pack +
Script API), *not* a Java Forge/Fabric mod.

## Platform constraints (drive every decision)
- Touch-first UX: no keybinds. Abilities fire from the **Spirit Focus** item →
  a `@minecraft/server-ui` menu, or **sneak + use** to quick-cast.
- Persistence via **dynamic properties** (no external files).
- Custom entities/items via Behavior Pack; UI via server-ui forms.
- Performance-capped particles, entity counts, and phased content for phones.

## Character start
- **Race selection only** (no name/gender/appearance screen — uses the player's
  existing Minecraft skin & name). One `ActionForm` with five buttons.
- Races: **Soul Reaper, Hollow, Quincy, Fullbringer, Human** — each with unique
  progression, abilities, transformations and endgame.

## Core systems
- **Levels 1–1000**, XP from quests/bosses/training/PvP/raids/missions.
- **Stats:** Strength, Defense, Speed, Reiatsu, Spirit Control, Sword Mastery,
  Ability Mastery. Stat points each level.
- **Reiatsu:** resource for abilities/flight/transformations; 10 ranks
  (Civilian → Soul King Class); pressure effects on weaker entities.
- **Ability engine:** one framework, ~9 reusable "kinds"
  (beam, cero, blast, slash, dash, buff, guard, dot, heal, summon). All race
  skills are data rows parameterising these.

## Races
- **Soul Reaper** — Asauchi + Flash Step; random Zanpakutō from 20 elements
  (4 Shikai + 6 Bankai + Ultimate each); Shikai @100, Bankai @300; Squads 1–13.
- **Hollow** — evolve by eating souls: Lesser → Gillian → Adjuchas → Vasto Lorde
  → Arrancar; skill branches (Speed/Regen/Cero/Strength/Hierro); random Aspect &
  Resurrección form.
- **Quincy** — Spirit Bow, Blut, Hirenkyaku; random **Schrift** A–Z (5 actives +
  Vollständig ultimate); Vollständig @300.
- **Fullbringer** — random object (Sword/Book/Chain/Gun/Necklace/Coin/Ring/
  Jacket/Cards); Stage 1 → 2 → Complete Fullbring.
- **Human** — weak but +50% XP; hidden evolution paths (Visored/Soul Reaper/
  Fullbringer/Quincy).
- **Visored** — Soul Reaper + Lv 400: Hollow Mask (Cero/Regen/Berserk).

## Content
- **Transformations** all toggle from the menu with power multipliers + buffs +
  pressure burst.
- **Training** (6 activities) raises mastery permanently; mobile channel UX.
- **Spirit Flight** — hover flight fuelled by Reiatsu (jump=rise, sneak=descend).
- **Bosses** — 18 across Early/Mid/Late/Endgame, multi-phase, scripted cero,
  unique drops, XP rewards.
- **Dynamic events** — Hollow Invasion, Menos Attack, Soul Society Emergency,
  Espada Assault, Sternritter Raid, Aizen Rebellion, Yhwach Invasion.
- **Raids** — Hueco Mundo (50 waves), Espada gauntlet, Soul Society War,
  Thousand-Year Blood War.

## Build order (shipped as a foundation; expansions are data-only)
1. ✅ Core loop: race select, stats/levels, Reiatsu, ability engine, one+ boss.
2. ✅ All races baseline + training + transformations.
3. ✅ Full element/Schrift/Hollow/Fullbring data tables (460+ abilities).
4. ✅ Bosses + dynamic events.
5. ✅ Raids + progression gates.
6. ⏳ Custom models, built world zones, NPC questlines, squad missions, ranked
   PvP board — all slot into existing data tables.

See `README.md` for install & commands.
