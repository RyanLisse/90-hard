# HardLevel — Slices Pack

Deze map bevat **7 verticale slices** (markdown) + een **PR template**. Gebruik dit pakket om stap‑voor‑stap HardLevel te bouwen met **vertical slicing**, **TDD (London)**, **conventional commits** en **git worktrees**.

## Inhoud

- `slice-01-foundation-and-tooling.md`
- `slice-02-design-system-and-app-shell.md`
- `slice-03-core-tracking-checklist-heatmap.md`
- `slice-04-photo-and-avatar.md`
- `slice-05-weight-and-fasting.md`
- `slice-06-journaling-voice-tiptap-summaries.md`
- `slice-07-analytics-gamification-integrations.md`
- `.github/pull_request_template.md`

## Vereisten

- **Git** ≥ 2.40 met `git worktree`
- **Bun** ≥ 1.1
- **Node** ≥ 18 (voor tooling)
- Optioneel: **pnpm**/**npm** (voor Expo/Next init)

## Aanpak (korte samenvatting)

1. **Eén slice per PR** (klein, reviewbaar).
2. **TDD (London)**: eerst contract/tests met mocks → implementatie → refactor.
3. **Conventional commits** (met scope).
4. **Worktrees**: elke slice in een eigen werkmap/branch.

## Quickstart

```bash
# 1) Repo klonen
git clone git@github.com:<org>/<repo>.git
cd <repo>

# 2) Nieuwe worktree voor Slice 1
git worktree add ../hardlevel-foundation -b chore/foundation
cd ../hardlevel-foundation

# 3) Volg instructies uit: slice-01-foundation-and-tooling.md
#    - implementeer
#    - bun test && bun run lint && bun run build

# 4) Commit & push
git add -A
git commit -m "chore(repo): initialize monorepo, bun, biome, commit hooks"
git push -u origin chore/foundation

# 5) Open PR met template .github/pull_request_template.md
```

## Implemented Core Skeleton (Ready to Use)

- Code: `packages/@hardlevel-core`
- Exports: domain types, `computeDayCompletion`, unit converters, heatmap utils, and ports/services for Checklist, Avatar, and Journal (London TDD against ports).
- Tests: Bun unit tests colocated next to the modules.

Run only the HardLevel core tests:

```bash
# from repo root
cd packages/@hardlevel-core
bun test
# go back after
cd -
```

## Conventional Commits (voorbeeld)

- `feat(app-shell): add dark theme and real-time header`
- `test(core-tracking): add heatmap domain tests`
- `refactor(avatar): extract prompt builder`
- `chore(repo): setup commitlint and husky`

## TDD (London) — Richtlijnen

- **Schrijf eerst** een test tegen een **port/contract** (mock dependencies).
- Laat de test **falen** (rood), implementeer **minimaal** (groen), **refactor**.
- Houd unit tests **klein en snel**; adapters/integraties apart testen.
- UI: test interacties met RTL; e2e pas aan het einde (Playwright).

## Branch/PR Flow

1. `git worktree add ../<slice-dir> -b feat/<slice-name>`
2. Commit klein en vaak; push branch.
3. Open PR en gebruik de **Ready to Merge Checklist** uit elke slice.
4. Na merge: verwijder worktree/map lokaal.

## Nieuwe slice toevoegen

- Kopieer de **SLICING_TEMPLATE** structuur uit een bestaande slice.
- Formuleer **één zin** wat de slice oplevert.
- Schat complexiteit; splits >3 in subtasks.
- Lever een **klein codevoorbeeld** (contract of kerncomponent).

## Troubleshooting

- **Hydration mismatch (Next.js):** klok alleen client-side renderen; `useEffect` voor timers.
- **Flaky tests met timers:** gebruik fake timers/mocks (`vi.useFakeTimers()` of gelijkwaardig).
- **Offline sync:** InstantDB lokaal laten schrijven, sync bij reconnect; test race conditions.

Succes! Houd slices klein en ship elke dag een stukje.
