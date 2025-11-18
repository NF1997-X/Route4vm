# Route4vm - Complete Theme & Design System

## 🎨 Overview

This document details the complete theme, color system, typography, spacing, and iOS-specific styling implemented across Route4vm.

---

## 📋 Table of Contents

1. [Light Mode Colors](#light-mode-colors)
2. [Dark Mode Colors](#dark-mode-colors)
3. [Typography System](#typography-system)
4. [Spacing & Border Radius](#spacing--border-radius)
5. [Shadow System](#shadow-system)
6. [iOS Component Styles](#ios-component-styles)
7. [Glass Morphism Effects](#glass-morphism-effects)
8. [Theme Configuration](#theme-configuration)
9. [Tailwind Integration](#tailwind-integration)
10. [Animations & Transitions](#animations--transitions)

---

## 🌞 Light Mode Colors

### Primary Colors
```css
--color-primary: #3b82f6           /* Blue 500 - Main accent */
--color-primary-light: #60a5fa     /* Blue 400 - Lighter variant */
--color-primary-dark: #2563eb      /* Blue 600 - Darker variant */
--color-primary-ultra-light: #dbeafe /* Blue 100 - Ultra light backgrounds */
--color-primary-foreground: #ffffff  /* White text on primary */
```

### Neutral Colors (Light Mode)
```css
--color-bg-primary: #ffffff        /* Main background - Pure white */
--color-bg-secondary: #f9fafb      /* Secondary BG - Almost white */
--color-bg-tertiary: #f3f4f6       /* Tertiary BG - Light gray */

--color-text-primary: #111827      /* Main text - Deep dark (high contrast) */
--color-text-secondary: #4b5563    /* Secondary text - Better contrast */
--color-text-tertiary: #9ca3af     /* Tertiary text - Medium gray */
--color-text-disabled: #d1d5db     /* Disabled text - Lighter gray */
```

### Borders & Dividers
```css
--color-border: #e5e7eb            /* Light borders - Refined gray */
--color-border-light: #f3f4f6      /* Very light borders */
--color-divider: #f0f1f3           /* Divider lines - Subtle */
```

### Card & Surface
```css
--color-card: #ffffff              /* Card background - Pure white */
--color-card-hover: #f9fafb        /* Card on hover - Subtle shift */
--color-card-border: #e5e7eb       /* Card border - Refined */
--color-card-foreground: #111827   /* Card text - Deep dark */
--color-card-shadow: rgba(0, 0, 0, 0.04) /* Subtle card shadow */
```

### Input & Form Elements
```css
--color-input-bg: #ffffff          /* Input background - White */
--color-input-border: #d1d5db      /* Input border - Refined */
--color-input-border-hover: #9ca3af /* Input border on hover */
--color-input-border-focus: #3b82f6 /* Input border on focus - Blue */
--color-input-text: #111827        /* Input text - Deep dark */
--color-input-placeholder: #9ca3af /* Input placeholder - Medium gray */
--color-input-bg-focus: #f0f9ff    /* Input BG focus - Light blue */
```

### Status Colors
```css
--color-success: #10b981           /* Green - Emerald for success */
--color-success-light: #d1fae5     /* Light green background */

--color-warning: #f59e0b           /* Amber - Golden for warning */
--color-warning-light: #fef3c7     /* Light amber background */

--color-error: #ef4444             /* Red - Bright red for errors */
--color-error-light: #fee2e2       /* Light red background */

--color-info: #3b82f6              /* Blue - Primary blue for info */
--color-info-light: #dbeafe        /* Light blue background */
```

### Accent Colors
```css
--color-accent: #06b6d4            /* Cyan accent */
--color-accent-light: #cffafe      /* Light cyan background */

--color-destructive: #dc2626       /* Destructive actions - Dark red */
```

---

## 🌙 Dark Mode Colors

### Primary Colors (Dark Mode)
```css
--color-primary: #60a5fa           /* Blue 400 - Brighter for dark mode */
--color-primary-light: #93c5fd     /* Blue 300 */
--color-primary-dark: #3b82f6      /* Blue 500 */
--color-primary-foreground: #0f172a /* Dark text on primary */
```

### Neutral Colors (Dark Mode)
```css
--color-bg-primary: #0f172a        /* Main BG - Very dark */
--color-bg-secondary: #1e293b      /* Secondary BG - Dark slate */
--color-bg-tertiary: #334155       /* Tertiary BG - Medium slate */

--color-text-primary: #f8fafc      /* Main text - Very light */
--color-text-secondary: #cbd5e1    /* Secondary text - Light slate */
--color-text-tertiary: #94a3b8     /* Tertiary text - Medium slate */
--color-text-disabled: #475569     /* Disabled text - Medium slate */
```

### Status Colors (Dark Mode - Brighter)
```css
--color-success: #4ade80           /* Green 400 - Brighter */
--color-warning: #fbbf24           /* Amber 400 - Brighter */
--color-error: #f87171             /* Red 400 - Brighter */
--color-info: #60a5fa              /* Blue 400 */
```

---

## 🔤 Typography System

### Tailwind Font Stack
```css
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;
--font-mono: 'Menlo', 'Monaco', 'Courier New', monospace;
```

### iOS Typography Classes

**Heading (24px)**
- Font Size: 24px
- Font Weight: 700
- Letter Spacing: -0.5px
- Color: Primary text
- Class: `.ios-heading`

**Subheading (18px)**
- Font Size: 18px
- Font Weight: 600
- Letter Spacing: -0.3px
- Color: Primary text
- Class: `.ios-subheading`

**Body (16px)**
- Font Size: 16px
- Font Weight: 400
- Line Height: 1.5
- Color: Secondary text
- Class: `.ios-body`

**Caption (12px)**
- Font Size: 12px
- Font Weight: 400
- Line Height: 1.4
- Color: Tertiary text
- Class: `.ios-caption`

---

## 📏 Spacing & Border Radius

### Border Radius Scale
```css
--radius: 8px                  /* Base radius */
--radius-sm: 4px               /* Small */
--radius-md: 8px               /* Medium */
--radius-lg: 12px              /* Large */
--radius-xl: 16px              /* Extra large */
--radius-full: 9999px          /* Full/pill shape */
```

### Tailwind Border Radius Mapping
```css
lg:  var(--radius)           /* 8px */
md:  calc(var(--radius) - 2px)  /* 6px */
sm:  calc(var(--radius) - 4px)  /* 4px */
xl:  calc(var(--radius) + 4px)  /* 12px */
2xl: calc(var(--radius) + 8px)  /* 16px */
3xl: calc(var(--radius) + 12px) /* 20px */
```

---

## 🌓 Shadow System

### Light Mode Shadows
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04)     /* Very subtle */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08)     /* Subtle */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07)     /* Standard */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08)   /* Large */
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.09)   /* Extra large */
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.1)   /* Maximum */
```

### Dark Mode Shadows (Darker Opacity)
```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3)
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5)
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.5)
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.6)
```

---

## 📱 iOS Component Styles

### iOS Card (`.ios-card`)
**Light Mode:**
- Background: Pure white (#ffffff)
- Border Radius: 16px
- Shadow: 0 2px 8px rgba(0, 0, 0, 0.04)
- Border: 1px solid #e5e7eb
- Padding: 16px

**Hover State:**
- Shadow: 0 4px 16px rgba(0, 0, 0, 0.08)
- Transform: translateY(-2px)

**Dark Mode:**
- Background: Dark slate (#1e293b)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Shadow: 0 2px 8px rgba(0, 0, 0, 0.3)

### iOS Group Card (`.ios-group-card`)
- Border Radius: 12px
- Border: 1px solid theme colors
- Overflow: hidden
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.06)
- Used for: Grouped lists, settings panels

### iOS Primary Button (`.btn-ios`)
**Light & Dark:**
- Background: Primary blue (#3b82f6 / #60a5fa)
- Color: White
- Font Weight: 600
- Font Size: 16px
- Padding: 12px 24px
- Border Radius: 10px
- Box Shadow: 0 4px 12px rgba(59, 130, 246, 0.3)

**Hover State:**
- Transform: translateY(-1px)
- Box Shadow: Enhanced
- Background: Slightly darker

**Active State:**
- Transform: translateY(0) scale(0.98)

### iOS Secondary Button (`.btn-ios-secondary`)
**Light Mode:**
- Background: Light gray (#f9fafb)
- Color: Deep dark (#111827)
- Border: 1px solid #e5e7eb

**Dark Mode:**
- Background: rgba(255, 255, 255, 0.08)
- Color: Very light (#f8fafc)
- Border: 1px solid rgba(255, 255, 255, 0.1)

**Hover State:**
- Border Color: Primary blue
- Background: Slightly darker

### iOS Input (`.ios-input`)
- Border Radius: 8px
- Padding: 10px 12px
- Font Size: 16px (prevents iOS zoom)
- Border: 1px solid input-border color
- Transition: 0.2s ease-out

**Focus State:**
- Border Color: Primary blue
- Background: Light blue (#f0f9ff)
- Box Shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)
- Outline: none

**Dark Mode Focus:**
- Border Color: rgba(59, 130, 246, 0.8)
- Background: rgba(59, 130, 246, 0.05)
- Box Shadow: 0 0 0 3px rgba(59, 130, 246, 0.15)

### iOS Label (`.ios-label`)
- Font Size: 14px
- Font Weight: 600
- Margin Bottom: 6px
- Color: Secondary text

---

## ✨ Glass Morphism Effects

### Basic Glass (`.glass`)
**Light Mode:**
- Background: rgba(255, 255, 255, 0.85)
- Backdrop Filter: blur(40px) saturate(1.8)
- Border: 1px solid rgba(0, 0, 0, 0.08)
- Box Shadow: Dual shadow + inset light border

**Dark Mode:**
- Backdrop Filter: blur(60px) saturate(2) brightness(1.15)
- Border: 1px solid rgba(255, 255, 255, 0.12)
- Enhanced inner shadows for depth

### Glass Card (`.glass-card`)
- Similar to `.glass` but lighter blur: blur(32px)
- Used for cards and larger containers

### Glass Table (`.glass-table`)
- Backdrop Filter: blur(48px) saturate(1.8)
- Enhanced shadows for table depth
- **Dark Mode:** blur(70px) saturate(2.2) brightness(1.25)

### Glass Input (`.glass-input`)
- Backdrop Filter: blur(24px) saturate(1.4)
- Border: 1px solid glass-border color
- **Focus:** Scales to 1.02, blue ring shadow

### Glass Textarea (`.glass-textarea`)
- Backdrop Filter: blur(32px) saturate(1.6)
- Min Height: 120px
- Border Radius: 12px
- Padding: 16px 18px
- **Dark Mode:** blur(50px) saturate(1.9) brightness(1.2)

---

## 🎬 Animations & Transitions

### Transition Timing
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)   /* Quick */
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)   /* Standard */
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)   /* Smooth */
```

