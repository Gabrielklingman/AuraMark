import React from 'react';
import DraggableBookmarkCard from './DraggableBookmarkCard';
import BookmarkCard from './BookmarkCard';

const BookmarkGrid = ({ bookmarks, isTrashView = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {bookmarks.map(bookmark => (
        isTrashView ? (
          <BookmarkCard key={bookmark.id} bookmark={bookmark} isTrashView={true} />
        ) : (
          <DraggableBookmarkCard key={bookmark.id} bookmark={bookmark} />
        )
      ))}
    </div>
  );
};

export default BookmarkGrid;