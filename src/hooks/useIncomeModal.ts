import { useRef, useCallback } from "react";

interface IncomeModalHandle {
  openModal: () => void;
}

export function useIncomeModal() {
  const modalRef = useRef<IncomeModalHandle>(null);

  const openModal = useCallback(() => {
    modalRef.current?.openModal();
  }, []);

  return { modalRef, openModal };
}
