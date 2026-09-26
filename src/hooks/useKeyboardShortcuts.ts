import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields (except barcode scanner)
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    
    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !(e.ctrlKey || e.metaKey);
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      
      if (
        e.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ctrlMatch &&
        altMatch &&
        shiftMatch
      ) {
        // Allow shortcuts even in input fields if they have ctrl/alt
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

export const SHORTCUT_DEFINITIONS = [
  { key: 'F1', action: 'showHelp', description: 'Mostrar ayuda de atajos' },
  { key: 'F2', action: 'focusSearch', description: 'Buscar producto' },
  { key: 'F3', action: 'focusBarcode', description: 'Escanear código de barras' },
  { key: 'F4', action: 'focusQuantity', description: 'Ingresar cantidad' },
  { key: 'F5', action: 'addPayment', description: 'Agregar pago / Cobrar' },
  { key: 'F6', action: 'clearCart', description: 'Limpiar carrito' },
  { key: 'F7', action: 'printTicket', description: 'Imprimir último ticket' },
  { key: 'F8', action: 'showHistory', description: 'Historial de tickets' },
  { key: 'F9', action: 'quickDiscount', description: 'Descuento rápido' },
  { key: 'F10', action: 'toggleCategories', description: 'Mostrar/ocultar categorías' },
  { key: 'F12', action: 'newSale', description: 'Nueva venta' },
  { key: 'Escape', action: 'closeModal', description: 'Cerrar modal / Cancelar' },
  { key: '+', action: 'increaseQty', description: 'Aumentar cantidad (en carrito)' },
  { key: '-', action: 'decreaseQty', description: 'Disminuir cantidad (en carrito)' },
  { key: 'Delete', action: 'removeItem', description: 'Eliminar item seleccionado' },
];
