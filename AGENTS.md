This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Multi-Agent Design & Development Workflows Baseline (Mobile App & Godot 4 + Blender Game Pipeline)

### 1. Mobile App Design Workflow (Multi-Agent)
- **Product Agent**: `Receive App Requirements` -> `User Research & Persona Generation` -> `Define Feature Set & User Journey` -> hands off in parallel to the UI/UX Agent and Tech Architect Agent -> `Drafting Front-End Views & Layouts` -> `App Spec & Prototype Delivery`.
- **UI/UX Agent**: `Generate Wireframes & Information Architecture` -> `UX Review & Flow Check` (if **Fail**, loop back to `Define Feature Set & User Journey`; if **Pass**, proceed to `Design System & High-Fi UI Prototypes` enforcing WCAG AAA contrast, 48x48dp touch targets, and zero emoji asset flips).
- **Tech Architect Agent**: `Backend Architecture & API Definition` -> `Cross-Platform Feasibility?` (if **No**, refine `Backend Architecture & API Definition`; if **Yes**, feed validated architecture into `Design System & High-Fi UI Prototypes` and `Drafting Front-End Views & Layouts` across iOS, Android, and Web).

### 2. Video Game Design Workflow (Multi-Agent — Godot 4 + Blender Scope Baseline)
- **Scope-Matched Baseline Stack**: Whenever game development matches scope (3D/2D action, martial arts, roguelike combat, tactical arenas, or physics-driven gameplay), enforce **Godot 4 (`Node3D` / GDScript 2.0)** + **Headless Blender Python (`bpy` -> `.glb`)** as the baseline engine and 3D asset pipeline.
- **Game Director Agent**: `Receive Game Concept & Genre` -> `Establish Game Lore & World-building` -> `Define Player Progression & Core Loops` -> handoff to Content & Art Agent. If `Resource & Platform Feasibility?` returns **No**, execute `Revise World & Mechanics` and loop back into world-building and blockout scripting.
- **Content & Art Agent (Blender `bpy` 3D Pipeline)**: `Develop Levels, Quests, & Environmental Art Style` -> `Concept Art & Mechanics Review` (if **Fail**, return to `Define Player Progression & Core Loops`; if **Pass**, trigger both `Systems & Gameplay Agent` and `Design Character, UI, & Audio Guidelines`). Run headless Blender Python (`blender --background --python generate_3d_*.py`) to procedurally build 3D characters, weapons, multi-bone armatures, PBR/emission materials, and NLA keyframed combat animations (`Idle_Poise`, `SingleHit_Cleave`, `MultiHit_Flurry`, `CloseQuarters_Combo`), exporting `.glb` models into Godot's `models/` folder -> `Draft Blockouts & Behavior Scripts` -> `Game Design Document (GDD), Asset List & Playable Godot 4 Build`.
- **Systems & Gameplay Agent (Godot 4 Engine & Physics Rules)**: `Determine Game Engine & Physics Rules` (configure Godot 4 `Forward+`, `WorldEnvironment` ACES Filmic glow/fog, dynamic `Camera3D` orbit/combat framing, `AnimationPlayer` state machine, 66ms hit-stop kinesthetics, and authentic studio audio/haptics) -> `Resource & Platform Feasibility?` (if **No**, handoff to `Revise World & Mechanics`; if **Yes**, feed into `Draft Blockouts & Behavior Scripts` and verify via live Godot 4 execution).

### 3. Audio & Sound Design Anti-Slop Baseline
- **STRICTLY BANNED AS AI SLOP**: Algorithmic mathematical wave synthesis (procedural sine-wave drones, white noise sweeps, frequency sweeps, and synthetic math-formula buzzers). They produce harsh, robotic, and low-effort sound that degrades game quality.
- **Enforced Audio Standard**: Use ONLY high-fidelity studio-recorded Foley, orchestral, or authentic game sound assets (`.wav`, `.ogg`, `.mp3`). In the absence of verified studio audio assets, the game MUST remain completely silent rather than generating synthetic sine-wave slop.

