import React, { useState } from 'react';
import { Kit, Product } from '../types';
import { Plus, Edit3, Trash2, Package, X, Save } from 'lucide-react';

interface KitsProps {
  kits: Kit[];
  products: Product[];
  onAddKit: (kit: Omit<Kit, 'id'>) => void;
  onUpdateKit: (kit: Kit) => void;
  onDeleteKit: (kitId: string) => void;
}

export const Kits: React.FC<KitsProps> = ({ kits, products, onAddKit, onUpdateKit, onDeleteKit }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    price: '',
    cost: '',
    stock: '0',
    minStock: '5',
    active: true,
    items: [] as { productId: string; quantity: number }[],
  });

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '📦',
      price: '',
      cost: '',
      stock: '0',
      minStock: '5',
      active: true,
      items: [],
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1 }],
    });
  };

  const handleUpdateItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const calculateCost = () => {
    return formData.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        return total + (product.cost * item.quantity);
      }
      return total;
    }, 0);
  };

  const handleSubmit = () => {
    if (!formData.name || formData.items.length === 0) return;

    const kitData = {
      name: formData.name,
      icon: formData.icon,
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || calculateCost(),
      stock: parseInt(formData.stock) || 0,
      minStock: parseInt(formData.minStock) || 5,
      active: formData.active,
      items: formData.items,
    };

    if (editingKit) {
      onUpdateKit({ ...kitData, id: editingKit.id });
    } else {
      onAddKit(kitData);
    }

    resetForm();
    setShowForm(false);
    setEditingKit(null);
  };

  const handleEdit = (kit: Kit) => {
    setEditingKit(kit);
    setFormData({
      name: kit.name,
      icon: kit.icon,
      price: kit.price.toString(),
      cost: kit.cost.toString(),
      stock: kit.stock.toString(),
      minStock: kit.minStock.toString(),
      active: kit.active,
      items: kit.items,
    });
    setShowForm(true);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Kits de Productos</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); setEditingKit(null); }}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> Nuevo Kit
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 text-sm">
              {editingKit ? 'Editar Kit' : 'Nuevo Kit'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingKit(null); }} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-500 mb-1 block">Nombre del Kit</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Paquete Fiesta"
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Precio Venta</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Costo</label>
              <input
                type="number"
                value={formData.cost}
                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                placeholder="Auto"
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
              <p className="text-[9px] text-slate-400 mt-0.5">Auto: {calculateCost().toFixed(2)}</p>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Stock Mínimo</label>
              <input
                type="number"
                value={formData.minStock}
                onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                placeholder="5"
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Items */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-slate-500">Productos del Kit</label>
              <button
                onClick={handleAddItem}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Agregar Producto
              </button>
            </div>

            {formData.items.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No hay productos agregados</p>
            ) : (
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={item.productId}
                      onChange={e => handleUpdateItem(index, 'productId', e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs text-center"
                      placeholder="Cant"
                    />
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 text-red-400 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.name || formData.items.length === 0}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-medium rounded-lg flex items-center gap-1"
            >
              <Save className="w-3 h-3" /> {editingKit ? 'Actualizar' : 'Guardar'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingKit(null); }}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Kits List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {kits.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay kits creados</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {kits.map(kit => (
              <div key={kit.id} className="p-3 hover:bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-slate-800">{kit.name}</h4>
                    <p className="text-[10px] text-slate-500">
                      Stock: {kit.stock} | Precio: ${kit.price.toFixed(2)} | Costo: ${kit.cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${kit.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {kit.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button
                      onClick={() => handleEdit(kit)}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => { if (confirm('¿Eliminar kit?')) onDeleteKit(kit.id); }}
                      className="p-1 text-red-400 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {kit.items.map((item, i) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600">
                        {product?.name || 'Producto'} x{item.quantity}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
