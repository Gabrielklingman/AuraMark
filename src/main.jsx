import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { BookmarkFilterProvider } from './contexts/BookmarkFilterContext.jsx'
import { DragAndDropProvider } from './contexts/DragAndDropContext.jsx'
import { TagProvider } from './contexts/TagContext.jsx'
import { SelectionProvider } from './contexts/SelectionContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <TagProvider>
        <BookmarkFilterProvider>
          <SelectionProvider>
            <DragAndDropProvider>
              <App />
            </DragAndDropProvider>
          </SelectionProvider>
        </BookmarkFilterProvider>
      </TagProvider>
    </AuthProvider>
  </React.StrictMode>
)