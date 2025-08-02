import React from 'react';
import DraggableBookmarkListItem from './DraggableBookmarkListItem';
import BookmarkListItem from './BookmarkListItem';

const BookmarkList = ({ bookmarks, isTrashView = false }) => {
  return (
    <div className="space-y-2">
      {bookmarks.map(bookmark => (
        isTrashView ? (
          <BookmarkListItem key={bookmark.id} bookmark={bookmark} isTrashView={true} />
        ) : (
          <DraggableBookmarkListItem key={bookmark.id} bookmark={bookmark} />
        )
      ))}
    </div>
  );
};

export default BookmarkList;