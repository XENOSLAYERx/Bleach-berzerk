# Bleach: Berzerk — a Bleach RPG Add-On for Minecraft **Bedrock (Mobile)**

A deep, anime-style RPG built as a **Bedrock Edition Add-On** (Behavior Pack +
Resource Pack + Script API) so it runs on **phones/tablets**, Windows 10/11,
consoles and Bedrock servers. Inspired by Dragon Block C / Naruto C / Bleach.

> **Platform note:** This is a Bedrock **Add-On**, not a Java Forge/Fabric mod.
> Java mods do not run on mobile — Bedrock does. That choice drives everything
> below (touch UI instead of keybinds, dynamic-property saves, etc.).

---

## What's in the box

| System | Status |
|---|---|
| 5 playable races (Soul Reaper, Hollow, Quincy, Fullbringer, Human) | ✅ |
| First-join **race selection** menu (touch-friendly) | ✅ |
| Level system (1–1000), XP from kills/bosses/training/events/raids | ✅ |
| 7 stats + per-level stat points you spend in a menu | ✅ |
| **Reiatsu** resource, 10 ranks, regen, spiritual **pressure** (crater, knockback, screen-shake on power-up) | ✅ |
| **460+ abilities** via a data-driven engine (9 reusable "kinds") | ✅ |
| 20 Zanpakutō elements → 4 Shikai + 6 Bankai + Ultimate each | ✅ |
| 26 Quincy **Schrift** letters (A–Z) → 5 actives + Vollständig ult each | ✅ |
| Hollow evolution: Lesser→Gillian→Adjuchas→Vasto Lorde→Arrancar (+ aspect + Resurrección) | ✅ |
| 9 Fullbring objects → Stage 1 → 2 → Complete Fullbring | ✅ |
| Transformations: Shikai, Bankai, Visored Mask, Resurrección, Vollständig, Fullbring | ✅ |
| Training (meditation, sword, reiatsu, hunting, quincy, speed) → permanent mastery | ✅ |
| **Spirit Flight** (mobile hover flight, Reiatsu-fuelled) | ✅ |
| 18 bosses across 4 tiers, multi-phase, scripted attacks, unique drops | ✅ |
| Dynamic world events (Hollow Invasion, Menos Attack, Espada Assault, Aizen/Yhwach…) | ✅ |
| Raids (Hueco Mundo 50-wave, Espada gauntlet, Soul Society War, Thousand-Year Blood War) | ✅ |
| Touch menu: cast, loadout, transform, stats, training, flight, profile | ✅ |

**Design intent:** the engine is data-driven, so extending it is *filling in
data tables* (more Schrift specifics, per-squad missions, custom models/zones)
rather than writing new systems. See "Roadmap" below.

---

## Install (mobile)

1. Run `python3 tools/build.py` to produce `dist/BleachBerzerk.mcaddon`
   (already reproducible from source; textures come from
   `python3 tools/gen_textures.py`).
2. Send that `.mcaddon` to your device and **open it** — Minecraft imports both
   packs automatically.
3. Create a world and enable, under **Behavior Packs** and **Resource Packs**,
   *Bleach: Berzerk*. Enabling the behavior pack pulls in the resource pack.
4. In the world's settings turn **ON**:
   - **Beta APIs / "Additional Modding Capabilities"** (required — the Script API)
   - **Holiday Creator Features** (custom items)
5. Enter the world → a **Choose Your Path** menu appears. Pick a race.

You'll be given a **Spirit Focus** item — use it (tap-and-hold / right-click) to
open your ability menu. **Sneak + use** quick-casts ability slot 1.
Type `!bb help` in chat for commands.

### If the pack fails to load
The manifest targets `@minecraft/server` `1.13.0` and `@minecraft/server-ui`
`1.2.0` (min engine `1.21.0`). If your Minecraft version rejects these, open
`behavior_pack/manifest.json` and bump the two `dependencies[].version` strings
to the versions your game ships (Bedrock tells you the valid range in the
content-log), then rebuild. No code changes needed.

---

## Playing

