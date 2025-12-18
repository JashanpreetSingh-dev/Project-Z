# Unused Items in Frontend

This document lists all unused components, hooks, files, and directories found in the frontend codebase.

## Unused Components

### React Bits Components
- **`TypewriterText`** (`components/react-bits/typewriter-text.tsx`)
  - Exported but never imported or used anywhere in the app

### Animation Components (from `components/animations/`)
- **`ParallaxSection`**, **`ParallaxContainer`**, **`ParallaxLayer`**, **`ParallaxBackground`**, **`HorizontalParallax`** (`components/animations/parallax.tsx`)
  - All parallax components are exported but never used
  
- **`TextReveal`**, **`TextRevealByChar`** (`components/animations/text-reveal.tsx`)
  - Only `GradientTextReveal` is used, these two are not
  
- **`StaggerContainer`**, **`StaggerItem`**, **`ScaleReveal`** (`components/animations/scroll-reveal.tsx`)
  - Exported but never imported or used
  
- **`RotatingFloat`**, **`PulseElement`**, **`FloatingShapes`** (`components/animations/floating-element.tsx`)
  - Only `FloatingElement` is used, these variants are not
  
- **`BlurStaggerContainer`**, **`BlurStaggerItem`** (`components/animations/blur-reveal.tsx`)
  - Only `BlurReveal` and `FadeBlur` are used
  
- **`HoverScale`**, **`GlowButtonWrapper`** (`components/animations/magnetic-button.tsx`)
  - Only `MagneticButton` is used
  
- **`AnimatedTextCounter`** (`components/animations/animated-counter.tsx`)
  - Only `AnimatedCounter` is used
  
- **`AnimatedGradient`** (`components/animations/gradient-background.tsx`)
  - Only `GradientBackground` is used
  
- **`GradientText`** (`components/animations/text-reveal.tsx`)
  - Not used (only `GradientTextReveal` is used)

## Unused Hooks

- **`use-quota`** (`hooks/billing/use-quota.ts`)
  - Hook is defined and exported but never imported or used anywhere in the app

## Unused Files

- **`lib/react-bits-config.ts`**
  - Configuration file that's never imported or used anywhere
  
- **`backend/static/voice_test.html`**
  - Static HTML test file for voice functionality, not referenced in the frontend codebase

## Unused Directories

- **`hooks/realtime/`**
  - Empty directory with no files

## Storybook Files (Development Only)

The following files are for Storybook development and are not used in the production app:
- `stories/` directory (entire directory)
- `components/animations/*.stories.tsx` files
- `components/ui/*.stories.tsx` files
- `components/theme-toggle.stories.tsx`

**Note:** These Storybook files are intentionally separate and used for component development/testing, so they may be kept for development purposes.

## Direct Replacements Available

### Components that can directly replace currently used ones:

1. **`MagneticButton` (wrapper) → `AnimatedButton` with `variant="magnetic"`**
   - **Current usage**: `MagneticButton` is used as a wrapper in `app/(marketing)/page.tsx`
   - **Replacement**: `AnimatedButton` with `variant="magnetic"` is already used in `components/marketing/hero-section.tsx`
   - **Note**: `AnimatedButton` is a `<button>` element, while `MagneticButton` is a wrapper `<div>`. You'd need to restructure the code slightly, but `AnimatedButton` is more feature-rich (supports multiple variants)

2. **`HoverScale` (wrapper) → `AnimatedButton` with `variant="scale"`**
   - **Current usage**: `AnimatedButton` with `variant="scale"` is used in `app/dashboard/page.tsx`
   - **Replacement**: `HoverScale` provides the same hover scale effect but as a wrapper
   - **Note**: If you prefer a wrapper component instead of a button element, `HoverScale` could replace `AnimatedButton` with `variant="scale"` (but you'd lose the button semantics)

3. **`GlowButtonWrapper` (wrapper) → `AnimatedButton` with `variant="glow"`**
   - **Current usage**: `AnimatedButton` with `variant="glow"` is used in `components/marketing/hero-section.tsx`
   - **Replacement**: `GlowButtonWrapper` provides the same glow effect but as a wrapper
   - **Note**: If you prefer a wrapper component instead of a button element, `GlowButtonWrapper` could replace `AnimatedButton` with `variant="glow"` (but you'd lose the button semantics)

4. **`TextReveal` → `EnhancedTextReveal` with `variant="word"`**
   - **Current usage**: `EnhancedTextReveal` with `variant="word"` is used throughout
   - **Replacement**: `TextReveal` is simpler and could work as a drop-in replacement if you don't need the extra features (direction, line variant, reduced motion support)
   - **Note**: `EnhancedTextReveal` is more feature-rich, so this would be a downgrade

5. **`TextRevealByChar` → `EnhancedTextReveal` with `variant="char"`**
   - **Current usage**: `EnhancedTextReveal` with `variant="char"` can be used (though currently only "word" variant is used)
   - **Replacement**: `TextRevealByChar` does the same thing but `EnhancedTextReveal` is better (has reduced motion support)
   - **Note**: This would be a downgrade - keep `EnhancedTextReveal`

### Components with unique functionality (not direct replacements):

- **`TypewriterText`**: Provides actual typewriter effect (typing character by character with cursor). This is unique and could be useful for typewriter-style animations, but no current component provides this exact functionality.

- **`AnimatedTextCounter`**: Just animates text appearance (fade in), while `AnimatedCounter` animates numbers counting up. Different use cases.

## Summary

### Can be safely removed:
1. `components/react-bits/typewriter-text.tsx` (unless you want typewriter effects)
2. `components/animations/parallax.tsx` (entire file - all components unused)
3. `hooks/billing/use-quota.ts`
4. `lib/react-bits-config.ts`
5. `backend/static/voice_test.html` (if not needed for testing)
6. `hooks/realtime/` (empty directory)

### Should be cleaned up (remove unused exports):
1. `components/animations/text-reveal.tsx` - remove `TextReveal`, `TextRevealByChar`, `GradientText` exports (or keep if you want simpler alternatives)
2. `components/animations/scroll-reveal.tsx` - remove `StaggerContainer`, `StaggerItem`, `ScaleReveal` exports
3. `components/animations/floating-element.tsx` - remove `RotatingFloat`, `PulseElement`, `FloatingShapes` exports
4. `components/animations/blur-reveal.tsx` - remove `BlurStaggerContainer`, `BlurStaggerItem` exports
5. `components/animations/magnetic-button.tsx` - remove `HoverScale`, `GlowButtonWrapper` exports (or keep if you want wrapper alternatives)
6. `components/animations/animated-counter.tsx` - remove `AnimatedTextCounter` export
7. `components/animations/gradient-background.tsx` - remove `AnimatedGradient` export
8. `components/react-bits/index.ts` - remove `TypewriterText` export (or keep if you want typewriter effects)
9. `components/animations/index.ts` - remove all unused component exports

### Recommended Actions:

**Option 1: Consolidate to fewer components (recommended)**
- Replace `MagneticButton` wrapper with `AnimatedButton` variant="magnetic" (already used elsewhere)
- Remove `HoverScale` and `GlowButtonWrapper` (use `AnimatedButton` variants instead)
- Remove `TextReveal` and `TextRevealByChar` (use `EnhancedTextReveal` instead)

**Option 2: Keep wrappers if you prefer them**
- Keep `MagneticButton`, `HoverScale`, `GlowButtonWrapper` if you prefer wrapper components over button elements
- Keep `TextReveal` and `TextRevealByChar` if you want simpler, lighter-weight alternatives

