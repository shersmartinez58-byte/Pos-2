import React from 'react';
import { Ticket } from '../types';
import { X, Receipt, Printer } from 'lucide-react';

interface HistoryModalProps {
  tickets: Ticket[];
  onClose: () => void;
  onViewTicket: (ticket: Ticket) => void;
  onPrintTicket: (ticket: Ticket) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ tickets, onClose, onViewTicket, onPrintTicket }) => {
  const todayTotal = tickets
    .filter(t => t.date.toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Historial de Ventas</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gray-50 border-b grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Ventas Hoy</p>
            <p className="text-lg font-bold text-blue-600">
              {tickets.filter(t => t.date.toDateString() === new Date().toDateString()).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Hoy</p>
            <p className="text-lg font-bold text-green-600">${todayTotal.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Ventas</p>
            <p className="text-lg font-bold text-gray-800">{tickets.length}</p>
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Receipt className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No hay ventas registradas</p>
            </div>
          ) : (
            <div className="divide-y">
              {[...tickets].reverse().map((ticket) => (
                <div key={ticket.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                        #{ticket.ticketNumber}
                      </span>
                      <span className="text-xs text-gray-500">
                        {ticket.date.toLocaleDateString('es-MX')} {ticket.date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {ticket.items.reduce((s, i) => s + i.quantity, 0)} artículos •{' '}
                      {ticket.paymentMethod === 'cash' ? '💵 Efectivo' :
                       ticket.paymentMethod === 'card' ? '💳 Tarjeta' : '🏦 Transferencia'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">
                      ${ticket.total.toFixed(2)}
                    </span>
                    <button
                      onClick={() => onViewTicket(ticket)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      title="Ver ticket"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onPrintTicket(ticket)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                      title="Imprimir ticket"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
