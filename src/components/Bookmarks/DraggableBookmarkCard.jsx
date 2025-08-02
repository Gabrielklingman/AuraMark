import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import BookmarkCard from './BookmarkCard';

const DraggableBookmarkCard = ({ bookmark }) => {
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
      <BookmarkCard bookmark={bookmark} />
    </div>
  );
};

export default DraggableBookmarkCard;