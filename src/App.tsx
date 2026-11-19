import React, { useState, useEffect, useRef } from 'react';
import type { Note, DragState } from './types';
import { NoteCard } from './NoteCard';
import './App.css';

const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-1',
    x: 80,
    y: 80,
    width: 220,
    height: 180,
    text: 'This is a test note',
    color: '#fef08a',
    zIndex: 1,
  },
  {
    id: 'note-2',
    x: 340,
    y: 80,
    width: 220,
    height: 180,
    text: 'This is another test note',
    color: '#bbf7d0',
    zIndex: 2,
  },
];

export const App: React.FC = () => {
  // 1. Core State
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('simple_sticky_notes');
    return saved ? JSON.parse(saved) : DEFAULT_NOTES;
  });

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOverTrash, setIsOverTrash] = useState<boolean>(false);

  // Form state (Specified size at specified position)
  const [newX, setNewX] = useState<number>(150);
  const [newY, setNewY] = useState<number>(150);
  const [newWidth, setNewWidth] = useState<number>(200);
  const [newHeight, setNewHeight] = useState<number>(160);

  const trashRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 2. Persistence: LocalStorage & simulated async REST API
  useEffect(() => {
    localStorage.setItem('simple_sticky_notes', JSON.stringify(notes));

    // Simulated async REST API call completion
    const timer = setTimeout(() => {
      setIsSyncing(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [notes]);

  const updateNotes = (updater: (prev: Note[]) => Note[]) => {
    setIsSyncing(true);
    setNotes(updater);
  };

  // 3. Create a new note of specified size at specified position
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotes((prev) => {
      const highestZ = Math.max(0, ...prev.map((n) => n.zIndex));
      const newNote: Note = {
        id: `note-${Date.now()}`,
        x: newX,
        y: newY,
        width: Math.max(120, newWidth),
        height: Math.max(80, newHeight),
        text: '',
        color: '#fef08a',
        zIndex: highestZ + 1,
      };
      return [...prev, newNote];
    });
  };

  // 4. Bring note to front (highest z-index)
  const bringToFront = (id: string) => {
    updateNotes((prev) => {
      const highestZ = Math.max(0, ...prev.map((n) => n.zIndex));
      const note = prev.find((n) => n.id === id);
      if (note && note.zIndex === highestZ) {
        return prev; // Already on top
      }
      return prev.map((n) => (n.id === id ? { ...n, zIndex: highestZ + 1 } : n));
    });
  };

  // 5. Start dragging (Move)
  const handleStartMove = (id: string, e: React.MouseEvent) => {
    bringToFront(id);
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    setDragState({
      noteId: id,
      mode: 'move',
      startX: e.clientX,
      startY: e.clientY,
      initialX: note.x,
      initialY: note.y,
      initialWidth: note.width,
      initialHeight: note.height,
    });
  };

  // 6. Start dragging (Resize)
  const handleStartResize = (id: string, e: React.MouseEvent) => {
    bringToFront(id);
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    setDragState({
      noteId: id,
      mode: 'resize',
      startX: e.clientX,
      startY: e.clientY,
      initialX: note.x,
      initialY: note.y,
      initialWidth: note.width,
      initialHeight: note.height,
    });
  };

  // 7. Global MouseMove & MouseUp while dragging
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      const canvas = canvasRef.current;
      const canvasWidth = canvas ? canvas.clientWidth : window.innerWidth;
      const canvasHeight = canvas ? canvas.clientHeight : window.innerHeight;

      if (dragState.mode === 'move') {
        // Clamp to canvas boundaries so note stays 100% visible
        const maxX = Math.max(0, canvasWidth - dragState.initialWidth);
        const maxY = Math.max(0, canvasHeight - dragState.initialHeight);

        const nextX = Math.min(Math.max(0, dragState.initialX + deltaX), maxX);
        const nextY = Math.min(Math.max(0, dragState.initialY + deltaY), maxY);

        // Check if note intersects trash zone
        const trash = trashRef.current;
        if (trash) {
          const isColliding =
            nextX < trash.offsetLeft + trash.offsetWidth &&
            nextX + dragState.initialWidth > trash.offsetLeft &&
            nextY < trash.offsetTop + trash.offsetHeight &&
            nextY + dragState.initialHeight > trash.offsetTop;
          setIsOverTrash(isColliding);
        }

        setNotes((prev) =>
          prev.map((n) =>
            n.id === dragState.noteId ? { ...n, x: nextX, y: nextY } : n
          )
        );
      } else {
        // Resize mode - clamped to canvas boundaries
        const maxWidth = Math.max(140, canvasWidth - dragState.initialX);
        const maxHeight = Math.max(100, canvasHeight - dragState.initialY);

        const nextWidth = Math.min(Math.max(140, dragState.initialWidth + deltaX), maxWidth);
        const nextHeight = Math.min(Math.max(100, dragState.initialHeight + deltaY), maxHeight);

        setNotes((prev) =>
          prev.map((n) =>
            n.id === dragState.noteId ? { ...n, width: nextWidth, height: nextHeight } : n
          )
        );
      }
    };

    const handleMouseUp = () => {
      // If dropped over trash zone, delete the note
      if (dragState.mode === 'move' && isOverTrash) {
        updateNotes((prev) => prev.filter((n) => n.id !== dragState.noteId));
      } else {
        setIsSyncing(true);
      }
      setDragState(null);
      setIsOverTrash(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, isOverTrash]);

  // Note updates (text, color, delete)
  const handleUpdateText = (id: string, text: string) => {
    updateNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  };

  const handleUpdateColor = (id: string, color: string) => {
    updateNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color } : n)));
  };

  const handleDeleteNote = (id: string) => {
    updateNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="app-container">
      {/* Top Toolbar */}
      <header className="app-toolbar">
        <h1 className="app-title">Sticky Notes</h1>

        {/* Controls to create note of specified size & position */}
        <form className="create-form" onSubmit={handleCreateNote}>
          <label>
            X:
            <input
              type="number"
              value={newX}
              onChange={(e) => setNewX(Number(e.target.value))}
            />
          </label>
          <label>
            Y:
            <input
              type="number"
              value={newY}
              onChange={(e) => setNewY(Number(e.target.value))}
            />
          </label>
          <label>
            W:
            <input
              type="number"
              value={newWidth}
              onChange={(e) => setNewWidth(Number(e.target.value))}
            />
          </label>
          <label>
            H:
            <input
              type="number"
              value={newHeight}
              onChange={(e) => setNewHeight(Number(e.target.value))}
            />
          </label>
          <button type="submit" className="add-btn">
            + Add Note
          </button>
        </form>

        {/* Sync status badge */}
        <div className="sync-badge">
          <span className={`sync-dot ${isSyncing ? 'syncing' : 'saved'}`} />
          {isSyncing ? 'Syncing...' : 'Saved'}
        </div>
      </header>

      {/* Main Canvas */}
      <main ref={canvasRef} className="canvas">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onStartMove={handleStartMove}
            onStartResize={handleStartResize}
            onUpdateText={handleUpdateText}
            onUpdateColor={handleUpdateColor}
            onDelete={handleDeleteNote}
            onBringToFront={bringToFront}
          />
        ))}

        {/* Trash Zone */}
        <div
          ref={trashRef}
          className={`trash-zone ${isOverTrash ? 'hovered' : ''}`}
        >
          🗑️ {isOverTrash ? 'Drop to Delete' : 'Trash Zone'}
        </div>
      </main>
    </div>
  );
};

export default App;
