"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";

/**
 * Modal built on the native <dialog>: focus trapping, Esc to close, inert
 * background and focus return to the trigger are provided by the browser.
 * It blooms out of `origin` (viewport coordinates of the trigger) so it reads
 * as the control unfolding rather than a window appearing.
 */
export function MorphingModal({
  open,
  onClose,
  title,
  children,
  origin,
  full = false,
  returnFocus,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  origin?: { x: number; y: number } | null;
  full?: boolean;
  /**
   * The control that opened the dialog. Focus goes back here on close. Passed explicitly because Safari does not focus a
   * button when it is clicked, so "the element that was focused when we opened" is <body> there and cannot be restored.
   */
  returnFocus?: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const prev = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      prev.current = document.activeElement as HTMLElement | null;
      if (origin) d.style.transformOrigin = `${origin.x}px ${origin.y}px`;
      d.showModal();
    } else if (!open && d.open) {
      d.close();
      (returnFocus?.current ?? prev.current)?.focus?.();
    }
  }, [open, origin, returnFocus]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={() => {
        onClose();
        // Escape closes the dialog natively, before React knows: put focus back on the opener ourselves.
        requestAnimationFrame(() => (returnFocus?.current ?? prev.current)?.focus?.());
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={`arena-modal pointer-events-auto ${full ? "arena-modal-full" : ""}`}
    >
      <div className="relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="glass absolute right-3 top-3 z-20 grid size-11 place-items-center [--r:999px]"
        >
          <X size={18} aria-hidden />
        </button>
        {children}
      </div>
    </dialog>
  );
}