### Common Animations
- **Card Lift:** `translateY(-2px)` on hover
- **Scale Feedback:** `scale(0.98)` on click
- **Blur Transition:** Smooth 0.3s cubic-bezier
- **iOS Glass Hover:** `translateY(-4px) scale(1.02)`

### Keyframe Animations
```css
@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}
```

---

## 🎨 Theme Configuration

### Tailwind Config Integration
All CSS variables are mapped to Tailwind utilities:

```typescript
extend: {
  colors: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    card: {
      DEFAULT: "var(--card)",
      foreground: "var(--card-foreground)",
    },
    primary: {
      DEFAULT: "var(--primary)",
      foreground: "var(--primary-foreground)",
    },
    // ... more mappings
  },
  borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
    xl: "calc(var(--radius) + 4px)",
    "2xl": "calc(var(--radius) + 8px)",
    "3xl": "calc(var(--radius) + 12px)",
  },
  fontFamily: {
    sans: ["var(--font-sans)"],
    serif: ["var(--font-serif)"],
    mono: ["var(--font-mono)"],
  },
}
```

---

## 🎭 Theme Provider

Located in: `client/src/components/theme-provider.tsx`

**Features:**
- Detects system color scheme preference
- Persists user choice in localStorage
- Applies `dark` class to `<html>` element
- Provides context for theme state

