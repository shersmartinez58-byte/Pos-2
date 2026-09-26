import React from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus, ShoppingCart, CreditCard } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  selectedIndex: number;
  onSelectItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  subtotal: number;
  tax: number;
  total: number;
}

export const Cart: React.FC<CartProps> = ({
  items,
  selectedIndex,
  onSelectItem,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  subtotal,
  tax,
  total,
}) => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Cart Header */}
      <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-800">Carrito</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>
        <button
          onClick={onClearCart}
          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
          title="Limpiar carrito (F6)"
        >
          Limpiar (F6)
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
            <ShoppingCart className="w-12 h-12 mb-2 opacity-30" />
            <p className="text-sm text-center">Carrito vacío</p>
            <p className="text-xs text-center mt-1">Escanee o busque productos</p>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item, index) => (
              <div
                key={item.product.id}
                onClick={() => onSelectItem(index)}
                className={`p-3 cursor-pointer transition-colors ${
                  selectedIndex === index
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${item.product.price.toFixed(2)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateQuantity(index, item.quantity - 1);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateQuantity(index, item.quantity + 1);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(index);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="text-right mt-1">
                  <span className="text-sm font-bold text-gray-800">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Totals */}
      <div className="border-t bg-gray-50 p-3 space-y-1">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>IVA (16%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 pt-1 border-t">
          <span>Total:</span>
          <span className="text-blue-600">${total.toFixed(2)}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full mt-2 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <CreditCard className="w-5 h-5" />
          Cobrar (F5)
        </button>
      </div>
    </div>
  );
};
