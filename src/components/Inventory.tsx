import React, { useState } from 'react';
import { Product } from '../types';
import { Search, Package, AlertTriangle, Filter } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ products, onUpdateStock }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [filter, setFilter] = useState<'all' | 'low' | 'ok'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const categories = ['Todos', ...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchCat = category === 'Todos' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchFilter = filter === 'all' || (filter === 'low' && p.stock <= p.minStock) || (filter === 'ok' && p.stock > p.minStock);
    return matchCat && matchSearch && matchFilter;
  });

  const totalValue = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
  const lowStock = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs text-gray-500">Total Productos</p>
          <p className="text-xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs text-gray-500">Valor Inventario</p>
          <p className="text-xl font-bold text-green-600">${totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs text-gray-500">Stock Bajo</p>
          <p className="text-xl font-bold text-amber-600">{lowStock}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <p className="text-xs text-gray-500">Unidades Totales</p>
          <p className="text-xl font-bold">{products.reduce((s, p) => s + p.stock, 0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar producto o código..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-1">
            <button onClick={() => setFilter('all')} className={`px-3 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Todos</button>
            <button onClick={() => setFilter('low')} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${filter === 'low' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <AlertTriangle className="w-3 h-3" /> Bajo
            </button>
            <button onClick={() => setFilter('ok')} className={`px-3 py-2 rounded-lg text-sm font-medium ${filter === 'ok' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>OK</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Producto</th>
                <th className="text-left p-3 font-medium text-gray-600">Código</th>
                <th className="text-left p-3 font-medium text-gray-600">Categoría</th>
                <th className="text-left p-3 font-medium text-gray-600">Unidades de Venta</th>
                <th className="text-center p-3 font-medium text-gray-600">Costo</th>
                <th className="text-center p-3 font-medium text-gray-600">Stock</th>
                <th className="text-center p-3 font-medium text-gray-600">Mínimo</th>
                <th className="text-center p-3 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3 font-mono text-xs text-gray-500">{product.barcode}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{product.category}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {product.units.map(u => (
                        <span key={u.id} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                          {u.name}: ${u.price.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center">${product.cost.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    {editingId === product.id ? (
                      <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => { onUpdateStock(product.id, parseInt(editValue) || 0); setEditingId(null); }} onKeyDown={e => { if (e.key === 'Enter') { onUpdateStock(product.id, parseInt(editValue) || 0); setEditingId(null); } }} className="w-16 px-2 py-1 border rounded text-center text-sm" autoFocus />
                    ) : (
                      <button onClick={() => { setEditingId(product.id); setEditValue(String(product.stock)); }} className="font-bold hover:text-blue-600">{product.stock}</button>
                    )}
                  </td>
                  <td className="p-3 text-center text-gray-500">{product.minStock}</td>
                  <td className="p-3 text-center">
                    {product.stock <= product.minStock ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1 justify-center">
                        <AlertTriangle className="w-3 h-3" /> Bajo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
