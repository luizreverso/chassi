# Design System Preset: Modern Dark Tech (Linear / Raycast Style)

A precision-engineered, dark-mode-first design system optimized for SaaS dashboards, developer tools, and workflow applications.

## 0. UI Design Dials
- **`DESIGN_VARIANCE`**: `3` (Strict geometric consistency, uniform alignments, predictable rhythm)
- **`MOTION_INTENSITY`**: `4` (Fast, crisp micro-interactions: 150ms bezier curves, subtle hover glows)
- **`VISUAL_DENSITY`**: `8` (Compact data tables, tight list rows, high information-per-pixel ratio)

## 1. Color Palette & Semantic Tokens
- **Background (Canvas)**: `#0D0E11` (Deep obsidian black)
- **Surface Level 1 (Card/Panel)**: `#16181D` (Subtle elevated dark gray)
- **Surface Level 2 (Active/Hover)**: `#21242C` (Interactive row highlight)
- **Primary / Accent**: `#5E6AD2` (Electric Linear blurple / indigo)
- **On-Primary**: `#FFFFFF`
- **Text Primary**: `#EDEDED` (High-contrast pure text)
- **Text Secondary / Muted**: `#8A8F98` (Subtle metadata, keyboard hints)
- **Border / Outline**: `rgba(255, 255, 255, 0.08)` (Ultra-fine 1px borders)
- **Focus Ring**: `rgba(94, 106, 210, 0.5)` with `2px` offset

## 2. Typography Hierarchy
- **Primary Font**: Clean Geometric Sans-Serif (`Inter`, `Geist`, `SF Pro Display`)
- **Monospace Font**: `JetBrains Mono` or `Geist Mono` for IDs, shortcuts, and timestamps
- **Scale**:
  - `Title`: `20px`, SemiBold `600`, tracking `-0.015em`
  - `Body / UI`: `13px`–`14px`, Regular `400`, line-height `1.4`
  - `Captions & Tags`: `11px`–`12px`, Medium `500`, tracking `0.02em`

## 3. Spacing & Elevation
- **Base Grid**: `4px` / `8px` strict grid
- **Row Heights**: `36px`–`40px` compact interactive list items
- **Borders & Dividers**: `1px` translucent borders rather than drop shadows
- **Corner Radius**: `6px` (`rounded-md`) for controls and inputs; `10px` for dialogs/panels
