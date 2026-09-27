import React, { useState } from 'react';
import { Product, InventoryAdjustment as AdjustmentType } from '../types';
import { RefreshCw, Plus, Minus, Check, Search } from 'lucide-react';

interface InventoryAdjustmentProps {
  products: Product[];
  adjustments: AdjustmentType[];
  onAdjust: (adjustment: Omit<AdjustmentType, 'id' | 'date'> & { user: string }) => void;
  userName: string;
}

export const InventoryAdjustment: React.FC<InventoryAdjustmentProps> = ({ products, adjustments, onAdjust, userName }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [type, setType] = useState<'add' | 'remove' | 'correction'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search));

  const handleSubmit = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product || !quantity) return;
    
    onAdjust({
      productId: product.id,
      productName: product.name,
      type,
      quantity: parseInt(quantity),
      reason: reason || 'Sin especificar',
      user: userName,
    });

    setSelectedProduct('');
    setQuantity('');
    setReason('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Form */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-600" />
          Nuevo Ajuste de Inventario
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Product Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Producto</label>
            <input type="text" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              {filteredProducts.map(p => (
                <button key={p.id} onClick={() => { setSelectedProduct(p.id); setSearch(p.name); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${selectedProduct === p.id ? 'bg-blue-100 font-medium' : ''}`}>
                  <span>{p.name}</span>
                  <span className="text-gray-400 text-xs ml-2">Stock: {p.stock}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type & Quantity */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo de Ajuste</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setType('add')} className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${type === 'add' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                  <Plus className="w-4 h-4" /> Agregar
                </button>
                <button onClick={() => setType('remove')} className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${type === 'remove' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>
                  <Minus className="w-4 h-4" /> Quitar
                </button>
                <button onClick={() => setType('correction')} className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${type === 'correction' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                  <Check className="w-4 h-4" /> Corregir
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Cantidad</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" min="0" className="w-full px-3 py-2 border rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Motivo</label>
              <select value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Seleccionar motivo...</option>
                <option value="Compra a proveedor">Compra a proveedor</option>
                <option value="Devolución de cliente">Devolución de cliente</option>
                <option value="Merma / Daño">Merma / Daño</option>
                <option value="Robo / Pérdida">Robo / Pérdida</option>
                <option value="Error de conteo">Error de conteo</option>
                <option value="Ajuste de inventario físico">Ajuste de inventario físico</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preview */}
        {selectedProduct && quantity && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-600">
              <strong>Resumen:</strong> {type === 'add' ? 'Agregar' : type === 'remove' ? 'Quitar' : 'Corregir a'}{' '}
              <strong>{quantity}</strong> unidades de{' '}
              <strong>{products.find(p => p.id === selectedProduct)?.name}</strong>
              {type === 'correction' && ` (Stock actual: ${products.find(p => p.id === selectedProduct)?.stock})`}
            </p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!selectedProduct || !quantity} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors">
          Aplicar Ajuste
        </button>
      </div>

      {/* Success notification */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-bounce">
          ✅ Ajuste aplicado correctamente
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-bold text-gray-800">Historial de Ajustes</h3>
        </div>
        <div className="overflow-x-auto">
          {adjustments.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No hay ajustes registrados</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left p-3 font-medium text-gray-600">Producto</th>
                  <th className="text-center p-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-center p-3 font-medium text-gray-600">Cantidad</th>
                  <th className="text-left p-3 font-medium text-gray-600">Motivo</th>
                  <th className="text-left p-3 font-medium text-gray-600">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...adjustments].reverse().map(adj => (
                  <tr key={adj.id} className="hover:bg-gray-50">
                    <td className="p-3 text-xs text-gray-500">{adj.date.toLocaleString('es-MX')}</td>
                    <td className="p-3 font-medium">{adj.productName}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${adj.type === 'add' ? 'bg-green-100 text-green-700' : adj.type === 'remove' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {adj.type === 'add' ? '+ Agregar' : adj.type === 'remove' ? '- Quitar' : '= Corregir'}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold">{adj.quantity}</td>
                    <td className="p-3 text-gray-600">{adj.reason}</td>
                    <td className="p-3 text-gray-500">{adj.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
