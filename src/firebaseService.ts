import { db } from './firebase';
import { collection, getDocs, setDoc, doc, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Product, Kit, Ticket, User, Promotion, InventoryAdjustment } from './types';

// Products
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const q = query(collection(db, 'products'));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    callback(products);
  });
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const docRef = await addDoc(collection(db, 'products'), product);
  return docRef.id;
};

export const updateProduct = async (product: Product) => {
  const { id, ...data } = product;
  await setDoc(doc(db, 'products', id), data);
};

export const deleteProduct = async (productId: string) => {
  await deleteDoc(doc(db, 'products', productId));
};

// Kits
export const subscribeToKits = (callback: (kits: Kit[]) => void) => {
  const q = query(collection(db, 'kits'));
  return onSnapshot(q, (snapshot) => {
    const kits = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Kit));
    callback(kits);
  });
};

export const addKit = async (kit: Omit<Kit, 'id'>) => {
  const docRef = await addDoc(collection(db, 'kits'), kit);
  return docRef.id;
};

export const updateKit = async (kit: Kit) => {
  const { id, ...data } = kit;
  await setDoc(doc(db, 'kits', id), data);
};

export const deleteKit = async (kitId: string) => {
  await deleteDoc(doc(db, 'kits', kitId));
};

// Tickets
export const subscribeToTickets = (callback: (tickets: Ticket[]) => void) => {
  const q = query(collection(db, 'tickets'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      } as Ticket;
    });
    callback(tickets);
  });
};

export const addTicket = async (ticket: Omit<Ticket, 'id'>) => {
  const docRef = await addDoc(collection(db, 'tickets'), {
    ...ticket,
    date: ticket.date instanceof Date ? ticket.date : new Date(),
  });
  return docRef.id;
};

// Users
export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, 'users'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User));
    callback(users);
  });
};

export const addUser = async (user: Omit<User, 'id'>) => {
  const docRef = await addDoc(collection(db, 'users'), user);
  return docRef.id;
};

export const updateUser = async (user: User) => {
  const { id, ...data } = user;
  await setDoc(doc(db, 'users', id), data);
};

export const deleteUser = async (userId: string) => {
  await deleteDoc(doc(db, 'users', userId));
};

// Promotions
export const subscribeToPromotions = (callback: (promotions: Promotion[]) => void) => {
  const q = query(collection(db, 'promotions'));
  return onSnapshot(q, (snapshot) => {
    const promotions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Promotion));
    callback(promotions);
  });
};

export const addPromotion = async (promotion: Omit<Promotion, 'id'>) => {
  const docRef = await addDoc(collection(db, 'promotions'), promotion);
  return docRef.id;
};

export const updatePromotion = async (promotion: Promotion) => {
  const { id, ...data } = promotion;
  await setDoc(doc(db, 'promotions', id), data);
};

export const deletePromotion = async (promotionId: string) => {
  await deleteDoc(doc(db, 'promotions', promotionId));
};

// Inventory Adjustments
export const subscribeToAdjustments = (callback: (adjustments: InventoryAdjustment[]) => void) => {
  const q = query(collection(db, 'adjustments'), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const adjustments = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      } as InventoryAdjustment;
    });
    callback(adjustments);
  });
};

export const addAdjustment = async (adjustment: Omit<InventoryAdjustment, 'id'>) => {
  const docRef = await addDoc(collection(db, 'adjustments'), {
    ...adjustment,
    date: adjustment.date instanceof Date ? adjustment.date : new Date(),
  });
  return docRef.id;
};

// Settings
export const getSettings = async () => {
  const docRef = doc(db, 'settings', 'general');
  const snapshot = await getDocs(collection(db, 'settings'));
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data();
  return data;
};

export const saveSettings = async (settings: Record<string, unknown>) => {
  await setDoc(doc(db, 'settings', 'general'), settings);
};
