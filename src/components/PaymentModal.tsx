import React, { useState, useRef, useEffect } from 'react';
import { PaymentMethod } from '../types';
import { Banknote, CreditCard, Building2, X } from 'lucide-react';

interface PaymentModalProps {
  total: number;
  onConfirm: (method: PaymentMethod, amountPaid: number) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ total, onConfirm, onClose }) => {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState(total.toFixed(2));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const change = Math.max(0, parseFloat(amountPaid || '0') - total);
  const quickAmounts = [
    Math.ceil(total),
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 50) * 50,
    Math.ceil(total / 100) * 100,
    Math.ceil(total / 500) * 500,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4);

  const handleConfirm = () => {
    const paid = parseFloat(amountPaid) || 0;
    if (method === 'cash' && paid < total) return;
    onConfirm(method, method === 'cash' ? paid : total);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Cobrar</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Total */}
        <div className="p-4 bg-blue-50 text-center">
          <p className="text-sm text-blue-600 font-medium">Total a cobrar</p>
          <p className="text-4xl font-bold text-blue-800">${total.toFixed(2)}</p>
        </div>

        {/* Payment Method */}
        <div className="p-4 space-y-3">
          <p className="text-sm font-medium text-gray-600">Método de pago:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setMethod('cash')}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                method === 'cash'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Banknote className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Efectivo</span>
            </button>
            <button
              onClick={() => setMethod('card')}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                method === 'card'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <CreditCard className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Tarjeta</span>
            </button>
            <button
              onClick={() => setMethod('transfer')}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                method === 'transfer'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Building2 className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Transfer.</span>
            </button>
          </div>

          {/* Amount Input (Cash only) */}
          {method === 'cash' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Monto recibido:</label>
              <input
                ref={inputRef}
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                }}
                className="w-full px-4 py-3 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                step="0.01"
                min={total}
              />
              
              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setAmountPaid(amount.toFixed(2))}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    ${amount}
                  </button>
                ))}
                <button
                  onClick={() => setAmountPaid(total.toFixed(2))}
                  className="px-3 py-1.5 bg-green-100 hover:bg-green-200 rounded-lg text-sm font-medium text-green-700 transition-colors"
                >
                  Exacto
                </button>
              </div>

              {/* Change */}
              <div className={`p-3 rounded-lg text-center ${
                change > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className="text-sm text-gray-600">Cambio:</p>
                <p className={`text-2xl font-bold ${change > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                  ${change.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleConfirm}
            disabled={method === 'cash' && parseFloat(amountPaid) < total}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition-colors shadow-lg"
          >
            Confirmar Pago ✓
          </button>
          <p className="text-xs text-center text-gray-400 mt-2">Presione Enter para confirmar</p>
        </div>
      </div>
    </div>
  );
};
