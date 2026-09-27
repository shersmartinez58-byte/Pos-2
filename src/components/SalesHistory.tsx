import React, { useState } from 'react';
import { Ticket } from '../types';
import { History, Search, Printer, Receipt, Calendar, Filter } from 'lucide-react';

interface SalesHistoryProps {
  tickets: Ticket[];
  onPrint: (ticket: Ticket) => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({ tickets, onPrint }) => {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filtered = tickets.filter(t => {
    const matchSearch = t.ticketNumber.includes(search) || t.cashier.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || t.date.toISOString().split('T')[0] === dateFilter;
    const matchMethod = methodFilter === 'all' || t.paymentMethod === methodFilter;
    return matchSearch && matchDate && matchMethod;
  }).reverse();

  const totalFiltered = filtered.reduce((sum, t) => sum + t.total, 0);
  const cashTotal = filtered.filter(t => t.paymentMethod === 'cash').reduce((s, t) => s + t.total, 0);
  const cardTotal = filtered.filter(t => t.paymentMethod === 'card').reduce((s, t) => s + t.total, 0);
  const transferTotal = filtered.filter(t => t.paymentMethod === 'transfer').reduce((s, t) => s + t.total, 0);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs text-gray-500">Total Ventas</p>
          <p className="text-xl font-bold text-green-600">${totalFiltered.toFixed(2)}</p>
          <p className="text-xs text-gray-400">{filtered.length} tickets</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs text-gray-500">💵 Efectivo</p>
          <p className="text-xl font-bold text-gray-800">${cashTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs text-gray-500">💳 Tarjeta</p>
          <p className="text-xl font-bold text-gray-800">${cardTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs text-gray-500">🏦 Transferencia</p>
          <p className="text-xl font-bold text-gray-800">${transferTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por # ticket o cajero..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
          </div>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">Todos los métodos</option>
            <option value="cash">💵 Efectivo</option>
            <option value="card">💳 Tarjeta</option>
            <option value="transfer">🏦 Transferencia</option>
          </select>
          {(search || dateFilter || methodFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setDateFilter(''); setMethodFilter('all'); }} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Limpiar</button>
          )}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay ventas registradas</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Ticket</th>
                  <th className="text-left p-3 font-medium text-gray-600">Fecha/Hora</th>
                  <th className="text-left p-3 font-medium text-gray-600">Cajero</th>
                  <th className="text-center p-3 font-medium text-gray-600">Items</th>
                  <th className="text-center p-3 font-medium text-gray-600">Método</th>
                  <th className="text-right p-3 font-medium text-gray-600">Total</th>
                  <th className="text-center p-3 font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-medium">#{ticket.ticketNumber}</td>
                    <td className="p-3 text-gray-600">
                      <div>{ticket.date.toLocaleDateString('es-MX')}</div>
                      <div className="text-xs text-gray-400">{ticket.date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="p-3">{ticket.cashier}</td>
                    <td className="p-3 text-center">{ticket.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="p-3 text-center">
                      <span className="text-sm">
                        {ticket.paymentMethod === 'cash' ? '💵' : ticket.paymentMethod === 'card' ? '💳' : '🏦'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-green-600">${ticket.total.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedTicket(ticket)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Ver">
                          <Receipt className="w-4 h-4" />
                        </button>
                        <button onClick={() => onPrint(ticket)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Imprimir">
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold">Ticket #{selectedTicket.ticketNumber}</h2>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 font-mono text-xs space-y-2">
              <div className="text-center border-b border-dashed pb-2">
                <p className="font-bold">DEPÓSITO SAN JUDITAS</p>
                <p className="text-gray-500">{selectedTicket.date.toLocaleString('es-MX')}</p>
                <p className="text-gray-500">Cajero: {selectedTicket.cashier}</p>
              </div>
              {selectedTicket.items.map((item, i) => {
                const price = item.isCase ? item.product.casePrice : item.product.unitPrice;
                return (
                  <div key={`i-${i}`} className="flex justify-between">
                    <span className="truncate pr-2">{item.product.name}{item.isCase ? ' (Caja)' : ''}</span>
                    <span>{item.quantity}x${price.toFixed(2)}</span>
                  </div>
                );
              })}
              {selectedTicket.kits && selectedTicket.kits.map((item, i) => (
                <div key={`k-${i}`} className="flex justify-between text-purple-700">
                  <span className="truncate pr-2">[KIT] {item.kit.name}</span>
                  <span>{item.quantity}x${item.kit.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-dashed pt-2 space-y-0.5">
                <div className="flex justify-between"><span>Subtotal:</span><span>${selectedTicket.subtotal.toFixed(2)}</span></div>
                {selectedTicket.discount > 0 && <div className="flex justify-between text-green-600"><span>Descuento:</span><span>-${selectedTicket.discount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span>IVA:</span><span>${selectedTicket.tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold border-t pt-1"><span>TOTAL:</span><span>${selectedTicket.total.toFixed(2)}</span></div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <button onClick={() => onPrint(selectedTicket)} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"><Printer className="w-4 h-4" />Imprimir</button>
              <button onClick={() => setSelectedTicket(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
