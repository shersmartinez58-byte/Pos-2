export interface Product {
  id: string;
  barcode: string;
  barcodeCase?: string;
  name: string;
  icon: string;
  cost: number;
  unitPrice: number;
  casePrice: number;
  caseQty: number;
  ownConsumptionPrice: number;
  stock: number;
  minStock: number;
}

export interface KitItem {
  productId: string;
  quantity: number;
}

export interface Kit {
  id: string;
  name: string;
  icon: string;
  items: KitItem[];
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  isCase: boolean;
  isOwnConsumption: boolean;
}

export interface CartKitItem {
  kit: Kit;
  quantity: number;
  isOwnConsumption: boolean;
}

export interface Ticket {
  id: string;
  items: CartItem[];
  kits: CartKitItem[];
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

export type Page = 'dashboard' | 'pos' | 'returns' | 'inventory' | 'kits' | 'adjustment' | 'promotions' | 'history' | 'settings';
