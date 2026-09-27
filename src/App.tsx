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
  
  // Firebase state - todo empieza vacío
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [adjustments, setAdjustments] = useState<AdjustmentType[]>([]);
  const [businessName, setBusinessName] = useState('Depósito San Juditas');
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(false);

  // Subscribe to Firebase collections in real-time
  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      if (mounted) {
        setLoading(false);
        setFirebaseError(true);
        // Si Firebase falla, usar datos locales por defecto
        setUsers(defaultUsers);
        setProducts(initialProducts);
      }
    }, 5000); // 5 second timeout

    try {
      const unsubscribeUsers = subscribeToUsers((usersData) => {
        if (mounted) {
          clearTimeout(timeoutId);
          // Si no hay usuarios en Firebase, crear usuarios por defecto para poder hacer login
          if (usersData.length === 0) {
            setUsers(defaultUsers); // Actualizar estado local inmediatamente
            defaultUsers.forEach(user => addUser(user).catch(console.error));
          } else {
            setUsers(usersData);
          }
        }
      });

      const unsubscribeProducts = subscribeToProducts((productsData) => {
        if (mounted) {
          // Solo cargar productos de Firebase, no crear automáticamente
          setProducts(productsData);
        }
      });

      const unsubscribeKits = subscribeToKits((kitsData) => {
        if (mounted) setKits(kitsData);
      });
      
      const unsubscribeTickets = subscribeToTickets((ticketsData) => {
        if (mounted) setTickets(ticketsData);
      });
      
      const unsubscribePromotions = subscribeToPromotions((promotionsData) => {
        if (mounted) setPromotions(promotionsData);
      });
      
      const unsubscribeAdjustments = subscribeToAdjustments((adjustmentsData) => {
        if (mounted) setAdjustments(adjustmentsData);
      });

      // Load settings
      getSettings().then(settings => {
        if (mounted) {
          if (settings && settings.businessName) {
            setBusinessName(settings.businessName as string);
          }
          setLoading(false);
        }
      }).catch(() => {
        if (mounted) {
          setLoading(false);
          setFirebaseError(true);
        }
      });

      return () => {
        mounted = false;
        clearTimeout(timeoutId);
        unsubscribeUsers();
        unsubscribeProducts();
        unsubscribeKits();
        unsubscribeTickets();
        unsubscribePromotions();
        unsubscribeAdjustments();
      };
    } catch (error) {
      console.error('Firebase initialization error:', error);
      if (mounted) {
        setLoading(false);
        setFirebaseError(true);
      }
    }
  }, []);

  const adminUser = users.find(u => u.role === 'admin');
  const adminPassword = adminUser?.password || 'admin123';

  const handleLogin = useCallback((user: User) => setCurrentUser(user), []);
  const handleLogout = useCallback(() => { setCurrentUser(null); setCurrentPage('dashboard'); }, []);

  // Sale complete - save to Firebase and update stock
  const handleSaleComplete = useCallback(async (ticket: Omit<Ticket, 'id'>) => {
    const ticketWithId = { ...ticket, id: Date.now().toString() };
    
    // Update local state immediately
    setTickets(prev => [ticketWithId, ...prev]);
    
    // Update product stock locally
    setProducts(prev => prev.map(p => {
      const soldItems = ticket.items.filter(i => i.product.id === p.id);
      if (soldItems.length > 0) {
        const totalSold = soldItems.reduce((sum, item) => sum + (item.quantity * (item.isCase ? item.product.caseQty : 1)), 0);
        return { ...p, stock: Math.max(0, p.stock - totalSold) };
      }
      return p;
    }));

    // Update kits stock locally
    if (ticket.kits) {
      setKits(prev => prev.map(k => {
        const soldKit = ticket.kits?.find(ki => ki.kit.id === k.id);
        if (soldKit) {
          return { ...k, stock: Math.max(0, k.stock - soldKit.quantity) };
        }
        return k;
      }));
    }

    // Try to save to Firebase (if available)
    if (!firebaseError) {
      try {
        await addTicket(ticket);
        for (const item of ticket.items) {
          const product = products.find(p => p.id === item.product.id);
          if (product) {
            const soldQty = item.quantity * (item.isCase ? product.caseQty : 1);
            const newStock = Math.max(0, product.stock - soldQty);
            await updateProduct({ ...product, stock: newStock });
          }
        }
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
        console.error('Error saving to Firebase:', error);
      }
    }
  }, [products, kits, firebaseError]);

  // Product operations
  const handleUpdateStock = useCallback(async (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    if (!firebaseError) {
      try {
        const product = products.find(p => p.id === productId);
        if (product) {
          await updateProduct({ ...product, stock: newStock });
        }
      } catch (error) {
        console.error('Error updating stock:', error);
      }
    }
  }, [products, firebaseError]);

  const handleAddProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts(prev => [...prev, newProduct]);
    if (!firebaseError) {
      try {
        await addProduct(product);
      } catch (error) {
        console.error('Error adding product:', error);
      }
    }
  }, [firebaseError]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (!firebaseError) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  }, [firebaseError]);

  const handleUpdateProduct = useCallback(async (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    if (!firebaseError) {
      try {
        await updateProduct(product);
      } catch (error) {
        console.error('Error updating product:', error);
      }
    }
  }, [firebaseError]);

  // Kit operations
  const handleAddKit = useCallback(async (kit: Omit<Kit, 'id'>) => {
    const newKit = { ...kit, id: Date.now().toString() };
    setKits(prev => [...prev, newKit]);
    if (!firebaseError) {
      try {
        await addKit(kit);
      } catch (error) {
        console.error('Error adding kit:', error);
      }
    }
  }, [firebaseError]);

  const handleUpdateKit = useCallback(async (kit: Kit) => {
    setKits(prev => prev.map(k => k.id === kit.id ? kit : k));
    if (!firebaseError) {
      try {
        await updateKit(kit);
      } catch (error) {
        console.error('Error updating kit:', error);
      }
    }
  }, [firebaseError]);

  const handleDeleteKit = useCallback(async (kitId: string) => {
    setKits(prev => prev.filter(k => k.id !== kitId));
    if (!firebaseError) {
      try {
        await deleteKit(kitId);
      } catch (error) {
        console.error('Error deleting kit:', error);
      }
    }
  }, [firebaseError]);

  // Return operation
  const handleReturn = useCallback(async (ticketId: string, returnedItems: CartItem[], returnedKits: CartKitItem[]) => {
    // Reintegrate product stock locally
    setProducts(prev => prev.map(p => {
      const returnedItem = returnedItems.find(i => i.product.id === p.id);
      if (returnedItem) {
        const qty = returnedItem.isCase ? returnedItem.quantity * p.caseQty : returnedItem.quantity;
        return { ...p, stock: p.stock + qty };
      }
      return p;
    }));

    // Reintegrate kits stock locally
    setKits(prev => prev.map(k => {
      const returnedKit = returnedKits.find(rk => rk.kit.id === k.id);
      if (returnedKit) {
        return { ...k, stock: k.stock + returnedKit.quantity };
      }
      return k;
    }));

    // Add adjustment record locally
    const adjustment: AdjustmentType = {
      id: Date.now().toString(),
      productId: 'return',
      productName: 'Devolución',
      type: 'add',
      quantity: returnedItems.length + returnedKits.length,
      reason: `Devolución ticket #${ticketId}`,
      date: new Date(),
      user: currentUser?.name || 'Sistema',
    };
    setAdjustments(prev => [adjustment, ...prev]);

    // Try to save to Firebase
    if (!firebaseError) {
      try {
        for (const item of returnedItems) {
          const product = products.find(p => p.id === item.product.id);
          if (product) {
            const qty = item.isCase ? item.quantity * product.caseQty : item.quantity;
            await updateProduct({ ...product, stock: product.stock + qty });
          }
        }
        for (const kitItem of returnedKits) {
          const kit = kits.find(k => k.id === kitItem.kit.id);
          if (kit) {
            await updateKit({ ...kit, stock: kit.stock + kitItem.quantity });
          }
        }
        await addAdjustment(adjustment);
      } catch (error) {
        console.error('Error saving return to Firebase:', error);
      }
    }
  }, [products, kits, currentUser, firebaseError]);

  // Inventory adjustment
  const handleInventoryAdjust = useCallback(async (adjustment: Omit<AdjustmentType, 'id' | 'date'>) => {
    const newAdjustment: AdjustmentType = {
      ...adjustment,
      id: Date.now().toString(),
      date: new Date(),
    };
    
    // Update locally
    setAdjustments(prev => [newAdjustment, ...prev]);
    
    const product = products.find(p => p.id === adjustment.productId);
    let newStock = product?.stock || 0;
    
    if (product) {
      if (adjustment.type === 'add') newStock += adjustment.quantity;
      else if (adjustment.type === 'remove') newStock = Math.max(0, newStock - adjustment.quantity);
      else if (adjustment.type === 'correction') newStock = adjustment.quantity;
      
      setProducts(prev => prev.map(p => p.id === adjustment.productId ? { ...p, stock: newStock } : p));
    }

    // Try to save to Firebase
    if (!firebaseError) {
      try {
        await addAdjustment(newAdjustment);
        if (product) {
          await updateProduct({ ...product, stock: newStock });
        }
      } catch (error) {
        console.error('Error saving adjustment to Firebase:', error);
      }
    }
  }, [products, firebaseError]);

  // Promotion operations
  const handleAddPromotion = useCallback(async (promotion: Omit<Promotion, 'id'>) => {
    const newPromotion = { ...promotion, id: Date.now().toString() };
    setPromotions(prev => [...prev, newPromotion]);
    if (!firebaseError) {
      try {
        await addPromotion(promotion);
      } catch (error) {
        console.error('Error adding promotion:', error);
      }
    }
  }, [firebaseError]);

  const handleTogglePromotion = useCallback(async (id: string) => {
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    if (!firebaseError) {
      try {
        const promotion = promotions.find(p => p.id === id);
        if (promotion) {
          await updatePromotion({ ...promotion, active: !promotion.active });
        }
      } catch (error) {
        console.error('Error toggling promotion:', error);
      }
    }
  }, [promotions, firebaseError]);

  const handleDeletePromotion = useCallback(async (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    if (!firebaseError) {
      try {
        await deletePromotion(id);
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  }, [firebaseError]);

  // Settings
  const handleUpdateBusinessName = useCallback(async (name: string) => {
    setBusinessName(name);
    if (!firebaseError) {
      try {
        await saveSettings({ businessName: name });
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
  }, [firebaseError]);

  const handleUpdateUsers = useCallback(async (newUsers: User[]) => {
    setUsers(newUsers);
    if (!firebaseError) {
      try {
        for (const user of newUsers) {
          await updateUser(user);
        }
      } catch (error) {
        console.error('Error updating users:', error);
      }
    }
  }, [firebaseError]);

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
          <p className="text-xs text-slate-400 mt-2">Conectando con Firebase</p>
        </div>
      </div>
    );
  }

  if (firebaseError) {
    console.warn('Firebase no disponible, usando modo local');
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
