import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { useBookmarkFilter } from '../../contexts/BookmarkFilterContext';
import { useSelection } from '../../contexts/SelectionContext';
import BookmarkHeader from './BookmarkHeader';
import BookmarkGrid from './BookmarkGrid';
import BookmarkList from './BookmarkList';
import SelectionActionBar from './SelectionActionBar';
import SafeIcon from '../../common/SafeIcon';
import { FiBookmark, FiPlus, FiStar, FiClock, FiTrash2 } from 'react-icons/fi';

const BookmarkContainer = ({ onAddBookmark }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  const { 
    activeFolder, 
    recentTimeFrame, 
    getFolderDisplayName, 
    getRecentTimePeriod,
    getTimeFrameDisplayName
  } = useBookmarkFilter();

  const { isSelectionMode } = useSelection();

  // Fetch bookmarks from Firestore based on active folder
  useEffect(() => {
    if (!currentUser) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Reference to the bookmarks collection
    const bookmarksRef = collection(db, `users/${currentUser.uid}/bookmarks`);
    let bookmarksQuery;
    
    // Build query based on active folder
    switch(activeFolder) {
      case 'favorites':
        // Only show favorited bookmarks that aren't trashed
        bookmarksQuery = query(
          bookmarksRef, 
          where('isFavorite', '==', true),
          where('isTrashed', '!=', true),
          orderBy('isTrashed'), // Required for the not-equal query
          orderBy('updatedAt', 'desc')
        );
        break;
        
      case 'recent':
        // Get recent bookmarks based on the selected time frame
        const recentDate = new Date(getRecentTimePeriod());
        bookmarksQuery = query(
          bookmarksRef, 
          where('createdAt', '>=', Timestamp.fromDate(recentDate)),
          where('isTrashed', '!=', true),
          orderBy('createdAt', 'desc'),
          orderBy('isTrashed') // Required for the not-equal query
        );
        break;
        
      case 'trash':
        // Show only trashed bookmarks
        bookmarksQuery = query(
          bookmarksRef, 
          where('isTrashed', '==', true),
          orderBy('updatedAt', 'desc')
        );
        break;
        
      default:
        if (activeFolder.startsWith('folder-')) {
          // Filter by folder ID
          const folderId = activeFolder.replace('folder-', '');
          bookmarksQuery = query(
            bookmarksRef, 
            where('folderId', '==', folderId),
            where('isTrashed', '!=', true),
            orderBy('isTrashed'), // Required for the not-equal query
            orderBy('createdAt', 'desc')
          );
        } else if (activeFolder.startsWith('tag-')) {
          // Filter by tag
          const tag = activeFolder.replace('tag-', '');
          bookmarksQuery = query(
            bookmarksRef, 
            where('tags', 'array-contains', tag),
            where('isTrashed', '!=', true),
            orderBy('isTrashed'), // Required for the not-equal query
            orderBy('createdAt', 'desc')
          );
        } else {
          // All bookmarks (not trashed)
          bookmarksQuery = query(
            bookmarksRef, 
            where('isTrashed', '!=', true),
            orderBy('isTrashed'), // Required for the not-equal query
            orderBy('createdAt', 'desc')
          );
        }
    }
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(bookmarksQuery, 
      (snapshot) => {
        const fetchedBookmarks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }));
        setBookmarks(fetchedBookmarks);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching bookmarks:', err);
        setError('Failed to load bookmarks. Please try again later.');
        setLoading(false);
      }
    );
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, [currentUser, activeFolder, recentTimeFrame, getRecentTimePeriod]);

  // Get the appropriate icon for the current view
  const getFolderIcon = () => {
    switch(activeFolder) {
      case 'favorites':
        return FiStar;
      case 'recent':
        return FiClock;
      case 'trash':
        return FiTrash2;
      default:
        return FiBookmark;
    }
  };

  // Empty state component with dynamic messages
  const EmptyState = () => {
    let message = '';
    let icon = getFolderIcon();
    let iconClass = 'text-primary-400';
    let bgClass = 'bg-primary-50';
    
    switch(activeFolder) {
      case 'favorites':
        message = "You haven't favorited any bookmarks yet";
        iconClass = 'text-yellow-400';
        bgClass = 'bg-yellow-50';
        break;
      case 'recent':
        message = `No bookmarks added in the ${getTimeFrameDisplayName().toLowerCase()}`;
        iconClass = 'text-blue-400';
        bgClass = 'bg-blue-50';
        break;
      case 'trash':
        message = "Your trash is empty";
        iconClass = 'text-gray-400';
        bgClass = 'bg-gray-50';
        break;
      default:
        if (activeFolder.startsWith('folder-')) {
          message = "This folder is empty";
        } else if (activeFolder.startsWith('tag-')) {
          message = "No bookmarks with this tag";
        } else {
          message = "No bookmarks yet";
        }
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <div className={`w-16 h-16 mb-4 ${bgClass} rounded-full flex items-center justify-center`}>
          <SafeIcon icon={icon} className={`w-8 h-8 ${iconClass}`} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
        <p className="text-gray-500 max-w-sm mb-6">
          {activeFolder === 'trash' 
            ? "Items you delete will appear here"
            : "Bookmarks help you quickly access your favorite websites"
          }
        </p>
        {activeFolder !== 'trash' && activeFolder !== 'recent' && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddBookmark}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-medium shadow-sm flex items-center"
          >
            <SafeIcon icon={FiPlus} className="mr-2 h-5 w-5" />
            {activeFolder === 'favorites' ? 'Add a Bookmark to Favorite' : 'Add a Bookmark'}
          </motion.button>
        )}
      </div>
    );
  };

  // Loading state
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500">Loading your bookmarks...</p>
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 mb-4 bg-red-50 rounded-full flex items-center justify-center">
        <span className="text-red-500 text-2xl">!</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-500 max-w-sm">
        {error || 'Failed to load your bookmarks. Please try again later.'}
      </p>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <BookmarkHeader 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        totalBookmarks={bookmarks.length}
        folderName={getFolderDisplayName()}
        activeFolder={activeFolder}
        onAddBookmark={onAddBookmark}
        bookmarks={bookmarks}
      />
      
      <div className="flex-grow overflow-y-auto px-6 py-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : bookmarks.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'grid' ? (
                <BookmarkGrid bookmarks={bookmarks} isTrashView={activeFolder === 'trash'} />
              ) : (
                <BookmarkList bookmarks={bookmarks} isTrashView={activeFolder === 'trash'} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Selection Action Bar - only show when in selection mode */}
      {isSelectionMode && <SelectionActionBar />}
    </div>
  );
};

export default BookmarkContainer;