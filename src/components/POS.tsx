import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Product, CartItem, Ticket, UnitType, Promotion } from '../types';
import { Search, ScanBarcode, Trash2, Plus, Minus, ShoppingCart, CreditCard, Printer, X, Banknote, Building2, Keyboard } from 'lucide-react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface POSProps {
  products: Product[];
  promotions: Promotion[];
  cashierName: string;
  onSaleComplete: (ticket: Ticket) => void;
  tickets: Ticket[];
}

export const POS: React.FC<POSProps> = ({ products, promotions, cashierName, onSaleComplete, tickets }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [selectedCartIndex, setSelectedCartIndex] = useState(-1);
  const [showPayment, setShowPayment] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const barcodeRef = useRef<HTMLInputElement>(null);
  const ticketCounter = useRef(tickets.length + 1);

  const categories = useMemo(() => ['Todos', ...new Set(products.map(p => p.category))], [products]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.unit.price * item.quantity, 0), [cart]);
  const discount = useMemo(() => {
    let d = 0;
    promotions.filter(p => p.active).forEach(promo => {
      if (promo.type === 'percentage') d += subtotal * (promo.value / 100);
      else if (promo.type === 'fixed') d += promo.value;
    });
    return Math.min(d, subtotal);
  }, [subtotal, promotions]);
  const tax = useMemo(() => (subtotal - discount) * 0.16, [subtotal, discount]);
  const total = useMemo(() => subtotal - discount + tax, [subtotal, discount, tax]);

  const showNotif = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  const addToCart = useCallback((product: Product, unit?: UnitType) => {
    const u = unit || product.units[0];
    setCart(prev => {
      const existing = prev.findIndex(item => item.product.id === product.id && item.unit.id === u.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
        return updated;
      }
      return [...prev, { product, unit: u, quantity: 1 }];
    });
    showNotif(`✅ ${product.name} (${u.name}) agregado`);
  }, [showNotif]);

  const handleBarcodeScan = useCallback((barcode: string) => {
    for (const product of products) {
      const unit = product.units.find(u => u.barcode === barcode);
      if (unit) {
        addToCart(product, unit);
        setBarcodeValue('');
        return;
      }
      if (product.barcode === barcode) {
        addToCart(product);
        setBarcodeValue('');
        return;
      }
    }
    showNotif(`❌ No encontrado: ${barcode}`);
    setBarcodeValue('');
  }, [products, addToCart, showNotif]);

  // Barcode scanner detection
  useEffect(() => {
    let buffer = '';
    let lastTime = 0;
    let timer: number | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (target.id !== 'barcode-input') return;
      }

      if (e.key === 'Enter' && buffer.length >= 4) {
        e.preventDefault();
        handleBarcodeScan(buffer);
        buffer = '';
        return;
      }

      if (e.key.length === 1 && /[a-zA-Z0-9\-]/.test(e.key)) {
        const now = Date.now();
        if (now - lastTime > 50 && buffer.length > 0) {
          buffer = '';
        }
        buffer += e.key;
        lastTime = now;
        if (timer) clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (buffer.length >= 4) handleBarcodeScan(buffer);
          buffer = '';
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timer) clearTimeout(timer);
    };
  }, [handleBarcodeScan]);

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
    showNotif('🗑️ Carrito limpiado');
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
      discount,
      tax,
      total,
      paymentMethod,
      amountPaid: paid,
      change: paymentMethod === 'cash' ? paid - total : 0,
      date: new Date(),
      ticketNumber: String(ticketCounter.current++).padStart(6, '0'),
      cashier: cashierName,
    };

    onSaleComplete(ticket);
    setLastTicket(ticket);
    setShowPayment(false);
    setShowTicket(true);
    setCart([]);
    setSelectedCartIndex(-1);
  }, [cart, subtotal, discount, tax, total, paymentMethod, amountPaid, cashierName, onSaleComplete]);

  const printTicket = useCallback((ticket?: Ticket) => {
    const t = ticket || lastTicket;
    if (!t) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Ticket</title><style>body{font-family:monospace;font-size:11px;width:200px;margin:0 auto;padding:5px}.c{text-align:center}.b{font-weight:bold}.l{border-top:1px dashed #000;margin:3px 0}.r{display:flex;justify-content:space-between;font-size:10px}</style></head><body><div class="c"><p class="b" style="font-size:14px">DEPÓSITO SAN JUDITAS</p><p>RFC: XAXX010101000</p><p>Ticket #${t.ticketNumber}</p><p>${t.date.toLocaleString('es-MX')}</p><p>Cajero: ${t.cashier}</p></div><div class="l"></div>${t.items.map(i => `<div class="r"><span>${i.product.name} (${i.unit.name})</span><span>${i.quantity}x$${i.unit.price.toFixed(2)}</span></div>`).join('')}<div class="l"></div><div class="r"><span>Subtotal:</span><span>$${t.subtotal.toFixed(2)}</span></div>${t.discount > 0 ? `<div class="r"><span>Descuento:</span><span>-$${t.discount.toFixed(2)}</span></div>` : ''}<div class="r"><span>IVA:</span><span>$${t.tax.toFixed(2)}</span></div><div class="l"></div><div class="r b"><span>TOTAL:</span><span>$${t.total.toFixed(2)}</span></div><div class="r"><span>Pago:</span><span>$${t.amountPaid.toFixed(2)}</span></div>${t.paymentMethod === 'cash' ? `<div class="r b"><span>Cambio:</span><span>$${t.change.toFixed(2)}</span></div>` : ''}<div class="l"></div><div class="c"><p class="b">¡GRACIAS POR SU COMPRA!</p></div><script>print();close();</script></body></html>`);
    w.document.close();
  }, [lastTicket]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'f2', action: () => document.getElementById('search-input')?.focus() },
    { key: 'f3', action: () => { setBarcodeValue(''); barcodeRef.current?.focus(); } },
    { key: 'f5', action: handleCheckout },
    { key: 'f6', action: clearCart },
    { key: 'f7', action: () => printTicket() },
    { key: 'f12', action: () => { clearCart(); setSearchTerm(''); } },
    { key: 'Escape', action: () => { setShowPayment(false); setShowTicket(false); setShowHelp(false); } },
    { key: '+', action: () => { if (selectedCartIndex >= 0) updateQuantity(selectedCartIndex, cart[selectedCartIndex].quantity + 1); } },
    { key: '-', action: () => { if (selectedCartIndex >= 0) updateQuantity(selectedCartIndex, cart[selectedCartIndex].quantity - 1); } },
    { key: 'Delete', action: () => { if (selectedCartIndex >= 0) removeItem(selectedCartIndex); } },
    { key: '1', alt: true, action: () => setPaymentMethod('cash') },
    { key: '2', alt: true, action: () => setPaymentMethod('card') },
    { key: '3', alt: true, action: () => setPaymentMethod('transfer') },
  ]);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm);
    return matchCat && matchSearch;
  });

  const change = Math.max(0, parseFloat(amountPaid || '0') - total);
  const quickAmounts = [Math.ceil(total), Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4);

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col min-w-0 border-r">
        {/* Search Bar */}
        <div className="p-3 bg-gray-50 border-b space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="search-input" type="text" placeholder="Buscar... (F2)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1 relative">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input ref={barcodeRef} id="barcode-input" type="text" placeholder="Escanear código (F3)" value={barcodeValue} onChange={e => setBarcodeValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeScan(barcodeValue); } }} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500" autoFocus />
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {filteredProducts.map(product => {
              const currentUnit = selectedUnit[product.id] || product.units[0].id;
              const unit = product.units.find(u => u.id === currentUnit) || product.units[0];
              return (
                <div key={product.id} className="bg-white border rounded-lg p-3 hover:shadow-md transition-all group">
                  <button onClick={() => addToCart(product, unit)} className="w-full text-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg">{product.category === 'Bebidas' ? '🥤' : product.category === 'Botanas' ? '🍿' : product.category === 'Dulces' ? '🍬' : product.category === 'Panadería' ? '🍞' : product.category === 'Lácteos' ? '🥛' : '📦'}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-sm font-bold text-blue-600 mt-1">${unit.price.toFixed(2)}</p>
                  </button>
                  {product.units.length > 1 && (
                    <div className="mt-2 flex gap-1 flex-wrap justify-center">
                      {product.units.map(u => (
                        <button key={u.id} onClick={() => setSelectedUnit(prev => ({ ...prev, [product.id]: u.id }))} className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${currentUnit === u.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {u.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 text-center mt-1">Stock: {product.stock}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white border-l">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-800">Carrito</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
          </div>
          <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50">Limpiar (F6)</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">Carrito vacío</p>
            </div>
          ) : (
            <div className="divide-y">
              {cart.map((item, index) => (
                <div key={`${item.product.id}-${item.unit.id}`} onClick={() => setSelectedCartIndex(index)} className={`p-3 cursor-pointer transition-colors ${selectedCartIndex === index ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.unit.name} • ${item.unit.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={e => { e.stopPropagation(); updateQuantity(index, item.quantity - 1); }} className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={e => { e.stopPropagation(); updateQuantity(index, item.quantity + 1); }} className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300"><Plus className="w-3 h-3" /></button>
                      <button onClick={e => { e.stopPropagation(); removeItem(index); }} className="w-6 h-6 flex items-center justify-center rounded text-red-400 hover:bg-red-100"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="text-right mt-1"><span className="text-sm font-bold">${(item.unit.price * item.quantity).toFixed(2)}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t bg-gray-50 p-3 space-y-1">
          <div className="flex justify-between text-sm text-gray-600"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Descuento:</span><span>-${discount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-sm text-gray-600"><span>IVA (16%):</span><span>${tax.toFixed(2)}</span></div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-1 border-t"><span>Total:</span><span className="text-blue-600">${total.toFixed(2)}</span></div>
          <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full mt-2 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg">
            <CreditCard className="w-5 h-5" /> Cobrar (F5)
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPayment(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">💰 Cobrar</h2>
              <button onClick={() => setShowPayment(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 bg-blue-50 text-center">
              <p className="text-sm text-blue-600">Total a cobrar</p>
              <p className="text-4xl font-bold text-blue-800">${total.toFixed(2)}</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setPaymentMethod('cash')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${paymentMethod === 'cash' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                  <Banknote className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Efectivo (Alt+1)</span>
                </button>
                <button onClick={() => setPaymentMethod('card')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${paymentMethod === 'card' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                  <CreditCard className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Tarjeta (Alt+2)</span>
                </button>
                <button onClick={() => setPaymentMethod('transfer')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${paymentMethod === 'transfer' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600'}`}>
                  <Building2 className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Transfer. (Alt+3)</span>
                </button>
              </div>
              {paymentMethod === 'cash' && (
                <div className="space-y-2">
                  <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handlePaymentConfirm(); }} className="w-full px-4 py-3 text-2xl font-bold text-center border-2 rounded-lg focus:border-green-500" step="0.01" autoFocus />
                  <div className="flex gap-2 flex-wrap">
                    {quickAmounts.map(a => (<button key={a} onClick={() => setAmountPaid(a.toFixed(2))} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">${a}</button>))}
                    <button onClick={() => setAmountPaid(total.toFixed(2))} className="px-3 py-1.5 bg-green-100 hover:bg-green-200 rounded-lg text-sm font-medium text-green-700">Exacto</button>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${change > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <p className="text-sm text-gray-600">Cambio:</p>
                    <p className={`text-2xl font-bold ${change > 0 ? 'text-green-600' : 'text-yellow-600'}`}>${change.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t">
              <button onClick={handlePaymentConfirm} disabled={paymentMethod === 'cash' && parseFloat(amountPaid) < total} className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold text-lg rounded-lg shadow-lg">
                Confirmar Pago ✓ (Enter)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicket && lastTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTicket(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">✅ Venta Exitosa</h2>
              <button onClick={() => setShowTicket(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <div className="border-2 border-dashed rounded-lg p-4 font-mono text-xs">
                <div className="text-center border-b border-dashed pb-2 mb-2">
                  <p className="font-bold text-sm">DEPÓSITO SAN JUDITAS</p>
                  <p className="text-gray-500">Ticket #{lastTicket.ticketNumber}</p>
                  <p className="text-gray-500">{lastTicket.date.toLocaleString('es-MX')}</p>
                  <p className="text-gray-500">Cajero: {lastTicket.cashier}</p>
                </div>
                {lastTicket.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-0.5">
                    <span className="flex-1 truncate pr-1">{item.product.name} ({item.unit.name})</span>
                    <span>{item.quantity}x${item.unit.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-dashed pt-1 mt-1">
                  <div className="flex justify-between"><span>Subtotal:</span><span>${lastTicket.subtotal.toFixed(2)}</span></div>
                  {lastTicket.discount > 0 && <div className="flex justify-between text-green-600"><span>Descuento:</span><span>-${lastTicket.discount.toFixed(2)}</span></div>}
                  <div className="flex justify-between"><span>IVA:</span><span>${lastTicket.tax.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>TOTAL:</span><span>${lastTicket.total.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Pago:</span><span>${lastTicket.amountPaid.toFixed(2)}</span></div>
                  {lastTicket.paymentMethod === 'cash' && <div className="flex justify-between font-bold"><span>Cambio:</span><span>${lastTicket.change.toFixed(2)}</span></div>}
                </div>
                <p className="text-center mt-2 font-bold">¡GRACIAS POR SU COMPRA!</p>
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <button onClick={() => printTicket()} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"><Printer className="w-4 h-4" />Imprimir (P)</button>
              <button onClick={() => setShowTicket(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg">Nueva Venta</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">{notification}</div>
        </div>
      )}

      {/* Help button */}
      <button onClick={() => setShowHelp(!showHelp)} className="fixed bottom-4 right-4 w-10 h-10 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 z-40" title="Atajos de teclado">
        <Keyboard className="w-5 h-5" />
      </button>

      {showHelp && (
        <div className="fixed bottom-16 right-4 w-72 bg-white rounded-xl shadow-2xl border z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">⌨️ Atajos de Teclado</h3>
            <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-1.5 text-xs">
            {[['F2', 'Buscar producto'], ['F3', 'Escanear código'], ['F5', 'Cobrar'], ['F6', 'Limpiar carrito'], ['F7', 'Imprimir ticket'], ['F12', 'Nueva venta'], ['+/-', 'Cantidad item'], ['Del', 'Eliminar item'], ['Alt+1', 'Efectivo'], ['Alt+2', 'Tarjeta'], ['Alt+3', 'Transferencia'], ['Enter', 'Confirmar pago'], ['Esc', 'Cerrar modal']].map(([key, desc]) => (
              <div key={key} className="flex justify-between"><span className="text-gray-600">{desc}</span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">{key}</kbd></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
