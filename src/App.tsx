import React, { useState, useCallback } from 'react';
import { User, Page, Product, Ticket, Promotion, InventoryAdjustment as AdjustmentType } from './types';
import { products as initialProducts } from './data/products';
import { defaultUsers } from './data/users';
import { LoginScreen } from './components/LoginScreen';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { InventoryAdjustment } from './components/InventoryAdjustment';
import { Promotions } from './components/Promotions';
import { SalesHistory } from './components/SalesHistory';
import { Settings } from './components/Settings';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [adjustments, setAdjustments] = useState<AdjustmentType[]>([]);
  const [businessName, setBusinessName] = useState('Depósito San Juditas');

  const adminUser = users.find(u => u.role === 'admin');
  const adminPassword = adminUser?.password || 'admin123';

  const handleLogin = useCallback((user: User) => setCurrentUser(user), []);
  const handleLogout = useCallback(() => { setCurrentUser(null); setCurrentPage('dashboard'); }, []);

  const handleSaleComplete = useCallback((ticket: Ticket) => {
    setTickets(prev => [...prev, ticket]);
    setProducts(prev => prev.map(p => {
      const soldItems = ticket.items.filter(i => i.product.id === p.id);
      if (soldItems.length > 0) {
        const totalSold = soldItems.reduce((sum, item) => sum + (item.quantity * (item.isCase ? item.product.caseQty : 1)), 0);
        return { ...p, stock: Math.max(0, p.stock - totalSold) };
      }
      return p;
    }));
  }, []);

  const handleUpdateStock = useCallback((productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  }, []);

  const handleAddProduct = useCallback((product: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...product, id: Date.now().toString() }]);
  }, []);

  const handleDeleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const handleUpdateProduct = useCallback((product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  }, []);

  const handleInventoryAdjust = useCallback((adjustment: Omit<AdjustmentType, 'id' | 'date'>) => {
    const newAdj: AdjustmentType = { ...adjustment, id: Date.now().toString(), date: new Date() };
    setAdjustments(prev => [...prev, newAdj]);
    setProducts(prev => prev.map(p => {
      if (p.id !== adjustment.productId) return p;
      let newStock = p.stock;
      if (adjustment.type === 'add') newStock += adjustment.quantity;
      else if (adjustment.type === 'remove') newStock = Math.max(0, newStock - adjustment.quantity);
      else if (adjustment.type === 'correction') newStock = adjustment.quantity;
      return { ...p, stock: newStock };
    }));
  }, []);

  const handleAddPromotion = useCallback((promo: Omit<Promotion, 'id'>) => {
    setPromotions(prev => [...prev, { ...promo, id: Date.now().toString() }]);
  }, []);

  const handleTogglePromotion = useCallback((id: string) => {
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }, []);

  const handleDeletePromotion = useCallback((id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
  }, []);

  const handlePrintTicket = useCallback((ticket: Ticket) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Ticket #${ticket.ticketNumber}</title><style>body{font-family:monospace;font-size:11px;width:200px;margin:0 auto;padding:5px}.c{text-align:center}.b{font-weight:bold}.l{border-top:1px dashed #000;margin:3px 0}.r{display:flex;justify-content:space-between;font-size:10px}</style></head><body><div class="c"><p class="b" style="font-size:14px">${businessName}</p><p>RFC: XAXX010101000</p><p>Av. Principal #123</p><p>Tel: (555) 123-4567</p></div><div class="l"></div><div class="c"><p class="b">TICKET DE VENTA</p><p>No. ${ticket.ticketNumber}</p><p>${ticket.date.toLocaleString('es-MX')}</p><p>Cajero: ${ticket.cashier}</p>${ticket.isOwnConsumption ? '<p class="b">CONSUMO PROPIO</p>' : ''}</div><div class="l"></div>${ticket.items.map(i => { const price = i.isCase ? i.product.casePrice : i.product.unitPrice; return `<div class="r"><span>${i.product.name}${i.isCase ? ' (Caja)' : ''}</span><span>${i.quantity}x$${price.toFixed(2)}</span></div>`; }).join('')}<div class="l"></div><div class="r"><span>Subtotal:</span><span>$${ticket.subtotal.toFixed(2)}</span></div>${ticket.discount > 0 ? `<div class="r"><span>Descuento:</span><span>-$${ticket.discount.toFixed(2)}</span></div>` : ''}<div class="r"><span>IVA (16%):</span><span>$${ticket.tax.toFixed(2)}</span></div><div class="l"></div><div class="r b"><span>TOTAL:</span><span>$${ticket.total.toFixed(2)}</span></div><div class="r"><span>Pago (${ticket.paymentMethod === 'cash' ? 'Efectivo' : ticket.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}):</span><span>$${ticket.amountPaid.toFixed(2)}</span></div>${ticket.paymentMethod === 'cash' ? `<div class="r b"><span>Cambio:</span><span>$${ticket.change.toFixed(2)}</span></div>` : ''}<div class="l"></div><div class="c"><p class="b">¡GRACIAS POR SU COMPRA!</p><p>${businessName}</p></div><script>window.print();window.close();</script></body></html>`);
    w.document.close();
  }, [businessName]);

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard tickets={tickets} products={products} />;
      case 'pos':
        return (
          <POS
            products={products}
            cashierName={currentUser.name}
            userRole={currentUser.role}
            adminPassword={adminPassword}
            onSaleComplete={handleSaleComplete}
            tickets={tickets}
          />
        );
      case 'inventory':
        return (
          <Inventory
            products={products}
            onUpdateStock={handleUpdateStock}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateProduct={handleUpdateProduct}
          />
        );
      case 'adjustment':
        return <InventoryAdjustment products={products} adjustments={adjustments} onAdjust={handleInventoryAdjust} userName={currentUser.name} />;
      case 'promotions':
        return <Promotions promotions={promotions} products={products} onAdd={handleAddPromotion} onToggle={handleTogglePromotion} onDelete={handleDeletePromotion} />;
      case 'history':
        return <SalesHistory tickets={tickets} onPrint={handlePrintTicket} />;
      case 'settings':
        return <Settings users={users} onUpdateUsers={setUsers} businessName={businessName} onUpdateBusinessName={setBusinessName} />;
      default:
        return <Dashboard tickets={tickets} products={products} />;
    }
  };

  return (
    <Layout user={currentUser} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}

export default App;
