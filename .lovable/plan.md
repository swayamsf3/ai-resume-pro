

# Fix Dark Mode Visibility Issues

## Problem

The Hero section and CTA section always use dark gradient backgrounds (`bg-gradient-hero`). They rely on `text-primary-foreground` for text color, which works in light mode (light cream) but breaks in dark mode because `--primary-foreground` becomes a very dark brown -- invisible on dark backgrounds.

Additionally, the Hero badge uses `bg-card-foreground` which becomes white in dark mode, creating a jarring look.

## Root Cause

These sections have **fixed dark backgrounds** regardless of theme, so they need **fixed light text** -- not theme-aware text tokens that flip.

## Changes

### 1. `src/components/landing/HeroSection.tsx`

Replace theme-dependent text classes with fixed light colors:

- `text-primary-foreground` --> `text-white`
- `text-primary-foreground/90` --> `text-white/90`
- `text-primary-foreground/70` --> `text-white/70`
- `text-primary-foreground/60` --> `text-white/60`
- Badge: change `bg-card-foreground` to `bg-white/10` for a consistent glass-like look

### 2. `src/components/landing/CTASection.tsx`

Same approach -- replace theme-dependent text with fixed colors:

- `text-primary-foreground` --> `text-white`
- `text-primary-foreground/90` --> `text-white/90`
- `text-primary-foreground/70` --> `text-white/70`
- `text-primary-foreground/50` --> `text-white/50`

### 3. `src/components/landing/HowItWorksSection.tsx`

- Change `bg-secondary/30` to `bg-muted/30` for better contrast in dark mode (secondary in dark mode is a medium gray that blends poorly)

### 4. `src/components/ui/button.tsx`

- Update `heroOutline` variant: change `text-primary` and border/hover classes to use `text-white border-white/30 hover:bg-white/10 hover:text-white` so the "Find Jobs" button in the hero is visible in dark mode

## Files Summary

| File | Description |
|------|-------------|
| `src/components/landing/HeroSection.tsx` | Fix all text colors to use fixed `text-white` variants; fix badge background |
| `src/components/landing/CTASection.tsx` | Fix all text colors to use fixed `text-white` variants |
| `src/components/landing/HowItWorksSection.tsx` | Fix section background for dark mode contrast |
| `src/components/ui/button.tsx` | Fix `heroOutline` variant for dark backgrounds |

