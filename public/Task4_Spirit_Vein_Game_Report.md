# Assignment 4: Developing an AI-Assisted Application

**Project Title**: 守护灵脉 / Defend the Spirit Vein  
**Student Name**: 龚科市  
**Student ID**: ZY2557102  

## 1. Background & Design

For Assignment 4, I chose **Option A: "Defend Your Thesis" (The Game)**, but changed the theme from an academic defense scene into a xianxia-style spirit-vein defense game.

The player is a cultivator defending the sect's **Spirit Vein Core**, which is placed at the bottom of the battlefield. Enemies attack from the upper and side edges of the map and try to destroy the core. The player chooses one of two characters, moves around the battlefield, casts basic attacks, and uses character-specific immortal art skills.

The reason for this design is that it keeps the original assignment logic:

1. Survival / defense gameplay.
2. Character selection.
3. Game over and score logic.
4. Keyboard and mouse controls.

At the same time, the xianxia theme gives the game a more personal and memorable setting.

## 2. Core Gameplay

| Feature | Implementation |
| --- | --- |
| Game Name | 守护灵脉 / Defend the Spirit Vein |
| Main Goal | Protect the bottom Spirit Vein Core for as long as possible |
| Player Control | WASD / arrow keys for movement, mouse for aiming |
| Basic Attack | Left mouse button |
| Ice Cultivator Skills | Q, E, R, F, Q+E, and Space |
| Fire Cultivator Skills | Q, E, R, and Space |
| Skill Growth | Every 200 score grants 1 upgrade point |
| Skill Tiers | Each ice skill has 3 tiers; tier 3 has exaggerated effects |
| Score Logic | Survival time and enemy kills increase score |
| Game Over | Triggered when the Spirit Vein Core or player HP reaches 0 |

## 3. Character Design

### 3.1 冰修

| Attribute | Design |
| --- | --- |
| Role Type | Control-oriented ice cultivator |
| Basic Attack | 冰棱术 |
| Q Skill | 半月霜波: releases a crescent-shaped ice wave and slows enemies on hit |
| E Skill | 万剑归宗: releases multiple radial sword projectiles |
| R Skill | 冰影分身: summons stronger clones that continuously attack toward the current mouse direction |
| F Skill | 玄冰封界: directly freezes all enemies; tier 3 unlocks a second active press that detonates frozen targets |
| Q+E Domain Skill | 冰魄领域: creates an ice-array frost domain under the player for area control |
| Ultimate | 九霄天雷: calls full-screen lightning strikes to damage all enemies |
| Growth System | Each skill can be upgraded from tier 1 to tier 3 using score-based upgrade points |
| Strength | Strong control, crowd management, and defensive utility |
| Play Style | Slows enemies before they reach the bottom Spirit Vein Core |

### 3.1.1 冰修 Skill Tiers

| Skill | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- |
| Q 半月霜波 | One crescent wave that slows enemies | Two wider crescent waves | Five large ice moons with heavy slow and short freeze |
| E 万剑归宗 | One radial sword wave | Two radial sword layers | Three full-screen sword storms with lightning visuals |
| R 冰影分身 | Two faster clones that follow mouse aiming | Four stronger clones with slowing shots | Six high-speed clones creating a bullet-screen effect |
| F 玄冰封界 | Directly freeze all enemies for 2 seconds | Longer direct freeze | Long global freeze, then press F again to detonate each frozen target |
| Q+E 冰魄领域 | Create an ice-array frost domain under the player | Larger domain with rotating ice runes | Extreme frost array with stronger control and damage |
| Space 九霄天雷 | Full-screen lightning strikes all enemies | Stronger chain lightning and higher damage | Thunderstorm-like global lightning with multiple heavy strikes |

### 3.2 火修

| Attribute | Design |
| --- | --- |
| Role Type | Burst-damage fire cultivator |
| Basic Attack | 火球术 |
| Q Skill | 陨炎大火球: launches a large explosive fireball |
| E Skill | 赤焰光束: fires a continuous flame beam |
| R Skill | 护体炎星: summons orbiting fireballs around the player |
| Ultimate | 焚天蓄炎: charges for 1 second, then releases a super-large fireball |
| Growth System | Each fire skill can also be upgraded from tier 1 to tier 3 |
| Strength | Strong burst damage, area denial, and aggressive clearing |
| Play Style | Higher risk, but can delete enemy waves with upgraded skills |

### 3.2.1 火修 Skill Tiers

| Skill | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- |
| Q 陨炎大火球 | One large explosive fireball | Two fireballs with wider explosions | Three meteor-like giant fireballs with huge blast radius |
| E 赤焰光束 | One straight flame beam | Wider and longer burning beam | Triple piercing flame beams that melt enemy waves |
| R 护体炎星 | Three orbiting fireballs | Five stronger orbiting fireballs | Nine giant orbiting fireballs for close-range destruction |
| Space 焚天蓄炎 | Charge for 1 second, then launch a super-large fireball | Larger explosive core with stronger splash damage | Sun-like giant fireball with massive single-direction explosion |

