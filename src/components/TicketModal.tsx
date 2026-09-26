import React, { useRef, useEffect } from 'react';
import { Ticket } from '../types';
import { Printer, X, Download } from 'lucide-react';

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
  onPrint: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ ticket, onClose, onPrint }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handlePrint = () => {
    onPrint();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={0}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'p' || e.key === 'P') handlePrint();
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">✅ Venta Exitosa</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Ticket */}
        <div className="p-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 font-mono text-xs">
            {/* Ticket Header */}
            <div className="text-center border-b border-dashed border-gray-300 pb-2 mb-2">
              <p className="font-bold text-sm">MI TIENDA POS</p>
              <p className="text-gray-500">RFC: XAXX010101000</p>
              <p className="text-gray-500">Av. Principal #123</p>
              <p className="text-gray-500">Tel: (555) 123-4567</p>
              <p className="mt-1 font-bold">TICKET DE VENTA</p>
              <p className="text-gray-500">No. {ticket.ticketNumber}</p>
              <p className="text-gray-500">
                {ticket.date.toLocaleDateString('es-MX')} {ticket.date.toLocaleTimeString('es-MX')}
              </p>
            </div>

            {/* Items */}
            <div className="border-b border-dashed border-gray-300 pb-2 mb-2">
              <div className="flex justify-between font-bold mb-1">
                <span className="flex-1">Producto</span>
                <span className="w-8 text-center">Cant</span>
                <span className="w-16 text-right">Importe</span>
              </div>
              {ticket.items.map((item, i) => (
                <div key={i} className="flex justify-between py-0.5">
                  <span className="flex-1 truncate pr-1">{item.product.name}</span>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <span className="w-16 text-right">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${ticket.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%):</span>
                <span>${ticket.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-300 pt-1 mt-1">
                <span>TOTAL:</span>
                <span>${ticket.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Pago ({
                  ticket.paymentMethod === 'cash' ? 'Efectivo' :
                  ticket.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'
                }):</span>
                <span>${ticket.amountPaid.toFixed(2)}</span>
              </div>
              {ticket.paymentMethod === 'cash' && (
                <div className="flex justify-between font-bold">
                  <span>Cambio:</span>
                  <span>${ticket.change.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center border-t border-dashed border-gray-300 pt-2 mt-2">
              <p className="font-bold">¡GRACIAS POR SU COMPRA!</p>
              <p className="text-gray-500 mt-1">Este ticket es su comprobante</p>
              <p className="text-gray-400 mt-1 text-[10px]">
                Items: {ticket.items.reduce((s, i) => s + i.quantity, 0)} | 
                Cajero: Admin
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir (P)
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  );
};
