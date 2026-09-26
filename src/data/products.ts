import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1', barcode: '7501000000001', name: 'Coca Cola', category: 'Bebidas',
    cost: 12, stock: 200, minStock: 24,
    units: [
      { id: '1u', name: 'Unidad', factor: 1, price: 18, barcode: '7501000000001' },
      { id: '1c', name: 'Caja (24)', factor: 24, price: 380, barcode: '7501000000101' },
    ]
  },
  {
    id: '2', barcode: '7501000000002', name: 'Pepsi', category: 'Bebidas',
    cost: 11, stock: 150, minStock: 24,
    units: [
      { id: '2u', name: 'Unidad', factor: 1, price: 17, barcode: '7501000000002' },
      { id: '2c', name: 'Caja (24)', factor: 24, price: 360, barcode: '7501000000102' },
    ]
  },
  {
    id: '3', barcode: '7501000000003', name: 'Agua Natural 1L', category: 'Bebidas',
    cost: 6, stock: 500, minStock: 48,
    units: [
      { id: '3u', name: 'Unidad', factor: 1, price: 12, barcode: '7501000000003' },
      { id: '3p', name: 'Paquete (12)', factor: 12, price: 120, barcode: '7501000000103' },
      { id: '3c', name: 'Caja (24)', factor: 24, price: 220, barcode: '7501000000203' },
    ]
  },
  {
    id: '4', barcode: '7501000000004', name: 'Jugo de Naranja 1L', category: 'Bebidas',
    cost: 18, stock: 60, minStock: 12,
    units: [
      { id: '4u', name: 'Unidad', factor: 1, price: 28, barcode: '7501000000004' },
      { id: '4c', name: 'Caja (12)', factor: 12, price: 300, barcode: '7501000000104' },
    ]
  },
  {
    id: '5', barcode: '7501000000005', name: 'Café Soluble 200g', category: 'Bebidas',
    cost: 55, stock: 40, minStock: 10,
    units: [
      { id: '5u', name: 'Unidad', factor: 1, price: 85, barcode: '7501000000005' },
    ]
  },
  {
    id: '6', barcode: '7501000000006', name: 'Sabritas Original', category: 'Botanas',
    cost: 14, stock: 120, minStock: 24,
    units: [
      { id: '6u', name: 'Unidad', factor: 1, price: 22, barcode: '7501000000006' },
      { id: '6c', name: 'Caja (30)', factor: 30, price: 580, barcode: '7501000000106' },
    ]
  },
  {
    id: '7', barcode: '7501000000007', name: 'Doritos Nachos', category: 'Botanas',
    cost: 15, stock: 100, minStock: 24,
    units: [
      { id: '7u', name: 'Unidad', factor: 1, price: 24, barcode: '7501000000007' },
      { id: '7c', name: 'Caja (30)', factor: 30, price: 620, barcode: '7501000000107' },
    ]
  },
  {
    id: '8', barcode: '7501000000008', name: 'Galletas Marías', category: 'Botanas',
    cost: 9, stock: 80, minStock: 20,
    units: [
      { id: '8u', name: 'Unidad', factor: 1, price: 15, barcode: '7501000000008' },
      { id: '8p', name: 'Paquete (12)', factor: 12, price: 155, barcode: '7501000000108' },
    ]
  },
  {
    id: '9', barcode: '7501000000009', name: 'Chocolate Carlos V', category: 'Dulces',
    cost: 7, stock: 200, minStock: 40,
    units: [
      { id: '9u', name: 'Unidad', factor: 1, price: 12, barcode: '7501000000009' },
      { id: '9c', name: 'Caja (40)', factor: 40, price: 400, barcode: '7501000000109' },
    ]
  },
  {
    id: '10', barcode: '7501000000010', name: 'Paleta Payaso', category: 'Dulces',
    cost: 4.5, stock: 300, minStock: 50,
    units: [
      { id: '10u', name: 'Unidad', factor: 1, price: 8, barcode: '7501000000010' },
      { id: '10b', name: 'Bolsa (20)', factor: 20, price: 130, barcode: '7501000000110' },
    ]
  },
  {
    id: '11', barcode: '7501000000011', name: 'Pan Bimbo Grande', category: 'Panadería',
    cost: 35, stock: 40, minStock: 10,
    units: [
      { id: '11u', name: 'Unidad', factor: 1, price: 52, barcode: '7501000000011' },
    ]
  },
  {
    id: '12', barcode: '7501000000012', name: 'Tortillas 1kg', category: 'Panadería',
    cost: 12, stock: 60, minStock: 15,
    units: [
      { id: '12u', name: 'Kilo', factor: 1, price: 18, barcode: '7501000000012' },
    ]
  },
  {
    id: '13', barcode: '7501000000013', name: 'Leche Entera 1L', category: 'Lácteos',
    cost: 18, stock: 80, minStock: 20,
    units: [
      { id: '13u', name: 'Unidad', factor: 1, price: 26, barcode: '7501000000013' },
      { id: '13c', name: 'Caja (12)', factor: 12, price: 280, barcode: '7501000000113' },
    ]
  },
  {
    id: '14', barcode: '7501000000014', name: 'Yogurt Natural', category: 'Lácteos',
    cost: 12, stock: 50, minStock: 12,
    units: [
      { id: '14u', name: 'Unidad', factor: 1, price: 19, barcode: '7501000000014' },
    ]
  },
  {
    id: '15', barcode: '7501000000015', name: 'Queso Oaxaca 250g', category: 'Lácteos',
    cost: 45, stock: 30, minStock: 8,
    units: [
      { id: '15u', name: 'Unidad', factor: 1, price: 65, barcode: '7501000000015' },
      { id: '15k', name: 'Kilo', factor: 4, price: 240, barcode: '7501000000115' },
    ]
  },
  {
    id: '16', barcode: '7501000000016', name: 'Huevo', category: 'Abarrotes',
    cost: 32, stock: 50, minStock: 10,
    units: [
      { id: '16k', name: 'Kilo', factor: 1, price: 48, barcode: '7501000000016' },
    ]
  },
  {
    id: '17', barcode: '7501000000017', name: 'Arroz 1kg', category: 'Abarrotes',
    cost: 18, stock: 80, minStock: 20,
    units: [
      { id: '17u', name: 'Kilo', factor: 1, price: 28, barcode: '7501000000017' },
      { id: '17b', name: 'Bulto (25kg)', factor: 25, price: 600, barcode: '7501000000117' },
    ]
  },
  {
    id: '18', barcode: '7501000000018', name: 'Frijol 1kg', category: 'Abarrotes',
    cost: 24, stock: 70, minStock: 15,
    units: [
      { id: '18u', name: 'Kilo', factor: 1, price: 35, barcode: '7501000000018' },
      { id: '18b', name: 'Bulto (25kg)', factor: 25, price: 750, barcode: '7501000000118' },
    ]
  },
  {
    id: '19', barcode: '7501000000019', name: 'Aceite 1L', category: 'Abarrotes',
    cost: 28, stock: 50, minStock: 12,
    units: [
      { id: '19u', name: 'Unidad', factor: 1, price: 42, barcode: '7501000000019' },
      { id: '19c', name: 'Caja (12)', factor: 12, price: 450, barcode: '7501000000119' },
    ]
  },
  {
    id: '20', barcode: '7501000000020', name: 'Atún en lata', category: 'Abarrotes',
    cost: 14, stock: 100, minStock: 24,
    units: [
      { id: '20u', name: 'Unidad', factor: 1, price: 22, barcode: '7501000000020' },
      { id: '20c', name: 'Caja (48)', factor: 48, price: 900, barcode: '7501000000120' },
    ]
  },
];

export const categories = [...new Set(products.map(p => p.category))];
