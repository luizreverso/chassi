# Design System Preset: Clean Enterprise B2B (Tailwind / Stripe Style)

A crisp, accessible, light-mode design system built for corporate web applications, client portals, and administrative workflows.

## 0. UI Design Dials
- **`DESIGN_VARIANCE`**: `3` (High clarity, predictable navigation, standard layout grids)
- **`MOTION_INTENSITY`**: `2` (Minimal transitions, standard 200ms ease-in-out for modals/dropdowns)
- **`VISUAL_DENSITY`**: `6` (Balanced whitespace with clear visual hierarchy)

## 1. Color Palette & Semantic Tokens
- **Background**: `#F9FAFB` (Tailwind Gray 50)
- **Surface / Card**: `#FFFFFF` (Pure white)
- **Primary / Brand CTA**: `#2563EB` (Tailwind Blue 600)
- **Primary Hover**: `#1D4ED8` (Tailwind Blue 700)
- **Text Primary**: `#111827` (Tailwind Gray 900)
- **Text Secondary**: `#4B5563` (Tailwind Gray 600)
- **Border / Divider**: `#E5E7EB` (Tailwind Gray 200)
- **Error / Danger**: `#DC2626` (Tailwind Red 600)
- **Warning**: `#D97706` (Tailwind Amber 600)
- **Success**: `#059669` (Tailwind Emerald 600)

## 2. Typography Hierarchy
- **Primary Font**: `Inter`, `system-ui`, `-apple-system`, `sans-serif`
- **Scale**:
  - `H1 / Page Title`: `30px`, Bold `700`, line-height `1.2`
  - `H2 / Section Title`: `22px`, SemiBold `600`, line-height `1.3`
  - `H3 / Card Title`: `16px`, SemiBold `600`, line-height `1.4`
  - `Body`: `14px`–`15px`, Regular `400`, line-height `1.5`
  - `Small / Helper`: `12px`, Regular `400`, text-secondary

## 3. Spacing & Elevation
- **Base Grid**: `8px` increments
- **Elevation**:
  - Cards: `1px solid #E5E7EB` border + `0 1px 3px 0 rgb(0 0 0 / 0.05)` (`shadow-sm`)
  - Dropdowns & Popovers: `shadow-lg`
- **Corner Radius**: `8px` (`rounded-lg`) for cards, buttons, and inputs
