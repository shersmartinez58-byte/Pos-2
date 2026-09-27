# Depósito San Juditas - Sistema POS

Sistema de punto de venta completo para Depósito San Juditas con soporte para Firebase y modo local.

## Características

- ✅ Autenticación con usuario y contraseña
- ✅ Punto de venta con búsqueda por nombre o código de barras
- ✅ Venta por unidad, caja o kit
- ✅ Sistema de devoluciones
- ✅ Gestión de inventario
- ✅ Kits de productos
- ✅ Ajustes de inventario
- ✅ Promociones y descuentos
- ✅ Historial de ventas
- ✅ Configuraciones
- ✅ Impresión de tickets (58mm)
- ✅ Modo consumo propio
- ✅ Sincronización en tiempo real con Firebase
- ✅ Modo local (funciona sin Firebase)

## Configuración

### Modo Local (Sin Firebase)

La aplicación funciona automáticamente en modo local si Firebase no está disponible. Los datos se guardan en el estado de la aplicación y se pierden al recargar la página.

### Modo Firebase (Recomendado para producción)

1. **Crear proyecto en Firebase**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto llamado "depositosanjudas-praxis"
   - Habilita Firestore Database

2. **Configurar Firestore**
   - Ve a Firestore Database
   - Crea las siguientes colecciones:
     - `products`
     - `kits`
     - `tickets`
     - `users`
     - `promotions`
     - `adjustments`
     - `settings`

3. **Reglas de seguridad**
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

4. **Configurar credenciales**
   - Ve a Configuración del proyecto > Tus aplicaciones
   - Copia las credenciales de configuración web
   - Reemplaza las credenciales en `src/firebase.ts`

5. **Instalar dependencias**
   ```bash
   npm install
   ```

6. **Ejecutar la aplicación**
   ```bash
   npm run dev
   ```

## Usuarios por defecto

Cuando la base de datos está vacía, se crean automáticamente:

- **Admin**: admin / admin123
- **Cajero 1**: cajero1 / 1234
- **Cajero 2**: cajero2 / 5678

## Productos por defecto

Se cargan 24 productos de ejemplo cuando la base de datos está vacía.

## Estructura del proyecto

```
src/
├── components/          # Componentes React
│   ├── Dashboard.tsx
│   ├── Inventory.tsx
│   ├── InventoryAdjustment.tsx
│   ├── Kits.tsx
│   ├── Layout.tsx
│   ├── LoginScreen.tsx
│   ├── POS.tsx
│   ├── Promotions.tsx
│   ├── Returns.tsx
│   ├── SalesHistory.tsx
│   └── Settings.tsx
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

## Atajos de teclado

### Punto de Venta
- `F2`: Buscar producto
- `F3`: Escanear código de barras
- `F5`: Cobrar
- `F6`: Limpiar carrito
- `F7`: Imprimir último ticket
- `F12`: Nueva venta
- `+`: Aumentar cantidad del item seleccionado
- `-`: Disminuir cantidad del item seleccionado
- `Delete`: Eliminar item seleccionado
- `Alt+1`: Pago en efectivo
- `Alt+2`: Pago con tarjeta
- `Alt+3`: Pago con transferencia
- `Enter`: Confirmar pago

## Estructura de datos

### Product
```typescript
{
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
```

### Kit
```typescript
{
  id: string;
  name: string;
  icon: string;
  items: [{ productId: string; quantity: number }];
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  active: boolean;
}
```

### Ticket
```typescript
{
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
```

## Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Firebase Firestore
- Lucide React (iconos)

## Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## Notas importantes

- La aplicación funciona tanto con Firebase como sin él
- Si Firebase no está disponible, se usa modo local
- Los datos en modo local se pierden al recargar la página
- Para producción, se recomienda configurar Firebase
- Las credenciales de Firebase están en `src/firebase.ts`
- Los tickets se imprimen en formato de 58mm

## Licencia

Este proyecto es privado y pertenece a Depósito San Juditas.
