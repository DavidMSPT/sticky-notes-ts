# Sticky Notes — Interview Solution

A single-page sticky notes desktop application built with **React** and **TypeScript**, without any external component or drag-and-drop libraries.

---

## Architecture Overview (Submission Description)

The application follows a simple data flow centered around a flat array of note objects (`Note[]`) stored in React state. Each note stores its position (`x`, `y`), dimensions (`width`, `height`), `text`, `color`, and `zIndex`. The entire layout consists of a top control bar (header) and an interactive canvas workspace, avoiding external frameworks or state libraries to keep the codebase lean and easy to maintain.

Dragging and resizing are implemented using native DOM mouse events (`onMouseDown`, `mousemove`, `mouseup`). When an interaction begins, a `dragState` object records the starting mouse coordinates and the note's initial dimensions/position. Global `mousemove` and `mouseup` listeners registered on the `window` calculate coordinate deltas, enabling continuous movement and resizing without losing tracking even when the pointer moves quickly. Resizing is constrained to reasonable minimum dimensions to prevent inverted or invisible elements.

Removing notes via the trash zone is achieved through collision detection (Axis-Aligned Bounding Box). When a note is dragged over the predefined trash zone at the bottom-right, the zone highlights to give the user immediate visual feedback; on mouse release, the note is deleted from state. State persistence is managed with `localStorage` and a simulated asynchronous REST API sync indicator, while overlapping notes are brought to the foreground by incrementing their `zIndex` on interaction.

---

## Features Implemented

### Required Features (4 of 4)
1. **Create note of specified size & position**: Top control bar has inputs for X, Y, Width, and Height plus an "+ Add Note" button.
2. **Change note size by dragging**: Bottom-right resize handle on each note.
3. **Move a note by dragging**: Note header bar acts as the drag handle.
4. **Remove note via Trash Zone**: Dragging any note over the bottom-right trash zone highlights it; releasing deletes the note.

### Bonus Features (5 of 5)
- **I. Text editing**: Integrated `<textarea>` with immediate state updates.
- **II. Bring to front**: Clicking or dragging any note increments its `zIndex`.
- **III. Local Storage persistence**: Automatically restores and saves notes across reloads.
- **IV. Different colors**: Interactive color swatches on every note header.
- **V. Mock REST API**: Asynchronous sync status badge ("Saved" / "Syncing...").

---

## Quick Start & Build Instructions

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Production build
npm run build

# Run linter
npm run lint
```
