import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import BookmarkListItem from './BookmarkListItem';

const DraggableBookmarkListItem = ({ bookmark }) => {
  // Set up draggable behavior
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: bookmark.id,
    data: {
      type: 'bookmark',
      bookmark
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        position: 'relative',
        zIndex: isDragging ? 999 : 1,
      }}
    >
      <BookmarkListItem bookmark={bookmark} />
    </div>
  );
};

export default DraggableBookmarkListItem;