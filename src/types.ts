export interface UnitType {
  id: string;
  name: string;       // "Unidad", "Caja", "Paquete"
  factor: number;     // cuántas unidades contiene (caja de 24 = factor 24)
  price: number;
  barcode?: string;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  cost: number;
  stock: number;
  minStock: number;
  units: UnitType[];
  image?: string;
}

export interface CartItem {
  product: Product;
  unit: UnitType;
  quantity: number;
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
  promotionApplied?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'cashier';
  pin: string;
  active: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'buyXgetY';
  value: number;
  buyQty?: number;
  getQty?: number;
  productId?: string;
  categoryId?: string;
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
