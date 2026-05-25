# Donezo Design System & Architectural Specification

This document serves as a comprehensive guide for recreating the **Donezo** dashboard frontend. It captures the aesthetic DNA, component structure, and technical requirements of the application.

---

## 1. Design Direction: "Organic Professionalism"
The design language is characterized by a "Bento-Grid" inspired layout, high-contrast greens, and soft organic rounding. It prioritizes white space and subtle depth to reduce cognitive load while maintaining a "high-performance" feel.

### Core Visual Principles
- **Extreme Rounding:** All primary containers use `rounded-[32px]` or `rounded-[40px]`.
- **Depth & Elevation:** Subtle shadows (`shadow-sm`) combined with thin, light borders (`border-slate-100`).
- **Minimalism:** No unnecessary lines; use background color shifts and padding to define zones.

---

## 2. Color Palette

### Primary (Emerald Green)
Used for calls to action, active states, and brand identity.
- **Deep (Header/Sidebar):** `#0a2e1d` (Base for gradients)
- **Primary:** `#059669` (Main buttons and progress)
- **Light:** `#6ee7b7` (Secondary accents)
- **Tint/Surface:** `#ecfdf5` (Emerald-50)

### Neutral (Slate)
Used for typography, backgrounds, and structural borders.
- **Background:** `#f8fafc` (Slate-50)
- **Borders:** `#f1f5f9` (Slate-100)
- **Text (Main):** `#0f172a` (Slate-900)
- **Text (Muted):** `#64748b` (Slate-500)
- **Text (Label):** `#94a3b8` (Slate-400)

### Accents (Status Colors)
- **Pending:** `#f59e0b` (Amber-500)
- **In Progress:** `#3b82f6` (Blue-500)
- **Urgent/Error:** `#f43f5e` (Rose-500)

---

## 3. Typography & Hierarchy
**Typeface:** `Inter` (Variable sans-serif)

| Level | Size | Weight | Tracking | Case |
| :--- | :--- | :--- | :--- | :--- |
| **H1 (Page Title)** | `2.25rem (text-4xl)` | `800 (extrabold)` | `tight` | Sentence |
| **H2 (Card Headers)**| `1.125rem (text-lg)` | `700 (bold)` | `normal` | Sentence |
| **Section Labels** | `0.625rem (text-[10px])`| `700 (bold)` | `0.2em (widest)` | UPPERCASE |
| **Body Text** | `0.875rem (text-sm)` | `500 (medium)` | `normal` | Sentence |
| **Metadata/Table** | `0.75rem (text-xs)` | `600 (semibold)` | `normal` | Sentence |

---

## 4. Component Layout Structure

### 4.1 Side Navigation (Left)
- **Width:** `18rem (72px)` fixed.
- **Behavior:** Desktop (fixed), Mobile (Slide-in drawer from left).
- **Structure:**
    - Brand Logo (`Donezo` + SVG Icon).
    - Navigation Menu (Vertical list of buttons with icons).
    - General Settings & Logout (Bottom-aligned).

### 4.2 Application Shell
- **Main Container:** `flex row` with `min-h-screen`.
- **Content Area:** `p-4 md:p-10`. Uses `max-w-[1440px] mx-auto` for readability on ultra-wide monitors.

### 4.3 Dashboard Modules (Bento Grid)
- **Stats Row:** 4-column grid (1-col on mobile). Cards use high-contrast backgrounds (Emerald for Primary, White for Others).
- **Analytics Module:** `lg:col-span-2`. Uses Recharts with custom `pattern-stripe` SVG definition for a professional, non-standard bar chart feel.
- **Overall Progress:** Donut/Gauge chart (SVG Path) showing 180-degree or 270-degree completion.
- **Recent Tasks:** List-style items with status pill badges.
- **Time Tracker:** Dark themed (`#0a2e1d`) card with high-contrast timer typography.

---

## 5. Interactions & Flow

### 5.1 Transitions
- **Route Changes:** Use `motion/react` (Framer Motion) with `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}`.
- **Entrance Animation:** GSAP `stagger` used for dashboard items on first load.

### 5.2 Task Modal (Drawer)
- Slide-in from the **RIGHT** side (`fixed right-0`).
- Overlay: `bg-slate-900/20 backdrop-blur-sm`.

### 5.3 Mobile User Experience
- **Burger Menu:** Appears in `TopBar` on mobile.
- **Sidebar:** Transitions from `-translate-x-full` to `translate-x-0`.
- **Search Bar:** Occupies full width under the header on small screens.

---

## 6. Technical Stack
- **Framework:** React 18+ (Vite)
- **Styling:** Tailwind CSS 4 (PostCSS/Vite integrated)
- **Icons:** Lucide React
- **Animations:** Framer Motion (Transitions), GSAP (Entrance Sequencing)
- **Charts:** Recharts
- **State:** Local React State (useState) with Props for navigation.

---

## 7. Implementation Checklist for Cursor
1. [ ] Install `lucide-react`, `motion/react`, `recharts`, `gsap`, `clsx`, `tailwind-merge`.
2. [ ] Set up `src/index.css` with `@import "tailwindcss";` and custom scrollbar utilities.
3. [ ] Define the `Task` type in `src/types.ts`.
4. [ ] Create `TopBar.tsx` with responsive layout and menu toggle.
5. [ ] Build the `Sidebar.tsx` with mobile drawer logic.
6. [ ] Implement `DashboardOverview.tsx` using a `grid-cols-1 lg:grid-cols-3` layout.
7. [ ] Ensure all buttons have `transition-all active:scale-95` for tactile feedback.
