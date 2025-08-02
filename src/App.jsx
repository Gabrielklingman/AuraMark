import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DragAndDropProvider } from './contexts/DragAndDropContext';
import { BookmarkFilterProvider } from './contexts/BookmarkFilterContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MainContent from './components/Layout/MainContent';
import BookmarkContainer from './components/Bookmarks/BookmarkContainer';
import AddBookmarkModal from './components/Bookmarks/AddBookmarkModal';
import AuthModal from './components/Auth/AuthModal';
import './App.css';

function App() {
  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleOpenAddBookmarkModal = () => {
    setIsAddBookmarkModalOpen(true);
  };

  const handleCloseAddBookmarkModal = () => {
    setIsAddBookmarkModalOpen(false);
  };

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthProvider>
      <BookmarkFilterProvider>
        <DragAndDropProvider>
          <div className="flex min-h-screen bg-gray-100">
            <Sidebar onNewBookmark={handleOpenAddBookmarkModal} />
            
            <div className="flex-1 flex flex-col">
              <Header onLogin={handleOpenAuthModal} />
              
              <MainContent>
                <BookmarkContainer onAddBookmark={handleOpenAddBookmarkModal} />
              </MainContent>
            </div>
            
            {/* Modals */}
            <AddBookmarkModal 
              isOpen={isAddBookmarkModalOpen} 
              onClose={handleCloseAddBookmarkModal} 
            />
            
            <AuthModal 
              isOpen={isAuthModalOpen} 
              onClose={handleCloseAuthModal} 
            />
          </div>
        </DragAndDropProvider>
      </BookmarkFilterProvider>
    </AuthProvider>
  );
}

export default App;