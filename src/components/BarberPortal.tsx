/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Scissors, 
  Coins, 
  Calendar, 
  Hourglass, 
  Award, 
  UserCheck, 
  Clock, 
  CheckCircle,
  Sparkles,
  ArrowRight,
  Hand
} from 'lucide-react';
import { globalStore } from '../data/store';
import { Barber, Appointment } from '../types';

interface BarberPortalProps {
  onNotifyTriggered: (msg: string) => void;
}

export const BarberPortal: React.FC<BarberPortalProps> = ({ onNotifyTriggered }) => {
  const [storeState, setStoreState] = useState({ ...globalStore });
  const [selectedBarberId, setSelectedBarberId] = useState<string>('bar_enzo');
  const [barberBlockTime, setBarberBlockTime] = useState<string>('15:00');

  useEffect(() => {
    const unsub = globalStore.subscribe(() => {
      setStoreState({ ...globalStore });
    });
    return unsub;
  }, []);

  const activeBarber = storeState.barbers.find(b => b.id === selectedBarberId)!;

  // Calculate Barber stats
  const getBarberStats = () => {
    const barberApts = storeState.appointments.filter(
      a => a.barberId === selectedBarberId && a.status !== 'cancelled'
    );

    // Sum prices
    const faturamentoTotal = barberApts.reduce((sum, a) => sum + a.pricePaid, 0);
    const comissaoAcumulada = barberApts.reduce((sum, a) => {
      return sum + (a.pricePaid * activeBarber.commissionPercentage);
    }, 0);

    const faturamentoHoje = barberApts
      .filter(a => a.date === '2026-05-27')
      .reduce((sum, a) => sum + a.pricePaid, 0);

    const comissaoHoje = faturamentoHoje * activeBarber.commissionPercentage;

    const totalAtendimentos = barberApts.length;

    return { faturamentoTotal, comissaoAcumulada, faturamentoHoje, comissaoHoje, totalAtendimentos };
  };

  const stats = getBarberStats();

  // Target goals
  const monthlyGoal = 4000;
  const goalProgressPercent = Math.min(Math.round((stats.faturamentoTotal / monthlyGoal) * 100), 100);

  // Get barber agenda of simulated today (2026-05-27)
  const getTodaySchedule = () => {
    return storeState.appointments
      .filter(a => a.barberId === selectedBarberId && a.date === '2026-05-27' && a.status !== 'cancelled')
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  // Create barber block slot
  const handleBarberFormBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberBlockTime) return;

    // Direct simulation inserts placeholder block
    const transientBlockId = 'apt_barblock_' + Date.now();
    const newApt: Appointment = {
      id: transientBlockId,
      branchId: activeBarber.branchIds[0] || 'br_jardins',
      barberId: selectedBarberId,
      serviceId: 'ser_barba_luxury', // Placeholder service to occupy duration
      customerId: 'block_barber',
      customerName: '[BLOQUEIO BARBEIRO] Ausente',
      customerPhone: '(00) 00000-0000',
      date: '2026-05-27',
      time: barberBlockTime,
      status: 'confirmed',
      pricePaid: 0,
      createdAt: new Date().toISOString(),
      whatsappSentStatus: 'not_sent'
    };

    globalStore.appointments.push(newApt);
    localStorage.setItem('bp_appointments', JSON.stringify(globalStore.appointments));
    onNotifyTriggered(`Você bloqueou o horário de ${barberBlockTime} na sua agenda de hoje.`);
    setBarberBlockTime('');
  };

  return (
    <div className="w-full max-w-sm mx-auto aspect-[9/18.5] bg-[#070708] rounded-[48px] border-8 border-[#1a1b1e] shadow-2xl relative overflow-hidden flex flex-col font-sans" id="barber-phone-container">
      {/* Phone Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#1a1b1e] rounded-b-2xl z-50 flex items-center justify-center">
        <div className="w-12 h-1 bg-black rounded-full mb-1"></div>
      </div>

      <div className="flex-1 flex flex-col pt-8 pb-4 px-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-850">
        
        {/* Profile Barber Switcher Header */}
        <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-3 mb-4 mt-2">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#B08D57] shrink-0" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D6C29A] font-mono">Modo Barbeiro de Elite</span>
          </div>

          <select 
            id="barber_portal_selector"
            value={selectedBarberId}
            onChange={(e) => setSelectedBarberId(e.target.value)}
            className="bg-black border border-[#B08D57]/30 rounded px-2.5 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-[#B08D57] font-mono"
          >
            {storeState.barbers.map(b => (
              <option key={b.id} value={b.id}>{b.name.split(' ')[0]}</option>
            ))}
          </select>
        </div>

        {/* Barber Avatar Card */}
        <div className="glass rounded-2xl p-4 flex gap-4 items-center">
          <img 
            src={activeBarber.imageUrl} 
            alt={activeBarber.name} 
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full object-cover border-2 border-[#B08D57] shrink-0"
          />
          <div>
            <h4 className="text-xs font-bold serif font-serif text-white tracking-tight">{activeBarber.name}</h4>
            <span className="text-[10px] text-[#6E8B8E] block mt-0.5 font-medium">{activeBarber.role}</span>
            <span className="text-[9px] bg-[#B08D57]/10 text-[#D6C29A] border border-[#B08D57]/30 px-2 py-0.2 rounded mt-1.5 inline-block font-mono">
              Comissão: {(activeBarber.commissionPercentage * 100)}% por serviço
            </span>
          </div>
        </div>

        {/* Financial Commission Summary */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="glass p-3 rounded-xl">
            <span className="text-[9px] text-gray-400 uppercase font-medium block">Minha Comissão Hoje</span>
            <span className="text-base font-bold font-serif font-serif text-[#D6C29A] mt-1 block">R$ {stats.comissaoHoje.toFixed(2)}</span>
            <span className="text-[8px] text-gray-500 block mt-0.5">Fruto de R$ {stats.faturamentoHoje}</span>
          </div>
          <div className="glass p-3 rounded-xl">
            <span className="text-[9px] text-gray-400 uppercase font-medium block">Ganhos neste Mês</span>
            <span className="text-base font-bold font-serif font-serif text-white mt-1 block">R$ {stats.comissaoAcumulada.toFixed(2)}</span>
            <span className="text-[8px] text-gray-500 block mt-0.5">Total de {stats.totalAtendimentos} rituais</span>
          </div>
        </div>

        {/* Goals Progress indicator bar */}
        <div className="glass p-4 mt-4 flex flex-col gap-2 rounded-2xl">
          <div className="flex justify-between text-[10px] font-semibold text-gray-300">
            <span className="font-serif">Meta de Desempenho</span>
            <span className="text-[#D6C29A] font-mono">{goalProgressPercent}% (R$ {stats.faturamentoTotal} / R$ {monthlyGoal})</span>
          </div>
          <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-[#B08D57]/10">
            <div 
              style={{ width: `${goalProgressPercent}%` }}
              className="h-full bg-gradient-to-r from-[#8A6A3D] to-[#D6C29A] transition-all duration-700 shadow-[0_0_8px_#B08D57]"
            />
          </div>
          <span className="text-[8px] text-gray-500 italic">Prestigie clientes recorrentes para bater suas metas rapidamente.</span>
        </div>

        {/* Dynamic availability block toggle */}
        <div className="glass p-4 mt-4 rounded-xl">
          <h5 className="text-[10px] font-bold text-[#D6C29A] uppercase tracking-wider mb-2 flex items-center gap-1 font-mono">
            <Hand className="w-3.5 h-3.5" /> Bloquear Horário Técnico
          </h5>
          <form onSubmit={handleBarberFormBlock} className="flex gap-2">
            <input 
              required
              type="text" 
              placeholder="Ex: 15:30 ou 16:00"
              value={barberBlockTime}
              onChange={(e) => setBarberBlockTime(e.target.value)}
              className="flex-1 bg-black border border-gray-800 rounded px-2 text-xs text-white focus:outline-none focus:border-[#B08D57] font-mono py-1.5"
            />
            <button 
              type="submit"
              id="btn_barber_block_submit"
              className="btn-premium font-semibold text-[10px] px-3 py-1 rounded-lg uppercase tracking-wider"
            >
              Bloquear
            </button>
          </form>
        </div>

        {/* Today's appointments (Simulated for May 27, 2026) */}
        <div className="flex flex-col gap-2.5 mt-5">
          <h4 className="text-xs uppercase tracking-widest text-[#6E8B8E] ml-1 font-mono">Minha Agenda de Hoje</h4>
          
          {(() => {
            const list = getTodaySchedule();
            if (list.length === 0) {
              return (
                <p className="text-xs text-gray-500 italic text-center py-6 bg-black/30 rounded-xl border border-gray-950">
                  Nenhuma reserva para você hoje.
                </p>
              );
            }

            return list.map(apt => {
              const serv = storeState.services.find(s => s.id === apt.serviceId);
              const isBlock = apt.customerPhone === '(00) 00000-0000';
              return (
                <div 
                  key={apt.id} 
                  className={`p-3 bg-gradient-to-r from-[#111214] to-[#111214]/60 border rounded-xl flex items-center justify-between text-left ${
                    isBlock ? 'border-amber-950/40 bg-amber-500/5' : 'border-[#B08D57]/10'
                  }`}
                >
                  <div className="flex gap-2.5 items-center">
                    <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-gray-500 border border-gray-900">
                      <Clock className="w-4 h-4 text-[#B08D57]" />
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white truncate max-w-[150px]">
                        {isBlock ? 'Horário Trancado' : apt.customerName}
                      </h5>
                      <span className="text-[9px] text-gray-400 mt-0.5 block font-mono">
                        {apt.time} ({serv?.durationMinutes}m) • {isBlock ? 'Ausência' : serv?.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {!isBlock ? (
                      <span className="text-[10px] font-bold font-serif font-serif text-emerald-400 text-right block">
                        + R$ {(apt.pricePaid * activeBarber.commissionPercentage).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-500">Bloqueado</span>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>

      </div>

      <div className="bg-[#111214]/90 border-t border-gray-900 py-4 text-center z-13 rounded-b-[40px]">
        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-mono">BarberPro Premium • Poltrona Ativa</span>
      </div>
    </div>
  );
};
