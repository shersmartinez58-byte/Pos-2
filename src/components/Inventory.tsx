import React, { useState } from 'react';
import { Product } from '../types';
import { Search, Plus, Trash2, Edit3, Save, X, Package, AlertTriangle } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProduct: (product: Product) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ products, onUpdateStock, onAddProduct, onDeleteProduct, onUpdateProduct }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'ok'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  console.log('📋 Inventory renderizado con', products.length, 'productos');

  // Add form state
  const [newProduct, setNewProduct] = useState({
    barcode: '', barcodeCase: '', name: '', icon: '📦',
    cost: '', unitPrice: '', casePrice: '', caseQty: '1',
    ownConsumptionPrice: '', stock: '', minStock: '10',
  });

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search) || (p.barcodeCase && p.barcodeCase.includes(search));
    const matchFilter = filter === 'all' || (filter === 'low' && p.stock <= p.minStock) || (filter === 'ok' && p.stock > p.minStock);
    return matchSearch && matchFilter;
  });

  const totalValue = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
  const lowStock = products.filter(p => p.stock <= p.minStock).length;

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.barcode || !newProduct.unitPrice) return;
    onAddProduct({
      barcode: newProduct.barcode,
      barcodeCase: newProduct.barcodeCase || undefined,
      name: newProduct.name,
      icon: newProduct.icon || '📦',
      cost: parseFloat(newProduct.cost) || 0,
      unitPrice: parseFloat(newProduct.unitPrice),
      casePrice: parseFloat(newProduct.casePrice) || parseFloat(newProduct.unitPrice),
      caseQty: parseInt(newProduct.caseQty) || 1,
      ownConsumptionPrice: parseFloat(newProduct.ownConsumptionPrice) || parseFloat(newProduct.unitPrice),
      stock: parseInt(newProduct.stock) || 0,
      minStock: parseInt(newProduct.minStock) || 10,
    });
    setNewProduct({ barcode: '', barcodeCase: '', name: '', icon: '📦', cost: '', unitPrice: '', casePrice: '', caseQty: '1', ownConsumptionPrice: '', stock: '', minStock: '10' });
    setShowAddForm(false);
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
  };

  

  return (
    <div className="p-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <p className="text-[10px] text-slate-500">Total Productos</p>
          <p className="text-xl font-bold">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <p className="text-[10px] text-slate-500">Valor Inventario</p>
          <p className="text-xl font-bold text-green-600">${totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <p className="text-[10px] text-slate-500">Stock Bajo</p>
          <p className="text-xl font-bold text-amber-600">{lowStock}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-200">
          <p className="text-[10px] text-slate-500">Unidades Totales</p>
          <p className="text-xl font-bold">{products.reduce((s, p) => s + p.stock, 0)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar producto o código..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none" />
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setFilter('all')} className={`px-3 py-2 rounded-lg text-xs font-medium ${filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>Todos</button>
            <button onClick={() => setFilter('low')} className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 ${filter === 'low' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <AlertTriangle className="w-3 h-3" /> Bajo
            </button>
            <button onClick={() => setFilter('ok')} className={`px-3 py-2 rounded-lg text-xs font-medium ${filter === 'ok' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}>OK</button>
            <button onClick={() => setShowAddForm(true)} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors">
              <Plus className="w-3 h-3" /> Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Producto
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] text-slate-500 mb-1 block">Nombre</label>
              <input type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Nombre del producto" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Código (unidad)</label>
              <input type="text" value={newProduct.barcode} onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })} placeholder="750..." className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Código (caja)</label>
              <input type="text" value={newProduct.barcodeCase} onChange={e => setNewProduct({ ...newProduct, barcodeCase: e.target.value })} placeholder="Opcional" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Costo</label>
              <input type="number" value={newProduct.cost} onChange={e => setNewProduct({ ...newProduct, cost: e.target.value })} placeholder="0.00" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Precio Unidad</label>
              <input type="number" value={newProduct.unitPrice} onChange={e => setNewProduct({ ...newProduct, unitPrice: e.target.value })} placeholder="0.00" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Precio Caja</label>
              <input type="number" value={newProduct.casePrice} onChange={e => setNewProduct({ ...newProduct, casePrice: e.target.value })} placeholder="0.00" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Cant. por Caja</label>
              <input type="number" value={newProduct.caseQty} onChange={e => setNewProduct({ ...newProduct, caseQty: e.target.value })} placeholder="24" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Precio Consumo</label>
              <input type="number" value={newProduct.ownConsumptionPrice} onChange={e => setNewProduct({ ...newProduct, ownConsumptionPrice: e.target.value })} placeholder="0.00" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Stock Inicial</label>
              <input type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="0" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">Stock Mínimo</label>
              <input type="number" value={newProduct.minStock} onChange={e => setNewProduct({ ...newProduct, minStock: e.target.value })} placeholder="10" className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAddProduct} className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center gap-1">
              <Save className="w-3 h-3" /> Guardar
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg">Cancelar</button>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingProduct(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Editar Producto
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">Nombre</label>
                <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Código (unidad)</label>
                  <input type="text" value={editingProduct.barcode} onChange={e => setEditingProduct({ ...editingProduct, barcode: e.target.value })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Código (caja)</label>
                  <input type="text" value={editingProduct.barcodeCase || ''} onChange={e => setEditingProduct({ ...editingProduct, barcodeCase: e.target.value })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Costo</label>
                  <input type="number" value={editingProduct.cost} onChange={e => setEditingProduct({ ...editingProduct, cost: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Precio Unidad</label>
                  <input type="number" value={editingProduct.unitPrice} onChange={e => setEditingProduct({ ...editingProduct, unitPrice: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Precio Caja</label>
                  <input type="number" value={editingProduct.casePrice} onChange={e => setEditingProduct({ ...editingProduct, casePrice: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Cant. por Caja</label>
                  <input type="number" value={editingProduct.caseQty} onChange={e => setEditingProduct({ ...editingProduct, caseQty: parseInt(e.target.value) || 1 })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Precio Consumo</label>
                  <input type="number" value={editingProduct.ownConsumptionPrice} onChange={e => setEditingProduct({ ...editingProduct, ownConsumptionPrice: parseFloat(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Stock</label>
                  <input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 mb-1 block">Stock Mínimo</label>
                  <input type="number" value={editingProduct.minStock} onChange={e => setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value) || 0 })} className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleEditProduct} className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                  <Save className="w-3 h-3" /> Guardar Cambios
                </button>
                <button onClick={() => setEditingProduct(null)} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-2 font-medium text-slate-600">Producto</th>
                <th className="text-left p-2 font-medium text-slate-600">Códigos</th>
                <th className="text-center p-2 font-medium text-slate-600">Costo</th>
                <th className="text-center p-2 font-medium text-slate-600">Precio U.</th>
                <th className="text-center p-2 font-medium text-slate-600">Precio C.</th>
                <th className="text-center p-2 font-medium text-slate-600">Stock</th>
                <th className="text-center p-2 font-medium text-slate-600">Estado</th>
                <th className="text-center p-2 font-medium text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="p-2">
                    <span className="font-medium text-slate-800">{product.name}</span>
                  </td>
                  <td className="p-2 font-mono text-[10px] text-slate-500">
                    <div>U: {product.barcode}</div>
                    {product.barcodeCase && <div>C: {product.barcodeCase}</div>}
                  </td>
                  <td className="p-2 text-center">${(product.cost || 0).toFixed(2)}</td>
                  <td className="p-2 text-center font-medium">${(product.unitPrice || 0).toFixed(2)}</td>
                  <td className="p-2 text-center font-medium">${(product.casePrice || 0).toFixed(2)}</td>
                  <td className="p-2 text-center">
                    {editingId === product.id ? (
                      <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={() => { onUpdateStock(product.id, parseInt(editValue) || 0); setEditingId(null); }} onKeyDown={e => { if (e.key === 'Enter') { onUpdateStock(product.id, parseInt(editValue) || 0); setEditingId(null); } }} className="w-14 px-1 py-0.5 border rounded text-center text-xs" autoFocus />
                    ) : (
                      <button onClick={() => { setEditingId(product.id); setEditValue(String(product.stock)); }} className="font-bold hover:text-blue-600">{product.stock}</button>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {product.stock <= product.minStock ? (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">⚠️ Bajo</span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium">✓ OK</span>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setEditingProduct(product)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title="Editar">
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button onClick={() => { if (confirm('¿Eliminar producto?')) onDeleteProduct(product.id); }} className="p-1 text-red-400 hover:bg-red-50 rounded" title="Eliminar">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
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
