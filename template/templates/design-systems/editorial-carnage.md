# Design System Preset: Editorial & Media (The Daily Carnage Style)

A high-character editorial design system tailored for publishing, media brands, and interactive marketing games.

## 0. UI Design Dials
- **`DESIGN_VARIANCE`**: `8` (Bold mastheads, distinctive accent colors, asymmetrical hero layouts)
- **`MOTION_INTENSITY`**: `7` (Staged stagger animations, reactive feedback, smooth accordion expands)
- **`VISUAL_DENSITY`**: `5` (Generous editorial whitespace with high-density tabular leaderboards)

## 1. Color Palette & Semantic Tokens
- **Background / Surface**: `#FAFAF8` (Warm off-white paper)
- **Surface Container (Cards)**: `#FFFFFF` (Crisp white with `1px solid #E5E5E0` border)
- **Primary / Brand Accent**: `#D93829` (High-energy Carnage red for CTAs and streaks)
- **High-Contrast Text / Ink**: `#111111` (Deep black ink for headlines and body)
- **Muted Text / Secondary**: `#6B7280` (Subtle captions, timestamps, and metadata)
- **Border / Divider**: `#E5E7EB` (Clean 1px borders)
- **Success**: `#10B981` (Vibrant green for positive indicators)
- **Error**: `#EF4444` (Sharp red for errors / alerts)

## 2. Typography Hierarchy
- **Display Masthead**: Serif Display (Playfair / Fraunces / Merriweather), Bold `700`, line-height `1.1`
- **Headlines**: Clean high-contrast Sans-Serif or Editorial Serif
- **Body**: Highly readable Serif or Sans-Serif, `18px`, line-height `1.6`, character limit `65-75ch`
- **Numeric & Data**: Monospace / Tabular figures (`font-variant-numeric: tabular-nums`) for scores and clocks

## 3. Spacing & Elevation
- **Base Grid**: `8px` increments
- **Elevation**: Flat surfaces with thin `1px` structural borders (`border border-neutral-200`) and optional subtle ambient shadows on hover (`shadow-sm` -> `shadow-md`)
- **Corner Radius**: `8px` (`rounded-lg`) for cards, `9999px` (`rounded-full`) for badges and pills
