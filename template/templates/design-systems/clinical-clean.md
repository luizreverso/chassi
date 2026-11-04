# Design System Preset: Clinical Clean (Healthcare, Data & FinTech)

A clean, accessible, high-trust design system optimized for consultation flows, charts, audit logs, and critical domain administration.

## 0. UI Design Dials (1–10 Scale)
- **`DESIGN_VARIANCE`**: `3` (Strict geometric consistency, uniform alignments, predictable workflows)
- **`MOTION_INTENSITY`**: `2` (Minimal/functional: instant state changes, subtle 150ms opacity transitions, zero distracting bounce)
- **`VISUAL_DENSITY`**: `8` (Compact data tables, legible metrics, high information-per-pixel ratio for analytical charts)

## 1. Color Palette & Semantic Tokens
- **Background (Canvas)**: `#F8FAFC` (Slate 50 — ultra-clean, sterile, high-contrast)
- **Surface Level 1 (Card/Container)**: `#FFFFFF` (Pure white card surface)
- **Surface Level 2 (Active/Hover)**: `#F1F5F9` (Slate 100 — subtle interactive row highlight)
- **Primary / Core Action**: `#0284C7` (Sky 600 — trusted blue)
- **On-Primary**: `#FFFFFF`
- **Secondary**: `#0F172A` (Slate 900 — high-contrast text and prominent headers)
- **Muted / Border**: `#E2E8F0` (Slate 200 — crisp 1px borders)
- **Success / Normal**: `#16A34A` (Green 600 — normal metrics, confirmed states)
- **Warning / Pending**: `#D97706` (Amber 600 — pending operations, cautions)
- **Danger / Urgent**: `#DC2626` (Red 600 — validation failures, critical alerts)
- **Focus Ring**: `rgba(2, 132, 199, 0.4)` with `2px` offset

## 2. Typography Hierarchy
- **Primary Font**: Clean Geometric Sans-Serif (`Inter`, `Geist`, system-ui)
- **Monospace Font**: `JetBrains Mono` or `SF Mono` for IDs, codes, and timestamps
- **Scale**:
  - `Title`: `24px` / `20px`, SemiBold `600`, line-height `1.25`
  - `Section Header`: `18px`, SemiBold `600`, line-height `1.3`
  - `Body / UI`: `14px`, Regular `400`, line-height `1.5`
  - `Metric / Data`: `13px`–`14px`, Medium `500`
  - `Captions & Badges`: `11px`–`12px`, SemiBold `600`, uppercase tracking `0.04em`

## 3. Spacing & Elevation
- **Base Grid**: `4px` / `8px` strict grid
- **Row Heights**: `36px`–`42px` compact tabular rows
- **Borders & Dividers**: `1px solid #E2E8F0`
- **Corner Radius**: `6px` for inputs/controls, `10px` for dialogs and detail cards
