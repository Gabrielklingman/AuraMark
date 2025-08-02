import React from 'react';
import { motion } from 'framer-motion';

const MainContent = ({ children }) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 bg-white rounded-l-xl shadow-soft min-h-screen overflow-hidden"
    >
      <div className="h-full p-8">
        {children || (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                No bookmarks here yet!
              </h2>
              <p className="text-gray-600 mb-8">
                Save your favorite websites, articles, and resources for quick access anytime.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-lg shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Bookmark
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.main>
  );
};

export default MainContent;