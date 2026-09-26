import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedUser) {
      pinRef.current?.focus();
    }
  }, [selectedUser]);

  const handlePinSubmit = () => {
    if (selectedUser && pin === selectedUser.pin) {
      onLogin(selectedUser);
    } else {
      setError('PIN incorrecto');
      setPin('');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handlePinChange = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value);
      if (value.length === 4) {
        setTimeout(() => {
          if (selectedUser && value === selectedUser.pin) {
            onLogin(selectedUser);
          } else {
            setError('PIN incorrecto');
            setPin('');
            setTimeout(() => setError(''), 2000);
          }
        }, 100);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <span className="text-4xl">🏪</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Depósito San Juditas</h1>
          <p className="text-blue-200 mt-1">Sistema Punto de Venta</p>
        </div>

        {!selectedUser ? (
          /* User Selection */
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-4 text-center">Selecciona tu usuario</h2>
            <div className="grid grid-cols-1 gap-3">
              {users.filter(u => u.active).map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 hover:border-white/30 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-blue-200 text-sm capitalize">{user.role === 'admin' ? 'Administrador' : 'Cajero'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* PIN Entry */
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-medium text-lg">{selectedUser.name}</p>
              <p className="text-blue-200 text-sm">Ingresa tu PIN</p>
            </div>

            {/* PIN Display */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                    pin.length > i
                      ? 'border-green-400 bg-green-400/20 text-white'
                      : 'border-white/30 bg-white/5 text-white/50'
                  }`}
                >
                  {pin.length > i ? '●' : ''}
                </div>
              ))}
            </div>

            {/* PIN Input (hidden, for keyboard) */}
            <input
              ref={pinRef}
              type="password"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pin.length === 4) handlePinSubmit();
                if (e.key === 'Escape') { setSelectedUser(null); setPin(''); }
              }}
              className="absolute opacity-0 pointer-events-none"
              maxLength={4}
              autoFocus
            />

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button
                  key={n}
                  onClick={() => handlePinChange(pin + n)}
                  className="h-14 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xl font-bold transition-all active:scale-95"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => { setSelectedUser(null); setPin(''); }}
                className="h-14 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-300 text-sm font-medium transition-all"
              >
                ← Atrás
              </button>
              <button
                onClick={() => handlePinChange(pin + '0')}
                className="h-14 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xl font-bold transition-all active:scale-95"
              >
                0
              </button>
              <button
                onClick={() => handlePinChange(pin.slice(0, -1))}
                className="h-14 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl text-yellow-300 text-sm font-medium transition-all"
              >
                Borrar
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-center mt-4 text-sm font-medium animate-pulse">{error}</p>
            )}
          </div>
        )}

        <p className="text-center text-blue-300/50 text-xs mt-6">
          v1.0 • Depósito San Juditas © 2024
        </p>
      </div>
    </div>
  );
};
