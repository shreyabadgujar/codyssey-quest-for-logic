import { useEffect, useRef } from "react";

export function useJournalOverlay(open, onClose, mobileOnly = false) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const media = window.matchMedia("(max-width: 1023px)");
    let restoreScroll = () => {};
    const updateScrollLock = () => {
      restoreScroll();
      restoreScroll = () => {};
      if (mobileOnly && !media.matches) return;
      const root = document.documentElement;
      const previous = root.style.overflow;
      root.style.overflow = "hidden";
      restoreScroll = () => { root.style.overflow = previous; };
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeRef.current();
    };
    updateScrollLock();
    media.addEventListener("change", updateScrollLock);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      restoreScroll();
      media.removeEventListener("change", updateScrollLock);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, mobileOnly]);
}
