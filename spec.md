# Shinigami Playlist - Master Specification

**Version:** 1.5.0
**Type:** Client-Side Web Application (SPA)
**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide Icons
**Philosophy:** No Backend, No AI, Privacy-First, Local Processing.

---

## 1. Core Concept
Shinigami Playlist is a powerful, client-side IPTV playlist editor. It allows users to import multiple M3U sources, merge them, clean data (deduplicate, rename, tag), organize channels into tidy groups, and export the result.

## 2. Visual Identity & UX

### 2.1 Theme & Styling
- **Design Language:** Modern, Clean, "Cyber-Minimalist".
- **Color Palette:**
  - **Primary:** Blue (`#3b82f6`) - Used for branding and primary actions.
  - **Secondary:** Slate/Gray - Used for structural elements.
  - **Status Colors:** Green (Online), Red (Offline), Gray (Unknown).
- **Dark/Light Mode:** 
  - Full support for system preference toggling.
  - **Light Mode:** White backgrounds, soft gray borders, high contrast text.
  - **Dark Mode:** Deep slate backgrounds (`#0f172a`), subtle borders, light text.
- **Iconography:** Lucide React icons. Thin strokes, elegant.

### 2.2 Layout
- **Header:** Logo (Left), Theme Toggle & Help Button (Right).
- **Source Bar:** Horizontal strip for importing files/links.
- **Control Deck:** Sticky toolbar containing Filters (Row 1) and Actions (Row 2).
- **Data View:** Large, scrollable table with sticky headers.
- **Footer:** Status bar with counters.
- **Responsiveness:** Grid layouts adapt from single column (mobile) to multi-column (laptop/desktop).

### 2.3 Help System
- **Feature:** A dedicated "?" button in the header.
- **Behavior:** Opens a large modal overlay.
- **Content:** Documentation on Imports, Regex, Tags, and Shortcuts.

---

## 3. Feature Modules

### 3.1 Input & Sources
- **Methods:**
  1.  **Local File:** M3U/M3U8 file upload.
  2.  **URL Import:** Direct fetch of M3U links (CORS dependent).
- **Source Management:**
  - List currently loaded source filenames.
  - "Clear All" button (Immediate action, no confirmation).
- **Parsing Logic:**
  - Extract: `tvg-id`, `tvg-logo`, `group-title`, `Channel Name`, `Stream URL`.
  - **Auto-Tagging:** Automatically infer a "Tag" based on the filename (e.g., importing `sports-fr.m3u` -> Tag: `sports-fr`).

### 3.2 The Data View (Main Table)
- **Columns:**
  1.  **Select:** Checkbox for bulk operations.
  2.  **Status:** Visual indicator (Circle).
      - *Grey:* Untested.
      - *Green:* Online (200 OK).
      - *Red:* Offline (404/Timeout).
  3.  **Name:** Editable Text Input.
  4.  **Group:** Editable Text Input.
  5.  **Tag:** Editable Text Input (Short field).
  6.  **Source:** Read-only label (e.g., `playlist.m3u`).
- **Smart Editing:** Editing a cell automatically creates a history snapshot for Undo.

### 3.3 Filters (The Search Engine)
- **Logic:** Combined `AND` filtering.
- **Fields:**
  - **Global Search:** Matches Channel Name.
  - **Combobox Filters:** Dropdown + Text Input for **Group**, **Tag**, and **Source**. Users can type to filter or pick from existing values.
  - **Duplicate Toggle:** "Show Duplicates Only" (based on Stream URL).
- **Actions:** "Reset Filters" button.

### 3.4 Action Toolbar
- **Undo System:**
  - **Button:** Counter-clockwise arrow.
  - **Logic:** Maintains a history stack of the last 10 states. Reverts Import, Delete, Bulk Edits, and Manual Typing.
- **Selection Tools:**
  - Select All / None.
  - Select Live / Dead.
- **Operational Tools:**
  - **Delete Selected:** Removes rows immediately (No confirmation dialog).
  - **Clean Dupes:** Auto-removes duplicates based on URL, keeping the first instance found. (Enabled only when Duplicates Filter is active).
  - **Check Status:** Performs a `HEAD` request to stream URLs to verify availability.
  - **Bulk Edit:** Toggles the specialized "Bulk Operations" panel.

### 3.5 Bulk Operations (The "Cleaner")
This panel appears when "Bulk Edit" is active.
1.  **Find & Replace:**
    - **Scope:** Dropdown [Name | Group | Tag].
    - **Inputs:** "Find string" and "Replace with".
    - **Regex Mode:** Toggle button (`.*`). Enables Javascript RegExp support with capture groups (`$1`, `$2`). Includes syntax validation and safe execution.
    - **Action:** Apply to *Selected* channels.
2.  **Regrouping (Pattern System):**
    - **Purpose:** Standardize group names.
    - **Syntax:** `{tag}`, `{group}`, `{name}`.
    - **Example Pattern:** `{tag} - {group} Channels`
    - **Action:** Parsing the string and replacing variables with channel data for *Selected* channels.

### 3.6 Export
- **Selection:** 
  - Dropdown Menu: "Export All" vs "Export Selected".
  - Format: M3U vs M3U8.
- **Output:** Triggers a file download named `shinigami-playlist.[ext]`.

---

## 4. Technical Implementation Details
- **State Management:** React `useState` / `useMemo` / `useRef`.
- **History:** Custom stack implementation for Undo functionality.
- **Performance:** 
  - Status checking batched to avoid browser throttling.
  - Regex instantiation handles errors gracefully.
  - Inputs use `onFocus` for snapshotting state.
- **Status Check Implementation:** 
  - Use `fetch(url, { method: 'HEAD' })`.
  - Protocol check (skips non-http).
  - Timeout set to 5000ms.
- **M3U Generator:** 
  - Header: `#EXTM3U`
  - Format: `#EXTINF:-1 tvg-id="" tvg-logo="" group-title="[Group]",[Name]\n[URL]`

---
*End of Specification*