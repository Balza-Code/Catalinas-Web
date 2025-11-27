import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/Modal';

const ModalContext = createContext(null);

export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({ open: false, title: '', message: '', onClose: null, confirmText: 'OK' });

  const showModal = useCallback(({ title = '', message = '', confirmText = 'OK', onClose = null }) => {
    setModalState({ open: true, title, message, onClose, confirmText });
  }, []);

  const hideModal = useCallback(() => {
    const cb = modalState.onClose;
    setModalState((s) => ({ ...s, open: false }));
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
      />
    </ModalContext.Provider>
  );
}
