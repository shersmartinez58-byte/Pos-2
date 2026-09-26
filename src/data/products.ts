import { Product } from '../types';

export const products: Product[] = [
  { id: '1', barcode: '7501000000001', name: 'Coca Cola 600ml', category: 'Bebidas', cost: 12, price: 18, ownConsumptionPrice: 14, stock: 200, minStock: 24 },
  { id: '2', barcode: '7501000000002', name: 'Pepsi 600ml', category: 'Bebidas', cost: 11, price: 17, ownConsumptionPrice: 13, stock: 150, minStock: 24 },
  { id: '3', barcode: '7501000000003', name: 'Agua Natural 1L', category: 'Bebidas', cost: 6, price: 12, ownConsumptionPrice: 9, stock: 500, minStock: 48 },
  { id: '4', barcode: '7501000000004', name: 'Jugo de Naranja 1L', category: 'Bebidas', cost: 18, price: 28, ownConsumptionPrice: 22, stock: 60, minStock: 12 },
  { id: '5', barcode: '7501000000005', name: 'Café Soluble 200g', category: 'Bebidas', cost: 55, price: 85, ownConsumptionPrice: 70, stock: 40, minStock: 10 },
  { id: '6', barcode: '7501000000006', name: 'Sabritas Original', category: 'Botanas', cost: 14, price: 22, ownConsumptionPrice: 18, stock: 120, minStock: 24 },
  { id: '7', barcode: '7501000000007', name: 'Doritos Nachos', category: 'Botanas', cost: 15, price: 24, ownConsumptionPrice: 20, stock: 100, minStock: 24 },
  { id: '8', barcode: '7501000000008', name: 'Galletas Marías', category: 'Botanas', cost: 9, price: 15, ownConsumptionPrice: 12, stock: 80, minStock: 20 },
  { id: '9', barcode: '7501000000009', name: 'Chocolate Carlos V', category: 'Dulces', cost: 7, price: 12, ownConsumptionPrice: 10, stock: 200, minStock: 40 },
  { id: '10', barcode: '7501000000010', name: 'Paleta Payaso', category: 'Dulces', cost: 4.5, price: 8, ownConsumptionPrice: 6, stock: 300, minStock: 50 },
  { id: '11', barcode: '7501000000011', name: 'Pan Bimbo Grande', category: 'Panadería', cost: 35, price: 52, ownConsumptionPrice: 45, stock: 40, minStock: 10 },
  { id: '12', barcode: '7501000000012', name: 'Tortillas 1kg', category: 'Panadería', cost: 12, price: 18, ownConsumptionPrice: 15, stock: 60, minStock: 15 },
  { id: '13', barcode: '7501000000013', name: 'Leche Entera 1L', category: 'Lácteos', cost: 18, price: 26, ownConsumptionPrice: 22, stock: 80, minStock: 20 },
  { id: '14', barcode: '7501000000014', name: 'Yogurt Natural', category: 'Lácteos', cost: 12, price: 19, ownConsumptionPrice: 16, stock: 50, minStock: 12 },
  { id: '15', barcode: '7501000000015', name: 'Queso Oaxaca 250g', category: 'Lácteos', cost: 45, price: 65, ownConsumptionPrice: 55, stock: 30, minStock: 8 },
  { id: '16', barcode: '7501000000016', name: 'Huevo 1kg', category: 'Abarrotes', cost: 32, price: 48, ownConsumptionPrice: 42, stock: 50, minStock: 10 },
  { id: '17', barcode: '7501000000017', name: 'Arroz 1kg', category: 'Abarrotes', cost: 18, price: 28, ownConsumptionPrice: 24, stock: 80, minStock: 20 },
  { id: '18', barcode: '7501000000018', name: 'Frijol 1kg', category: 'Abarrotes', cost: 24, price: 35, ownConsumptionPrice: 30, stock: 70, minStock: 15 },
  { id: '19', barcode: '7501000000019', name: 'Aceite 1L', category: 'Abarrotes', cost: 28, price: 42, ownConsumptionPrice: 36, stock: 50, minStock: 12 },
  { id: '20', barcode: '7501000000020', name: 'Atún en lata', category: 'Abarrotes', cost: 14, price: 22, ownConsumptionPrice: 18, stock: 100, minStock: 24 },
];

export const categories = [...new Set(products.map(p => p.category))];
