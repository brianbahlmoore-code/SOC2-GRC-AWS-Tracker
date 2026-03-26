import { useEffect } from 'react';

export function useKeyboardShortcuts(handlers: {
  onNewTask?: () => void;
  onFocusSearch?: () => void;
  onCloseDrawer?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape' && handlers.onCloseDrawer) {
          handlers.onCloseDrawer();
        }
        return;
      }

      switch (e.key) {
        case 'n':
        case 'N':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handlers.onNewTask?.();
          }
          break;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handlers.onFocusSearch?.();
          }
          break;
        case 'Escape':
          handlers.onCloseDrawer?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
