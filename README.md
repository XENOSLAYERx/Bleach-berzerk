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
| **Gotei 13 squads** (1–13) with captains, passive buffs & reputation; race factions | ✅ |
| **Mission board** — 12 missions (kill/boss/train/pvp/event/raid/level) with XP + rep | ✅ |
| **Race questlines** that unlock transformations (incl. Zanpakutō-Spirit & Inner-Hollow story bosses); Human evolution | ✅ |
| **World travel hub** (Senkaimon) — Karakura, Seireitei, Hueco Mundo, Wandenreich, Arena; landmarks auto-built on first visit | ✅ |
| **Ranked PvP** — challenge duels, arena teleport, rating & 6 ranks (Bronze→Legend) | ✅ |
| **Endgame titles** (Soul King, Captain Commander, Strongest Espada, Quincy King…) with a selector | ✅ |
| **Schrift signature passives** per letter (Quincy) | ✅ |
| **Custom entities** — walk-up NPCs (mentors + squad captains), a custom Hollow, a giant **Menos**, and an **Arrancar** boss model (used by 5 Espada), with hand-authored geometry, textures & spawn eggs | ✅ |
| **Entity animations** — shared idle/walk animation + controller drive all custom entities | ✅ |
| **Walk-up NPC interaction** — tap a captain to enlist / open missions; mentors open quests/missions/training | ✅ |
| **Hollow spawn rules** — custom Hollows spawn at night | ✅ |
| **Schrift special mechanics** — reactive per-letter effects (The Almighty foresight, The Miracle comeback, The Fear recoil, The Deathdealer lifesteal, …) | ✅ |
| Touch menu: cast, loadout, transform, stats, training, flight, squad, missions, quests, travel, PvP, titles, profile | ✅ |

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
!bb menu            open your ability menu (all systems live here)
!bb quest           show your current quest ( !bb quest boss summons its boss)
!bb travel <zone>   fast-travel (karakura, soul_society, hueco_mundo, wandenreich, arena)
!bb duel <player>   challenge a player to a ranked duel
!bb reroll          re-pick your race
!bb help            list commands
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
  entities/              custom entities (bb:npc, bb:hollow_grunt)
  spawn_rules/           night-spawning Hollows
  scripts/
    main.js              entry: wires events + tick loops
    config.js            all tuning constants & dynamic-property keys
    util.js              version-tolerant API helpers
    data/                profile, elements, zanpakuto, schrift, hollow,
                         fullbring, bosses, baseAbilities, squads, missions
    systems/             abilities engine, combat, reiatsu, leveling,
                         raceManager, transformations, progression,
                         pressure, flight, training, hollowEvolution,
                         bossManager, worldEvents (events + raids),
                         squads, missions, quests, travel (zones),
                         pvp, titles, schriftPassive
    ui/                  raceSelect, menu (+ squad/mission/quest/travel/
                         pvp/title screens), forms
    commands/            chat + scriptevent command interface
resource_pack/
  manifest.json
  entity/                client render defs (npc, hollow_grunt, menos)
  models/entity/         bb_humanoid.geo.json (shared geometry)
  animations/            idle / walk animations
  animation_controllers/ move controller (idle<->walk)
  textures/items/*.png   generated item icons
  textures/entity/*.png  generated NPC / Hollow / Menos skins
  texts/                 lang + item/entity names
tools/
  gen_textures.py        regenerate textures (no Pillow needed)
  build.py               package -> dist/BleachBerzerk.mcaddon
  selftest.mjs           offline registry/availability test
```

## Development

```bash
python3 tools/gen_textures.py     # (re)build textures
node tools/importtest.mjs         # every module imports cleanly (uses local stubs)
node tools/selftest.mjs           # all 460 abilities resolve for every race/form
node tools/systest.mjs            # squad / mission / quest / title flows
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

## Roadmap (remaining polish)
Every system in the design is implemented and the custom-entity pipeline is now
proven (geometry → texture → client entity → behavior → spawn/interaction). The
remaining work is incremental art & content that plugs into what's already here:
- **Per-boss custom models** — the shared, animated `bb_humanoid` geometry drives
  NPCs, Hollows, the Menos and the **Espada** (5 bosses render as the custom
  Arrancar; the Inner Hollow renders as the Menos). The remaining named bosses
  still reskin vanilla mobs; giving each its own `.geo.json` follows the exact
  pattern in `resource_pack/models/entity` + `entity` + `animations`.
- **Detailed hand-built zones** — the travel hub auto-builds lit landmark arenas
  and populates them with NPCs; swapping in structure-file cities is pure content.
- **Even more Schrift depth** — 7 letters have reactive mechanics today; the other
  19 currently use passive buffs and could each get a signature handler.

---

## Constraints & honesty
This is a **complete, runnable RPG** covering every system in the design, with
broad content across all five races, custom items and custom entities (NPCs +
a Hollow mob with hand-authored geometry). **Bosses still reskin vanilla mobs**
(buffed & multi-phase) rather than shipping unique models — that's the main
remaining art task, and the custom-entity pipeline here is the template for it.
Reiatsu-fly is a mobile-appropriate hover, not creative flight. Custom entities,
items and the Script API all require the world's **Beta APIs** + **Holiday
Creator Features** toggles. Some script-API calls are version-sensitive and are
wrapped in defensive helpers (`util.js`) so they degrade instead of crashing;
if a custom entity is rejected by an older version, the rest of the mod is
unaffected (NPC content also remains reachable from the menu).
