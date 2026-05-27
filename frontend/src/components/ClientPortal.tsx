/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles, 
  Check, 
  ChevronRight, 
  ArrowLeft, 
  Award, 
  Coins, 
  Crown, 
  ShieldCheck, 
  Smartphone, 
  X,
  User,
  Scissors
} from 'lucide-react';
import { globalStore } from '../data/store';
import { SubscriptionPlan, Branch, Barber, Service } from '../types';

interface ClientPortalProps {
  onNotifyTriggered: (msg: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ onNotifyTriggered }) => {
  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'onboarding' | 'home' | 'schedule' | 'club' | 'profile'>('splash');
  const [storeState, setStoreState] = useState({ ...globalStore });

  // Booking states
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [affiliateCode, setAffiliateCode] = useState<string>('');
  
  // Member activation state
  const [selectedPlanToSubscribe, setSelectedPlanToSubscribe] = useState<SubscriptionPlan | null>(null);
  const [subscribingCustPhone, setSubscribingCustPhone] = useState<string>('');
  const [subscribingCustName, setSubscribingCustName] = useState<string>('');
  const [authPhone, setAuthPhone] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedClient, setLoggedClient] = useState<any>(null);

  // Load latest store state
  useEffect(() => {
    const unsub = globalStore.subscribe(() => {
      setStoreState({ ...globalStore });
    });
    return unsub;
  }, []);

  // Sync logged customer when logging in
  useEffect(() => {
    if (isLoggedIn && authPhone) {
      const client = storeState.customers.find(c => c.phone === authPhone);
      if (client) {
        setLoggedClient(client);
      } else {
        // Create transient client
        setLoggedClient({
          id: 'temp_client',
          name: 'Cliente Convidado',
          phone: authPhone,
          vip: false,
          loyaltyPoints: 0,
          status: 'Nenhum'
        });
      }
    } else {
      setLoggedClient(null);
    }
  }, [isLoggedIn, authPhone, storeState.customers]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPhone) return;
    setIsLoggedIn(true);
    // Try to prefill fields in scheduler
    const match = storeState.customers.find(c => c.phone === authPhone);
    if (match) {
      setClientName(match.name);
      setClientPhone(match.phone);
    } else {
      setClientPhone(authPhone);
    }
    onNotifyTriggered('Sessão iniciada com sucesso. Experiência de alta fidelidade ativada.');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthPhone('');
    setLoggedClient(null);
    onNotifyTriggered('Sessão encerrada.');
  };

  // Format date helper: "YYYY-MM-DD" to short Portuguese: "Quarta, 27 Mai"
  const getReadableDay = (dateStr: string) => {
    if (!dateStr) return '';
    const dateObjsObj = new Date(dateStr + 'T00:00:00');
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${weekdays[dateObjsObj.getDay()]}, ${dateObjsObj.getDate()} de ${months[dateObjsObj.getMonth()]}`;
  };

  // Quick next 5 days generator
  const getNextDays = () => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 5; i++) {
      const next = new Date(today);
      next.setDate(today.getDate() + i);
      const yyyy = next.getFullYear();
      const mm = String(next.getMonth() + 1).padStart(2, '0');
      const dd = String(next.getDate()).padStart(2, '0');
      days.push(`${yyyy}-${mm}-${dd}`);
    }
    return days;
  };

  // Perform Appointment creation
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch || !selectedBarber || !selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const apt = globalStore.createAppointment({
        branchId: selectedBranch.id,
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        customerName: clientName,
        customerPhone: clientPhone,
        date: selectedDate,
        time: selectedTime,
        affiliateCode: affiliateCode
      });

      // Reset booking info
      setSelectedBranch(null);
      setSelectedBarber(null);
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
      setAffiliateCode('');
      setBookingStep(1);

      onNotifyTriggered(`Agendamento realizado! Confirmação e lembrete automáticos agendados no WhatsApp para ${clientPhone}.`);
      
      // Auto redirect to profile or home
      setIsLoggedIn(true);
      setAuthPhone(clientPhone);
      setCurrentScreen('profile');
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Perform Subscriber VIP purchase
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanToSubscribe || !subscribingCustName || !subscribingCustPhone) {
      alert('Por favor, digite seu nome e telefone.');
      return;
    }

    const sub = globalStore.buySubscription(
      'cust_' + Date.now(), 
      selectedPlanToSubscribe.id,
      affiliateCode
    );

    // Set logged state
    setAuthPhone(subscribingCustPhone);
    setIsLoggedIn(true);

    setSelectedPlanToSubscribe(null);
    setSubscribingCustPhone('');
    setSubscribingCustName('');
    setAffiliateCode('');

    onNotifyTriggered(`Assinatura do ${sub.planId === 'plan_black' ? 'Club Black' : sub.planId === 'plan_gold' ? 'Club Gold' : 'Club Bronze'} com sucesso!`);
    setCurrentScreen('profile');
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto aspect-[9/19] max-h-[82svh] bg-[#070708] rounded-[32px] sm:rounded-[48px] border-4 sm:border-8 border-[#1a1b1e] shadow-2xl relative overflow-hidden flex flex-col font-sans" id="phone-container">
      {/* Phone Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#1a1b1e] rounded-b-2xl z-50 flex items-center justify-center">
        <div className="w-12 h-1 bg-black rounded-full mb-1"></div>
      </div>
      
      {/* Active screen content */}
      <div className="flex-1 flex flex-col pt-8 pb-4 px-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-850">
        <AnimatePresence mode="wait">
          
          {/* SCREEN 1: SPLASH SCREEN (LUXURY BRAND LAUNCHER) */}
          {currentScreen === 'splash' && (
            <motion.div 
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-between py-12 text-center"
              id="splash_screen"
            >
              <div className="pt-16 flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="w-20 h-20 rounded-2xl border-2 border-[#B08D57] bg-[#111214] flex items-center justify-center shadow-lg shadow-[#B08D57]/20"
                >
                  <Scissors className="w-10 h-10 text-[#D6C29A]" />
                </motion.div>
                <h1 className="text-2.5xl tracking-[0.18em] font-serif serif font-bold text-white mt-6 uppercase">
                  <span className="gold-text">BarberPro</span> <span className="text-white text-opacity-80">Premium</span>
                </h1>
                <p className="text-[#B08D57] text-[10px] tracking-[0.25em] font-mono uppercase mt-2">
                  HAIRCUT • SPA • VIP CLUB
                </p>
              </div>

              <div className="flex flex-col items-center w-full px-6 gap-4">
                <div className="text-gray-300 text-xs italic font-serif">
                  "Onde a masculinidade clássica encontra a exclusividade contemporânea."
                </div>
                
                <button
                  id="btn_enter_platform"
                  onClick={() => setCurrentScreen('onboarding')}
                  className="btn-premium w-full py-4 rounded-xl text-black font-extrabold tracking-widest uppercase text-xs flex items-center justify-center gap-2 mt-4"
                >
                  Iniciar Experiência 
                  <ChevronRight className="w-4 h-4 text-black stroke-[3]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: ONBOARDING */}
          {currentScreen === 'onboarding' && (
            <motion.div 
              key="onboarding"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: -20 }}
              className="flex-1 flex flex-col justify-between py-8"
              id="onboarding_screen"
            >
              <div className="flex justify-between items-center px-2">
                <span className="text-[#B08D57] font-mono text-[10px] tracking-widest uppercase">SOBRE NÓS</span>
                <button 
                  id="skip_onboard"
                  onClick={() => setCurrentScreen('home')} 
                  className="text-xs text-[#6E8B8E] hover:text-white font-mono"
                >
                  Pular
                </button>
              </div>

              <div className="mt-8 px-2 flex flex-col gap-6">
                <div className="glass rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#B08D57]/5 rounded-bl-[100px]" />
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg bg-[#8A6A3D]/20 border border-[#B08D57]/30 flex items-center justify-center text-[#D6C29A] shrink-0 mt-1">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold font-serif serif text-[#D6C29A]">Frequência Sem Limites</h4>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed font-sans">
                        Torne-se assinante do nosso Club VIP e venha cortar o cabelo e aparar a barba quantas vezes quiser por uma parcela fixa mensal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#B08D57]/5 rounded-bl-[100px]" />
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg bg-[#8A6A3D]/20 border border-[#B08D57]/30 flex items-center justify-center text-[#D6C29A] shrink-0 mt-1">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold font-serif serif text-[#D6C29A]">Barbeiros de Elite</h4>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed font-sans">
                        Agende com diretores artísticos com formação europeia em visagismo 3D e corte com precisão cirúrgica de tesoura.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#B08D57]/5 rounded-bl-[100px]" />
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg bg-[#8A6A3D]/20 border border-[#B08D57]/30 flex items-center justify-center text-[#D6C29A] shrink-0 mt-1">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold font-serif serif text-[#D6C29A]">Open Bar & Club Amigos</h4>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed font-sans">
                        Serviço com café italiano, garrafas numeradas de whisky single-malt e chopp artesanal de cortesia em ambiente sofisticado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-2 mt-8">
                <button
                  id="go_home_button"
                  onClick={() => setCurrentScreen('home')}
                  className="w-full py-4 rounded-xl bg-black border-2 border-[#B08D57] text-[#D6C29A] font-extrabold text-xs tracking-widest uppercase hover:bg-[#B08D57] hover:text-black transition-all duration-300 cursor-pointer"
                >
                  Entrar na Sede Virtual
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 3: APP HOME (THE ENTRY POINT FOR LINK/QR-CODE CLIENT) */}
          {currentScreen === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-5 pb-6"
              id="client_portal_home"
            >
              {/* Premium Header */}
              <div className="flex justify-between items-center py-2 border-b border-gray-900">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B08D57] animate-pulse"></span>
                  <span className="text-xs text-gray-100 uppercase tracking-widest font-semibold">BarberPro Jardins</span>
                </div>
                {isLoggedIn ? (
                  <button 
                    id="btn_user_profile" 
                    onClick={() => setCurrentScreen('profile')}
                    className="w-8 h-8 rounded-full border border-[#B08D57] bg-[#111214] flex items-center justify-center text-[#D6C29A] text-xs font-bold"
                  >
                    {loggedClient?.name?.charAt(0) || 'U'}
                  </button>
                ) : (
                  <span className="text-[10px] text-[#6E8B8E] font-mono">Convidado</span>
                )}
              </div>

              {/* Login Bar if not logged in */}
              {!isLoggedIn && (
                <div className="bg-[#111214]/90 border border-[#B08D57]/20 rounded-xl p-3.5 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#D6C29A] font-medium">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Já é cliente ou associado?</span>
                  </div>
                  <form onSubmit={handleLogin} className="flex gap-2">
                    <input 
                      type="tel"
                      id="login_phone"
                      placeholder="DDD + Seu WhatsApp"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="flex-1 bg-black border border-gray-800 text-xs px-2.5 py-1.5 rounded-md text-white focus:border-[#B08D57] focus:outline-none"
                    />
                    <button 
                      type="submit"
                      id="btn_submit_login"
                      className="bg-[#B08D57] text-black text-[11px] font-bold px-3 py-1.5 rounded-md uppercase hover:bg-opacity-90 tracking-wider"
                    >
                      Acessar
                    </button>
                  </form>
                </div>
              )}

              {/* Promo Banner / Club VIP Callout */}
              <div className="glass border border-[#B08D57]/45 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between h-40 bg-[#111214]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#B08D57]/5 rounded-bl-full" />
                <div className="z-10">
                  <span className="text-[9px] bg-[#B08D57]/10 border border-[#B08D57]/30 text-[#D6C29A] px-2.5 py-1 rounded-full uppercase tracking-widest font-bold font-mono">
                    Club VIP Signature
                  </span>
                  <h3 className="text-base font-bold text-white mt-2.5 tracking-tight leading-tight font-serif serif">
                    Corte e Barba Sem Limites <br />no Plano Executivo
                  </h3>
                  <p className="text-gray-300 text-xs mt-1">Visitas recorrentes com pagamento fixo.</p>
                </div>
                <button
                  id="btn_see_vip_plans"
                  onClick={() => setCurrentScreen('club')}
                  className="w-fit text-xs text-[#D6C29A] font-medium hover:text-white flex items-center gap-1.5 mt-2 group font-serif serif cursor-pointer"
                >
                  Conhecer os Clubes 
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Action grid (Primary SaaS operation) */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs uppercase tracking-widest text-[#B08D57] ml-1 font-mono font-bold">Operações</h4>
                
                {/* Button: Schedule */}
                <button
                  id="btn_open_scheduler"
                  onClick={() => {
                    setBookingStep(1);
                    setCurrentScreen('schedule');
                  }}
                  className="w-full glass border border-[#B08D57]/15 rounded-2xl p-4 flex justify-between items-center hover:border-[#B08D57]/60 transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#B08D57]/10 flex items-center justify-center text-[#D6C29A] border border-[#B08D57]/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white font-serif serif">Agendar Horário Imperial</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Calculados em tempo real sem colisão</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#D6C29A] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Button: Subscribe VIP */}
                <button
                  id="btn_open_club"
                  onClick={() => setCurrentScreen('club')}
                  className="w-full glass border border-[#B08D57]/15 rounded-2xl p-4 flex justify-between items-center hover:border-[#B08D57]/60 transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#B08D57]/10 flex items-center justify-center text-[#D6C29A] border border-[#B08D57]/20">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white font-serif serif">Assinar Club VIP</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Acesso recorrente e benefícios exclusivos</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#D6C29A] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Button: Profile / Wallet */}
                <button
                  id="btn_open_profile"
                  onClick={() => {
                    if (isLoggedIn) {
                      setCurrentScreen('profile');
                    } else {
                      onNotifyTriggered('Identifique-se no topo digitando seu telefone para ver a carteira e histórico.');
                    }
                  }}
                  className="w-full glass border border-[#B08D57]/15 rounded-2xl p-4 flex justify-between items-center hover:border-[#B08D57]/60 transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#B08D57]/10 flex items-center justify-center text-[#D6C29A] border border-[#B08D57]/20">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white font-serif serif">Carteira & Meus Agendamentos</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Pontos fidelidade e histórico completo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#D6C29A] group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* Branches Spotlight */}
              <div className="flex flex-col gap-3 mt-1">
                <h4 className="text-xs uppercase tracking-widest text-[#B08D57] ml-1 font-mono font-bold">Nossas Sedes</h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {storeState.branches.map(branch => (
                    <div 
                      key={branch.id}
                      className="min-w-[200px] w-52 glass border border-[#B08D57]/15 rounded-2xl overflow-hidden flex flex-col relative bg-black/40"
                    >
                      <img 
                        src={branch.imageUrl} 
                        alt={branch.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-24 object-cover object-center filter saturate-50 brightness-75 hover:saturate-100 transition-all duration-300" 
                      />
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-white tracking-tight font-serif serif">{branch.name}</h5>
                          <span className="text-[10px] text-gray-450 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#B08D57]" /> {branch.city}
                          </span>
                        </div>
                        <span className="text-[9px] bg-black border border-[#B08D57]/20 text-[#D6C29A] w-fit px-2 py-0.5 rounded-full mt-2 font-mono">
                          {branch.openingHour} - {branch.closingHour}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Imperial Styles Gallery (New Style Visualizer Integration) */}
              <div className="flex flex-col gap-3 mt-1 pb-2">
                <h4 className="text-xs uppercase tracking-widest text-[#B08D57] ml-1 font-mono font-bold">Estilos & Tendências Imperiais</h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {[
                    {
                      id: 'style_1',
                      name: 'Executive Pompadour',
                      serviceId: 'ser_corte_signature',
                      desc: 'Volume clássico polido com brilho sutil e linhas de contorno ultra limpas.',
                      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300',
                      tags: ['Clássico', 'Visagismo']
                    },
                    {
                      id: 'style_2',
                      name: 'Textured Crop & Fade',
                      serviceId: 'ser_corte_signature',
                      desc: 'Franja texturizada contemporânea em harmonia com degradê impecável.',
                      imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=300',
                      tags: ['Moderno', 'Suave']
                    },
                    {
                      id: 'style_3',
                      name: 'Barba de Elite a Vapor',
                      serviceId: 'ser_barba_luxury',
                      desc: 'Protocolo de calor e óleo de sândalo para fios domados e contornados.',
                      imageUrl: 'https://images.unsplash.com/photo-1622039737229-27e5c7bec5df?auto=format&fit=crop&q=80&w=300',
                      tags: ['Premium', 'SPA']
                    },
                    {
                      id: 'style_4',
                      name: 'Experiência Ritual Real',
                      serviceId: 'ser_combo_real',
                      desc: 'Corte e barba combinados com peeling facial e dose de single malt cortesia.',
                      imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=300',
                      tags: ['Combo Real', 'Selo VIP']
                    }
                  ].map(style => (
                    <div 
                      key={style.id}
                      className="min-w-[190px] w-48 glass border border-[#B08D57]/15 rounded-2xl overflow-hidden flex flex-col relative bg-black/40"
                    >
                      <img 
                        src={style.imageUrl} 
                        alt={style.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-24 object-cover object-center filter saturate-50 hover:saturate-100 transition-all duration-300"
                      />
                      <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
                        <div>
                          <div className="flex gap-1 flex-wrap">
                            {style.tags.map((t, idx) => (
                              <span key={idx} className="text-[7.5px] bg-[#B08D57]/15 text-[#D6C29A] px-1.5 py-0.2 rounded font-mono font-bold uppercase">{t}</span>
                            ))}
                          </div>
                          <h5 className="text-[11px] font-bold text-white tracking-tight mt-1.5 font-sans">{style.name}</h5>
                          <p className="text-[9px] text-gray-400 mt-0.5 leading-normal line-clamp-2">{style.desc}</p>
                        </div>
                        <button
                          id={`btn_book_style_${style.id}`}
                          onClick={() => {
                            const exactSer = storeState.services.find(s => s.id === style.serviceId);
                            if (exactSer) {
                              setSelectedService(exactSer);
                              setBookingStep(1); // Set directly to branch pick and keep service locked
                              setCurrentScreen('schedule');
                              onNotifyTriggered(`Estilo "${style.name}" pré-selecionado! Agora escolha a unidade e o profissional de sua preferência.`);
                            }
                          }}
                          className="w-full py-1.5 rounded-lg bg-black/40 hover:bg-[#B08D57] hover:text-black border border-[#B08D57]/30 text-[#D6C29A] text-[9px] font-bold uppercase tracking-wider transition-all duration-300 mt-1 cursor-pointer"
                        >
                          Agendar Estilo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SCREEN 4: INTEL_SCHEDULER (THE MOST ADVANCED CORE SCHEDULING INTERFACE) */}
          {currentScreen === 'schedule' && (
            <motion.div 
              key="schedule"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-4 pb-4"
              id="appointment_scheduler"
            >
              {/* Step Navigation Header */}
              <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                <button 
                  id="btn_back_scheduling_step"
                  onClick={() => {
                    if (bookingStep > 1) {
                      setBookingStep(prev => prev - 1);
                    } else {
                      setCurrentScreen('home');
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-[#111214] border border-gray-900 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-white font-semibold">Agendamento Real ({bookingStep}/6)</span>
                <span className="text-[10px] text-[#B08D57] font-mono">Passo {bookingStep}</span>
              </div>

              {/* STEP 1: SELECT BRANCH */}
              {bookingStep === 1 && (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="text-center py-2">
                    <h3 className="text-sm font-bold text-[#D6C29A] uppercase tracking-wide">Escolha uma Unidade</h3>
                    <p className="text-xs text-gray-400 mt-1">Nossos templos de alta classe disponíveis</p>
                  </div>
                  <div className="flex flex-col gap-3 mt-2">
                    {storeState.branches.map(branch => (
                      <button
                        key={branch.id}
                        id={`btn_choose_branch_${branch.id}`}
                        onClick={() => {
                          setSelectedBranch(branch);
                          setBookingStep(2);
                        }}
                        className={`w-full py-4 px-4 bg-[#111214] rounded-2xl flex items-center justify-between border text-left transition-all ${
                          selectedBranch?.id === branch.id ? 'border-[#B08D57] bg-gradient-to-tr from-[#111214] to-[#B08D57]/5' : 'border-gray-900 hover:border-gray-800'
                        }`}
                      >
                        <div className="flex gap-3 items-center">
                          <img 
                            src={branch.imageUrl} 
                            alt={branch.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover filter saturate-50 inline"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-white tracking-tight">{branch.name}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{branch.address}</p>
                            <span className="text-[9px] text-[#6E8B8E] mt-1 block">Aberto até às {branch.closingHour}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#D6C29A]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT BARBER */}
              {bookingStep === 2 && (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="text-center py-2">
                    <h3 className="text-sm font-bold text-[#D6C29A] uppercase tracking-wide">Escolha um Barbeiro</h3>
                    <p className="text-xs text-gray-400 mt-1">Especialistas formados em visagismo de alta precisão</p>
                  </div>
                  <div className="flex flex-col gap-3 mt-2">
                    {storeState.barbers
                      .filter(b => selectedBranch ? b.branchIds.includes(selectedBranch.id) : true)
                      .map(barber => (
                        <button
                          key={barber.id}
                          id={`btn_choose_barber_${barber.id}`}
                          onClick={() => {
                            setSelectedBarber(barber);
                            setBookingStep(3);
                          }}
                          className={`w-full py-3.5 px-4 bg-[#111214] rounded-2xl flex items-center justify-between border text-left transition-all ${
                            selectedBarber?.id === barber.id ? 'border-[#B08D57] bg-gradient-to-tr from-[#111214] to-[#B08D57]/5' : 'border-gray-900 hover:border-gray-800'
                          }`}
                        >
                          <div className="flex gap-3 items-center">
                            <img 
                              src={barber.imageUrl} 
                              alt={barber.name} 
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-full object-cover border border-[#B08D57]/35 inline"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-white tracking-tight">{barber.name}</h4>
                                <span className="text-[9px] bg-[#B08D57]/10 text-[#D6C29A] px-1.5 py-0.2 rounded font-mono">★ {barber.rating}</span>
                              </div>
                              <p className="text-[10px] text-[#6E8B8E] mt-0.5 font-medium">{barber.role}</p>
                              <div className="flex gap-1 flex-wrap mt-1.5">
                                {barber.specialties.slice(0, 2).map((s, idx) => (
                                  <span key={idx} className="text-[8px] bg-black text-gray-400 border border-gray-900 px-1.5 py-0.2 rounded">{s}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#D6C29A]" />
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* STEP 3: SELECT SERVICE */}
              {bookingStep === 3 && (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="text-center py-2">
                    <h3 className="text-sm font-bold text-[#D6C29A] uppercase tracking-wide">Escolha o Serviço</h3>
                    <p className="text-xs text-gray-400 mt-1">Sua dose cortesia de bem-estar inclui massagens faciais</p>
                  </div>
                  <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-[350px] pr-1 scrollbar-thin scrollbar-thumb-gray-800">
                    {storeState.services.map(subService => (
                      <button
                        key={subService.id}
                        id={`btn_choose_service_${subService.id}`}
                        onClick={() => {
                          setSelectedService(subService);
                          setBookingStep(4);
                        }}
                        className={`w-full py-3.5 px-4 bg-[#111214] rounded-2xl flex flex-col gap-1.5 border text-left transition-all ${
                          selectedService?.id === subService.id ? 'border-[#B08D57] bg-gradient-to-tr from-[#111214] to-[#B08D57]/5' : 'border-gray-900 hover:border-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <h4 className="text-xs font-bold text-white tracking-tight">{subService.name}</h4>
                          <span className="text-[#D6C29A] font-mono text-xs font-bold">R$ {subService.price.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-normal line-clamp-2">{subService.description}</p>
                        <div className="flex justify-between items-center w-full mt-1 border-t border-gray-950 pt-1.5">
                          <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#B08D57]" /> {subService.durationMinutes} minutos
                          </span>
                          <span className="text-[9px] text-[#6E8B8E] tracking-widest font-bold uppercase">Selecionar</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: SELECT DATE */}
              {bookingStep === 4 && (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="text-center py-2">
                    <h3 className="text-sm font-bold text-[#D6C29A] uppercase tracking-wide">Escolha uma Data</h3>
                    <p className="text-xs text-gray-400 mt-1">Lógica real de calendário disponível em tempo real</p>
                  </div>
                  <div className="flex flex-col gap-2.5 mt-2">
                    {getNextDays().map(day => {
                      const isSel = selectedDate === day;
                      return (
                        <button
                          key={day}
                          id={`btn_choose_date_${day}`}
                          onClick={() => {
                            setSelectedDate(day);
                            setSelectedTime(''); // Reset time representation when date flips
                            setBookingStep(5);
                          }}
                          className={`w-full py-4 px-4 bg-[#111214] rounded-2xl flex justify-between items-center border text-left transition-all ${
                            isSel ? 'border-[#B08D57] bg-gradient-to-tr from-[#111214] to-[#B08D57]/5' : 'border-gray-900 hover:border-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-[#D6C29A]" />
                            <span className="text-xs font-semibold text-white">{getReadableDay(day)}</span>
                          </div>
                          {day === '2026-05-27' && (
                            <span className="text-[9px] bg-[#B08D57]/10 text-[#D6C29A] border border-[#B08D57]/20 px-2 py-0.5 rounded-full font-mono uppercase">Hoje</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: SELECT TIME (THE MASTER PRECLUSION CALCULATION) */}
              {bookingStep === 5 && (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="text-center py-2">
                    <h3 className="text-sm font-bold text-[#D6C29A] uppercase tracking-wide">Escolha o Horário</h3>
                    <p className="text-xs text-gray-400 mt-1">Feriados, pausas e conflitos pré-calculados de forma rigorosa</p>
                  </div>
                  
                  {selectedBranch && selectedBarber && selectedService && selectedDate && (
                    <div className="mt-2">
                      <div className="bg-[#111214] border border-gray-900 p-3.5 rounded-2xl flex items-center justify-between text-xs mb-4">
                        <span className="text-[#6E8B8E]">Barbeiro: {selectedBarber.name}</span>
                        <span className="text-[#D6C29A] font-mono">{getReadableDay(selectedDate)}</span>
                      </div>
                      
                      {/* Calculate available slots with the store's filter function */}
                      {(() => {
                        const slots = storeState.getAvailableSlots(
                          selectedBranch.id,
                          selectedBarber.id,
                          selectedDate,
                          selectedService.id
                        );

                        if (slots.length === 0) {
                          return (
                            <div className="py-12 text-center flex flex-col items-center gap-2">
                              <X className="w-8 h-8 text-rose-500 bg-rose-500/10 p-1.5 rounded-full" />
                              <h4 className="text-xs text-rose-450 font-bold">Sem Horários Livres</h4>
                              <p className="text-[10px] text-gray-400 px-6 max-w-xs">Todas as poltronas estão preenchidas para este barbeiro de elite nesta data. Por favor, tente outra data ou outro profissional.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-4 gap-2 max-h-[240px] overflow-y-auto pr-1">
                            {slots.map(slot => {
                              const isSel = selectedTime === slot;
                              return (
                                <button
                                  key={slot}
                                  id={`btn_choose_time_${slot}`}
                                  onClick={() => {
                                    setSelectedTime(slot);
                                    setBookingStep(6);
                                  }}
                                  className={`py-3.5 px-1 rounded-xl font-mono text-center text-xs border transition-all ${
                                    isSel 
                                      ? 'border-[#B08D57] bg-[#B08D57] text-black font-bold shadow-lg shadow-[#B08D57]/10' 
                                      : 'border-gray-900 bg-[#111214] text-white hover:border-[#B08D57]/45'
                                  }`}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: VERIFY & CONFIRM */}
              {bookingStep === 6 && (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="text-center py-2">
                    <h3 className="text-sm font-bold text-[#D6C29A] uppercase tracking-wide">Finalizar Ticket Imperial</h3>
                    <p className="text-xs text-gray-400 mt-1">Revise seu ritual de visual de luxo</p>
                  </div>

                  <form onSubmit={handleConfirmBooking} className="flex flex-col gap-3.5 mt-2">
                    <div className="bg-[#111214] border border-gray-900 p-4 rounded-2xl flex flex-col gap-3.5 text-xs">
                      
                      {/* Branch and Date detail */}
                      <div className="flex justify-between items-start border-b border-gray-950 pb-2">
                        <div>
                          <span className="text-[#6E8B8E] block text-[9px] uppercase tracking-wider">Unidade</span>
                          <span className="text-white font-semibold">{selectedBranch?.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#6E8B8E] block text-[9px] uppercase tracking-wider">Data / Hora</span>
                          <span className="text-[#D6C29A] font-mono font-bold">{getReadableDay(selectedDate)} às {selectedTime}</span>
                        </div>
                      </div>

                      {/* Barber and service info */}
                      <div className="flex justify-between items-start border-b border-gray-950 pb-2">
                        <div>
                          <span className="text-[#6E8B8E] block text-[9px] uppercase tracking-wider">Barbeiro de Elite</span>
                          <span className="text-white font-semibold">{selectedBarber?.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#6E8B8E] block text-[9px] uppercase tracking-wider">Serviço</span>
                          <span className="text-white font-semibold">{selectedService?.name}</span>
                        </div>
                      </div>

                      {/* Price / Membership analysis */}
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[#6E8B8E] text-[10px] uppercase">Preço Estimado</span>
                        <div className="text-right">
                          {(() => {
                            // Quick virtual sub check
                            const matchPhone = clientPhone || authPhone;
                            const clientMatch = storeState.customers.find(c => c.phone === matchPhone);
                            const customerSub = clientMatch ? storeState.subscriptions.find(sub => sub.customerId === clientMatch.id && sub.status === 'active') : null;
                            
                            if (customerSub) {
                              return (
                                <div className="flex flex-col items-end">
                                  <span className="text-[#6E8B8E] line-through text-[11px]">R$ {selectedService?.price.toFixed(2)}</span>
                                  <span className="text-emerald-400 font-bold font-mono">Coberto pelo Club VIP (R$ 0,00)</span>
                                </div>
                              );
                            }
                            return (
                              <span className="text-white font-bold font-mono text-sm">R$ {selectedService?.price.toFixed(2)}</span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase text-[#6E8B8E] tracking-widest pl-1">Seu Nome Completo</label>
                      <input 
                        required
                        type="text"
                        id="form_client_name"
                        placeholder="Nome Sobrenomes"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-[#111214] border border-gray-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#B08D57] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase text-[#6E8B8E] tracking-widest pl-1">Seu Telefone/WhatsApp</label>
                      <input 
                        required
                        type="tel"
                        id="form_client_phone"
                        placeholder="(11) 99999-9999"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-[#111214] border border-gray-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#B08D57] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase text-[#6E8B8E] tracking-widest pl-1">Código Promocional ou Afiliado (Opcional)</label>
                      <input 
                        type="text"
                        id="form_client_coupon"
                        placeholder="Ex: PEDROVIP"
                        value={affiliateCode}
                        onChange={(e) => setAffiliateCode(e.target.value)}
                        className="w-full bg-[#111214] border border-gray-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#B08D57] focus:outline-none uppercase"
                      />
                    </div>

                    <button
                      type="submit"
                      id="btn_finalize_booking"
                      className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-[#8A6A3D] via-[#B08D57] to-[#D6C29A] text-black font-semibold text-xs tracking-wider uppercase hover:opacity-90 active:scale-[0.98] transition-transform duration-100"
                    >
                      Reservar Assento de Elite
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {/* SCREEN 5: VIRTUAL CLUB VIP MEMBERSHIP EXPONENT */}
          {currentScreen === 'club' && (
            <motion.div 
              key="club"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-4 pb-4"
              id="club_vip_screen"
            >
              <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                <button 
                  id="btn_back_club"
                  onClick={() => {
                    if (selectedPlanToSubscribe) {
                      setSelectedPlanToSubscribe(null);
                    } else {
                      setCurrentScreen('home');
                    }
                  }}
                  className="w-8 h-8 rounded-lg bg-[#111214] border border-gray-900 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-white font-semibold">Assinatura Club VIP</span>
                <span className="text-[10px] text-[#B08D57] font-mono">SaaS Recorrente</span>
              </div>

              {/* STAGE A: PLANS OFFERING */}
              {!selectedPlanToSubscribe ? (
                <div className="flex flex-col gap-4">
                  <div className="text-center py-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Confraria BarberPro Premium</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Visitas ilimitadas e rentabilidade previsível</p>
                  </div>

                  <div className="flex flex-col gap-4 mt-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-850">
                    {storeState.subscriptionPlans.map(plan => {
                      const isBlack = plan.id === 'plan_black';
                      const isGold = plan.id === 'plan_gold';
                      return (
                        <div 
                          key={plan.id}
                          className={`rounded-2xl border p-4 flex flex-col justify-between relative overflow-hidden ${
                            isBlack 
                              ? 'bg-gradient-to-b from-[#111214] to-black border-[#B08D57] shadow-lg shadow-[#B08D57]/5' 
                              : isGold 
                                ? 'bg-[#111214] border-[#8A6A3D]/40' 
                                : 'bg-[#111214] border-gray-900'
                          }`}
                        >
                          {isBlack && (
                            <span className="absolute top-0 right-0 py-1 px-4 text-[8px] bg-[#B08D57] text-black font-extrabold uppercase tracking-widest rounded-bl-xl flex items-center gap-1">
                              <Crown className="w-3 h-3 inline" /> Recomenda-se
                            </span>
                          )}

                          <div className="flex justify-between items-start w-full">
                            <div>
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{plan.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-1">{plan.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-white font-mono font-bold text-sm">R$ {plan.price.toFixed(2)}</span>
                              <span className="text-[9px] text-gray-500 block">/mês</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 mt-3 border-t border-gray-900 pt-3">
                            {plan.benefits.map((b, idx) => (
                              <div key={idx} className="flex gap-2 items-center text-[10px] text-gray-300">
                                <Check className="w-3 h-3 text-[#B08D57] shrink-0" />
                                <span className="line-clamp-1">{b}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            id={`btn_initiate_subscription_${plan.id}`}
                            onClick={() => setSelectedPlanToSubscribe(plan)}
                            className={`w-full py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider mt-4 transition-all duration-150 ${
                              isBlack 
                                ? 'bg-[#B08D57] text-black hover:bg-opacity-90' 
                                : 'bg-black text-[#D6C29A] border border-gray-800 hover:border-[#B08D57]'
                            }`}
                          >
                            Tornar-se Associado
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* STAGE B: SUBSCRIPTION RECURRING CHECKOUT FORM */
                <div className="flex-1 flex flex-col gap-4">
                  <div className="bg-[#111214] border border-gray-900 p-4 rounded-2xl">
                    <span className="text-[9px] text-[#6E8B8E] uppercase tracking-wider block">Assinatura Selecionada</span>
                    <h4 className="text-sm font-bold text-[#D6C29A] mt-1">{selectedPlanToSubscribe.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">Cobrança recorrente mensal de R$ {selectedPlanToSubscribe.price.toFixed(2)}</p>
                  </div>

                  <form onSubmit={handleSubscribe} className="flex flex-col gap-3.5 mt-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase text-[#6E8B8E] tracking-widest pl-1">Seu Nome Completo</label>
                      <input 
                        required
                        type="text"
                        id="form_sub_name"
                        placeholder="Nome Sobrenomes"
                        value={subscribingCustName}
                        onChange={(e) => setSubscribingCustName(e.target.value)}
                        className="w-full bg-[#111214] border border-gray-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#B08D57] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase text-[#6E8B8E] tracking-widest pl-1">Número do Celular / WhatsApp</label>
                      <input 
                        required
                        type="tel"
                        id="form_sub_phone"
                        placeholder="(11) 99999-9999"
                        value={subscribingCustPhone}
                        onChange={(e) => setSubscribingCustPhone(e.target.value)}
                        className="w-full bg-[#111214] border border-gray-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#B08D57] focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase text-[#6E8B8E] tracking-widest pl-1">Cupom de Afiliado (Opcional)</label>
                      <input 
                        type="text"
                        id="form_sub_coupon"
                        placeholder="Ex: COORDENA"
                        value={affiliateCode}
                        onChange={(e) => setAffiliateCode(e.target.value)}
                        className="w-full bg-[#111214] border border-gray-900 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#B08D57] focus:outline-none uppercase"
                      />
                    </div>

                    <div className="rounded-xl border border-gray-900 p-3 bg-[#111214]/50 text-[10px] text-gray-400 leading-normal">
                      🛡️ <strong className="text-gray-300">Segurança de Pagamento:</strong> A cobrança é gerada em cartão em formato recorrente mensal. Você pode suspender ou alterar seu plano a qualquer momento sem contrato de fidelidade.
                    </div>

                    <button
                      type="submit"
                      id="btn_finalize_subscription"
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8A6A3D] via-[#B08D57] to-[#D6C29A] text-black font-semibold text-xs tracking-wider uppercase hover:opacity-90 active:scale-[0.98] transition-transform duration-100"
                    >
                      Confirmar Assinatura VIP
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {/* SCREEN 6: CUSTOMER CRM DESKTOP PORTLET */}
          {currentScreen === 'profile' && isLoggedIn && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-4 pb-4"
              id="client_portal_profile"
            >
              <div className="flex justify-between items-center border-b border-gray-900 pb-2">
                <button 
                  id="btn_back_profile"
                  onClick={() => setCurrentScreen('home')}
                  className="w-8 h-8 rounded-lg bg-[#111214] border border-gray-900 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-white font-semibold">Perfil Executivo</span>
                <button 
                  id="btn_logout_profile" 
                  onClick={handleLogout}
                  className="text-[9px] text-[#6E8B8E] hover:text-[#D6C29A] uppercase"
                >
                  Sair
                </button>
              </div>

              {/* CRM Card */}
              <div className="bg-gradient-to-b from-[#111214] to-[#070708] border border-[#B08D57]/30 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden">
                <Crown className="w-8 h-8 text-[#B08D57] absolute top-2 right-2 opacity-20" />
                <div className="w-14 h-14 rounded-full bg-[#8A6A3D]/20 border-2 border-[#B08D57] flex items-center justify-center text-[#D6C29A] text-lg font-bold">
                  {loggedClient?.name?.charAt(0) || 'U'}
                </div>
                <h4 className="text-sm font-semibold text-white mt-2.5">{loggedClient?.name}</h4>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{loggedClient?.phone}</p>
                
                {/* Active subscription tag */}
                {loggedClient?.vip ? (
                  <span className="mt-3 text-[9px] bg-[#B08D57]/10 text-[#D6C29A] border border-[#B08D57]/30 px-3 py-1 rounded-full uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                    <Crown className="w-3 h-3 text-[#B08D57]" /> {loggedClient?.status} Ativo
                  </span>
                ) : (
                  <span className="mt-3 text-[9px] bg-red-500/10 text-rose-500 border border-red-900/30 px-3 py-1 rounded-full uppercase tracking-widest font-extrabold">
                    Nenhum Plano Ativo
                  </span>
                )}
              </div>

              {/* Loyalty Program Wallet Status */}
              <div className="bg-[#111214] border border-gray-900 rounded-2xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#B08D57]/10 flex items-center justify-center text-[#B08D57] shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] uppercase tracking-wider text-[#6E8B8E] font-medium">Pontos Fidelidade</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">Resgate kits luxo ou descontos</p>
                  </div>
                </div>
                <span className="text-xl font-bold font-mono text-[#D6C29A]">{loggedClient?.loyaltyPoints || 0} pts</span>
              </div>

              {/* Interactive Loyalty Rewards Store (New!) */}
              <div className="glass border border-[#B08D57]/20 rounded-2xl p-3 flex flex-col gap-2.5 bg-black/40">
                <div className="flex items-center gap-1.5 border-b border-[#B08D57]/10 pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span className="text-[10px] uppercase font-bold text-white tracking-widest font-mono">Loja de Resgate de Prêmios</span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1 scrollbar-none">
                  {[
                    { id: 'rew_1', name: 'Chopp Pilsen Extra', points: 30, icon: '🍺' },
                    { id: 'rew_2', name: 'Dose Single Malt Whisky', points: 50, icon: '🥃' },
                    { id: 'rew_3', name: 'Pomada Matte Carbon', points: 80, icon: '🧴' },
                    { id: 'rew_4', name: 'Óleo Hidratante Wood', points: 100, icon: '💈' },
                    { id: 'rew_5', name: 'Modelado Visagista Extra', points: 120, icon: '💇‍♂️' }
                  ].map(reward => {
                    const hasEnough = (loggedClient?.loyaltyPoints || 0) >= reward.points;
                    return (
                      <div key={reward.id} className="bg-[#111214]/80 p-2 rounded-xl border border-[#B08D57]/10 flex flex-col justify-between gap-1.5 hover:border-[#B08D57]/20 transition-all text-left">
                        <div className="flex items-center gap-1">
                          <span className="text-base shrink-0">{reward.icon}</span>
                          <span className="text-[9px] font-bold text-white leading-normal truncate block max-w-[100px]">{reward.name}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5 pt-0.5 border-t border-white/5">
                          <span className="text-[9px] font-bold font-mono text-[#D6C29A]">{reward.points}p</span>
                          <button
                            id={`btn_redeem_${reward.id}`}
                            onClick={() => {
                              if (!hasEnough) {
                                onNotifyTriggered(`Pontos insuficientes! Faltam ${reward.points - (loggedClient?.loyaltyPoints || 0)} pts.`);
                                return;
                              }
                              const oldPts = loggedClient.loyaltyPoints;
                              globalStore.updateCustomerLoyalty(loggedClient.id, oldPts - reward.points, reward.name);
                              onNotifyTriggered(`Sucesso! Resgatado: ${reward.name}. Retire seu prêmio no balcão de atendimento.`);
                            }}
                            className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded transition-colors uppercase cursor-pointer ${
                              hasEnough ? 'bg-[#B08D57] text-black active:scale-[0.96]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Resgatar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User Appointments History in CRM */}
              <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[190px] pr-1 scrollbar-thin scrollbar-thumb-gray-850">
                <h4 className="text-xs uppercase tracking-widest text-[#6E8B8E] ml-1">Meus Agendamentos</h4>
                {(() => {
                  const clientApts = storeState.appointments.filter(a => a.customerName === loggedClient?.name || a.customerPhone === loggedClient?.phone);
                  if (clientApts.length === 0) {
                    return (
                      <p className="text-xs text-gray-500 italic text-center py-6">Nenhum agendamento encontrado.</p>
                    );
                  }

                  return clientApts.map(apt => {
                    const serv = storeState.services.find(s => s.id === apt.serviceId);
                    const barb = storeState.barbers.find(b => b.id === apt.barberId);
                    const isCancelled = apt.status === 'cancelled';
                    return (
                      <div 
                        key={apt.id}
                        className={`p-3 bg-gradient-to-r from-[#111214] to-[#111214]/60 border rounded-xl flex items-center justify-between text-left transition-all ${
                          isCancelled ? 'border-[#331114]/30 opacity-60' : 'border-gray-900'
                        }`}
                      >
                        <div className="flex gap-2.5 items-center">
                          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-gray-500 border border-gray-900">
                            <Scissors className="w-4 h-4 text-[#B08D57]" />
                          </div>
                          <div>
                            <h5 className={`text-xs font-semibold text-white ${isCancelled ? 'line-through opacity-50' : ''}`}>{serv?.name}</h5>
                            <span className="text-[9px] text-gray-400 mt-0.5 block">Com {barb?.name} • {getReadableDay(apt.date)} às {apt.time}</span>
                          </div>
                        </div>

                        {/* Actions for active bookings */}
                        {apt.status === 'confirmed' || apt.status === 'pending' ? (
                          <button
                            id={`btn_cancel_appointment_${apt.id}`}
                            onClick={() => {
                              if (confirm('Deseja realmente cancelar este agendamento?')) {
                                globalStore.cancelAppointment(apt.id);
                                onNotifyTriggered('Agendamento cancelado com sucesso.');
                              }
                            }}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-xs px-2.5 py-1 rounded text-rose-500 font-medium transition-colors border border-rose-950/20"
                          >
                            Cancelar
                          </button>
                        ) : (
                          <span className={`text-[9px] px-2.5 py-1 rounded border font-bold uppercase ${
                            isCancelled 
                              ? 'bg-red-500/5 text-rose-500 border-red-950/20' 
                              : 'bg-emerald-500/5 text-emerald-400 border-emerald-950/20'
                          }`}>
                            {isCancelled ? 'Cancelado' : 'Concluído'}
                          </span>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Persistent Bottom Tab Bar */}
      <div className="bg-[#111214]/90 backdrop-blur-md border-t border-gray-900 py-3.5 px-6 flex justify-between items-center z-13 rounded-b-[40px] relative">
        <button 
          id="btn_tab_home"
          onClick={() => setCurrentScreen('home')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${currentScreen === 'home' ? 'text-[#D6C29A]' : 'text-gray-500 hover:text-white'}`}
        >
          <Scissors className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Início</span>
        </button>
        <button 
          id="btn_tab_schedule"
          onClick={() => {
            setBookingStep(1);
            setCurrentScreen('schedule');
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer ${currentScreen === 'schedule' ? 'text-[#D6C29A]' : 'text-gray-500 hover:text-white'}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Agendar</span>
        </button>
        <button 
          id="btn_tab_club"
          onClick={() => setCurrentScreen('club')}
          className={`flex flex-col items-center gap-1 cursor-pointer ${currentScreen === 'club' ? 'text-[#D6C29A]' : 'text-gray-500 hover:text-white'}`}
        >
          <Crown className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Club VIP</span>
        </button>
        <button 
          id="btn_tab_profile"
          onClick={() => {
            if (isLoggedIn) {
              setCurrentScreen('profile');
            } else {
              onNotifyTriggered('Digite seu telefone para entrar na carteira.');
              setCurrentScreen('home');
            }
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer ${currentScreen === 'profile' ? 'text-[#D6C29A]' : 'text-gray-500 hover:text-white'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Carteira</span>
        </button>
      </div>
    </div>
  );
};
