import { useEffect, useRef, useCallback } from 'react';

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minLength?: number;
  maxDelay?: number;
}

export function useBarcodeScanner({ onScan, minLength = 4, maxDelay = 50 }: UseBarcodeScannerOptions) {
  const inputRef = useRef('');
  const lastKeyTime = useRef(0);
  const timerRef = useRef<number | null>(null);
  const isScanning = useRef(false);

  const processBarcode = useCallback(() => {
    const barcode = inputRef.current.trim();
    if (barcode.length >= minLength) {
      onScan(barcode);
    }
    inputRef.current = '';
    isScanning.current = false;
  }, [onScan, minLength]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't intercept when user is in a regular input field
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Unless it's the barcode input specifically
        if (target.id !== 'barcode-input') return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTime.current;

      // If Enter is pressed and we have accumulated characters quickly (scanner behavior)
      if (e.key === 'Enter') {
        if (inputRef.current.length >= minLength && isScanning.current) {
          e.preventDefault();
          processBarcode();
          return;
        }
        inputRef.current = '';
        isScanning.current = false;
        return;
      }

      // Only capture alphanumeric characters and common barcode chars
      if (e.key.length === 1 && /[a-zA-Z0-9\-]/.test(e.key)) {
        // If the time between keys is too long, reset
        if (timeDiff > maxDelay && inputRef.current.length > 0) {
          inputRef.current = '';
          isScanning.current = false;
        }

        inputRef.current += e.key;
        isScanning.current = true;
        lastKeyTime.current = now;

        // Clear timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        // Set a timeout to process if no Enter comes
        timerRef.current = window.setTimeout(() => {
          if (inputRef.current.length >= minLength && isScanning.current) {
            processBarcode();
          } else {
            inputRef.current = '';
            isScanning.current = false;
          }
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onScan, minLength, maxDelay, processBarcode]);
}
