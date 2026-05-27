/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Smartphone,
  Monitor,
  UserCheck,
  Trophy,
  Scissors,
  Sparkles,
  Check,
  MessageSquare,
  Bell,
  Compass,
  Volume2,
  HelpCircle,
  Database,
  ArrowRight,
  ShieldAlert,
  LogOut,
  User
} from 'lucide-react';
import { globalStore } from './data/store';
import { ClientPortal } from './components/ClientPortal';
import { AdminPortal } from './components/AdminPortal';
import { BarberPortal } from './components/BarberPortal';
import { AffiliatePortal } from './components/AffiliatePortal';
import { AuthScreen } from './components/AuthScreen';
import { useAuth } from './context/AuthContext';
import { useApiSync } from './hooks/useApiSync';

export default function App() {
  const { isAuthenticated, isDemoMode, loading, user, logout } = useAuth();
  const { barbearia, synced } = useApiSync();
  const [activeRole, setActiveRole] = useState<'client' | 'admin' | 'barber' | 'affiliate'>('client');
  const [latestNotification, setLatestNotification] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [storeState, setStoreState] = useState({ ...globalStore });

  // ⚠️ TODOS os hooks ANTES de qualquer early return (React Rules of Hooks)
  useEffect(() => {
    const unsub = globalStore.subscribe(() => {
      setStoreState({ ...globalStore });

      const lastMsg = globalStore.whatsappMessages[0];
      if (lastMsg) {
        setLatestNotification(`WhatsApp para ${lastMsg.customerName}: ${lastMsg.content}`);
        setShowNotification(true);
        const timer = setTimeout(() => setShowNotification(false), 8000);
        return () => clearTimeout(timer);
      }
    });
    return unsub;
  }, []);

  // Early returns APÓS todos os hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B08D57]/30 border-t-[#B08D57] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated && !isDemoMode) {
    return <AuthScreen />;
  }

  const triggerManualNotification = (message: string) => {
    setLatestNotification(message);
    setShowNotification(true);
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 5000);
    return () => clearTimeout(timer);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-gray-200 selection:bg-[#B08D57]/30 selection:text-[#D6C29A] flex flex-col" id="app_master_root">
      
      {/* GLAMOUR BRANDING HEADER */}
      <header className="border-b border-[#B08D57]/20 bg-[#070708]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-3 sm:py-4 flex flex-row md:flex-row justify-between items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8A6A3D] to-[#D6C29A] p-[1.5px] shadow-lg shadow-[#B08D57]/10">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Scissors className="w-4.5 h-4.5 text-[#D6C29A] transform -rotate-12" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-serif font-semibold tracking-[0.15em] text-white uppercase">
                <span className="gold-text">{barbearia?.nome || 'BarberPro'}</span> {!barbearia && <span className="text-[#B08D57] font-bold">Premium</span>}
              </h1>
              <span className="text-[9px] bg-[#B08D57]/10 text-[#D6C29A] border border-[#B08D57]/20 px-2 py-0.2 rounded-full uppercase tracking-widest font-bold font-mono">
                Elite Franquia v1.2
              </span>
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">SaaS de Gestão e Reservas Online sem Colisão de Poltronas</p>
          </div>
        </div>

        {/* AUTH STATUS + LOGOUT */}
        <div className="hidden sm:flex items-center gap-2 mr-2 shrink-0">
          {isDemoMode ? (
            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-full uppercase tracking-widest font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Demo
            </span>
          ) : user ? (
            <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
              <User className="w-3 h-3 text-[#B08D57]" />
              <span className="hidden lg:inline text-gray-300">{user.nome}</span>
            </span>
          ) : null}
          <button
            onClick={logout}
            title="Sair"
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* WORKSPACE ACTOR SWITCHER BUTTONS */}
        <div className="flex bg-[#111214] border border-[#B08D57]/20 p-1 rounded-2xl gap-1 shrink-0">
          <button
            id="role_switch_client"
            onClick={() => {
              setActiveRole('client');
              triggerManualNotification('Visão do Cliente Ativada: Simule o fluxo de reservas virtuais por QR code/WhatsApp.');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeRole === 'client' 
                ? 'bg-gradient-to-r from-[#8A6A3D] to-[#B08D57] text-black font-extrabold shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1. Cliente (App)</span>
          </button>
          
          <button
            id="role_switch_barber"
            onClick={() => {
              setActiveRole('barber');
              triggerManualNotification('Visão do Barbeiro Ativada: Monitore suas metas de faturamento, comissões de e agendas do dia.');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeRole === 'barber' 
                ? 'bg-gradient-to-r from-[#8A6A3D] to-[#B08D57] text-black font-extrabold shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2. Barbeiro</span>
          </button>

          <button
            id="role_switch_affiliate"
            onClick={() => {
              setActiveRole('affiliate');
              triggerManualNotification('Visão do Afiliado Ativada: Conecte influenciadores e concierges com cupons próprios.');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeRole === 'affiliate' 
                ? 'bg-gradient-to-r from-[#8A6A3D] to-[#B08D57] text-black font-extrabold shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3. Afiliado</span>
          </button>

          <button
            id="role_switch_admin"
            onClick={() => {
              setActiveRole('admin');
              triggerManualNotification('Painel Operacional ERP Ativado: Gerenciamento comercial total das franquias mundiais.');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeRole === 'admin' 
                ? 'bg-gradient-to-r from-[#8A6A3D] to-[#B08D57] text-black font-extrabold shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">4. Dono / ERP</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE SPLITTER CONTAINER */}
      <main className="flex-1 flex flex-col xl:flex-row gap-4 xl:gap-6 p-3 sm:p-4 md:p-6 overflow-auto xl:overflow-hidden">

        {/* PORTLET SIDEBAR — oculta no mobile, visível em xl+ */}
        <div className="hidden xl:flex xl:w-[320px] shrink-0 flex-col gap-6" id="saas_specifications_sidebar">
          
          {/* Brand Philosophy Panel */}
          <div className="glass rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B08D57]/5 rounded-bl-full" />
            
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#B08D57] block">BarberPro Concept</span>
            <h2 className="text-sm font-bold serif font-serif text-white mt-1 uppercase tracking-wider">Ritual e Tecnologia</h2>
            <p className="text-xs text-gray-300 mt-2.5 leading-relaxed">
              O BarberPro Premium é um software de gestão sob medida para operações masculinas de alto ticket. 
              Elimina o retrabalho de reservas duplicadas por meio de uma avançada <strong className="text-white">API de Agendamento Inteligente em Tempo Real</strong> e estimula faturamentos recorrentes usando o módulo de <strong className="text-white">Clubes VIP de Assinatura</strong> (SaaS de Atendimento Recorrente).
            </p>
          </div>

          {/* Database & Models checklist visualization */}
          <div className="glass rounded-3xl p-5 flex flex-col gap-3">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#B08D57] flex items-center gap-1 font-mono">
              <Database className="w-3.5 h-3.5 text-[#B08D57]" /> Esquema Relacional de Dados Active
            </span>
            <p className="text-[10px] text-gray-400 mt-0.5">Tabelas modeladas e sincronizadas do banco à disposição:</p>
            
            <div className="flex flex-col gap-2 mt-1 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-850">
              <div className="flex justify-between text-[10px] bg-black/45 hover:bg-black/60 p-2 rounded border border-[#B08D57]/10 transition-colors">
                <span className="font-mono text-gray-300">🏢 branches (Filiais)</span>
                <span className="text-[#C5A46D] font-mono">{storeState.branches.length} ativas</span>
              </div>
              <div className="flex justify-between text-[10px] bg-black/45 hover:bg-black/60 p-2 rounded border border-[#B08D57]/10 transition-colors">
                <span className="font-mono text-gray-300">💈 barbers (Barbeiros)</span>
                <span className="text-[#C5A46D] font-mono">{storeState.barbers.length} elites</span>
              </div>
              <div className="flex justify-between text-[10px] bg-black/45 hover:bg-black/60 p-2 rounded border border-[#B08D57]/10 transition-colors">
                <span className="font-mono text-gray-300">✂️ services (Serviços)</span>
                <span className="text-[#C5A46D] font-mono">{storeState.services.length} rituais</span>
              </div>
              <div className="flex justify-between text-[10px] bg-black/45 hover:bg-black/60 p-2 rounded border border-[#B08D57]/10 transition-colors">
                <span className="font-mono text-gray-300">📅 appointments (Agendas)</span>
                <span className="text-emerald-400 font-mono font-bold animate-pulse">{storeState.appointments.length} registros</span>
              </div>
              <div className="flex justify-between text-[10px] bg-black/45 hover:bg-black/60 p-2 rounded border border-[#B08D57]/10 transition-colors">
                <span className="font-mono text-gray-300">💎 subscriptions (Planos VIP)</span>
                <span className="text-[#C5A46D] font-mono">{storeState.subscriptions.length} ativos</span>
              </div>
              <div className="flex justify-between text-[10px] bg-black/45 hover:bg-black/60 p-2 rounded border border-[#B08D57]/10 transition-colors">
                <span className="font-mono text-gray-300">🤝 affiliates (Afiliados)</span>
                <span className="text-[#C5A46D] font-mono">{storeState.affiliates.length} parceiros</span>
              </div>
              <div className="flex justify-between text-[10px] bg-black/45 hover:bg-black/60 p-2 rounded border border-[#B08D57]/10 transition-colors">
                <span className="font-mono text-gray-300">💬 whatsapp_logs</span>
                <span className="text-sky-400 font-mono font-bold">{storeState.whatsappMessages.length} enviados</span>
              </div>
            </div>
          </div>

          {/* Quick instructions indicator */}
          <div className="glass rounded-3xl p-5 flex flex-col gap-2 bg-gradient-to-b from-[#111214] to-black/30">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#B08D57] flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Guia de Operação Rápida
            </span>
            <ol className="text-[10px] text-gray-300 leading-relaxed list-decimal pl-3 space-y-2 mt-1.5 font-sans">
              <li>Na vista <strong className="text-white">1. Cliente</strong>, agende um horário. Veja que o sistema calcula e mostra apenas horários verdadeiramente disponíveis.</li>
              <li>Ative uma assinatura do <strong className="text-[#D6C29A]">Club Black</strong>. Seu preço de serviço passará a constar como <strong className="text-emerald-400 font-bold">R$ 0,00</strong>!</li>
              <li>Acesse a vista <strong className="text-white">2. Barbeiro</strong> e simule sua tela interna. Você verá sua comissão subindo em tempo real.</li>
              <li>Acesse a vista <strong className="text-white">4. Dono / ERP</strong> para ver os gráficos financeiros agregados e gerenciar as filiais!</li>
            </ol>
          </div>
        </div>

        {/* PRIMARY ACTIVE ACTOR INTERFACE DISPLAY PANEL */}
        <div className="flex-1 flex flex-col justify-center items-center min-w-0">
          
          {activeRole === 'client' && (
            <div className="w-full flex justify-center items-center py-2" id="client_portal_container_wrapper">
              <ClientPortal onNotifyTriggered={triggerManualNotification} />
            </div>
          )}

          {activeRole === 'barber' && (
            <div className="w-full flex justify-center items-center py-2" id="barber_portal_container_wrapper">
              <BarberPortal onNotifyTriggered={triggerManualNotification} />
            </div>
          )}

          {activeRole === 'affiliate' && (
            <div className="w-full flex justify-center items-center py-2" id="affiliate_portal_container_wrapper">
              <AffiliatePortal onNotifyTriggered={triggerManualNotification} />
            </div>
          )}

          {activeRole === 'admin' && (
            <div className="w-full h-full" id="admin_portal_container_wrapper">
              <AdminPortal onNotifyTriggered={triggerManualNotification} />
            </div>
          )}

        </div>

      </main>

      {/* FLOATING WHATSAPP AUTOMATION SIMULATOR NOTIFICATION BUBBLE Widget */}
      <AnimatePresence>
        {showNotification && latestNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-80 bg-gradient-to-tr from-[#111214] to-black border-2 border-[#B08D57] rounded-2xl shadow-2xl p-4 flex gap-3 text-xs shadow-[#B08D57]/15"
            id="whatsapp_bubble_simulator"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-emerald-500/20">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center w-full">
                <span className="font-bold text-white tracking-wide uppercase text-[9px]">WhatsApp Disparado</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">11:29</span>
              </div>
              <p className="text-gray-300 font-sans leading-relaxed text-[10px] mt-1.5 whitespace-pre-wrap">{latestNotification}</p>
              
              <div className="mt-2 text-[8px] text-gray-500 uppercase flex items-center gap-1 font-mono tracking-wider pt-1.5 border-t border-gray-900">
                <span>⚡ Automação BarberPro Ativa</span>
              </div>
            </div>
            <button 
              id="btn_dismiss_toast"
              onClick={() => setShowNotification(false)}
              className="text-gray-500 hover:text-white shrink-0 font-bold ml-1 self-start"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER BAR */}
      <footer className="border-t border-gray-950 py-4 px-6 text-center text-[10px] text-gray-500 uppercase tracking-widest bg-black flex justify-between items-center">
        <span>BarberPro Premium © 2026 • BarberPro Premium S/A</span>
        <span>Suíte Comercial Escalonável</span>
      </footer>
    </div>
  );
}