**Usage:**
```tsx
import { useTheme } from './hooks/use-theme';

const { theme, toggleTheme } = useTheme();
```

---

## 📐 Responsive Design

### iOS Safe Area Support
```css
@supports (padding: max(0px)) {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
```

### Mobile Optimizations
- Input font size: 16px (prevents iOS zoom)
- Touch scrolling: `-webkit-overflow-scrolling: touch`
- Tap highlight: Subtle 0.1 opacity
- Table cells: Responsive padding on mobile

---

## 🎯 Gradient System

### Pre-defined Gradients
```css
--gradient-primary: linear-gradient(135deg, #3b82f6, #2563eb)
--gradient-success: linear-gradient(135deg, #10b981, #059669)
--gradient-warning: linear-gradient(135deg, #f59e0b, #d97706)
--gradient-error: linear-gradient(135deg, #ef4444, #dc2626)
```

---

## 📊 Chart Colors

### Tailwind Chart Integration
```css
--chart-1: Primary blue (#3b82f6)
--chart-2: Success green (#10b981)
--chart-3: Warning amber (#f59e0b)
--chart-4: Error red (#ef4444)
--chart-5: Purple (#8b5cf6) / (#a78bfa in dark)
```

---

## 🔄 Dark Mode Toggle

The application supports automatic and manual dark mode switching:

