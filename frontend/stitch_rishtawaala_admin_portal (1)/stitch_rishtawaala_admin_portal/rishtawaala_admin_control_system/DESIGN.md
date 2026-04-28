---
name: Rishtawaala Admin Control System
colors:
  surface: '#ffffff'
  surface-dim: '#dcd8e5'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#f0ecf9'
  surface-container-high: '#eae6f4'
  surface-container-highest: '#e4e1ee'
  on-surface: '#1e293b'
  on-surface-variant: '#464555'
  inverse-surface: '#302f39'
  inverse-on-surface: '#f3effc'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#e0e7ff'
  on-primary-container: '#312e81'
  inverse-primary: '#c3c0ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8fafc'
  on-background: '#1b1b24'
  surface-variant: '#e4e1ee'
  surface-sidebar: '#0f172a'
  on-surface-sidebar: '#94a3b8'
  on-surface-sidebar-active: '#ffffff'
  on-surface-dim: '#64748b'
  success: '#10b981'
  warning: '#f59e0b'
  info: '#0ea5e9'
  border-subtle: '#e2e8f0'
  table-hover: '#f1f5f9'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  table-header:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  sidebar-width: 260px
  header-height: 64px
  container-max: 1440px
  table-row-y: 8px
---

---
name: Rishtawaala Admin Control
theme: Enterprise Professional
colors:
  # Primary Branding & Actions
  primary: '#4f46e5'           # Indigo - Authority & Trust
  on-primary: '#ffffff'
  primary-container: '#e0e7ff'
  on-primary-container: '#312e81'

  # Sidebar & Navigation
  surface-sidebar: '#0f172a'   # Deep Slate/Navy - Command Center Feel
  on-surface-sidebar: '#94a3b8'
  on-surface-sidebar-active: '#ffffff'
  
  # Content & Backgrounds
  background: '#f8fafc'        # Very Light Slate - Reduces eye strain
  surface: '#ffffff'           # Pure White for cards and tables
  on-surface: '#1e293b'        # Slate 800 for primary text
  on-surface-dim: '#64748b'    # Slate 500 for secondary/meta text
  
  # Functional States (Strict Logic)
  [cite_start]success: '#10b981'           # Emerald - Approved/Verified Status [cite: 3, 6]
  [cite_start]error: '#ef4444'             # Red - Banned/Rejected/Failure [cite: 3, 6]
  [cite_start]warning: '#f59e0b'           # Amber - Pending Review/Flagged [cite: 3, 6, 10]
  [cite_start]info: '#0ea5e9'              # Sky Blue - System Info/Audit Logs [cite: 9]

typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
  body-md:
    fontFamily: Inter
    fontSize: 14px            # Optimized for data-heavy tables
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'         # For table headers and badges

rounded:
  sm: 4px
  DEFAULT: 8px                # Professional, precision-engineered corners
  lg: 12px
  full: 9999px

spacing:
  base: 4px                   # 4px grid for tighter data density
  gutter: 24px
  sidebar-width: 260px
  container-max: 1440px
---

## Design Philosophy: "Clarity, Density, Authority"

[cite_start]The Admin Control system is a functional tool designed to manage 28 critical tasks[cite: 3, 6, 9, 10]. Unlike the consumer site, which prioritizes "warmth," the admin portal prioritizes **efficiency**. The goal is to minimize eye travel and maximize the information available on a single screen.

## 1. Layout Structure
- **Global Sidebar:** Fixed at 260px. Dark (#0f172a) background to visually separate the "Controls" from the "Data."
- **Top Header:** 64px height. [cite_start]Contains a global search bar (Phone/Name/ID search) and Admin Profile/Role indicators[cite: 3, 10].
- **Main Stage:** A fluid background (#f8fafc) that hosts white cards containing the core features.

## 2. Component Specifications

### **Data Tables (The Workhorse)**
[cite_start]Used in **User Directory**, **Transaction Logs**, and **Audit Logs**[cite: 3, 6, 9].
- **Header:** Slate-100 background, 12px semi-bold text, uppercase.
- **Rows:** 1px bottom border (#e2e8f0). 8px padding on Y-axis.
- **Hover State:** Very light blue tint (#f1f5f9) to help focus on the current record.
- **Pagination:** Simple "Next/Prev" buttons with current page count.

### **Status Badges**
[cite_start]Used for Verification levels and Screening status[cite: 3, 6, 10].
- **Format:** Pill-shaped, semi-bold text, 12px.
- **Logic:** - `bg-emerald-100 text-emerald-700` for **Approved**.
  - `bg-amber-100 text-amber-700` for **Pending**.
  - `bg-red-100 text-red-700` for **Banned/Rejected**.

### **Split-Screen Modals**
[cite_start]Crucial for the **Moderation Desk** and **Verification Center**[cite: 3, 6].
- Left panel shows user-submitted data (New Bio/Photos).
- Right panel shows original data or ID Documents for comparison.
- Bottom fixed-action bar for "Approve" or "Reject with Reason."

### **Form Elements**
[cite_start]Used for **Subscription Config** and **Notification Broadcaster**[cite: 6, 9].
- **Inputs:** White background, 1px Slate-300 border. Focus state: 2px Indigo-500 ring.
- **Labels:** 13px semi-bold Slate-700. Always placed above the input for scanning speed.

### **Analytics Widgets**
[cite_start]Used for **Dashboard** and **Revenue Suite**[cite: 3, 6, 9].
- Simple white cards with 1px border.
- Indigo (#4f46e5) for primary lines/bars.
- Slate-400 for grid lines to keep the focus on the data trend.

## 3. Workflow Color Coding
To prevent errors during high-speed moderation:
- [cite_start]**Destructive Actions:** (Banning, Deleting, Refunding) must use an `error` red button with a confirmation modal[cite: 3, 6].
- [cite_start]**Marketing Actions:** (Notifications, Boosts) use the `primary` Indigo color[cite: 9].
- **System Health:** Green indicates a healthy database/server connection; [cite_start]Red indicates an alert[cite: 10].

## 4. Iconography
- Use **Line Icons** (e.g., Lucide or Heroicons).
- Thin stroke (1.5px) to maintain a clean, high-end enterprise aesthetic.
- Color: Slate-500 for inactive icons, White for active sidebar icons.