## 4. Enemy Design

| Enemy | Role in the Game |
| --- | --- |
| 妖兽 | Basic enemy, appears from the beginning |
| 心魔 | Fast enemy, appears after the early stage |
| 魔修 | Slower but stronger enemy |
| 天劫残影 | Elite enemy with high HP, appears in the late stage |

The enemy waves become harder over time. This creates a survival curve: the first stage lets the player learn the controls, and later stages become more intense.

## 5. Tech Stack

| Category | Tool |
| --- | --- |
| Programming Language | JavaScript / JSX |
| Framework | React |
| Build Tool | Vite |
| Rendering | HTML Canvas |
| Styling | CSS |
| Deployment Target | Static website / GitHub Pages-compatible build |
| AI Development Partner | LLM-assisted planning, debugging, and iteration |
| In-Game Assistant | Local rule-based skill Q&A agent |

## 6. AI-Assisted Development Process

### 6.1 Architecture Planning

The LLM helped plan the game as a React component with a Canvas-based game loop. The application was separated into:

1. Main website navigation in `App.jsx`.
2. Game logic and rendering in `SpiritVeinGame.jsx`.
3. Visual layout and responsive styling in `index.css`.

This structure keeps the game separate from the previous report pages, making it easier to maintain.

### 6.2 Feature Implementation

The LLM assisted with:

1. Designing the two character classes.
2. Implementing player movement.
3. Creating projectile and skill logic.
4. Spawning enemies from the edge of the battlefield.
5. Adding collision detection between projectiles, enemies, the player, and the core.
6. Building score, HP, cooldown, and game-over logic.
7. Designing a small in-game skill assistant for answering player questions.

### 6.3 Problem Solving and Iteration

During testing, the first difficulty curve was too harsh: the Spirit Vein could be destroyed very quickly if the player did not immediately attack. The game was adjusted by:

1. Increasing the Spirit Vein Core HP.
2. Reducing early enemy speed and damage.
3. Slowing the early spawn rate.
4. Keeping late-game scaling so that the game still becomes harder over time.

This is an example of using testing feedback to tune game balance instead of only making the code compile.

### 6.4 Handling AI Limitations

The AI-generated plan needed verification. I checked the implementation with:

1. Production build tests.
2. ESLint checks on the modified source files.
3. Browser verification through the local website.
4. Gameplay state checks for role selection, Canvas rendering, status bar updates, controls, and enemy labels.

This helped catch real issues such as a lint warning in enemy coordinate initialization and an overly fast early-game failure curve.

### 6.5 Embedded Skill Assistant

To satisfy the embedded agent bonus in a stable way, the game includes a lightweight in-game assistant named "器灵助手". The player can ask questions such as:

1. "F怎么用?"
2. "Q+E领域怎么放?"
3. "怎么升阶?"
4. "当前冷却状态怎么样?"

The assistant answers based on the selected character, current skill tiers, cooldown status, and upgrade points. It is implemented locally instead of exposing an API key in the public browser code. This keeps the GitHub Pages deployment safe and reliable while still demonstrating an AI-agent-style interaction inside the game.

## 7. Results

The current prototype includes:

1. A working Task 4 game page in the personal website.
2. A character selection screen with 冰修 and 火修.
3. A live Canvas battlefield.
4. Player HP, Spirit Vein HP, score, kill count, timer, and multi-skill cooldown display.
5. Four enemy types.
6. Game-over and restart flow.
7. Responsive layout that still works in a narrow browser panel.
8. An embedded "器灵助手" panel for asking skill and upgrade questions.

The project can be run locally with:

```bash
npm run dev -- --host 127.0.0.1
```

It can also be built as a static website with:

```bash
npm run build
```

## 8. Current Limitations and Next Steps

The current version focuses on a stable playable core and a local skill Q&A assistant. The assistant is intentionally limited to skill explanation, cooldown advice, and upgrade guidance, which makes it useful during a short classroom demonstration.

Planned next steps:

1. Add optional backend-based DeepSeek API support for more natural conversation.
2. Add screenshots or a short demo video for the final presentation.
3. Continue balancing enemy waves and skill cooldowns.
4. Add more assistant answers for enemy strategy and character recommendations.

## 9. Rubric Coverage

| Criteria | Current Coverage |
| --- | --- |
| Concept & Logic | Xianxia spirit-vein defense game with clear rules |
| AI Integration Process | Architecture planning, debugging, balancing, and verification documented |
| Technical Execution | React + Canvas playable prototype |
| Documentation Quality | This report records design, process, results, and next steps |
| Final Presentation | Game page can be opened and played during presentation |
| Bonus: Embedded AI Agent | Implemented as a local skill Q&A assistant |
| Bonus: Cross-platform Support | Static web app can run in modern browsers on multiple systems |
