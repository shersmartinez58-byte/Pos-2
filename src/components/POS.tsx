import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Product, CartItem, Ticket, Kit } from '../types';
import { Search, Trash2, Plus, Minus, ShoppingCart, CreditCard, Printer, X, Banknote, Building2, Lock, Package, User } from 'lucide-react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface POSProps {
  products: Product[];
  kits: Kit[];
  cashierName: string;
  userRole: 'admin' | 'cashier';
  adminPassword: string;
  onSaleComplete: (ticket: Ticket) => void;
  tickets: Ticket[];
}

export const POS: React.FC<POSProps> = ({ products, kits, cashierName, userRole, adminPassword, onSaleComplete, tickets }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartKits, setCartKits] = useState<{ kit: Kit; quantity: number; isOwnConsumption: boolean }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCartIndex, setSelectedCartIndex] = useState(-1);
  const [showPayment, setShowPayment] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [isOwnConsumption, setIsOwnConsumption] = useState(false);
  const [defaultIsCase, setDefaultIsCase] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const ticketCounter = useRef(tickets.length + 1);

  const getItemPrice = useCallback((product: Product, isCase: boolean, ownConsumption: boolean) => {
    if (ownConsumption) return product.ownConsumptionPrice || 0;
    return isCase ? (product.casePrice || 0) : (product.unitPrice || 0);
  }, []);

  const getKitPrice = useCallback((kit: Kit, ownConsumption: boolean) => {
    if (ownConsumption) return kit.cost || 0;
    return kit.price || 0;
  }, []);

  const subtotal = useMemo(() => {
    const productsTotal = cart.reduce((sum, item) => sum + getItemPrice(item.product, item.isCase, item.isOwnConsumption) * item.quantity, 0);
    const kitsTotal = cartKits.reduce((sum, item) => sum + getKitPrice(item.kit, item.isOwnConsumption) * item.quantity, 0);
    return productsTotal + kitsTotal;
  }, [cart, cartKits, getItemPrice, getKitPrice]);
  const tax = useMemo(() => subtotal * 0.16, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const showNotif = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  const addToCart = useCallback((product: Product, isCase: boolean) => {
    setCart(prev => {
      const existing = prev.findIndex(item => item.product.id === product.id && item.isCase === isCase);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
        return updated;
      }
      return [...prev, { product, quantity: 1, isCase, isOwnConsumption }];
    });
    const unit = isCase ? `Caja (${product.caseQty})` : 'Unidad';
    showNotif(`✓ ${product.name} (${unit})`);
  }, [showNotif, isOwnConsumption]);

  const addKitToCart = useCallback((kit: Kit) => {
    setCartKits(prev => {
      const existing = prev.findIndex(item => item.kit.id === kit.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
        return updated;
      }
      return [...prev, { kit, quantity: 1, isOwnConsumption }];
    });
    showNotif(`✓ Kit: ${kit.name}`);
  }, [showNotif, isOwnConsumption]);

  // Unified search/barcode
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    if (/^\d{8,}$/.test(value)) {
      const byUnit = products.find(p => p.barcode === value);
      const byCase = products.find(p => p.barcodeCase === value);
      if (byUnit) { addToCart(byUnit, false); setSearchTerm(''); }
      else if (byCase) { addToCart(byCase, true); setSearchTerm(''); }
    }
  }, [products, addToCart]);

  // Barcode scanner
  useEffect(() => {
    let buffer = '';
    let lastTime = 0;
    let timer: number | null = null;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.id === 'search-input') return;
      if (e.key === 'Enter' && buffer.length >= 8) {
        e.preventDefault();
        const byUnit = products.find(p => p.barcode === buffer);
        const byCase = products.find(p => p.barcodeCase === buffer);
        if (byUnit) { addToCart(byUnit, false); showNotif(`✓ ${byUnit.name}`); }
        else if (byCase) { addToCart(byCase, true); showNotif(`✓ ${byCase.name} (Caja)`); }
        else showNotif('✗ Código no encontrado');
        buffer = '';
        return;
      }
      if (e.key.length === 1 && /\d/.test(e.key)) {
        const now = Date.now();
        if (now - lastTime > 50 && buffer.length > 0) buffer = '';
        buffer += e.key;
        lastTime = now;
        if (timer) clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (buffer.length >= 8) {
            const byUnit = products.find(p => p.barcode === buffer);
            const byCase = products.find(p => p.barcodeCase === buffer);
            if (byUnit) { addToCart(byUnit, false); showNotif(`✓ ${byUnit.name}`); }
            else if (byCase) { addToCart(byCase, true); showNotif(`✓ ${byCase.name} (Caja)`); }
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
    if (qty <= 0) setCart(prev => prev.filter((_, i) => i !== index));
    else setCart(prev => { const u = [...prev]; u[index] = { ...u[index], quantity: qty }; return u; });
  }, []);

  const removeItem = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    setSelectedCartIndex(-1);
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCartKits([]);
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
      kits: [...cartKits],
      subtotal, discount: 0, tax, total,
      paymentMethod, amountPaid: paid,
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
    setCartKits([]);
    setSelectedCartIndex(-1);
    setIsOwnConsumption(false);
  }, [cart, subtotal, tax, total, paymentMethod, amountPaid, cashierName, onSaleComplete, isOwnConsumption]);

  const handleToggleOwnConsumption = useCallback(() => {
    if (userRole === 'admin') {
      setIsOwnConsumption(!isOwnConsumption);
      showNotif(isOwnConsumption ? 'Precio normal' : '🏠 Consumo propio');
    } else {
      setShowAdminAuth(true);
    }
  }, [userRole, isOwnConsumption, showNotif]);

  const handleAdminAuth = useCallback(() => {
    if (adminPassInput === adminPassword) {
      setIsOwnConsumption(!isOwnConsumption);
      setShowAdminAuth(false);
      setAdminPassInput('');
      showNotif(isOwnConsumption ? 'Precio normal' : '🏠 Consumo propio');
    } else {
      showNotif('✗ Contraseña incorrecta');
      setAdminPassInput('');
    }
  }, [adminPassInput, adminPassword, isOwnConsumption, showNotif]);

  const printTicket = useCallback((ticket?: Ticket) => {
    const t = ticket || lastTicket;
    if (!t) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const itemsHtml = t.items.map(i => `<div class="r"><span>${i.product.name}${i.isCase ? ' (Caja)' : ''}</span><span>${i.quantity}x$${getItemPrice(i.product, i.isCase, i.isOwnConsumption).toFixed(2)}</span></div>`).join('');
    const kitsHtml = t.kits ? t.kits.map(k => `<div class="r"><span>[KIT] ${k.kit.name}</span><span>${k.quantity}x$${getKitPrice(k.kit, k.isOwnConsumption).toFixed(2)}</span></div>`).join('') : '';
    w.document.write(`<!DOCTYPE html><html><head><title>Ticket</title><style>body{font-family:monospace;font-size:11px;width:200px;margin:0 auto;padding:5px}.c{text-align:center}.b{font-weight:bold}.l{border-top:1px dashed #000;margin:3px 0}.r{display:flex;justify-content:space-between;font-size:10px}</style></head><body><div class="c"><p class="b" style="font-size:14px">DEPÓSITO SAN JUDITAS</p><p>Ticket #${t.ticketNumber}</p><p>${t.date.toLocaleString('es-MX')}</p><p>Cajero: ${t.cashier}</p>${t.isOwnConsumption ? '<p class="b">CONSUMO PROPIO</p>' : ''}</div><div class="l"></div>${itemsHtml}${kitsHtml}<div class="l"></div><div class="r"><span>Subtotal:</span><span>$${t.subtotal.toFixed(2)}</span></div><div class="r"><span>IVA:</span><span>$${t.tax.toFixed(2)}</span></div><div class="l"></div><div class="r b"><span>TOTAL:</span><span>$${t.total.toFixed(2)}</span></div><div class="r"><span>Pago:</span><span>$${t.amountPaid.toFixed(2)}</span></div>${t.paymentMethod === 'cash' ? `<div class="r b"><span>Cambio:</span><span>$${t.change.toFixed(2)}</span></div>` : ''}<div class="l"></div><div class="c"><p class="b">¡GRACIAS!</p></div><script>print();close();</script></body></html>`);
    w.document.close();
  }, [lastTicket, getItemPrice, getKitPrice]);

  useKeyboardShortcuts([
    { key: 'f2', action: () => searchRef.current?.focus() },
    { key: 'f5', action: handleCheckout },
    { key: 'f6', action: clearCart },
    { key: 'f7', action: () => printTicket() },
    { key: 'f12', action: () => { clearCart(); setSearchTerm(''); } },
    { key: 'Escape', action: () => { setShowPayment(false); setShowTicket(false); setShowAdminAuth(false); } },
    { key: '+', action: () => { if (selectedCartIndex >= 0) updateQuantity(selectedCartIndex, cart[selectedCartIndex].quantity + 1); } },
    { key: '-', action: () => { if (selectedCartIndex >= 0) updateQuantity(selectedCartIndex, cart[selectedCartIndex].quantity - 1); } },
    { key: 'Delete', action: () => { if (selectedCartIndex >= 0) removeItem(selectedCartIndex); } },
    { key: '1', alt: true, action: () => setPaymentMethod('cash') },
    { key: '2', alt: true, action: () => setPaymentMethod('card') },
    { key: '3', alt: true, action: () => setPaymentMethod('transfer') },
  ]);

  const filteredProducts = products.filter(p =>
    !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm) || (p.barcodeCase && p.barcodeCase.includes(searchTerm))
  );

  const change = Math.max(0, parseFloat(amountPaid || '0') - total);
  const quickAmounts = [Math.ceil(total), Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4);

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
        {/* Search */}
        <div className="p-3 bg-white border-b border-slate-200 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchRef}
              id="search-input"
              type="text"
              placeholder="Buscar producto o escanear código..."
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              autoFocus
            />
          </div>
          {/* Default sale mode */}
          <div className="flex gap-2">
            <button
              onClick={() => setDefaultIsCase(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${!defaultIsCase ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <User className="w-3 h-3 inline mr-1" />Unidad
            </button>
            <button
              onClick={() => setDefaultIsCase(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${defaultIsCase ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <Package className="w-3 h-3 inline mr-1" />Caja
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {filteredProducts.map(product => {
              // Buscar si este producto está en algún kit activo
              const productKits = kits.filter(kit => 
                kit.active && kit.items.some(item => item.productId === product.id)
              );
              const hasKit = productKits.length > 0;
              
              return (
                <div key={product.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all group">
                  <div className="p-2 text-center">
                    <p className="text-[11px] font-medium text-slate-800 truncate leading-tight">{product.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Stock: {product.stock || 0}</p>
                  </div>
                  <div className={`border-t border-slate-100 grid ${hasKit ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <button
                      onClick={() => addToCart(product, false)}
                      className={`py-1.5 text-[10px] font-medium transition-colors ${!defaultIsCase && !hasKit ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                    >
                      <div>Unidad</div>
                      <div className="font-bold">${(product.unitPrice || 0).toFixed(2)}</div>
                    </button>
                    {(product.caseQty || 0) > 1 && (
                      <button
                        onClick={() => addToCart(product, true)}
                        className={`py-1.5 text-[10px] font-medium transition-colors border-l border-slate-100 ${defaultIsCase && !hasKit ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                      >
                        <div>Caja ({product.caseQty})</div>
                        <div className="font-bold">${(product.casePrice || 0).toFixed(2)}</div>
                      </button>
                    )}
                    {hasKit && (
                      <button
                        onClick={() => addKitToCart(productKits[0])}
                        className={`py-1.5 text-[10px] font-medium transition-colors border-l border-slate-100 bg-purple-50 text-purple-700 hover:bg-purple-100`}
                      >
                        <div>Kit</div>
                        <div className="font-bold">${(productKits[0].price || 0).toFixed(2)}</div>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full md:w-80 flex flex-col bg-white border-l border-slate-200">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-slate-800 text-sm">Carrito</span>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button onClick={clearCart} className="text-[10px] text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50">
            Limpiar
          </button>
        </div>

        {/* Own Consumption Toggle */}
        <div className="p-2 border-b border-slate-100 bg-slate-50">
          <button
            onClick={handleToggleOwnConsumption}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all text-xs ${
              isOwnConsumption ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              <span className="font-medium">Consumo Propio</span>
            </div>
            <div className={`w-8 h-4 rounded-full transition-colors ${isOwnConsumption ? 'bg-amber-500' : 'bg-slate-300'}`}>
              <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${isOwnConsumption ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 && cartKits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-xs">Carrito vacío</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {/* Products */}
              {cart.map((item, index) => (
                <div
                  key={`p-${item.product.id}-${item.isCase}`}
                  onClick={() => setSelectedCartIndex(index)}
                  className={`p-2.5 cursor-pointer transition-colors ${selectedCartIndex === index ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.isCase ? `Caja (${item.product.caseQty})` : 'Unidad'} • ${getItemPrice(item.product, item.isCase, item.isOwnConsumption).toFixed(2)}
                        {item.isOwnConsumption && <span className="ml-1 text-amber-600 font-medium">(Consumo)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); updateQuantity(index, item.quantity - 1); }} className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200">
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-semibold">{item.quantity}</span>
                      <button onClick={e => { e.stopPropagation(); updateQuantity(index, item.quantity + 1); }} className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200">
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); removeItem(index); }} className="w-5 h-5 flex items-center justify-center rounded text-red-400 hover:bg-red-50 ml-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs font-bold text-slate-900">
                      ${(getItemPrice(item.product, item.isCase, item.isOwnConsumption) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              {/* Kits */}
              {cartKits.map((item, index) => (
                <div
                  key={`k-${item.kit.id}`}
                  className="p-2.5 bg-purple-50"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-purple-800 truncate">Kit: {item.kit.name}</p>
                      <p className="text-[10px] text-purple-600">
                        ${getKitPrice(item.kit, item.isOwnConsumption).toFixed(2)}
                        {item.isOwnConsumption && <span className="ml-1 font-medium">(Consumo)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCartKits(prev => { const u = [...prev]; u[index] = { ...u[index], quantity: u[index].quantity - 1 }; return u.filter(i => i.quantity > 0); })} className="w-5 h-5 flex items-center justify-center rounded bg-purple-100 hover:bg-purple-200">
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-semibold">{item.quantity}</span>
                      <button onClick={() => setCartKits(prev => { const u = [...prev]; u[index] = { ...u[index], quantity: u[index].quantity + 1 }; return u; })} className="w-5 h-5 flex items-center justify-center rounded bg-purple-100 hover:bg-purple-200">
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                      <button onClick={() => setCartKits(prev => prev.filter((_, i) => i !== index))} className="w-5 h-5 flex items-center justify-center rounded text-red-400 hover:bg-red-50 ml-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-xs font-bold text-purple-900">
                      ${(getKitPrice(item.kit, item.isOwnConsumption) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-slate-200 p-3 bg-slate-50">
          <div className="space-y-1 mb-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>IVA (16%):</span><span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>Total:</span><span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <CreditCard className="w-4 h-4" /> Cobrar (F5)
          </button>
        </div>
      </div>

      {/* Admin Auth Modal */}
      {showAdminAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdminAuth(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 text-center">Autorización Requerida</h2>
              <p className="text-xs text-slate-500 text-center mt-1">Contraseña del administrador</p>
            </div>
            <div className="p-5">
              <input
                type="password"
                value={adminPassInput}
                onChange={e => setAdminPassInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdminAuth(); }}
                placeholder="Contraseña"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button onClick={() => setShowAdminAuth(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg">Cancelar</button>
                <button onClick={handleAdminAuth} className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg">Autorizar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPayment(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">💰 Cobrar</h2>
              <button onClick={() => setShowPayment(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 bg-slate-50 text-center">
              <p className="text-xs text-slate-500">Total a cobrar</p>
              <p className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setPaymentMethod('cash')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${paymentMethod === 'cash' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}>
                  <Banknote className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Efectivo</span>
                </button>
                <button onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${paymentMethod === 'card' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}>
                  <CreditCard className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Tarjeta</span>
                </button>
                <button onClick={() => setPaymentMethod('transfer')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${paymentMethod === 'transfer' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}>
                  <Building2 className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium">Transfer.</span>
                </button>
              </div>
              {paymentMethod === 'cash' && (
                <div className="space-y-2">
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handlePaymentConfirm(); }}
                    className="w-full px-3 py-2 text-xl font-bold text-center bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    step="0.01"
                    autoFocus
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {quickAmounts.map(a => (
                      <button key={a} onClick={() => setAmountPaid(a.toFixed(2))} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium">
                        ${a}
                      </button>
                    ))}
                    <button onClick={() => setAmountPaid(total.toFixed(2))} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium">Exacto</button>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${change > 0 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <p className="text-xs text-slate-600">Cambio:</p>
                    <p className={`text-2xl font-bold ${change > 0 ? 'text-green-600' : 'text-amber-600'}`}>${change.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200">
              <button onClick={handlePaymentConfirm} disabled={paymentMethod === 'cash' && parseFloat(amountPaid) < total} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium rounded-lg">
                Confirmar Pago ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicket && lastTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTicket(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">✓ Venta Exitosa</h2>
              <button onClick={() => setShowTicket(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 font-mono text-[10px]">
                <div className="text-center border-b border-dashed border-slate-300 pb-2 mb-2">
                  <p className="font-bold text-xs">DEPÓSITO SAN JUDITAS</p>
                  <p className="text-slate-500">#{lastTicket.ticketNumber}</p>
                  <p className="text-slate-500">{lastTicket.date.toLocaleString('es-MX')}</p>
                  <p className="text-slate-500">Cajero: {lastTicket.cashier}</p>
                  {lastTicket.isOwnConsumption && <p className="font-bold text-amber-600 mt-1">🏠 CONSUMO PROPIO</p>}
                </div>
                {lastTicket.items.map((item, i) => (
                  <div key={`i-${i}`} className="flex justify-between py-0.5">
                    <span className="truncate pr-1">{item.product.name}{item.isCase ? ' (Caja)' : ''}</span>
                    <span>{item.quantity}x${getItemPrice(item.product, item.isCase, item.isOwnConsumption).toFixed(2)}</span>
                  </div>
                ))}
                {lastTicket.kits && lastTicket.kits.map((item, i) => (
                  <div key={`k-${i}`} className="flex justify-between py-0.5 text-purple-700">
                    <span className="truncate pr-1">[KIT] {item.kit.name}</span>
                    <span>{item.quantity}x${getKitPrice(item.kit, item.isOwnConsumption).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-dashed border-slate-300 pt-1 mt-1 space-y-0.5">
                  <div className="flex justify-between"><span>Subtotal:</span><span>${lastTicket.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>IVA:</span><span>${lastTicket.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold border-t border-dashed border-slate-300 pt-1 mt-1">
                    <span>TOTAL:</span><span>${lastTicket.total.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-center mt-2 font-bold">¡GRACIAS!</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex gap-2">
              <button onClick={() => printTicket()} className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5">
                <Printer className="w-3.5 h-3.5" />Imprimir
              </button>
              <button onClick={() => setShowTicket(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg">Nueva Venta</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-xs font-medium">{notification}</div>
        </div>
      )}
    </div>
  );
};
