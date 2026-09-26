import React, { useState } from 'react';
import { User } from '../types';
import { Settings as SettingsIcon, Users, Store, Save, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface SettingsProps {
  users: User[];
  onUpdateUsers: (users: User[]) => void;
  businessName: string;
  onUpdateBusinessName: (name: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ users, onUpdateUsers, businessName, onUpdateBusinessName }) => {
  const [storeName, setStoreName] = useState(businessName);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'cashier'>('cashier');
  const [saved, setSaved] = useState(false);

  const handleSaveStore = () => {
    onUpdateBusinessName(storeName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddUser = () => {
    if (!newUsername || !newName || !newPin) return;
    const newUser: User = {
      id: Date.now().toString(),
      username: newUsername,
      name: newName,
      role: newRole,
      pin: newPin,
      active: true,
    };
    onUpdateUsers([...users, newUser]);
    setNewUsername('');
    setNewName('');
    setNewPin('');
    setShowAddUser(false);
  };

  const toggleUser = (id: string) => {
    onUpdateUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  const deleteUser = (id: string) => {
    onUpdateUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      {/* Business Settings */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">Datos del Negocio</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nombre del Negocio</label>
            <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">RFC</label>
            <input type="text" defaultValue="XAXX010101000" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" defaultValue="Av. Principal #123" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Teléfono</label>
            <input type="text" defaultValue="(555) 123-4567" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">IVA (%)</label>
            <input type="number" defaultValue="16" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Moneda</label>
            <select defaultValue="MXN" className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="MXN">Peso Mexicano (MXN)</option>
              <option value="USD">Dólar (USD)</option>
            </select>
          </div>
        </div>
        <button onClick={handleSaveStore} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors">
          <Save className="w-4 h-4" /> Guardar Cambios
        </button>
        {saved && <span className="ml-3 text-green-600 text-sm font-medium">✓ Guardado</span>}
      </div>

      {/* Users Management */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-800">Usuarios del Sistema</h3>
          </div>
          <button onClick={() => setShowAddUser(!showAddUser)} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg flex items-center gap-1">
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        {/* Add User Form */}
        {showAddUser && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" placeholder="Usuario" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="Nombre completo" value={newName} onChange={e => setNewName(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
              <input type="text" placeholder="PIN (4 dígitos)" value={newPin} onChange={e => setNewPin(e.target.value)} maxLength={4} className="px-3 py-2 border rounded-lg text-sm" />
              <select value={newRole} onChange={e => setNewRole(e.target.value as 'admin' | 'cashier')} className="px-3 py-2 border rounded-lg text-sm">
                <option value="cashier">Cajero</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleAddUser} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg">Crear Usuario</button>
              <button onClick={() => setShowAddUser(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg">Cancelar</button>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.id} className={`flex items-center justify-between p-3 rounded-lg border ${user.active ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                  <span className={`font-bold text-sm ${user.role === 'admin' ? 'text-amber-700' : 'text-blue-700'}`}>
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">@{user.username} • PIN: {user.pin} • <span className="capitalize">{user.role === 'admin' ? 'Administrador' : 'Cajero'}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleUser(user.id)} className={`p-1.5 rounded-lg transition-colors ${user.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                  {user.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <button onClick={() => deleteUser(user.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-gray-600" />
          Información del Sistema
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Versión:</span> <span className="font-medium">1.0.0</span></div>
          <div><span className="text-gray-500">Licencia:</span> <span className="font-medium">Comercial</span></div>
          <div><span className="text-gray-500">Base datos:</span> <span className="font-medium">Local</span></div>
          <div><span className="text-gray-500">Impresora:</span> <span className="font-medium">Térmica 58mm</span></div>
        </div>
      </div>
    </div>
  );
};
