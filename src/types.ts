export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  ownConsumptionPrice: number; // Precio especial para consumo propio
  stock: number;
  minStock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  isOwnConsumption: boolean;
}

export interface Ticket {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  amountPaid: number;
  change: number;
  date: Date;
  ticketNumber: string;
  cashier: string;
  isOwnConsumption: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'cashier';
  password: string;
  active: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  active: boolean;
  startDate: string;
  endDate: string;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'add' | 'remove' | 'correction';
  quantity: number;
  reason: string;
  date: Date;
  user: string;
}

export type Page = 'dashboard' | 'pos' | 'inventory' | 'adjustment' | 'promotions' | 'history' | 'settings';
