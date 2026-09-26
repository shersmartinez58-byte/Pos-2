import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
    
    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
      const altMatch = shortcut.alt ? e.altKey : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : true;
      
      if (
        e.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ctrlMatch && altMatch && shiftMatch
      ) {
        if (!isInput || shortcut.ctrl || shortcut.alt) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
