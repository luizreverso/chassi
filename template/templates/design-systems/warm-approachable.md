# Design System Preset: Warm & Approachable (Community & Consumer Workspace)

A warm, inviting, approachable design system optimized for consumer applications, community platforms, family routines, and personal wellness tracking.

## 0. UI Design Dials (1–10 Scale)
- **`DESIGN_VARIANCE`**: `5` (Balanced consistency with warm, friendly personality and inviting visuals)
- **`MOTION_INTENSITY`**: `4` (Smooth, cheerful micro-interactions: 200ms spring animations on taps and feedback cues)
- **`VISUAL_DENSITY`**: `5` (Comfortable, legible spacing with large touch targets for mobile use)

## 1. Color Palette & Semantic Tokens
- **Background (Canvas)**: `#FAF9F6` (Warm alabaster cream)
- **Surface Level 1 (Card/Container)**: `#FFFFFF` (Elevated card container)
- **Surface Level 2 (Active/Hover)**: `#F4F1EA` (Warm neutral hover tint)
- **Primary / Action**: `#0D9488` (Teal 600 — soothing, friendly primary)
- **On-Primary**: `#FFFFFF`
- **Warm Accent**: `#F59E0B` (Amber 500 — reminders, badges, highlights)
- **Text Primary**: `#1E293B` (Slate 800)
- **Text Secondary / Muted**: `#64748B` (Slate 500)
- **Border / Outline**: `rgba(0, 0, 0, 0.08)`
- **Focus Ring**: `rgba(13, 148, 136, 0.4)` with `2px` offset

## 2. Typography Hierarchy
- **Heading Font**: Rounded or Modern Sans-Serif (`Plus Jakarta Sans`, `Inter`, `SF Pro`)
- **Body Font**: Clean Sans-Serif (`Inter`, `SF Pro Text`)
- **Scale**:
  - `Hero / Greeting`: `32px` / `26px`, Bold `700`, line-height `1.2`
  - `Card Header`: `20px` / `18px`, SemiBold `600`
  - `Body / UI`: `15px`–`16px`, Regular `400`, line-height `1.5`
  - `Tags & Reminders`: `12px`, Medium `500`

## 3. Spacing & Elevation
- **Base Grid**: `8px` (`0.5rem`)
- **Touch Targets**: Min `44px` height for buttons and mobile navigation
- **Corner Radius**: `12px` (`rounded-xl`) for cards, `9999px` (`rounded-full`) for pills and badges
- **Elevation**: Soft, warm ambient shadows (`0 2px 8px rgba(0,0,0,0.04)`)
