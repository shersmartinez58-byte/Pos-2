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

  const lastSales = [...tickets].reverse().slice(0, 5);

  const productSales: Record<string, { name: string; qty: number; total: number }> = {};
  tickets.forEach(t => {
    t.items.forEach(item => {
      const key = item.product.id;
      if (!productSales[key]) productSales[key] = { name: item.product.name, qty: 0, total: 0 };
      const price = item.isCase ? item.product.casePrice : item.product.unitPrice;
      productSales[key].qty += item.quantity;
      productSales[key].total += price * item.quantity;
    });
    // Include kits
    if (t.kits) {
      t.kits.forEach(item => {
        const key = `kit-${item.kit.id}`;
        if (!productSales[key]) productSales[key] = { name: `[KIT] ${item.kit.name}`, qty: 0, total: 0 };
        productSales[key].qty += item.quantity;
        productSales[key].total += item.kit.price * item.quantity;
      });
    }
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-green-100">Ventas Hoy</span>
            <DollarSign className="w-6 h-6 text-green-200" />
          </div>
          <p className="text-3xl font-bold">${todayTotal.toFixed(2)}</p>
          <p className="text-xs text-green-100 mt-2">{todayTickets.length} transacciones</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-100">Ventas Semana</span>
            <TrendingUp className="w-6 h-6 text-blue-200" />
          </div>
          <p className="text-3xl font-bold">${weekTotal.toFixed(2)}</p>
          <p className="text-xs text-blue-100 mt-2">{weekTickets.length} transacciones</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-purple-100">Artículos Hoy</span>
            <ShoppingCart className="w-6 h-6 text-purple-200" />
          </div>
          <p className="text-3xl font-bold">{todayItems}</p>
          <p className="text-xs text-purple-100 mt-2">unidades vendidas</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-amber-100">Stock Bajo</span>
            <AlertTriangle className="w-6 h-6 text-amber-200" />
          </div>
          <p className="text-3xl font-bold">{lowStockProducts.length}</p>
          <p className="text-xs text-amber-100 mt-2">productos alertados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-3 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-slate-800 text-sm">Últimas Ventas</h3>
          </div>
          <div className="p-3">
            {lastSales.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-8">No hay ventas registradas</p>
            ) : (
              <div className="space-y-2">
                {lastSales.map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <p className="text-xs font-medium text-slate-800">#{ticket.ticketNumber}</p>
                      <p className="text-[10px] text-slate-500">
                        {ticket.date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} • {ticket.items.reduce((s, i) => s + i.quantity, 0)} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-green-600">${ticket.total.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400 capitalize">
                        {ticket.paymentMethod === 'cash' ? '💵' : ticket.paymentMethod === 'card' ? '💳' : '🏦'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-3 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-slate-800 text-sm">Más Vendidos</h3>
          </div>
          <div className="p-3">
            {topProducts.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-8">No hay datos de ventas</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((product, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-slate-700">{product.name}</span>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800">{product.qty}</p>
                      <p className="text-[10px] text-slate-400">${product.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-amber-800 text-sm">Alerta de Stock Bajo</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {lowStockProducts.map(p => (
              <div key={p.id} className="bg-white rounded-lg p-2 border border-amber-100">
                <p className="text-xs font-medium text-slate-800 truncate">{p.name}</p>
                <p className="text-[10px] text-amber-600">Stock: {p.stock} / Mín: {p.minStock}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
