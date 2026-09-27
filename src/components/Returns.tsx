import React, { useState } from 'react';
import { Ticket, Product, Kit } from '../types';
import { Search, RotateCcw, CheckCircle, XCircle, Package } from 'lucide-react';

interface ReturnsProps {
  tickets: Ticket[];
  products: Product[];
  kits: Kit[];
  onReturn: (ticketId: string, returnedItems: any[], returnedKits: any[]) => void;
}

export const Returns: React.FC<ReturnsProps> = ({ tickets, products, kits, onReturn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedKits, setSelectedKits] = useState<Set<string>>(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);

  const filteredTickets = tickets.filter(t => 
    t.ticketNumber.includes(searchTerm) || 
    t.cashier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedItems(new Set());
    setSelectedKits(new Set());
  };

  const toggleItem = (itemId: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    setSelectedItems(newSet);
  };

  const toggleKit = (kitId: string) => {
    const newSet = new Set(selectedKits);
    if (newSet.has(kitId)) {
      newSet.delete(kitId);
    } else {
      newSet.add(kitId);
    }
    setSelectedKits(newSet);
  };

  const calculateRefund = () => {
    if (!selectedTicket) return 0;
    
    let refund = 0;
    
    // Calcular reembolso de productos
    selectedItems.forEach(itemId => {
      const item = selectedTicket.items.find(i => `${i.product.id}-${i.isCase}` === itemId);
      if (item) {
        const price = item.isCase ? (item.product.casePrice || 0) : (item.product.unitPrice || 0);
        refund += price * item.quantity;
      }
    });
    
    // Calcular reembolso de kits
    selectedKits.forEach(kitId => {
      const kit = selectedTicket.kits?.find(k => k.kit.id === kitId);
      if (kit) {
        refund += kit.kit.price * kit.quantity;
      }
    });
    
    return refund;
  };

  const handleReturn = () => {
    if (!selectedTicket) return;
    
    const returnedItems = selectedTicket.items.filter(i => 
      selectedItems.has(`${i.product.id}-${i.isCase}`)
    );
    
    const returnedKits = selectedTicket.kits?.filter(k => 
      selectedKits.has(k.kit.id)
    ) || [];
    
    onReturn(selectedTicket.id, returnedItems, returnedKits);
    
    // Reset
    setSelectedTicket(null);
    setSelectedItems(new Set());
    setSelectedKits(new Set());
    setShowConfirmation(false);
    setSearchTerm('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center gap-3">
          <RotateCcw className="w-8 h-8 text-slate-600" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Devoluciones</h2>
            <p className="text-slate-500 text-sm">Procesar devoluciones de productos y kits</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número de ticket o cajero..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Tickets Disponibles</h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No hay tickets para devolver</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-slate-50 border-l-4 border-l-slate-900' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-semibold text-slate-800">
                        #{ticket.ticketNumber}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ${ticket.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{ticket.date.toLocaleDateString('es-MX')}</span>
                      <span>{ticket.cashier}</span>
                    </div>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        {ticket.items.reduce((sum, i) => sum + i.quantity, 0)} items
                      </span>
                      {ticket.kits && ticket.kits.length > 0 && (
                        <span className="px-2 py-0.5 bg-purple-100 rounded text-purple-600">
                          {ticket.kits.reduce((sum, k) => sum + k.quantity, 0)} kits
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Return Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Seleccionar Items para Devolver</h3>
          </div>
          
          {!selectedTicket ? (
            <div className="p-12 text-center text-slate-400">
              <RotateCcw className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Selecciona un ticket para procesar la devolución</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Ticket Info */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-semibold">#{selectedTicket.ticketNumber}</span>
                  <span className="text-xs text-slate-500">{selectedTicket.date.toLocaleDateString('es-MX')}</span>
                </div>
                <div className="text-xs text-slate-500">Cajero: {selectedTicket.cashier}</div>
              </div>

              {/* Products */}
              {selectedTicket.items.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Productos</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTicket.items.map((item, idx) => {
                      const itemId = `${item.product.id}-${item.isCase}`;
                      const isSelected = selectedItems.has(itemId);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleItem(itemId)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected 
                              ? 'border-slate-900 bg-slate-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-800">
                                {item.product.name}
                                {item.isCase && <span className="ml-2 text-xs text-slate-500">(Caja)</span>}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Cantidad: {item.quantity} × ${(item.isCase ? (item.product.casePrice || 0) : (item.product.unitPrice || 0)).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">
                                ${((item.isCase ? (item.product.casePrice || 0) : (item.product.unitPrice || 0)) * item.quantity).toFixed(2)}
                              </span>
                              {isSelected && <CheckCircle className="w-5 h-5 text-slate-900" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Kits */}
              {selectedTicket.kits && selectedTicket.kits.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Kits</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTicket.kits.map((kitItem, idx) => {
                      const isSelected = selectedKits.has(kitItem.kit.id);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleKit(kitItem.kit.id)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected 
                              ? 'border-slate-900 bg-slate-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-800">
                                {kitItem.kit.name}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Cantidad: {kitItem.quantity} × ${kitItem.kit.price.toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">
                                ${kitItem.kit.price * kitItem.quantity}
                              </span>
                              {isSelected && <CheckCircle className="w-5 h-5 text-slate-900" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Refund Summary */}
              {(selectedItems.size > 0 || selectedKits.size > 0) && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Total a Reembolsar:</span>
                    <span className="text-2xl font-bold text-slate-800">
                      ${calculateRefund().toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedItems.size} productos, {selectedKits.size} kits
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(true)}
                  disabled={selectedItems.size === 0 && selectedKits.size === 0}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Procesar Devolución
                </button>
                <button
                  onClick={() => {
                    setSelectedTicket(null);
                    setSelectedItems(new Set());
                    setSelectedKits(new Set());
                  }}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Confirmar Devolución</h3>
                <p className="text-sm text-slate-500">¿Estás seguro de procesar esta devolución?</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Ticket:</span>
                  <span className="font-mono font-semibold">#{selectedTicket?.ticketNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Productos:</span>
                  <span className="font-semibold">{selectedItems.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Kits:</span>
                  <span className="font-semibold">{selectedKits.size}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">Reembolso:</span>
                  <span className="text-xl font-bold text-slate-800">${calculateRefund().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReturn}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirmar
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
