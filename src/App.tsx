import React, { useState, useEffect, useCallback } from 'react';
import { User, Page, Product, Ticket, Promotion, InventoryAdjustment as AdjustmentType, Kit, CartItem, CartKitItem } from './types';
import { products as initialProducts } from './data/products';
import { defaultUsers } from './data/users';
import { LoginScreen } from './components/LoginScreen';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Returns } from './components/Returns';
import { Inventory } from './components/Inventory';
import { Kits } from './components/Kits';
import { InventoryAdjustment } from './components/InventoryAdjustment';
import { Promotions } from './components/Promotions';
import { SalesHistory } from './components/SalesHistory';
import { Settings } from './components/Settings';
import {
  subscribeToProducts,
  subscribeToKits,
  subscribeToTickets,
  subscribeToUsers,
  subscribeToPromotions,
  subscribeToAdjustments,
  addProduct,
  updateProduct,
  deleteProduct,
  addKit,
  updateKit,
  deleteKit,
  addTicket,
  addUser,
  updateUser,
  deleteUser,
  addPromotion,
  updatePromotion,
  deletePromotion,
  addAdjustment,
  getSettings,
  saveSettings
} from './firebaseService';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  // Firebase state
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [adjustments, setAdjustments] = useState<AdjustmentType[]>([]);
  const [businessName, setBusinessName] = useState('Depósito San Juditas');
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase collections in real-time
  useEffect(() => {
    const unsubscribeUsers = subscribeToUsers((usersData) => {
      setUsers(usersData.length > 0 ? usersData : defaultUsers);
      if (usersData.length === 0) {
        // Initialize default users if empty
        defaultUsers.forEach(user => addUser(user));
      }
    });

    const unsubscribeProducts = subscribeToProducts((productsData) => {
      setProducts(productsData.length > 0 ? productsData : initialProducts);
      if (productsData.length === 0) {
        // Initialize default products if empty
        initialProducts.forEach(product => addProduct(product));
      }
    });

    const unsubscribeKits = subscribeToKits(setKits);
    const unsubscribeTickets = subscribeToTickets(setTickets);
    const unsubscribePromotions = subscribeToPromotions(setPromotions);
    const unsubscribeAdjustments = subscribeToAdjustments(setAdjustments);

    // Load settings
    getSettings().then(settings => {
      if (settings && settings.businessName) {
        setBusinessName(settings.businessName as string);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeProducts();
      unsubscribeKits();
      unsubscribeTickets();
      unsubscribePromotions();
      unsubscribeAdjustments();
    };
  }, []);

  const adminUser = users.find(u => u.role === 'admin');
  const adminPassword = adminUser?.password || 'admin123';

  const handleLogin = useCallback((user: User) => setCurrentUser(user), []);
  const handleLogout = useCallback(() => { setCurrentUser(null); setCurrentPage('dashboard'); }, []);

  // Sale complete - save to Firebase and update stock
  const handleSaleComplete = useCallback(async (ticket: Omit<Ticket, 'id'>) => {
    try {
      // Save ticket to Firebase
      await addTicket(ticket);

      // Update product stock
      for (const item of ticket.items) {
        const product = products.find(p => p.id === item.product.id);
        if (product) {
          const soldQty = item.quantity * (item.isCase ? product.caseQty : 1);
          const newStock = Math.max(0, product.stock - soldQty);
          await updateProduct({ ...product, stock: newStock });
        }
      }

      // Update kits stock
      if (ticket.kits) {
        for (const kitItem of ticket.kits) {
          const kit = kits.find(k => k.id === kitItem.kit.id);
          if (kit) {
            const newStock = Math.max(0, kit.stock - kitItem.quantity);
            await updateKit({ ...kit, stock: newStock });
          }
        }
      }
    } catch (error) {
      console.error('Error completing sale:', error);
    }
  }, [products, kits]);

  // Product operations
  const handleUpdateStock = useCallback(async (productId: string, newStock: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      await updateProduct({ ...product, stock: newStock });
    }
  }, [products]);

  const handleAddProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    await addProduct(product);
  }, []);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    await deleteProduct(productId);
  }, []);

  const handleUpdateProduct = useCallback(async (product: Product) => {
    await updateProduct(product);
  }, []);

  // Kit operations
  const handleAddKit = useCallback(async (kit: Omit<Kit, 'id'>) => {
    await addKit(kit);
  }, []);

  const handleUpdateKit = useCallback(async (kit: Kit) => {
    await updateKit(kit);
  }, []);

  const handleDeleteKit = useCallback(async (kitId: string) => {
    await deleteKit(kitId);
  }, []);

  // Return operation
  const handleReturn = useCallback(async (ticketId: string, returnedItems: CartItem[], returnedKits: CartKitItem[]) => {
    try {
      // Reintegrate product stock
      for (const item of returnedItems) {
        const product = products.find(p => p.id === item.product.id);
        if (product) {
          const qty = item.isCase ? item.quantity * product.caseQty : item.quantity;
          await updateProduct({ ...product, stock: product.stock + qty });
        }
      }

      // Reintegrate kits stock
      for (const kitItem of returnedKits) {
        const kit = kits.find(k => k.id === kitItem.kit.id);
        if (kit) {
          await updateKit({ ...kit, stock: kit.stock + kitItem.quantity });
        }
      }

      // Add adjustment record
      await addAdjustment({
        productId: 'return',
        productName: 'Devolución',
        type: 'add',
        quantity: returnedItems.length + returnedKits.length,
        reason: `Devolución ticket #${ticketId}`,
        user: currentUser?.name || 'Sistema',
        date: new Date(),
      });
    } catch (error) {
      console.error('Error processing return:', error);
    }
  }, [products, kits, currentUser]);

  // Inventory adjustment
  const handleInventoryAdjust = useCallback(async (adjustment: Omit<AdjustmentType, 'id' | 'date'>) => {
    try {
      await addAdjustment({ ...adjustment, date: new Date() });

      const product = products.find(p => p.id === adjustment.productId);
      if (product) {
        let newStock = product.stock;
        if (adjustment.type === 'add') newStock += adjustment.quantity;
        else if (adjustment.type === 'remove') newStock = Math.max(0, newStock - adjustment.quantity);
        else if (adjustment.type === 'correction') newStock = adjustment.quantity;
        
        await updateProduct({ ...product, stock: newStock });
      }
    } catch (error) {
      console.error('Error adjusting inventory:', error);
    }
  }, [products]);

  // Promotion operations
  const handleAddPromotion = useCallback(async (promotion: Omit<Promotion, 'id'>) => {
    await addPromotion(promotion);
  }, []);

  const handleTogglePromotion = useCallback(async (id: string) => {
    const promotion = promotions.find(p => p.id === id);
    if (promotion) {
      await updatePromotion({ ...promotion, active: !promotion.active });
    }
  }, [promotions]);

  const handleDeletePromotion = useCallback(async (id: string) => {
    await deletePromotion(id);
  }, []);

  // User operations
  const handleAddUser = useCallback(async (user: Omit<User, 'id'>) => {
    await addUser(user);
  }, []);

  const handleUpdateUser = useCallback(async (user: User) => {
    await updateUser(user);
  }, []);

  const handleDeleteUser = useCallback(async (userId: string) => {
    await deleteUser(userId);
  }, []);

  const handleToggleUser = useCallback(async (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      await updateUser({ ...user, active: !user.active });
    }
  }, [users]);

  // Settings
  const handleUpdateBusinessName = useCallback(async (name: string) => {
    setBusinessName(name);
    await saveSettings({ businessName: name });
  }, []);

  const handleUpdateUsers = useCallback(async (newUsers: User[]) => {
    // This is called from Settings component when users are modified
    // We need to sync with Firebase
    for (const user of newUsers) {
      await updateUser(user);
    }
  }, []);

  // Print ticket
  const handlePrintTicket = useCallback((ticket: Ticket) => {
    const w = window.open('', '_blank');
    if (!w) return;
    const itemsHtml = ticket.items.map(i => {
      const price = i.isCase ? i.product.casePrice : i.product.unitPrice;
      return `<div class="r"><span>${i.product.name}${i.isCase ? ' (Caja)' : ''}</span><span>${i.quantity}x$${price.toFixed(2)}</span></div>`;
    }).join('');
    const kitsHtml = ticket.kits ? ticket.kits.map(k => `<div class="r"><span>[KIT] ${k.kit.name}</span><span>${k.quantity}x$${k.kit.price.toFixed(2)}</span></div>`).join('') : '';
    
    w.document.write(`<!DOCTYPE html><html><head><title>Ticket #${ticket.ticketNumber}</title><style>body{font-family:monospace;font-size:11px;width:200px;margin:0 auto;padding:5px}.c{text-align:center}.b{font-weight:bold}.l{border-top:1px dashed #000;margin:3px 0}.r{display:flex;justify-content:space-between;font-size:10px}</style></head><body><div class="c"><p class="b" style="font-size:14px">${businessName}</p><p>RFC: XAXX010101000</p><p>Av. Principal #123</p><p>Tel: (555) 123-4567</p></div><div class="l"></div><div class="c"><p class="b">TICKET DE VENTA</p><p>No. ${ticket.ticketNumber}</p><p>${ticket.date.toLocaleString('es-MX')}</p><p>Cajero: ${ticket.cashier}</p>${ticket.isOwnConsumption ? '<p class="b">CONSUMO PROPIO</p>' : ''}</div><div class="l"></div>${itemsHtml}${kitsHtml}<div class="l"></div><div class="r"><span>Subtotal:</span><span>$${ticket.subtotal.toFixed(2)}</span></div>${ticket.discount > 0 ? `<div class="r"><span>Descuento:</span><span>-$${ticket.discount.toFixed(2)}</span></div>` : ''}<div class="r"><span>IVA (16%):</span><span>$${ticket.tax.toFixed(2)}</span></div><div class="l"></div><div class="r b"><span>TOTAL:</span><span>$${ticket.total.toFixed(2)}</span></div><div class="r"><span>Pago (${ticket.paymentMethod === 'cash' ? 'Efectivo' : ticket.paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}):</span><span>$${ticket.amountPaid.toFixed(2)}</span></div>${ticket.paymentMethod === 'cash' ? `<div class="r b"><span>Cambio:</span><span>$${ticket.change.toFixed(2)}</span></div>` : ''}<div class="l"></div><div class="c"><p class="b">¡GRACIAS POR SU COMPRA!</p><p>${businessName}</p></div><script>window.print();window.close();</script></body></html>`);
    w.document.close();
  }, [businessName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏪</span>
          </div>
          <p className="text-slate-600">Cargando sistema...</p>
        </div>
      </div>
    );
  }

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
            kits={kits}
            cashierName={currentUser.name}
            userRole={currentUser.role}
            adminPassword={adminPassword}
            onSaleComplete={handleSaleComplete}
            tickets={tickets}
          />
        );
      case 'returns':
        return (
          <Returns
            tickets={tickets}
            products={products}
            kits={kits}
            onReturn={handleReturn}
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
      case 'kits':
        return (
          <Kits
            kits={kits}
            products={products}
            onAddKit={handleAddKit}
            onUpdateKit={handleUpdateKit}
            onDeleteKit={handleDeleteKit}
          />
        );
      case 'adjustment':
        return (
          <InventoryAdjustment
            products={products}
            adjustments={adjustments}
            onAdjust={handleInventoryAdjust}
            userName={currentUser.name}
          />
        );
      case 'promotions':
        return (
          <Promotions
            promotions={promotions}
            products={products}
            onAdd={handleAddPromotion}
            onToggle={handleTogglePromotion}
            onDelete={handleDeletePromotion}
          />
        );
      case 'history':
        return <SalesHistory tickets={tickets} onPrint={handlePrintTicket} />;
      case 'settings':
        return (
          <Settings
            users={users}
            onUpdateUsers={handleUpdateUsers}
            businessName={businessName}
            onUpdateBusinessName={handleUpdateBusinessName}
          />
        );
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