1. **System Preference:** Defaults to system color scheme
2. **Manual Override:** Users can toggle theme
3. **Persistence:** Choice saved to localStorage
4. **Seamless:** Smooth transition between modes

---

## ✅ Accessibility

- **Contrast Ratios:** Exceed WCAG AA standards
- **Font Sizes:** Minimum 16px for inputs (iOS zoom prevention)
- **Tap Targets:** All interactive elements support 44x44px minimum
- **Color Blindness:** Not relying solely on color for status
- **Dark Mode:** Full support with semantic colors

---

## 📝 Usage Examples

### Using iOS Card
```tsx
<div className="ios-card">
  <h2 className="ios-heading">Title</h2>
  <p className="ios-body">Content here</p>
</div>
```

### Using iOS Button
```tsx
<button className="btn-ios">Primary Action</button>
<button className="btn-ios-secondary">Secondary Action</button>
```

### Using iOS Input
```tsx
<label className="ios-label">Email</label>
<input className="ios-input" type="email" placeholder="Enter email" />
```

### Using Glass Effects
```tsx
<div className="glass">
  <input className="glass-input" />
  <textarea className="glass-textarea" />
</div>
```

---

## 📱 iOS Specific Features

- **Safe Area Support:** Respects notches and home indicators
- **Smooth Scrolling:** Hardware-accelerated with `-webkit-overflow-scrolling`
- **Touch Performance:** Optimized for mobile interactions
- **Tap Feedback:** Subtle highlight without annoying flash
- **Font Sizing:** 16px inputs prevent zoom on iOS

---

## 🚀 Performance Optimizations

- **CSS Variables:** Enables dynamic theme switching without JS
- **Hardware Acceleration:** Will-change and transform for smooth animations
- **Backdrop Filters:** GPU-accelerated with fallbacks
- **Shadow Layers:** Optimized opacity values for rendering
- **Transitions:** Cubic-bezier easing for smooth 60fps animations

---

## 📦 Dependencies

- **Tailwind CSS:** Utility-first CSS framework
- **Tailwind CSS Animate:** Animation utilities
- **@tailwindcss/typography:** Typography plugin
- **System Fonts:** Native font stack (no external fonts)

---

## 🔗 Related Files

- **Theme CSS:** `/workspaces/Route4vm/client/src/index.css` (2268 lines)
- **Theme Provider:** `/workspaces/Route4vm/client/src/components/theme-provider.tsx`
- **Tailwind Config:** `/workspaces/Route4vm/tailwind.config.ts`
- **Root HTML:** `/workspaces/Route4vm/client/index.html`

---

## 🎨 Color Palette Summary

| Purpose | Light | Dark |
|---------|-------|------|
| Primary | #3b82f6 | #60a5fa |
| Success | #10b981 | #4ade80 |
| Warning | #f59e0b | #fbbf24 |
| Error | #ef4444 | #f87171 |
| Background | #ffffff | #0f172a |
| Text | #111827 | #f8fafc |
| Border | #e5e7eb | #334155 |

---

Last Updated: November 18, 2025
System: Route4vm v1.0 with iOS Design System
