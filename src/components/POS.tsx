import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Product, CartItem, Ticket, User } from '../types';
import { Search, Trash2, Plus, Minus, ShoppingCart, CreditCard, Printer, X, Banknote, Building2, Lock } from 'lucide-react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface POSProps {
  products: Product[];
  cashierName: string;
  userRole: 'admin' | 'cashier';
  adminPassword: string;
  onSaleComplete: (ticket: Ticket) => void;
  tickets: Ticket[];
}

export const POS: React.FC<POSProps> = ({ products, cashierName, userRole, adminPassword, onSaleComplete, tickets }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCartIndex, setSelectedCartIndex] = useState(-1);
  const [showPayment, setShowPayment] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [isOwnConsumption, setIsOwnConsumption] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const ticketCounter = useRef(tickets.length + 1);

  const categories = useMemo(() => ['Todos', ...new Set(products.map(p => p.category))], [products]);

  const getItemPrice = useCallback((product: Product, ownConsumption: boolean) => {
    return ownConsumption ? product.ownConsumptionPrice : product.price;
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + getItemPrice(item.product, item.isOwnConsumption) * item.quantity, 0), [cart, getItemPrice]);
  const tax = useMemo(() => subtotal * 0.16, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const showNotif = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.findIndex(item => item.product.id === product.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
        return updated;
      }
      return [...prev, { product, quantity: 1, isOwnConsumption }];
    });
    showNotif(`✓ ${product.name} agregado`);
  }, [showNotif, isOwnConsumption]);

  // Unified search/barcode detection
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    // If it looks like a barcode (all numbers, 8+ digits), try to find product
    if (/^\d{8,}$/.test(value)) {
      const product = products.find(p => p.barcode === value);
      if (product) {
        addToCart(product);
        setSearchTerm('');
      }
    }
  }, [products, addToCart]);

  // Barcode scanner detection (fast input)
  useEffect(() => {
    let buffer = '';
    let lastTime = 0;
    let timer: number | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === 'search-input') return; // Don't interfere with search

      if (e.key === 'Enter' && buffer.length >= 8) {
        e.preventDefault();
        const product = products.find(p => p.barcode === buffer);
        if (product) {
          addToCart(product);
          showNotif(`✓ ${product.name} agregado`);
        } else {
          showNotif(`✗ Código no encontrado`);
        }
        buffer = '';
        return;
      }

      if (e.key.length === 1 && /\d/.test(e.key)) {
        const now = Date.now();
        if (now - lastTime > 50 && buffer.length > 0) {
          buffer = '';
        }
        buffer += e.key;
        lastTime = now;
        if (timer) clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (buffer.length >= 8) {
            const product = products.find(p => p.barcode === buffer);
            if (product) {
              addToCart(product);
              showNotif(`✓ ${product.name} agregado`);
            }
          }
          buffer = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, [products, addToCart, showNotif]);

  const updateQuantity = useCallback((index: number, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter((_, i) => i !== index));
    } else {
      setCart(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], quantity: qty };
        return updated;
      });
    }
  }, []);

  const removeItem = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    setSelectedCartIndex(-1);
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCartIndex(-1);
    setIsOwnConsumption(false);
    showNotif('Carrito limpiado');
  }, [showNotif]);

  const handleCheckout = useCallback(() => {
    if (cart.length > 0) {
      setShowPayment(true);
      setAmountPaid(total.toFixed(2));
      setPaymentMethod('cash');
    }
  }, [cart.length, total]);

  const handlePaymentConfirm = useCallback(() => {
    const paid = paymentMethod === 'cash' ? parseFloat(amountPaid) || 0 : total;
    if (paymentMethod === 'cash' && paid < total) return;

    const ticket: Ticket = {
      id: Date.now().toString(),
      items: [...cart],
      subtotal,
      discount: 0,
      tax,
      total,
      paymentMethod,
      amountPaid: paid,
      change: paymentMethod === 'cash' ? paid - total : 0,
      date: new Date(),
      ticketNumber: String(ticketCounter.current++).padStart(6, '0'),
      cashier: cashierName,
      isOwnConsumption,
    };

    onSaleComplete(ticket);
    setLastTicket(ticket);
    setShowPayment(false);
    setShowTicket(true);
    setCart([]);
    setSelectedCartIndex(-1);
    setIsOwnConsumption(false);
  }, [cart, subtotal, tax, total, paymentMethod, amountPaid, cashierName, onSaleComplete, isOwnConsumption]);

  const handleToggleOwnConsumption = useCallback(() => {
    if (userRole === 'admin') {
      setIsOwnConsumption(!isOwnConsumption);
      showNotif(isOwnConsumption ? 'Precio normal activado' : 'Precio consumo propio activado');
    } else {
      setShowAdminAuth(true);
    }
  }, [userRole, isOwnConsumption, showNotif]);

  const handleAdminAuth = useCallback(() => {
    if (adminPassInput === adminPassword) {
      setIsOwnConsumption(!isOwnConsumption);
      setShowAdminAuth(false);
      setAdminPassInput('');
      showNotif(isOwnConsumption ? 'Precio normal activado' : 'Precio consumo propio activado');
    } else {
      showNotif('Contraseña incorrecta');
      setAdminPassInput('');
    }
  }, [adminPassInput, adminPassword, isOwnConsumption, showNotif]);

  const printTicket = useCallback((ticket?: Ticket) => {
    const t = ticket || lastTicket;
    if (!t) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Ticket</title><style>body{font-family:monospace;font-size:11px;width:200px;margin:0 auto;padding:5px}.c{text-align:center}.b{font-weight:bold}.l{border-top:1px dashed #000;margin:3px 0}.r{display:flex;justify-content:space-between;font-size:10px}</style></head><body><div class="c"><p class="b" style="font-size:14px">DEPÓSITO SAN JUDITAS</p><p>Ticket #${t.ticketNumber}</p><p>${t.date.toLocaleString('es-MX')}</p><p>Cajero: ${t.cashier}</p>${t.isOwnConsumption ? '<p class="b">CONSUMO PROPIO</p>' : ''}</div><div class="l"></div>${t.items.map(i => `<div class="r"><span>${i.product.name}</span><span>${i.quantity}x$${getItemPrice(i.product, i.isOwnConsumption).toFixed(2)}</span></div>`).join('')}<div class="l"></div><div class="r"><span>Subtotal:</span><span>$${t.subtotal.toFixed(2)}</span></div><div class="r"><span>IVA:</span><span>$${t.tax.toFixed(2)}</span></div><div class="l"></div><div class="r b"><span>TOTAL:</span><span>$${t.total.toFixed(2)}</span></div><div class="r"><span>Pago:</span><span>$${t.amountPaid.toFixed(2)}</span></div>${t.paymentMethod === 'cash' ? `<div class="r b"><span>Cambio:</span><span>$${t.change.toFixed(2)}</span></div>` : ''}<div class="l"></div><div class="c"><p class="b">¡GRACIAS!</p></div><script>print();close();</script></body></html>`);
    w.document.close();
  }, [lastTicket, getItemPrice]);

  useKeyboardShortcuts([
    { key: 'f2', action: () => searchRef.current?.focus() },
    { key: 'f5', action: handleCheckout },
    { key: 'f6', action: clearCart },
    { key: 'f7', action: () => printTicket() },
    { key: 'f12', action: () => { clearCart(); setSearchTerm(''); } },
    { key: 'Escape', action: () => { setShowPayment(false); setShowTicket(false); setShowHelp(false); setShowAdminAuth(false); } },
    { key: '+', action: () => { if (selectedCartIndex >= 0) updateQuantity(selectedCartIndex, cart[selectedCartIndex].quantity + 1); } },
    { key: '-', action: () => { if (selectedCartIndex >= 0) updateQuantity(selectedCartIndex, cart[selectedCartIndex].quantity - 1); } },
    { key: 'Delete', action: () => { if (selectedCartIndex >= 0) removeItem(selectedCartIndex); } },
    { key: '1', alt: true, action: () => setPaymentMethod('cash') },
    { key: '2', alt: true, action: () => setPaymentMethod('card') },
    { key: '3', alt: true, action: () => setPaymentMethod('transfer') },
  ]);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
    return matchCat && matchSearch;
  });

  const change = Math.max(0, parseFloat(amountPaid || '0') - total);
  const quickAmounts = [Math.ceil(total), Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4);

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={searchRef}
              id="search-input"
              type="text"
              placeholder="Buscar por nombre o escanear código de barras..."
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all text-left group"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-200 transition-colors">
                  <span className="text-2xl">
                    {product.category === 'Bebidas' ? '🥤' :
                     product.category === 'Botanas' ? '🍿' :
                     product.category === 'Dulces' ? '🍬' :
                     product.category === 'Panadería' ? '🍞' :
                     product.category === 'Lácteos' ? '🥛' : '📦'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-800 truncate mb-1">{product.name}</p>
                <p className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-1">Stock: {product.stock}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full md:w-96 flex flex-col bg-white border-l border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-800">Carrito</span>
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
            Limpiar
          </button>
        </div>

        {/* Own Consumption Toggle */}
        <div className="p-3 border-b border-slate-100 bg-slate-50">
          <button
            onClick={handleToggleOwnConsumption}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border transition-all ${
              isOwnConsumption
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Consumo Propio</span>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors ${isOwnConsumption ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform mt-1 ${isOwnConsumption ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4">
              <ShoppingCart className="w-16 h-16 mb-3 opacity-20" />
              <p className="text-sm">Carrito vacío</p>
              <p className="text-xs mt-1">Busca o escanea productos</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map((item, index) => (
                <div
                  key={item.product.id}
                  onClick={() => setSelectedCartIndex(index)}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedCartIndex === index ? 'bg-slate-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.product.name}</p>
                      <p className="text-xs text-slate-500">
                        ${getItemPrice(item.product, item.isOwnConsumption).toFixed(2)} c/u
                        {item.isOwnConsumption && <span className="ml-1 text-amber-600 font-medium">(Consumo)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={e => { e.stopPropagation(); updateQuantity(index, item.quantity - 1); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={e => { e.stopPropagation(); updateQuantity(index, item.quantity + 1); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); removeItem(index); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      ${(getItemPrice(item.product, item.isOwnConsumption) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>IVA (16%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            Cobrar (F5)
          </button>
        </div>
      </div>

      {/* Admin Auth Modal */}
      {showAdminAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdminAuth(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 text-center">Autorización Requerida</h2>
              <p className="text-sm text-slate-500 text-center mt-1">Ingresa la contraseña del administrador</p>
            </div>
            <div className="p-6">
              <input
                type="password"
                value={adminPassInput}
                onChange={e => setAdminPassInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdminAuth(); }}
                placeholder="Contraseña"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowAdminAuth(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
                  Cancelar
                </button>
                <button onClick={handleAdminAuth} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors">
                  Autorizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPayment(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Cobrar</h2>
              <button onClick={() => setShowPayment(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-50 text-center">
              <p className="text-sm text-slate-500">Total a cobrar</p>
              <p className="text-4xl font-bold text-slate-900 mt-1">${total.toFixed(2)}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'cash' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Banknote className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">Efectivo</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'card' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">Tarjeta</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('transfer')}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'transfer' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">Transfer.</span>
                </button>
              </div>
              {paymentMethod === 'cash' && (
                <div className="space-y-3">
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handlePaymentConfirm(); }}
                    className="w-full px-4 py-3 text-2xl font-bold text-center bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    step="0.01"
                    autoFocus
                  />
                  <div className="flex gap-2 flex-wrap">
                    {quickAmounts.map(a => (
                      <button key={a} onClick={() => setAmountPaid(a.toFixed(2))} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
                        ${a}
                      </button>
                    ))}
                    <button onClick={() => setAmountPaid(total.toFixed(2))} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors">
                      Exacto
                    </button>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${change > 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <p className="text-sm text-slate-600">Cambio:</p>
                    <p className={`text-3xl font-bold ${change > 0 ? 'text-green-600' : 'text-amber-600'}`}>${change.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={handlePaymentConfirm}
                disabled={paymentMethod === 'cash' && parseFloat(amountPaid) < total}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-xl transition-colors"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicket && lastTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTicket(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">✓ Venta Exitosa</h2>
              <button onClick={() => setShowTicket(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 font-mono text-xs">
                <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-3">
                  <p className="font-bold text-sm">DEPÓSITO SAN JUDITAS</p>
                  <p className="text-slate-500 mt-1">Ticket #{lastTicket.ticketNumber}</p>
                  <p className="text-slate-500">{lastTicket.date.toLocaleString('es-MX')}</p>
                  <p className="text-slate-500">Cajero: {lastTicket.cashier}</p>
                  {lastTicket.isOwnConsumption && <p className="font-bold text-amber-600 mt-1">CONSUMO PROPIO</p>}
                </div>
                {lastTicket.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-0.5">
                    <span className="truncate pr-2">{item.product.name}</span>
                    <span>{item.quantity}x${getItemPrice(item.product, item.isOwnConsumption).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-dashed border-slate-300 pt-2 mt-2 space-y-0.5">
                  <div className="flex justify-between"><span>Subtotal:</span><span>${lastTicket.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>IVA:</span><span>${lastTicket.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold border-t border-dashed border-slate-300 pt-1 mt-1">
                    <span>TOTAL:</span><span>${lastTicket.total.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-center mt-3 font-bold">¡GRACIAS!</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button onClick={() => printTicket()} className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button onClick={() => setShowTicket(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium">
            {notification}
          </div>
        </div>
      )}
    </div>
  );
};
