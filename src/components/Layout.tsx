import React, { useState } from 'react';
import { User, Page } from '../types';
import { 
  LayoutDashboard, ShoppingCart, Package, RefreshCw, Tag, 
  History, Settings, LogOut, Menu, X, ChevronDown
} from 'lucide-react';

interface LayoutProps {
  user: User;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const navItems: { page: Page; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { page: 'pos', label: 'Punto de Venta', icon: <ShoppingCart className="w-5 h-5" /> },
  { page: 'inventory', label: 'Inventario', icon: <Package className="w-5 h-5" /> },
  { page: 'adjustment', label: 'Ajuste Inventario', icon: <RefreshCw className="w-5 h-5" /> },
  { page: 'promotions', label: 'Promociones', icon: <Tag className="w-5 h-5" /> },
  { page: 'history', label: 'Historial Ventas', icon: <History className="w-5 h-5" /> },
  { page: 'settings', label: 'Configuraciones', icon: <Settings className="w-5 h-5" />, adminOnly: true },
];

export const Layout: React.FC<LayoutProps> = ({ user, currentPage, onNavigate, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filteredNav = navItems.filter(item => !item.adminOnly || user.role === 'admin');

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col transition-all duration-300 hidden md:flex`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🏪</span>
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">Depósito</p>
                <p className="text-amber-400 text-xs truncate">San Juditas</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {filteredNav.map(item => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                currentPage === item.page
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title={item.label}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏪</span>
                <span className="text-white font-bold">San Juditas</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-1">
              {filteredNav.map(item => (
                <button
                  key={item.page}
                  onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    currentPage === item.page
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
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
        <header className="bg-white border-b shadow-sm px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">
              {navItems.find(n => n.page === currentPage)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{user.name.charAt(0)}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role === 'admin' ? 'Admin' : 'Cajero'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
