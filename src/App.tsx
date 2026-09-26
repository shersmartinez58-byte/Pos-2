import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Product, CartItem, Ticket, PaymentMethod } from './types';
import { products, categories } from './data/products';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { PaymentModal } from './components/PaymentModal';
import { TicketModal } from './components/TicketModal';
import { HistoryModal } from './components/HistoryModal';
import { KeyboardHelp } from './components/KeyboardHelp';
import { HelpCircle, History, Keyboard, Clock, BarChart3 } from 'lucide-react';

function App() {
  // State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [selectedCartIndex, setSelectedCartIndex] = useState(-1);
  const [showPayment, setShowPayment] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const ticketCounter = useRef(1);

  // Computed values
  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), 
    [cart]
  );
  const tax = useMemo(() => subtotal * 0.16, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  // Notification helper
  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  // Add product to cart
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.findIndex(item => item.product.id === product.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 };
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
    showNotification(`✅ ${product.name} agregado`);
  }, [showNotification]);

  // Handle barcode scan
  const handleBarcodeScan = useCallback((barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
    } else {
      showNotification(`❌ Producto no encontrado: ${barcode}`);
    }
    setBarcodeValue('');
  }, [addToCart, showNotification]);

  // Use barcode scanner hook
  useBarcodeScanner({
    onScan: handleBarcodeScan,
    minLength: 4,
    maxDelay: 50,
  });

  // Cart operations
  const updateQuantity = useCallback((index: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter((_, i) => i !== index));
    } else {
      setCart(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], quantity };
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
    showNotification('🗑️ Carrito limpiado');
  }, [showNotification]);

  // Payment
  const handleCheckout = useCallback(() => {
    if (cart.length > 0) {
      setShowPayment(true);
    }
  }, [cart.length]);

  const handlePaymentConfirm = useCallback((method: PaymentMethod, amountPaid: number) => {
    const ticket: Ticket = {
      id: Date.now().toString(),
      items: [...cart],
      subtotal,
      tax,
      total,
      paymentMethod: method,
      amountPaid,
      change: method === 'cash' ? amountPaid - total : 0,
      date: new Date(),
      ticketNumber: String(ticketCounter.current++).padStart(6, '0'),
    };
    
    setTickets(prev => [...prev, ticket]);
    setLastTicket(ticket);
    setShowPayment(false);
    setShowTicket(true);
    setCart([]);
    setSelectedCartIndex(-1);
  }, [cart, subtotal, tax, total]);

  // Print ticket
  const printTicket = useCallback((ticket?: Ticket) => {
    const t = ticket || lastTicket;
    if (!t) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket #${t.ticketNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 10px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 5px 0; }
          .row { display: flex; justify-content: space-between; }
          .item { display: flex; justify-content: space-between; padding: 2px 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <p class="bold" style="font-size:14px">MI TIENDA POS</p>
          <p>RFC: XAXX010101000</p>
          <p>Av. Principal #123</p>
          <p>Tel: (555) 123-4567</p>
        </div>
        <div class="line"></div>
        <div class="center">
          <p class="bold">TICKET DE VENTA</p>
          <p>No. ${t.ticketNumber}</p>
          <p>${t.date.toLocaleDateString('es-MX')} ${t.date.toLocaleTimeString('es-MX')}</p>
        </div>
        <div class="line"></div>
        <div class="bold row"><span>Producto</span><span>Cant</span><span>Importe</span></div>
        ${t.items.map(item => `
          <div class="item">
            <span>${item.product.name}</span>
            <span>${item.quantity}</span>
            <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
        <div class="line"></div>
        <div class="row"><span>Subtotal:</span><span>$${t.subtotal.toFixed(2)}</span></div>
        <div class="row"><span>IVA (16%):</span><span>$${t.tax.toFixed(2)}</span></div>
        <div class="line"></div>
        <div class="row bold"><span>TOTAL:</span><span>$${t.total.toFixed(2)}</span></div>
        <div class="row"><span>Pago (${t.paymentMethod === 'cash' ? 'Efectivo' : t.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}):</span><span>$${t.amountPaid.toFixed(2)}</span></div>
        ${t.paymentMethod === 'cash' ? `<div class="row bold"><span>Cambio:</span><span>$${t.change.toFixed(2)}</span></div>` : ''}
        <div class="line"></div>
        <div class="center">
          <p class="bold">¡GRACIAS POR SU COMPRA!</p>
        </div>
        <script>window.print();window.close();</script>
      </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
  }, [lastTicket]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'f1', action: () => setShowHelp(true), description: 'Ayuda' },
    { key: 'f2', action: () => document.getElementById('search-input')?.focus(), description: 'Buscar' },
    { key: 'f3', action: () => document.getElementById('barcode-input')?.focus(), description: 'Escanear' },
    { key: 'f5', action: handleCheckout, description: 'Cobrar' },
    { key: 'f6', action: clearCart, description: 'Limpiar' },
    { key: 'f7', action: () => printTicket(), description: 'Imprimir' },
    { key: 'f8', action: () => setShowHistory(true), description: 'Historial' },
    { key: 'f12', action: () => { clearCart(); setSearchTerm(''); }, description: 'Nueva venta' },
    { key: 'Escape', action: () => {
      setShowPayment(false);
      setShowTicket(false);
      setShowHistory(false);
      setShowHelp(false);
    }, description: 'Cerrar' },
    { key: '+', action: () => {
      if (selectedCartIndex >= 0) {
        updateQuantity(selectedCartIndex, cart[selectedCartIndex].quantity + 1);
      }
    }, description: 'Aumentar' },
    { key: '-', action: () => {
      if (selectedCartIndex >= 0) {
        updateQuantity(selectedCartIndex, cart[selectedCartIndex].quantity - 1);
      }
    }, description: 'Disminuir' },
    { key: 'Delete', action: () => {
      if (selectedCartIndex >= 0) {
        removeItem(selectedCartIndex);
      }
    }, description: 'Eliminar' },
  ]);

  // Handle barcode input submit
  const handleBarcodeSubmit = useCallback(() => {
    if (barcodeValue.trim()) {
      handleBarcodeScan(barcodeValue.trim());
    }
  }, [barcodeValue, handleBarcodeScan]);

  const todaySales = tickets.filter(t => t.date.toDateString() === new Date().toDateString());
  const todayTotal = todaySales.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white border-b shadow-sm px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-800">POS System</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 mr-4 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            </div>
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <span>Ventas hoy: {todaySales.length}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 font-bold">
              <span>${todayTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
            title="Historial (F8)"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
            title="Ayuda (F1)"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
            title="Atajos de teclado"
          >
            <Keyboard className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Products Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <ProductGrid
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
            onCategoryChange={setSelectedCategory}
            onSearchChange={setSearchTerm}
            onProductClick={addToCart}
            barcodeValue={barcodeValue}
            onBarcodeChange={setBarcodeValue}
            onBarcodeSubmit={handleBarcodeSubmit}
          />
        </div>

        {/* Cart Panel */}
        <div className="w-80 lg:w-96 border-l flex flex-col">
          <Cart
            items={cart}
            selectedIndex={selectedCartIndex}
            onSelectItem={setSelectedCartIndex}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onClearCart={clearCart}
            onCheckout={handleCheckout}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            {notification}
          </div>
        </div>
      )}

      {/* Modals */}
      {showPayment && (
        <PaymentModal
          total={total}
          onConfirm={handlePaymentConfirm}
          onClose={() => setShowPayment(false)}
        />
      )}

      {showTicket && lastTicket && (
        <TicketModal
          ticket={lastTicket}
          onClose={() => setShowTicket(false)}
          onPrint={() => printTicket()}
        />
      )}

      {showHistory && (
        <HistoryModal
          tickets={tickets}
          onClose={() => setShowHistory(false)}
          onViewTicket={(ticket) => {
            setLastTicket(ticket);
            setShowHistory(false);
            setShowTicket(true);
          }}
          onPrintTicket={(ticket) => printTicket(ticket)}
        />
      )}

      {showHelp && (
        <KeyboardHelp onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}

export default App;
