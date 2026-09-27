import React, { useState } from 'react';
import { User, Page } from '../types';
import { 
  LayoutDashboard, ShoppingCart, Package, RefreshCw, Tag, 
  History, Settings, LogOut, Menu, X, ChevronDown, Clock
} from 'lucide-react';

interface LayoutProps {
  user: User;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

import { RotateCcw } from 'lucide-react';

const navItems: { page: Page; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { page: 'pos', label: 'Punto de Venta', icon: <ShoppingCart className="w-5 h-5" /> },
  { page: 'returns', label: 'Devoluciones', icon: <RotateCcw className="w-5 h-5" /> },
  { page: 'inventory', label: 'Inventario', icon: <Package className="w-5 h-5" /> },
  { page: 'kits', label: 'Kits', icon: <Package className="w-5 h-5" /> },
  { page: 'adjustment', label: 'Ajuste Inventario', icon: <RefreshCw className="w-5 h-5" /> },
  { page: 'promotions', label: 'Promociones', icon: <Tag className="w-5 h-5" /> },
  { page: 'history', label: 'Historial Ventas', icon: <History className="w-5 h-5" /> },
  { page: 'settings', label: 'Configuraciones', icon: <Settings className="w-5 h-5" />, adminOnly: true },
];

export const Layout: React.FC<LayoutProps> = ({ user, currentPage, onNavigate, onLogout, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filteredNav = navItems.filter(item => !item.adminOnly || user.role === 'admin');

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <span className="text-lg">🏪</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">San Juditas</p>
              <p className="text-xs text-slate-400">Sistema POS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredNav.map(item => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                currentPage === item.page
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-slate-600 font-semibold text-sm">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role === 'admin' ? 'Admin' : 'Cajero'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏪</span>
                <span className="font-semibold text-slate-800">San Juditas</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {filteredNav.map(item => (
                <button
                  key={item.page}
                  onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    currentPage === item.page
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">
              {navItems.find(n => n.page === currentPage)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <span className="text-slate-600 font-semibold text-sm">{user.name.charAt(0)}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-400">@{user.username}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
