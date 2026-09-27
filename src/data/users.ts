import { User } from '../types';

export const defaultUsers: User[] = [
  { id: '1', username: 'admin', name: 'Administrador', role: 'admin', password: 'admin123', active: true },
  { id: '2', username: 'cajero1', name: 'María García', role: 'cashier', password: '1234', active: true },
  { id: '3', username: 'cajero2', name: 'Juan López', role: 'cashier', password: '5678', active: true },
];
