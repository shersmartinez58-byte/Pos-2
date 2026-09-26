import React from 'react';
import { Product } from '../types';
import { Search, ScanBarcode } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  categories: string[];
  selectedCategory: string;
  searchTerm: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (term: string) => void;
  onProductClick: (product: Product) => void;
  barcodeValue: string;
  onBarcodeChange: (value: string) => void;
  onBarcodeSubmit: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  selectedCategory,
  searchTerm,
  onCategoryChange,
  onSearchChange,
  onProductClick,
  barcodeValue,
  onBarcodeChange,
  onBarcodeSubmit,
}) => {
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search and Barcode Input */}
      <div className="p-3 space-y-2 bg-gray-50 border-b">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              id="search-input"
              placeholder="Buscar producto... (F2)"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex-1 relative">
            <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              id="barcode-input"
              placeholder="Escanear código... (F3)"
              value={barcodeValue}
              onChange={(e) => onBarcodeChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onBarcodeSubmit();
                }
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-mono"
              autoFocus
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => onCategoryChange('Todos')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'Todos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => onProductClick(product)}
              className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all text-center group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-2 group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
                <span className="text-lg">
                  {product.category === 'Bebidas' ? '🥤' :
                   product.category === 'Botanas' ? '🍿' :
                   product.category === 'Dulces' ? '🍬' :
                   product.category === 'Panadería' ? '🍞' :
                   product.category === 'Lácteos' ? '🥛' :
                   '📦'}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-800 leading-tight line-clamp-2">
                {product.name}
              </span>
              <span className="text-sm font-bold text-blue-600 mt-1">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                {product.barcode.slice(-6)}
              </span>
            </button>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Search className="w-10 h-10 mb-2" />
            <p className="text-sm">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );
};
