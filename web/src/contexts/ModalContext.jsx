import { createContext, useContext, useState } from 'react';
import ModalRoot from '../components/ModalRoot.jsx';
import ProfileModal, { ProfileModalContent } from '../components/modals/ProfileModal.jsx';
import NotificationsModal from '../components/modals/NotificationsModal.jsx';
import HelpModal from '../components/modals/HelpModal.jsx';
import ChangelogModal from '../components/modals/ChangelogModal.jsx';
import ShortcutsModal from '../components/modals/ShortcutsModal.jsx';
import QuickActionsModal from '../components/modals/QuickActionsModal.jsx';
import FeedbackModal from '../components/modals/FeedbackModal.jsx';
import ConfirmLogout from '../components/modals/ConfirmLogout.jsx';
import { useAuthStore } from '../store/authStore.js';
import { useAuth } from './AuthContext.jsx';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [activeModal, setActiveModal] = useState(null);
  const authStoreSignOut = useAuthStore((s) => s.signOut);
  const { signOut: authSignOut } = useAuth();

  const openModal = (modalId) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, activeModal }}>
      {children}
      
      {/* Map existing modals to use ModalRoot wrapper */}
      {activeModal === 'profile' && (
        <ModalRoot open={true} onClose={closeModal} title="Profile & Security" maxWidth="max-w-3xl">
          <ProfileModalContent onClose={closeModal} />
        </ModalRoot>
      )}
      
      {activeModal === 'notifications' && (
        <ModalRoot open={true} onClose={closeModal} title="Notifications">
          <NotificationsModal open={true} onClose={closeModal} />
        </ModalRoot>
      )}
      
      {activeModal === 'help' && (
        <ModalRoot open={true} onClose={closeModal} title="Help Center">
          <HelpModal open={true} onClose={closeModal} />
        </ModalRoot>
      )}
      
      {activeModal === 'changelog' && (
        <ModalRoot open={true} onClose={closeModal} title="What's New">
          <ChangelogModal open={true} onClose={closeModal} />
        </ModalRoot>
      )}
      
      {activeModal === 'shortcuts' && (
        <ModalRoot open={true} onClose={closeModal} title="Keyboard Shortcuts">
          <ShortcutsModal open={true} onClose={closeModal} />
        </ModalRoot>
      )}
      
      {activeModal === 'quick' && (
        <ModalRoot open={true} onClose={closeModal} title="Quick Actions">
          <QuickActionsModal open={true} onClose={closeModal} />
        </ModalRoot>
      )}
      
      {activeModal === 'feedback' && (
        <ModalRoot open={true} onClose={closeModal} title="Feedback">
          <FeedbackModal open={true} onClose={closeModal} />
        </ModalRoot>
      )}
      
      {activeModal === 'confirmLogout' && (
        <ModalRoot open={true} onClose={closeModal} title="Confirm Logout">
          <ConfirmLogout 
            open={true} 
            onClose={closeModal} 
            onConfirm={async () => {
              // Sign out from both auth systems for compatibility
              await authSignOut();
              authStoreSignOut();
              window.location.href = '/login';
            }} 
          />
        </ModalRoot>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}

