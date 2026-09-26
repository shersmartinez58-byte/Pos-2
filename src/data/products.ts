import { Product } from '../types';

export const products: Product[] = [
  { id: '1', barcode: '7501000000001', name: 'Coca Cola 600ml', price: 18.00, category: 'Bebidas', stock: 50 },
  { id: '2', barcode: '7501000000002', name: 'Pepsi 600ml', price: 17.00, category: 'Bebidas', stock: 45 },
  { id: '3', barcode: '7501000000003', name: 'Agua Natural 1L', price: 12.00, category: 'Bebidas', stock: 100 },
  { id: '4', barcode: '7501000000004', name: 'Jugo de Naranja 1L', price: 28.00, category: 'Bebidas', stock: 30 },
  { id: '5', barcode: '7501000000005', name: 'Café Americano', price: 35.00, category: 'Bebidas', stock: 999 },
  { id: '6', barcode: '7501000000006', name: 'Sabritas Original', price: 22.00, category: 'Botanas', stock: 60 },
  { id: '7', barcode: '7501000000007', name: 'Doritos Nachos', price: 24.00, category: 'Botanas', stock: 55 },
  { id: '8', barcode: '7501000000008', name: 'Galletas Marías', price: 15.00, category: 'Botanas', stock: 40 },
  { id: '9', barcode: '7501000000009', name: 'Chocolate Carlos V', price: 12.00, category: 'Dulces', stock: 80 },
  { id: '10', barcode: '7501000000010', name: 'Paleta Payaso', price: 8.00, category: 'Dulces', stock: 100 },
  { id: '11', barcode: '7501000000011', name: 'Pan Bimbo Grande', price: 52.00, category: 'Panadería', stock: 25 },
  { id: '12', barcode: '7501000000012', name: 'Tortillas 1kg', price: 18.00, category: 'Panadería', stock: 35 },
  { id: '13', barcode: '7501000000013', name: 'Leche Entera 1L', price: 26.00, category: 'Lácteos', stock: 40 },
  { id: '14', barcode: '7501000000014', name: 'Yogurt Natural', price: 19.00, category: 'Lácteos', stock: 30 },
  { id: '15', barcode: '7501000000015', name: 'Queso Oaxaca 250g', price: 65.00, category: 'Lácteos', stock: 20 },
  { id: '16', barcode: '7501000000016', name: 'Huevo 1kg', price: 48.00, category: 'Abarrotes', stock: 30 },
  { id: '17', barcode: '7501000000017', name: 'Arroz 1kg', price: 28.00, category: 'Abarrotes', stock: 45 },
  { id: '18', barcode: '7501000000018', name: 'Frijoles 1kg', price: 35.00, category: 'Abarrotes', stock: 40 },
  { id: '19', barcode: '7501000000019', name: 'Aceite 1L', price: 42.00, category: 'Abarrotes', stock: 25 },
  { id: '20', barcode: '7501000000020', name: 'Atún en lata', price: 22.00, category: 'Abarrotes', stock: 50 },
];

export const categories = [...new Set(products.map(p => p.category))];
