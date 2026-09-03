import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/inicio');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#25282A] overflow-hidden font-sans">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#001871]/30"></div>
        {/* Simple CSS animation for futuristic feel */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1685BC] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-[#A7E6D7] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-[#25282A]/70 backdrop-blur-xl border border-[#DDE5ED]/10 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#A7E6D7] mb-2 tracking-widest drop-shadow-[0_0_10px_rgba(167,230,215,0.5)]">AJM SYSTEM</h1>
          <p className="text-[#DDE5ED]/70 font-medium tracking-wide text-sm uppercase">Gestión Interna de Inventarios</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#DDE5ED] mb-2 uppercase tracking-wider">Usuario</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-[#A7E6D7]" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-11 pr-3 py-3 border border-[#1685BC]/30 rounded-lg bg-[#001871]/40 text-[#DDE5ED] placeholder-[#DDE5ED]/40 focus:outline-none focus:ring-2 focus:ring-[#A7E6D7] focus:border-transparent transition-all"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#DDE5ED] mb-2 uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#A7E6D7]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-3 py-3 border border-[#1685BC]/30 rounded-lg bg-[#001871]/40 text-[#DDE5ED] placeholder-[#DDE5ED]/40 focus:outline-none focus:ring-2 focus:ring-[#A7E6D7] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button type="button" className="text-sm font-medium text-[#1685BC] hover:text-[#A7E6D7] transition-colors">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-[0_0_15px_rgba(167,230,215,0.3)] text-sm font-bold text-[#001871] bg-[#A7E6D7] hover:bg-[#DDE5ED] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A7E6D7] focus:ring-offset-[#25282A] transition-all tracking-widest"
          >
            ENTRAR AL SISTEMA
          </button>
        </form>
      </div>
    </div>
  );
}
