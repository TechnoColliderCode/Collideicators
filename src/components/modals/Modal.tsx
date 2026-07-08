import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return undefined;
    }

    if (!open) {
      if (dialog.open) {
        dialog.close();
      }
      returnFocusRef.current?.focus();
      return undefined;
    }

    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    if (!dialog.open) {
      dialog.showModal();
    }
    titleRef.current?.focus();

    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    const onCloseDialog = () => {
      returnFocusRef.current?.focus();
    };

    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onCloseDialog);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onCloseDialog);
    };
  }, [open, onClose]);

  return (
    <dialog ref={dialogRef} className="modal-card" aria-labelledby={titleId} aria-modal="true">
      <section>
        <header>
          <h2 id={titleId} ref={titleRef} tabIndex={-1}>{title}</h2>
          <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        {children}
      </section>
    </dialog>
  );
}
