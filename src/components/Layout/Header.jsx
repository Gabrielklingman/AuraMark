import React from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiLogOut } from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onSidebarToggle }) => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="lg:hidden bg-white border-b border-gray-200 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={onSidebarToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <SafeIcon icon={FiMenu} className="w-6 h-6 text-gray-600" />
        </button>
        
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          AuraMark
        </h1>
        
        {currentUser ? (
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Logout"
          >
            <SafeIcon icon={FiLogOut} className="w-5 h-5 text-gray-600" />
          </button>
        ) : (
          <div className="w-10" /> // Spacer for centering
        )}
      </div>
    </motion.header>
  );
};

export default Header;