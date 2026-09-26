import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { SHORTCUT_DEFINITIONS } from '../hooks/useKeyboardShortcuts';

interface KeyboardHelpProps {
  onClose: () => void;
}

export const KeyboardHelp: React.FC<KeyboardHelpProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Atajos de Teclado</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 border-b">
          <p className="text-sm text-blue-700">
            💡 <strong>Escáner de código de barras:</strong> Simplemente escanee el código. 
            El sistema detecta automáticamente la entrada rápida del escáner y agrega el producto al carrito.
          </p>
        </div>

        {/* Shortcuts */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {SHORTCUT_DEFINITIONS.map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono font-bold text-gray-600 shadow-sm">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              <strong>⚡ Tip:</strong> Los atajos con F1-F12 funcionan en todo momento. 
              Para aumentar/disminuir cantidad, seleccione un item del carrito primero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
