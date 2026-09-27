# Depósito San Juditas - Sistema POS

Sistema de Punto de Venta completo para Depósito San Juditas con integración de Firebase en tiempo real.

## Características

- ✅ **Autenticación**: Login con usuario y contraseña
- ✅ **Punto de Venta**: Venta por unidad, caja y kits
- ✅ **Devoluciones**: Procesamiento de devoluciones con reintegro de stock
- ✅ **Inventario**: Gestión completa de productos
- ✅ **Kits**: Creación y gestión de kits de productos
- ✅ **Ajustes de Inventario**: Correcciones y ajustes de stock
- ✅ **Promociones**: Descuentos y ofertas
- ✅ **Historial**: Registro completo de ventas
- ✅ **Configuraciones**: Gestión de usuarios y datos del negocio
- ✅ **Impresión**: Tickets optimizados para impresoras de 58mm
- ✅ **Consumo Propio**: Modo especial con precios diferenciados
- ✅ **Firebase**: Base de datos en tiempo real

## Configuración de Firebase

### 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado "depositosanjudas-praxis"
3. Habilita Firestore Database
4. Configura las reglas de seguridad (ver abajo)

### 2. Configurar Firestore

Ve a Firestore Database y crea las siguientes colecciones:

- `products` - Productos del inventario
- `kits` - Kits de productos
- `tickets` - Historial de ventas
- `users` - Usuarios del sistema
- `promotions` - Promociones activas
- `adjustments` - Ajustes de inventario
- `settings` - Configuración general

### 3. Reglas de seguridad de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Nota**: Para producción, implementa autenticación de Firebase y ajusta las reglas.

### 4. Configuración del proyecto

La configuración de Firebase ya está en `src/firebase.ts`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA49mQIpqvNORehX7fvs_EB5xTcKWSC2hU",
  authDomain: "depositosanjudas-praxis.firebaseapp.com",
  projectId: "depositosanjudas-praxis",
  storageBucket: "depositosanjudas-praxis.firebasestorage.app",
  messagingSenderId: "405711005956",
  appId: "1:405711005956:web:b7b93ea358b3342e5cc851",
  measurementId: "G-VMZKVK53XM"
};
```

## Usuarios por defecto

Cuando la base de datos está vacía, se crean automáticamente estos usuarios:

- **Administrador**: admin / admin123
- **Cajero 1**: cajero1 / 1234
- **Cajero 2**: cajero2 / 5678

## Productos por defecto

Cuando la base de datos está vacía, se cargan 24 productos de ejemplo incluyendo:
- Bebidas (Coca Cola, Pepsi, Agua, etc.)
- Botanas (Sabritas, Doritos, etc.)
- Dulces (Chocolate, Paletas, Gomitas, etc.)
- Lácteos (Leche, Yogurt, Queso, etc.)
- Abarrotes (Arroz, Frijol, Aceite, etc.)

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
```

## Estructura del proyecto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.tsx
│   ├── POS.tsx
│   ├── Returns.tsx
│   ├── Inventory.tsx
│   ├── Kits.tsx
│   ├── InventoryAdjustment.tsx
│   ├── Promotions.tsx
│   ├── SalesHistory.tsx
│   ├── Settings.tsx
│   ├── Layout.tsx
│   └── LoginScreen.tsx
├── data/               # Datos iniciales
│   ├── products.ts
│   └── users.ts
├── hooks/              # Custom hooks
│   └── useKeyboardShortcuts.ts
├── types.ts            # Tipos TypeScript
├── firebase.ts         # Configuración Firebase
├── firebaseService.ts  # Servicios Firebase
└── App.tsx             # Componente principal
```

## Funcionalidades principales

### Punto de Venta (POS)

- Búsqueda por nombre o código de barras
- Venta por unidad o caja
- Kits de productos
- Modo consumo propio (requiere autorización de admin)
- Métodos de pago: Efectivo, Tarjeta, Transferencia
- Cálculo automático de cambio
- Impresión de tickets (58mm)

### Atajos de teclado

- **F2**: Buscar producto
- **F3**: Escanear código de barras
- **F5**: Cobrar
- **F6**: Limpiar carrito
- **F7**: Imprimir ticket
- **F12**: Nueva venta
- **+/-**: Aumentar/disminuir cantidad
- **Delete**: Eliminar item
- **Alt+1**: Efectivo
- **Alt+2**: Tarjeta
- **Alt+3**: Transferencia

### Inventario

- Agregar/editar/eliminar productos
- Control de stock mínimo
- Alertas de stock bajo
- Edición rápida de stock

### Kits

- Crear kits combinando productos
- Precio de venta y costo
- Control de stock independiente
- Activar/desactivar kits

### Devoluciones

- Buscar tickets por número o cajero
- Seleccionar productos/kits a devolver
- Cálculo automático de reembolso
- Reintegro automático de stock

### Promociones

- Descuentos porcentuales
- Descuentos fijos
- Activar/desactivar promociones

## Firebase Collections

### products
```javascript
{
  id: string,
  barcode: string,
  barcodeCase?: string,
  name: string,
  icon: string,
  cost: number,
  unitPrice: number,
  casePrice: number,
  caseQty: number,
  ownConsumptionPrice: number,
  stock: number,
  minStock: number
}
```

### kits
```javascript
{
  id: string,
  name: string,
  icon: string,
  items: [{ productId: string, quantity: number }],
  price: number,
  cost: number,
  stock: number,
  minStock: number,
  active: boolean
}
```

### tickets
```javascript
{
  id: string,
  items: [CartItem],
  kits: [CartKitItem],
  subtotal: number,
  discount: number,
  tax: number,
  total: number,
  paymentMethod: 'cash' | 'card' | 'transfer',
  amountPaid: number,
  change: number,
  date: Timestamp,
  ticketNumber: string,
  cashier: string,
  isOwnConsumption: boolean
}
```

### users
```javascript
{
  id: string,
  username: string,
  name: string,
  role: 'admin' | 'cashier',
  password: string,
  active: boolean
}
```

## Tecnologías

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Firebase** - Backend en tiempo real
- **Lucide React** - Iconos

## Soporte

Para soporte o consultas, contacta al administrador del sistema.

---

**Versión**: 1.0.0  
**Última actualización**: 2024
