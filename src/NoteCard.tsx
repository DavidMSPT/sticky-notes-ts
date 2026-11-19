import React from 'react';
import type { Note } from './types';

const COLORS = ['#fef08a', '#bbf7d0', '#bae6fd', '#fbcfe8', '#e9d5ff'];

interface NoteCardProps {
  note: Note;
  onStartMove: (id: string, e: React.MouseEvent) => void;
  onStartResize: (id: string, e: React.MouseEvent) => void;
  onUpdateText: (id: string, text: string) => void;
  onUpdateColor: (id: string, color: string) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onStartMove,
  onStartResize,
  onUpdateText,
  onUpdateColor,
  // onDelete,
  onBringToFront,
}) => {
  return (
    <div
      className="note-card"
      style={{
        left: `${note.x}px`,
        top: `${note.y}px`,
        width: `${note.width}px`,
        height: `${note.height}px`,
        backgroundColor: note.color,
        zIndex: note.zIndex,
      }}
      onMouseDown={() => onBringToFront(note.id)}
    >
      {/* Header acts as the move drag handle */}
      <div
        className="note-header"
        onMouseDown={(e) => onStartMove(note.id, e)}
      >
        <span className="drag-indicator">⋮⋮</span>

        {/* Color picker swatches */}
        <div className="color-swatches">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className="color-dot"
              style={{ backgroundColor: c }}
              onClick={(e) => {
                e.stopPropagation();
                onUpdateColor(note.id, c);
              }}
            />
          ))}
        </div>

        {/* Delete button */}
        {/* <button
          type="button"
          className="delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
        >
          ✕
        </button> */}
      </div>

      {/* Note body with text editing */}
      <textarea
        className="note-textarea"
        value={note.text}
        placeholder="Type a note..."
        onChange={(e) => onUpdateText(note.id, e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
      />

      {/* Bottom-right corner handle for resizing */}
      <div
        className="resize-handle"
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize(note.id, e);
        }}
      />
    </div>
  );
};