- **Level up** by killing mobs/bosses, training, and completing events/raids.
  Humans gain 50% bonus XP.
- **Spend stat points** in the Stats screen (Strength, Defense, Speed, Reiatsu,
  Spirit Control, Sword Mastery, Ability Mastery).
- **Transform** from the menu once unlocked. Powering up unleashes Reiatsu
  pressure on weaker nearby entities.
- **Progression gates** (auto, no NPCs needed yet):
  - Shikai — Lv 100 + complete Meditation training
  - Bankai — Lv 300 (subdue your Zanpakutō spirit)
  - Visored Mask — Lv 400
  - Vollständig — Lv 300 (Quincy)
  - Fullbring Stage 2 / Complete — Lv 150 / Lv 350
  - Hollow evolution — by souls eaten (kills)

### Commands
```
!bb menu        open your ability menu
!bb reroll      re-pick your race
!bb help        list commands
```
Admin/debug (first run `/tag @s add bb_admin`):
```
!bb unlock shikai|bankai|visored|vollstandig
!bb boss <id>       spawn a boss in front of you
!bb event <id>      trigger a dynamic event
!bb raid <id>       start a raid
!bb setlevel <n>    set your level (1–1000)
!bb addxp <n>       grant XP
```
Map-makers can also use `/scriptevent bb:menu`, `/scriptevent bb:boss aizen`, etc.

---

## Project layout
```
behavior_pack/
  manifest.json
  items/                 custom item definitions (Spirit Focus, Asauchi, …)
  scripts/
    main.js              entry: wires events + tick loops
    config.js            all tuning constants & dynamic-property keys
    util.js              version-tolerant API helpers
    data/                profile, elements, zanpakuto, schrift, hollow,
                         fullbring, bosses, baseAbilities
    systems/             abilities engine, combat, reiatsu, leveling,
                         raceManager, transformations, progression,
                         pressure, flight, training, hollowEvolution,
                         bossManager, worldEvents (events + raids)
    ui/                  raceSelect, menu, forms
    commands/            chat + scriptevent command interface
resource_pack/
  manifest.json
  textures/items/*.png   generated icons
  texts/                 lang + item names
tools/
  gen_textures.py        regenerate textures (no Pillow needed)
  build.py               package -> dist/BleachBerzerk.mcaddon
  selftest.mjs           offline registry/availability test
```

## Development

```bash
python3 tools/gen_textures.py     # (re)build textures
node tools/selftest.mjs           # verify all abilities resolve (uses local stubs)
python3 tools/build.py            # package the .mcaddon
```
`node tools/selftest.mjs` uses tiny stub `@minecraft/*` modules under
`node_modules/` (git-ignored) so the ability registry can be exercised without
Minecraft. It reports the ability count and checks every race's loadout resolves.

**Tuning:** almost everything balance-related lives in `scripts/config.js`
(`TUNING`, `FORM_MULT`, `RANKS`, XP curve in `systems/leveling.js`). Adding a new
Zanpakutō element is one row in `data/elements.js`; a new boss is one row in
`data/bosses.js`.

---

## Roadmap (data-only expansions the engine already supports)
- Custom entity models/animations for bosses & Resurrección forms (currently
  reskinned vanilla mobs for out-of-the-box compatibility).
- Built world zones (Karakura, Seireitei, Hueco Mundo, Wandenreich) as
  structures/a custom dimension, with NPC questlines replacing the level-gated
  unlocks.
- Per-squad (1–13) missions, buffs and reputation UI.
- Ranked PvP arena matchmaking & titles board.
- Fleshed-out per-letter Schrift signature mechanics.

---

## Constraints & honesty
This is a **complete, runnable foundation** covering every core system in the
design, with broad content across all five races. It intentionally reskins
vanilla mobs for bosses and uses level-gated unlocks in place of full NPC
questlines so it works the moment you import it — those are the two biggest
"art & world-building" expansions, and both slot into the existing data tables
without new engine code. Reiatsu-fly is a mobile-appropriate hover, not
creative flight. Some script-API calls are version-sensitive and are wrapped in
defensive helpers (`util.js`) so they degrade instead of crashing.
