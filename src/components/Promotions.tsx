import React, { useState } from 'react';
import { Promotion, Product } from '../types';
import { Tag, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

interface PromotionsProps {
  promotions: Promotion[];
  products: Product[];
  onAdd: (promo: Omit<Promotion, 'id'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const Promotions: React.FC<PromotionsProps> = ({ promotions, products, onAdd, onToggle, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!name || !value) return;
    onAdd({
      name,
      type,
      value: parseFloat(value),
      active: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setName('');
    setValue('');
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold">Promociones Activas</h2>
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {promotions.filter(p => p.active).length}
          </span>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Nueva Promoción
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Crear Promoción</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: 10% descuento" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value as 'percentage' | 'fixed')} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Valor</label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder={type === 'percentage' ? '10' : '50.00'} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors">Guardar</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {/* Promotions List */}
      <div className="bg-white rounded-xl border shadow-sm">
        {promotions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Tag className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay promociones creadas</p>
            <p className="text-xs mt-1">Crea una promoción para aplicarla en las ventas</p>
          </div>
        ) : (
          <div className="divide-y">
            {promotions.map(promo => (
              <div key={promo.id} className={`p-4 flex items-center justify-between ${!promo.active ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${promo.active ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <Tag className={`w-5 h-5 ${promo.active ? 'text-purple-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{promo.name}</p>
                    <p className="text-sm text-gray-500">
                      {promo.type === 'percentage' ? `${promo.value}% de descuento` : `$${promo.value.toFixed(2)} de descuento`}
                    </p>
                    <p className="text-xs text-gray-400">
                      Desde: {promo.startDate || 'Sin fecha'} {promo.endDate ? `• Hasta: ${promo.endDate}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onToggle(promo.id)} className={`p-2 rounded-lg transition-colors ${promo.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title={promo.active ? 'Desactivar' : 'Activar'}>
                    {promo.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button onClick={() => onDelete(promo.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
