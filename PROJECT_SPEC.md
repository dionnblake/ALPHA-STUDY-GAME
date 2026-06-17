# Project Spec: AI Study Game
**Date:** 2026-06-17
**Version:** 1.0

---

## 1. One-Line Summary
A Windows desktop study game that helps beginners learn AI concepts and pass AI certification exams through interactive quizzes, flashcards, and code-reading exercises.

## 2. Problem Statement
People making a career change into AI have no single, focused tool that combines cert prep, concept learning, and hands-on code literacy in one place. Existing resources (YouTube, documentation, random quiz sites) are scattered and passive. This app gamifies the learning path so beginners can study consistently and track their progress toward real certifications.

## 3. Target User
**Primary:** Beginners making a career change into AI — people who are not yet working in tech or AI but want to break in, starting from close to zero.
**Secondary:** Self-learners already in tech who want to add AI credentials to advance.
**User's current workaround:** Scattered resources — YouTube videos, Google's free courses, documentation, random practice tests — with no unified progress tracking or gamified feedback loop.

## 4. Goals & Success Metrics
| Goal | How We Measure It |
|------|------------------|
| Creator passes target cert exams | Exam pass/fail (Google AI, Prompt Engineering, AWS) |
| App is marketplace-ready | Passes store submission review; no critical bugs or unfinished screens |
| Python code-reading fluency | Creator can read and review AI-related Python scripts without reference |
| Viable commercial product | Listed and generating downloads/revenue on target marketplace |

## 5. MVP Scope
### In Scope (v1)
- Cert quiz tracks: Google AI Essentials, Google AI Professional, Prompt Engineering, GenAI on Google Cloud
- Flashcard system
- One polished Python code-reading game (replaces the two existing drafts)
- Homepage cleanup (remove bloat items)
- Basic progress tracking

### Out of Scope (v1)
- AWS cert track content (future track)
- Multiplayer or social features
- Cloud sync or user accounts
- Mobile version
- Writing-focused Python exercises (focus is reading/reviewing, not authoring)
- Marketplace listing and distribution setup (Phase 2)

## 6. Technical Architecture
**Platform:** Windows desktop (Tauri)
**Stack:** Tauri + React + TypeScript + Vite; local SQLite via `@tauri-apps/plugin-sql`
**Data:** Questions stored in local SQLite DB (`ai_study_game.db`); question banks as JSON files in `public/questions/`; progress and settings persisted locally
**Integrations:** None (fully offline/local)
**Auth:** None — single-user local app

## 7. Key User Flows

1. **Cert Prep Loop:** User opens app → selects a cert track from sidebar → answers multiple-choice questions → gets immediate feedback + explanation → sees progress update on dashboard.

2. **Flashcard Review:** User opens Flashcards → selects a topic or track → flips through cards → marks known/unknown → app surfaces weak cards more often via spaced repetition.

3. **Python Code-Reading Game:** User opens Python game → sees a code snippet → answers "what does this do?", "what's the output?", or "spot the bug?" → gets explanation of the concept demonstrated → moves to next snippet.

4. **Progress Check:** User opens dashboard or progress screen → sees completion % per track, weak areas, and recent activity → decides what to study next.

## 8. Risks & Open Questions
| Risk / Question | Severity | Mitigation / Notes |
|-----------------|----------|-------------------|
| Python game design is undefined — creator doesn't yet know what "best" looks like | High | Research code-reading pedagogy; build a small prototype of 3 exercise types and validate before building the full bank |
| Marketplace submission requirements unknown (Windows Store, Tauri compatibility) | High | Research Windows Store submission process for Tauri apps before investing in polish |
| Where to market to AI career changers — distribution unknown | Med | Research channels: LinkedIn, Reddit r/learnprogramming, AI communities, Gumroad as alternative to Store |
| Question quality degradation as banks grow | Med | Keep existing validation scripts and quality gates from CLAUDE.md; run before every release |
| Homepage bloat reduces first impression | Low | Identify and remove low-value widgets; prioritize clean entry to cert tracks |

## 9. Timeline & Phases
**Phase 1 (MVP Polish):** Clean up homepage, rebuild Python game with code-reading focus, finalize all cert tracks, stabilize and test — no hard deadline, self-paced
**Phase 2 (Marketplace Ready):** Research and execute Windows Store (or alternative) submission, create screenshots/listing assets, set pricing
**Phase 3 (Growth):** Add AWS cert track, expand Python bank, consider Gumroad or direct sales if Store is a poor fit
**Hard deadline:** None — self-funded, self-driven

## 10. Open Decisions
- [ ] **Python game format:** Which exercise types to build — output prediction, bug spotting, code explanation, reordering? Need to prototype and validate before writing the full question bank.
- [ ] **Marketplace target:** Windows Store vs. Gumroad vs. itch.io vs. direct sales — each has different requirements, audiences, and revenue splits. Needs research before investing in store-specific polish.
- [ ] **Homepage cleanup:** Which specific widgets/sections get removed? Should be decided in a focused UI review session before touching code.
- [ ] **AWS track:** When to add it — before or after marketplace launch? Adds value but also scope risk.

---
*This spec was generated from a discovery interview on 2026-06-17. Update it as the project evolves.*
