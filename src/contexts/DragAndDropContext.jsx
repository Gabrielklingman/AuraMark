import React, { createContext, useContext, useState, useCallback } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

const DragAndDropContext = createContext();

export const useDragAndDrop = () => {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error('useDragAndDrop must be used within a DragAndDropProvider');
  }
  return context;
};

export const DragAndDropProvider = ({ children }) => {
  const [activeBookmark, setActiveBookmark] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingFolder, setIsDraggingFolder] = useState(false);
  const { currentUser } = useAuth();

  // Configure sensors for better drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Wait a bit to ensure it's a deliberate drag and not a click
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Similar delay for touch devices
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    
    if (active?.id) {
      // Check if we're dragging a folder or a bookmark
      if (active.data.current?.type === 'folder') {
        setActiveFolder(active.data.current?.folder);
        setIsDraggingFolder(true);
      } else {
        setActiveBookmark(active.data.current?.bookmark);
        setIsDragging(true);
      }
    }
  }, []);

  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;
    
    if (!active || !over || !(activeBookmark || activeFolder) || !currentUser) {
      setIsDragging(false);
      setIsDraggingFolder(false);
      setActiveBookmark(null);
      setActiveFolder(null);
      return;
    }

    try {
      // Handle bookmark drag
      if (activeBookmark) {
        const bookmarkId = active.id;
        const targetId = over.id;
        
        if (targetId.startsWith('folder-')) {
          // Handle drop on custom folder
          const folderId = targetId.replace('folder-', '');
          
          // Update bookmark in Firestore
          const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmarkId}`);
          await updateDoc(bookmarkRef, {
            folderId: folderId,
            updatedAt: new Date()
          });
          
          console.log(`Moved bookmark ${bookmarkId} to folder ${folderId}`);
        } else if (targetId === 'trash') {
          // Handle drop on trash folder
          const bookmarkRef = doc(db, `users/${currentUser.uid}/bookmarks/${bookmarkId}`);
          await updateDoc(bookmarkRef, {
            isTrashed: true,
            updatedAt: new Date()
          });
          
          console.log(`Moved bookmark ${bookmarkId} to trash`);
        }
      } 
      // Handle folder drag
      else if (activeFolder) {
        const folderId = active.id.replace('folder-', '');
        const targetId = over.id;
        
        if (targetId.startsWith('folder-')) {
          const parentFolderId = targetId.replace('folder-', '');
          
          // Prevent dropping a folder into itself
          if (folderId !== parentFolderId) {
            // Check for circular references
            let potentialParent = parentFolderId;
            let hasCircularReference = false;
            
            // Simple check to prevent immediate circular references
            const folderRef = doc(db, `users/${currentUser.uid}/folders/${potentialParent}`);
            const folderDoc = await folderRef.get();
            
            if (folderDoc.exists() && folderDoc.data().parentId === folderId) {
              hasCircularReference = true;
            }
            
            if (!hasCircularReference) {
              // Update folder in Firestore
              const folderRef = doc(db, `users/${currentUser.uid}/folders/${folderId}`);
              await updateDoc(folderRef, {
                parentId: parentFolderId,
                updatedAt: new Date()
              });
              
              console.log(`Nested folder ${folderId} under parent folder ${parentFolderId}`);
            } else {
              console.error('Cannot create circular folder reference');
            }
          }
        } else if (targetId === 'trash') {
          // Handle drop on trash folder - mark folder as deleted
          const folderRef = doc(db, `users/${currentUser.uid}/folders/${folderId}`);
          await updateDoc(folderRef, {
            isDeleted: true,
            updatedAt: new Date()
          });
          
          console.log(`Moved folder ${folderId} to trash`);
        }
      }
    } catch (error) {
      console.error('Error updating item location:', error);
    } finally {
      setIsDragging(false);
      setIsDraggingFolder(false);
      setActiveBookmark(null);
      setActiveFolder(null);
    }
  }, [activeBookmark, activeFolder, currentUser]);

  const handleDragCancel = useCallback(() => {
    setIsDragging(false);
    setIsDraggingFolder(false);
    setActiveBookmark(null);
    setActiveFolder(null);
  }, []);

  const value = {
    activeBookmark,
    activeFolder,
    isDragging,
    isDraggingFolder,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel
  };

  return (
    <DragAndDropContext.Provider value={value}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
      </DndContext>
    </DragAndDropContext.Provider>
  );
};