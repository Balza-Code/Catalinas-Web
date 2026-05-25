import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/Modal';

const ModalContext = createContext(null);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (ctx == null) {
    // Provide safe no-op fallbacks to avoid runtime crashes when provider is missing
    return {
      showModal: (opts = {}) => console.warn('ModalProvider missing — showModal called with', opts),
      hideModal: () => console.warn('ModalProvider missing — hideModal called'),
    };
  }
  return ctx;
};

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    open: false,
    title: '',
    message: '',
    onClose: null,
    confirmText: 'OK',
    children: null,
  });

  const showModal = useCallback(({ title = '', message = '', confirmText = 'OK', onClose = null, children = null }) => {
    setModalState({ open: true, title, message, onClose, confirmText, children });
  }, []);

  const hideModal = useCallback(() => {
    const cb = modalState.onClose;
    setModalState((s) => ({ ...s, open: false, children: null }));
    if (typeof cb === 'function') cb();
  }, [modalState]);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal
        open={modalState.open}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        onClose={hideModal}
      >
        {modalState.children}
      </Modal>
    </ModalContext.Provider>
  );
}
