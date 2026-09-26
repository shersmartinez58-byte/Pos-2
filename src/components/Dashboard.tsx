import React from 'react';
import { Ticket, Product } from '../types';
import { DollarSign, ShoppingCart, Package, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

interface DashboardProps {
  tickets: Ticket[];
  products: Product[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tickets, products }) => {
  const today = new Date();
  const todayTickets = tickets.filter(t => t.date.toDateString() === today.toDateString());
  const todayTotal = todayTickets.reduce((sum, t) => sum + t.total, 0);
  const todayItems = todayTickets.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekTickets = tickets.filter(t => t.date >= weekAgo);
  const weekTotal = weekTickets.reduce((sum, t) => sum + t.total, 0);

  // Last 5 sales
  const lastSales = [...tickets].reverse().slice(0, 5);

  // Top products by quantity sold
  const productSales: Record<string, { name: string; qty: number; total: number }> = {};
  tickets.forEach(t => {
    t.items.forEach(item => {
      const key = item.product.id;
      if (!productSales[key]) productSales[key] = { name: item.product.name, qty: 0, total: 0 };
      productSales[key].qty += item.quantity;
      productSales[key].total += item.product.price * item.quantity;
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Ventas Hoy</span>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">${todayTotal.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{todayTickets.length} transacciones</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Ventas Semana</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">${weekTotal.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{weekTickets.length} transacciones</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Artículos Hoy</span>
            <ShoppingCart className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{todayItems}</p>
          <p className="text-xs text-gray-400 mt-1">unidades vendidas</p>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Stock Bajo</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{lowStockProducts.length}</p>
          <p className="text-xs text-amber-500 mt-1">productos alertados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last Sales */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-800">Últimas Ventas</h3>
          </div>
          <div className="p-4">
            {lastSales.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No hay ventas registradas</p>
            ) : (
              <div className="space-y-3">
                {lastSales.map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">#{ticket.ticketNumber}</p>
                      <p className="text-xs text-gray-500">
                        {ticket.date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} • {ticket.items.reduce((s, i) => s + i.quantity, 0)} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">${ticket.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {ticket.paymentMethod === 'cash' ? '💵 Efectivo' : ticket.paymentMethod === 'card' ? '💳 Tarjeta' : '🏦 Transfer.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-500" />
            <h3 className="font-bold text-gray-800">Productos Más Vendidos</h3>
          </div>
          <div className="p-4">
            {topProducts.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No hay datos de ventas</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">{product.qty} uds</p>
                      <p className="text-xs text-gray-400">${product.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-amber-800">Alerta de Stock Bajo</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {lowStockProducts.map(p => (
              <div key={p.id} className="bg-white rounded-lg p-3 border border-amber-100">
                <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-amber-600">
                  Stock: {p.stock} / Mín: {p.minStock}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
