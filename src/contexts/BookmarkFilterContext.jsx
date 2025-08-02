import React, { createContext, useContext, useState } from 'react';

// Create context
const BookmarkFilterContext = createContext();

// Custom hook to use the context
export const useBookmarkFilter = () => {
  const context = useContext(BookmarkFilterContext);
  if (!context) {
    throw new Error('useBookmarkFilter must be used within a BookmarkFilterProvider');
  }
  return context;
};

// Provider component
export const BookmarkFilterProvider = ({ children }) => {
  // Current active folder state
  const [activeFolder, setActiveFolder] = useState('all');
  
  // Recent time frame filter (24h, 7d, 30d)
  const [recentTimeFrame, setRecentTimeFrame] = useState('24h');
  
  // Current folder name for display in the header
  const getFolderDisplayName = () => {
    if (activeFolder === 'all') return 'All Bookmarks';
    if (activeFolder === 'favorites') return 'Favorites';
    if (activeFolder === 'recent') return 'Recent Bookmarks';
    if (activeFolder === 'trash') return 'Trash';
    if (activeFolder.startsWith('folder-')) return 'Folder';
    if (activeFolder.startsWith('tag-')) {
      const tagName = activeFolder.replace('tag-', '');
      return `Tag: ${tagName.charAt(0).toUpperCase() + tagName.slice(1)}`;
    }
    return 'Bookmarks';
  };
  
  // Get the recent time period in milliseconds
  const getRecentTimePeriod = () => {
    const now = new Date();
    
    switch (recentTimeFrame) {
      case '24h':
        // 24 hours in milliseconds
        return now.getTime() - (24 * 60 * 60 * 1000);
      case '7d':
        // 7 days in milliseconds
        return now.getTime() - (7 * 24 * 60 * 60 * 1000);
      case '30d':
        // 30 days in milliseconds
        return now.getTime() - (30 * 24 * 60 * 60 * 1000);
      default:
        return now.getTime() - (24 * 60 * 60 * 1000);
    }
  };
  
  // Function to get the time frame display name
  const getTimeFrameDisplayName = () => {
    switch (recentTimeFrame) {
      case '24h':
        return 'Last 24 Hours';
      case '7d':
        return 'Last 7 Days';
      case '30d':
        return 'Last 30 Days';
      default:
        return 'Recent';
    }
  };
  
  // Value to be provided to consumers
  const value = {
    activeFolder,
    setActiveFolder,
    recentTimeFrame,
    setRecentTimeFrame,
    getFolderDisplayName,
    getRecentTimePeriod,
    getTimeFrameDisplayName
  };
  
  return (
    <BookmarkFilterContext.Provider value={value}>
      {children}
    </BookmarkFilterContext.Provider>
  );
};