import { User } from '../types';

export const defaultUsers: User[] = [
  { id: '1', username: 'admin', name: 'Administrador', role: 'admin', pin: '1234', active: true },
  { id: '2', username: 'cajero1', name: 'María García', role: 'cashier', pin: '5678', active: true },
  { id: '3', username: 'cajero2', name: 'Juan López', role: 'cashier', pin: '9012', active: true },
];
