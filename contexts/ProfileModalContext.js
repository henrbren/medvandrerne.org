import React, { createContext, useContext, useState, useCallback } from 'react';

const ProfileModalContext = createContext();

export function ProfileModalProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);

  const showProfileModal = useCallback((options = {}) => {
    setOpenScanner(options.openScanner || false);
    setVisible(true);
  }, []);

  const hideProfileModal = useCallback(() => {
    setVisible(false);
    setOpenScanner(false);
  }, []);

  const value = {
    visible,
    openScanner,
    showProfileModal,
    hideProfileModal,
  };

  return (
    <ProfileModalContext.Provider value={value}>
      {children}
    </ProfileModalContext.Provider>
  );
}

export function useProfileModal() {
  const context = useContext(ProfileModalContext);
  if (!context) {
    throw new Error('useProfileModal must be used within a ProfileModalProvider');
  }
  return context;
}

export default ProfileModalContext;


