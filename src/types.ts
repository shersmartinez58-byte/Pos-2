export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Ticket {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  date: Date;
  ticketNumber: string;
}

export type PaymentMethod = 'cash' | 'card' | 'transfer';
