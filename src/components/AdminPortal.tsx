/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Settings, 
  Smartphone, 
  Crown, 
  Coins, 
  Building, 
  Plus, 
  Filter, 
  AlertCircle, 
  Send, 
  Sparkles, 
  ArrowUpRight, 
  Trash2, 
  Hand,
  CheckCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { globalStore } from '../data/store';
import { 
  RevenueAreaChart, 
  CircularOccupancyGauge, 
  BranchBarChart 
} from './DashboardCharts';
import { Appointment, Branch, Service, Barber } from '../types';

interface AdminPortalProps {
  onNotifyTriggered: (msg: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNotifyTriggered }) => {
  const [storeState, setStoreState] = useState({ ...globalStore });
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all'); // all, br_jardins, br_leblon, br_savassi
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'clientes' | 'financeiro' | 'afiliados' | 'campanhas' | 'config'>('dashboard');

  // Manual Encaixe states
  const [showEncaixeModal, setShowEncaixeModal] = useState(false);
  const [manualBranch, setManualBranch] = useState('');
  const [manualBarber, setManualBarber] = useState('');
  const [manualService, setManualService] = useState('');
  const [manualDate, setManualDate] = useState('2026-05-27');
  const [manualTime, setManualTime] = useState('14:00');
  const [manualCustName, setManualCustName] = useState('');
  const [manualCustPhone, setManualCustPhone] = useState('');

  // Manual Block slot state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockBarberId, setBlockBarberId] = useState('');
  const [blockDate, setBlockDate] = useState('2026-05-27');
  const [blockTime, setBlockTime] = useState('11:00');

  // WhatsApp Campaign state
  const [campaignTitle, setCampaignTitle] = useState('Promoção Imperial Fim de Semana');
  const [campaignContent, setCampaignContent] = useState('Olá [NOME]! Faça seu agendamento esta semana e ganhe um double shot de whisky ou cerveja artesanal importada gelada de cortesia durante seu atendimento. Vagas limitadas!');
  const [campaignTarget, setCampaignTarget] = useState<'all' | 'vip' | 'inactive30'>('all');

  // Sync state
  useEffect(() => {
    const unsub = globalStore.subscribe(() => {
      setStoreState({ ...globalStore });
    });
    return unsub;
  }, []);

  // Filter financial figures
  const getFilteredTransactions = () => {
    if (selectedBranchId === 'all') return storeState.financials;
    return storeState.financials.filter(t => t.branchId === selectedBranchId);
  };

  const getFilteredAppointments = () => {
    if (selectedBranchId === 'all') return storeState.appointments;
    return storeState.appointments.filter(a => a.branchId === selectedBranchId);
  };

  // Get key statistics
  const getStats = () => {
    const txs = getFilteredTransactions();
    const apts = getFilteredAppointments().filter(a => a.status !== 'cancelled');

    const faturamento = txs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const despesas = txs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const saldo = faturamento - despesas;

    const tickets = apts.filter(a => a.pricePaid > 0);
    const ticketMedio = tickets.length > 0 
      ? Number((tickets.reduce((sum, a) => sum + a.pricePaid, 0) / tickets.length).toFixed(2)) 
      : 150.00;

    const totalSubscribers = storeState.subscriptions.filter(s => s.status === 'active').length;
    const recurringRevenue = storeState.subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.pricePaid, 0);

    return { faturamento, despesas, saldo, ticketMedio, totalSubscribers, recurringRevenue };
  };

  const stats = getStats();

  // Create mock list of revenue points
  const getChartData = () => {
    // Generate dates around today 2026-05-27
    return [
      { date: '21/Mai', value: selectedBranchId === 'br_savassi' ? 0 : 580 },
      { date: '22/Mai', value: selectedBranchId === 'br_leblon' ? 310 : 850 },
      { date: '23/Mai', value: selectedBranchId === 'br_jardins' ? 950 : 1240 },
      { date: '24/Mai', value: selectedBranchId === 'br_savassi' ? 420 : 790 },
      { date: '25/Mai', value: 920 },
      { date: '26/Mai', value: stats.faturamento > 0 ? Number((stats.faturamento * 0.9).toFixed(0)) : 1050 },
      { date: '27/Mai', value: stats.faturamento }
    ];
  };

  const handleCreateEncaixe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBranch || !manualBarber || !manualService || !manualCustName || !manualCustPhone) {
      alert('Preencha os dados necessários.');
      return;
    }

    try {
      // Force manual bypass on schedule checker by using creating appointment directly
      globalStore.createAppointment({
        branchId: manualBranch,
        barberId: manualBarber,
        serviceId: manualService,
        customerName: manualCustName,
        customerPhone: manualCustPhone,
        date: manualDate,
        time: manualTime
      });

      setShowEncaixeModal(false);
      setManualCustName('');
      setManualCustPhone('');
      onNotifyTriggered(`Encaixe manual realizado para ${manualCustName} na agenda!`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockBarberId || !blockDate || !blockTime) return;

    // Simulate scheduling block using direct block appointment
    try {
      const barber = storeState.barbers.find(b => b.id === blockBarberId)!;
      // Register a virtual placeholder appointment that acts as block
      const transientBlockId = 'apt_block_' + Date.now();
      const newApt: Appointment = {
        id: transientBlockId,
        branchId: barber.branchIds[0] || 'br_jardins',
        barberId: blockBarberId,
        serviceId: 'ser_barba_luxury', // Placeholder service to occupy duration
        customerId: 'block_system',
        customerName: '[BLOQUEADO] Intervalo Técnico',
        customerPhone: '(00) 00000-0000',
        date: blockDate,
        time: blockTime,
        status: 'confirmed',
        pricePaid: 0,
        createdAt: new Date().toISOString(),
        whatsappSentStatus: 'not_sent'
      };

      globalStore.appointments.push(newApt);
      localStorage.setItem('bp_appointments', JSON.stringify(globalStore.appointments));
      
      setShowBlockModal(false);
      onNotifyTriggered(`Horário bloqueado com sucesso na agenda de ${barber.name}.`);
    } catch (err) {
      alert('Erro ao processar bloqueio.');
    }
  };

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    globalStore.triggerCampaign(campaignTitle, campaignContent, campaignTarget);
    setCampaignTitle('');
    setCampaignContent('');
    onNotifyTriggered(`Mensagens da Campanha "${campaignTitle}" transmitidas via simulador de WhatsApp de forma bem sucedida!`);
  };

  const handleSettleAffiliate = (id: string, name: string) => {
    if (confirm(`Confirmar o pagamento das comissões acumuladas do parceiro ${name}?`)) {
      globalStore.settleAffiliateCommission(id);
      onNotifyTriggered(`Comissões de ${name} foram quitadas e registradas como despesa comercial.`);
    }
  };

  return (
    <div className="flex-1 bg-[#070708] rounded-3xl border border-[#B08D57]/20 overflow-hidden flex flex-col md:flex-row shadow-2xl h-full font-sans text-white animate-fade-in" id="admin_workspace_root">
      
      {/* SIDEBAR FOR INTERNAL CONTROLS */}
      <div className="w-full md:w-60 bg-[#0c0d0f] border-b md:border-b-0 md:border-r border-[#B08D57]/20 px-4 py-6 flex flex-col justify-between shrink-0 h-auto md:h-full">
        <div>
          {/* Logo and system headers */}
          <div className="flex items-center gap-2 px-1 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8A6A3D] to-[#D6C29A] flex items-center justify-center text-black font-extrabold shadow-md shadow-[#B08D57]/10 shrink-0">
              BP
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold tracking-wider text-white uppercase leading-none">
                <span className="gold-text">BarberPro</span>
              </h2>
              <span className="text-[9px] text-[#D6C29A] font-mono font-medium uppercase tracking-widest mt-1 block">PREMIUM SUITE</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex flex-col gap-1.5">
            <button
              id="admin_nav_dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-[#B08D57] text-black font-extrabold' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Painel Executivo</span>
            </button>
            <button
              id="admin_nav_agenda"
              onClick={() => setActiveTab('agenda')}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                activeTab === 'agenda' ? 'bg-[#B08D57] text-black font-extrabold' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Agenda de Poltronas</span>
            </button>
            <button
              id="admin_nav_clientes"
              onClick={() => setActiveTab('clientes')}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'clientes' ? 'bg-[#B08D57] text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Cadastro & CRM</span>
            </button>
            <button
              id="admin_nav_financeiro"
              onClick={() => setActiveTab('financeiro')}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'financeiro' ? 'bg-[#B08D57] text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Coins className="w-4 h-4 shrink-0" />
              <span>Cofre & Finanças</span>
            </button>
            <button
              id="admin_nav_afiliados"
              onClick={() => setActiveTab('afiliados')}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'afiliados' ? 'bg-[#B08D57] text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Crown className="w-4 h-4 shrink-0" />
              <span>Afiliados & Indicações</span>
            </button>
            <button
              id="admin_nav_campanhas"
              onClick={() => setActiveTab('campanhas')}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'campanhas' ? 'bg-[#B08D57] text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Disparador WhatsApp</span>
            </button>
            <button
              id="admin_nav_config"
              onClick={() => setActiveTab('config')}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left ${
                activeTab === 'config' ? 'bg-[#B08D57] text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Configurações SaaS</span>
            </button>
          </div>
        </div>

        {/* Global indicator bar */}
        <div className="mt-8 border-t border-gray-900 pt-5 px-1 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>Servidor Central</span>
            <span className="text-emerald-400 font-mono">● ONLINE</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>Automação WhatsApp</span>
            <span className="text-[#B08D57] font-mono">Habilitado</span>
          </div>
        </div>
      </div>

      {/* DETAILED CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-850">
        
        {/* TOP STATUS NAVIGATION AND FILTERS bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-900 pb-5 mb-5 gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase">
              {activeTab === 'dashboard' && 'Dashboard Executivo'}
              {activeTab === 'agenda' && 'Gestão Operacional de Poltronas'}
              {activeTab === 'clientes' && 'Gestão Premium de Clientes (CRM)'}
              {activeTab === 'financeiro' && 'Ledger Geral das Transações'}
              {activeTab === 'afiliados' && 'Painel de Afiliados de Ticket Alto'}
              {activeTab === 'campanhas' && 'Simulador de Disparos em Massa'}
              {activeTab === 'config' && 'Parâmetros Globais do Sistema'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Visão consolidada do crescimento de suas franquias premium</p>
          </div>

          {/* Micro Branch Changer */}
          <div className="flex bg-[#111214] border border-gray-850 p-1 rounded-xl">
            <button 
              id="branch_filter_all"
              onClick={() => setSelectedBranchId('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors ${selectedBranchId === 'all' ? 'bg-[#B08D57] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Todos
            </button>
            <button 
              id="branch_filter_jardins"
              onClick={() => setSelectedBranchId('br_jardins')}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors ${selectedBranchId === 'br_jardins' ? 'bg-[#B08D57] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Jardins
            </button>
            <button 
              id="branch_filter_leblon"
              onClick={() => setSelectedBranchId('br_leblon')}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors ${selectedBranchId === 'br_leblon' ? 'bg-[#B08D57] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Leblon
            </button>
            <button 
              id="branch_filter_savassi"
              onClick={() => setSelectedBranchId('br_savassi')}
              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors ${selectedBranchId === 'br_savassi' ? 'bg-[#B08D57] text-black' : 'text-gray-400 hover:text-white'}`}
            >
              Savassi
            </button>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6" id="dashboard_tab_content">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-2xl p-4.5 flex flex-col justify-between bg-[#111214]">
                <span className="text-[10px] uppercase tracking-wider text-[#6E8B8E] font-bold font-mono">Faturamento Líquido</span>
                <span className="text-xl font-bold font-serif serif text-white mt-2">R$ {stats.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="text-[9px] text-[#C5A46D] mt-1.5 flex items-center gap-1 font-mono font-semibold">★ Caixa real</span>
              </div>
              <div className="glass rounded-2xl p-4.5 flex flex-col justify-between bg-[#111214]">
                <span className="text-[10px] uppercase tracking-wider text-[#6E8B8E] font-bold font-mono">Receita Recorrente (MRR)</span>
                <span className="text-xl font-bold font-serif serif text-[#D6C29A] mt-2">R$ {stats.recurringRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="text-[9px] text-gray-500 mt-1.5 font-mono">Clientes no Club VIP</span>
              </div>
              <div className="glass rounded-2xl p-4.5 flex flex-col justify-between bg-[#111214]">
                <span className="text-[10px] uppercase tracking-wider text-[#6E8B8E] font-bold font-mono">Assinantes VIP Ativos</span>
                <span className="text-xl font-bold font-serif serif text-white mt-2">{stats.totalSubscribers}</span>
                <span className="text-[9px] text-emerald-400 mt-1.5 font-mono font-semibold">100% Retenção</span>
              </div>
              <div className="glass rounded-2xl p-4.5 flex flex-col justify-between bg-[#111214]">
                <span className="text-[10px] uppercase tracking-wider text-[#6E8B8E] font-bold font-mono">Ticket Médio</span>
                <span className="text-xl font-bold font-serif serif text-[#D6C29A] mt-2">R$ {stats.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="text-[9px] text-[#6E8B8E] mt-1.5 font-mono">Foco em serviços altos</span>
              </div>
            </div>

            {/* Charts and Visual Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Financial area trend chart */}
              <div className="lg:col-span-2 bg-[#111214] border border-gray-900 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-gray-950 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6C29A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B08D57]" /> Curva de Receita Semanal (Forecast)
                  </h4>
                  <span className="text-[10px] text-gray-500">Últimos 7 Dias</span>
                </div>
                <div className="h-52 w-full mt-2">
                  <RevenueAreaChart data={getChartData()} />
                </div>
              </div>

              {/* Occupancy and Branches Progress Gages */}
              <div className="bg-[#111214] border border-gray-900 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-gray-950 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Metricas de Operação</h4>
                </div>
                <div className="flex justify-around items-center pt-2">
                  <CircularOccupancyGauge percentage={84} label="Agenda Ocupada" />
                  <CircularOccupancyGauge percentage={96} label="Retorno VIP" />
                </div>
                {selectedBranchId === 'all' && (
                  <div className="border-t border-gray-950 pt-4 flex flex-col gap-2">
                    <span className="text-[9px] text-[#6E8B8E] uppercase tracking-wider">Comparativo de Unidades</span>
                    <BranchBarChart branches={[
                      { name: 'Jardins', value: 2450.00 },
                      { name: 'Leblon', value: 1620.00 },
                      { name: 'Savassi', value: 920.00 }
                    ]} />
                  </div>
                )}
              </div>
            </div>

            {/* Quick operations & recent VIP logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Premium bookings list */}
              <div className="bg-[#111214] border border-gray-900 rounded-2xl p-5">
                <div className="flex justify-between items-center border-b border-gray-950 pb-3.5 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6C29A]">Próximos Seis Atendimentos Confifmados</h4>
                  <span className="text-[10px] text-gray-400">Tempo Real</span>
                </div>
                <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
                  {getFilteredAppointments().slice(0, 5).map(apt => {
                    const s = storeState.services.find(serv => serv.id === apt.serviceId);
                    const b = storeState.barbers.find(barb => barb.id === apt.barberId);
                    const isCancelled = apt.status === 'cancelled';
                    return (
                      <div key={apt.id} className="p-3 bg-black/40 border border-gray-950 rounded-xl flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-white">{apt.customerName}</h5>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {s?.name} ({s?.durationMinutes}m) • {b?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono block text-[#C5A46D]">{apt.date} às {apt.time}</span>
                          <span className="text-[9px] border border-gray-900 bg-[#070708] text-gray-400 px-2 py-0.5 rounded-full uppercase mt-1 inline-block">
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VIP Subscription activity feed */}
              <div className="bg-[#111214] border border-gray-900 rounded-2xl p-5">
                <div className="flex justify-between items-center border-b border-gray-950 pb-3.5 mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quadro de Assinaturas do Clube</h4>
                  <span className="text-[10px] text-gray-500">Recorrência Mensal</span>
                </div>
                <div className="flex flex-col gap-3">
                  {storeState.subscriptions.map(sub => {
                    const plan = storeState.subscriptionPlans.find(p => p.id === sub.planId);
                    return (
                      <div key={sub.id} className="p-3 bg-gradient-to-r from-black/40 to-[#111214] border border-gray-950 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#B08D57]/10 flex items-center justify-center text-[#D6C29A] font-bold text-xs">
                            <Crown className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">{sub.customerName}</h5>
                            <span className="text-[10px] text-[#6E8B8E]">{plan?.name} • Próximo faturamento: {sub.nextBillingDate}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-white">R$ {sub.pricePaid.toFixed(2)}</span>
                          <span className="text-[9px] text-[#6E8B8E] font-medium block">Contabilidade Ativa</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CO-WORKING AGENDA AND CALENDAR DESK */}
        {activeTab === 'agenda' && (
          <div className="flex flex-col gap-5" id="agenda_tab_content">
            <div className="flex justify-between items-center bg-[#111214] border border-gray-900 p-4 rounded-xl">
              <div>
                <h3 className="text-sm font-bold text-[#D6C29A] uppercase tracking-wide">Planejamento das Poltronas</h3>
                <p className="text-xs text-gray-400 mt-1">Controle de encaixes manuais rápidos e trancamento técnico de poltrona</p>
              </div>

              <div className="flex gap-2">
                <button
                  id="btn_trigger_emergency_booking"
                  onClick={() => {
                    // Pre-fill initial defaults
                    setManualBranch(storeState.branches[0]?.id || '');
                    setManualBarber(storeState.barbers[0]?.id || '');
                    setManualService(storeState.services[0]?.id || '');
                    setShowEncaixeModal(true);
                  }}
                  className="bg-[#B08D57] hover:bg-[#8A6A3D] text-black font-semibold text-xs px-3.5 py-2 rounded-xl uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-black" /> Encaixe Manual
                </button>
                <button
                  id="btn_trigger_manual_block"
                  onClick={() => {
                    setBlockBarberId(storeState.barbers[0]?.id || '');
                    setShowBlockModal(true);
                  }}
                  className="bg-black text-[#D6C29A] border border-gray-800 font-semibold text-xs px-3.5 py-2 rounded-xl uppercase flex items-center gap-1.5 hover:border-[#B08D57] transition-colors cursor-pointer"
                >
                  <Hand className="w-4 h-4" /> Bloquear Horário
                </button>
              </div>
            </div>

            {/* List Agenda appointments filtered */}
            <div className="bg-[#111214] border border-gray-900 rounded-2xl overflow-hidden">
              <div className="p-4 bg-black/30 border-b border-gray-950 flex justify-between items-center text-xs">
                <span className="text-[#C5A46D] font-bold uppercase tracking-wider">Agendamentos Vigentes</span>
                <span className="text-gray-500">Mapeamento em tempo real</span>
              </div>
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#070708] text-gray-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Horário / Data</th>
                    <th className="py-3.5 px-4 font-semibold">Cliente / Telefone</th>
                    <th className="py-3.5 px-4 font-semibold">Barbeiro Alocado</th>
                    <th className="py-3.5 px-4 font-semibold">Serviço Solicitado</th>
                    <th className="py-3.5 px-4 font-semibold">Preço</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-950">
                  {getFilteredAppointments().map(apt => {
                    const s = storeState.services.find(serv => serv.id === apt.serviceId);
                    const b = storeState.barbers.find(barb => barb.id === apt.barberId);
                    return (
                      <tr key={apt.id} className="hover:bg-white/2 bg-[#111214]">
                        <td className="py-4 px-4 font-bold font-mono text-white text-xs">
                          {apt.date} às {apt.time}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold block text-white">{apt.customerName}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{apt.customerPhone}</span>
                        </td>
                        <td className="py-4 px-4 text-gray-300 font-medium">
                          {b?.name}
                        </td>
                        <td className="py-4 px-4 font-semibold">
                          {s?.name}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-[#D6C29A]">
                          R$ {apt.pricePaid.toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            apt.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-950/40'
                              : apt.status === 'cancelled'
                                ? 'bg-rose-500/10 text-[#652026] border border-rose-950/40'
                                : 'bg-[#B08D57]/10 text-[#C5A46D] border border-[#B08D57]/20'
                          }`}>
                            {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'completed' ? 'Concluído' : apt.status === 'pending' ? 'Pendente' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {apt.status !== 'cancelled' ? (
                            <button
                              id={`btn_admin_cancel_${apt.id}`}
                              onClick={() => {
                                globalStore.cancelAppointment(apt.id);
                                onNotifyTriggered('Reserva cancelada pela gerência.');
                              }}
                              className="text-rose-500 hover:text-white transition-colors bg-rose-500/10 hover:bg-rose-500 px-2 py-1 rounded"
                            >
                              Cancelar
                            </button>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ENCAIXE MANUAL OVERLAY MODAL */}
            {showEncaixeModal && (
              <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4" id="encaixe_modal">
                <div className="bg-[#111214] border border-[#B08D57] rounded-3xl p-6 max-w-sm w-full relative">
                  <button 
                    id="btn_cls_encaixe" 
                    onClick={() => setShowEncaixeModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h4 className="text-sm font-bold text-[#D6C29A] uppercase tracking-wider mb-4">Novo Encaixe Manual</h4>
                  <form onSubmit={handleCreateEncaixe} className="flex flex-col gap-3.5 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 uppercase">Unidade</label>
                      <select 
                        required
                        value={manualBranch} 
                        onChange={e => setManualBranch(e.target.value)}
                        className="bg-black text-white p-2 border border-gray-800 rounded focus:border-[#B08D57]"
                      >
                        {storeState.branches.map(br => <option key={br.id} value={br.id}>{br.name}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 uppercase">Barbeiro</label>
                      <select 
                        required
                        value={manualBarber} 
                        onChange={e => setManualBarber(e.target.value)}
                        className="bg-black text-white p-2 border border-gray-800 rounded focus:border-[#B08D57]"
                      >
                        {storeState.barbers.map(ba => <option key={ba.id} value={ba.id}>{ba.name}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 uppercase">Serviço</label>
                      <select 
                        required
                        value={manualService} 
                        onChange={e => setManualService(e.target.value)}
                        className="bg-black text-white p-2 border border-gray-800 rounded focus:border-[#B08D57]"
                      >
                        {storeState.services.map(se => <option key={se.id} value={se.id}>{se.name} (R$ {se.price})</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 uppercase">Data</label>
                        <input 
                          type="date"
                          value={manualDate}
                          onChange={e => setManualDate(e.target.value)}
                          className="bg-black text-white p-2 border border-gray-800 rounded focus:border-[#B08D57]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 uppercase">Hora</label>
                        <input 
                          type="text"
                          value={manualTime}
                          placeholder="15:30"
                          onChange={e => setManualTime(e.target.value)}
                          className="bg-black text-white p-2 border border-gray-800 rounded font-mono focus:border-[#B08D57]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 uppercase">Nome do Cliente</label>
                      <input 
                        required
                        type="text"
                        placeholder="Roberto Alencar"
                        value={manualCustName}
                        onChange={e => setManualCustName(e.target.value)}
                        className="bg-black text-white p-2 border border-gray-800 rounded focus:border-[#B08D57]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 uppercase">WhatsApp</label>
                      <input 
                        required
                        type="tel"
                        placeholder="(11) 99122-3344"
                        value={manualCustPhone}
                        onChange={e => setManualCustPhone(e.target.value)}
                        className="bg-black text-white p-2 border border-gray-800 rounded focus:border-[#B08D57]"
                      />
                    </div>

                    <button
                      type="submit"
                      id="btn_submit_manual_encaixe"
                      className="w-full py-3 mt-2 rounded bg-[#B08D57] text-black uppercase font-bold text-xs"
                    >
                      Inserir Agendamento Forçado
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* BLOCK TIME MODAL */}
            {showBlockModal && (
              <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4" id="block_modal">
                <div className="bg-[#111214] border border-[#B08D57] rounded-3xl p-6 max-w-sm w-full relative">
                  <button 
                    id="btn_cls_block" 
                    onClick={() => setShowBlockModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h4 className="text-sm font-bold text-[#D6C29A] uppercase tracking-wider mb-4">Travar Poltrona (Bloqueio)</h4>
                  <form onSubmit={handleCreateBlock} className="flex flex-col gap-3.5 text-xs">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 uppercase">Barbeiro Alocado</label>
                      <select 
                        required
                        value={blockBarberId}
                        onChange={e => setBlockBarberId(e.target.value)}
                        className="bg-black text-white p-2 border border-gray-800 rounded focus:border-[#B08D57]"
                      >
                        {storeState.barbers.map(ba => <option key={ba.id} value={ba.id}>{ba.name}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 uppercase">Data</label>
                        <input 
                          type="date"
                          value={blockDate}
                          onChange={e => setBlockDate(e.target.value)}
                          className="bg-black text-white p-2 border border-gray-800 rounded"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-gray-400 uppercase">Hora de Início</label>
                        <input 
                          type="text"
                          value={blockTime}
                          placeholder="e.g. 11:30"
                          onChange={e => setBlockTime(e.target.value)}
                          className="bg-black text-white p-2 border border-gray-800 rounded font-mono"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-400 bg-black/40 p-2.5 rounded border border-gray-850">
                      Isto criará uma ocupação fictícia na agenda do barbeiro, impedindo que clientes efetuem agendamentos online neste período preciso.
                    </p>

                    <button
                      type="submit"
                      id="btn_submit_block"
                      className="w-full py-3 bg-[#B08D57] text-black font-semibold text-xs tracking-wider uppercase rounded"
                    >
                      Aplicar Bloqueio de Poltrona
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CUSTOMER CRM LIST */}
        {activeTab === 'clientes' && (
          <div className="flex flex-col gap-4" id="clientes_tab_content">
            <div className="bg-[#111214] border border-gray-900 rounded-2xl overflow-hidden p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-gray-950 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6C29A]">Fichários de Atendimento (CRM)</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Status de membresia, ticket acumulativo e pontos fidelidade</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {storeState.customers.map(cust => (
                  <div key={cust.id} className="bg-black/30 border border-gray-950 rounded-xl p-4 flex flex-col justify-between hover:border-gray-850">
                    <div className="flex gap-3.5 items-start">
                      <div className="w-10 h-10 rounded-full bg-[#B08D57]/10 flex items-center justify-center text-[#D6C29A] font-extrabold border border-[#B08D57]/20">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-white">{cust.name}</h5>
                          {cust.vip ? (
                            <span className="text-[8px] bg-[#B08D57] text-black font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider">{cust.status}</span>
                          ) : (
                            <span className="text-[8px] bg-gray-900 text-gray-500 px-1.5 py-0.2 rounded uppercase">Varejo</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{cust.phone} • {cust.email}</p>
                        <p className="text-[10px] text-gray-400 mt-1.5 italic">Membro cadastrado desde {cust.joined}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-950 pt-3 mt-3.5 text-xs text-gray-400">
                      <div>
                        <span className="text-[10px] text-[#6E8B8E] uppercase tracking-wider block">Acúmulo Caixa</span>
                        <strong className="text-white font-mono">R$ {cust.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#6E8B8E] uppercase tracking-wider block">Fidelidade</span>
                        <span className="text-[#D3B583] font-bold font-mono">{cust.loyaltyPoints} PTS</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GENERAL FINANCIAL LEDGER */}
        {activeTab === 'financeiro' && (
          <div className="flex flex-col gap-4" id="financeiro_tab_content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#111214] border border-gray-900 rounded-xl p-4 text-center">
                <span className="text-[10px] text-[#6E8B8E] block uppercase tracking-wider">Entradas Faturadas</span>
                <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">R$ {stats.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-[#111214] border border-gray-900 rounded-xl p-4 text-center">
                <span className="text-[10px] text-[#6E8B8E] block uppercase tracking-wider">Saídas / Custos / Comissão</span>
                <span className="text-lg font-bold font-mono text-red-400 mt-1 block">R$ {stats.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-[#111214] border border-gray-900 rounded-xl p-4 text-center">
                <span className="text-[10px] text-[#6E8B8E] block uppercase tracking-wider">Lucro Operacional Líquido</span>
                <span className="text-lg font-bold font-mono text-white mt-1 block">R$ {stats.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="bg-[#111214] border border-gray-900 rounded-2xl overflow-hidden mt-2">
              <div className="p-4 bg-black/30 border-b border-gray-950 text-xs flex justify-between items-center">
                <strong className="text-[#D6C29A] uppercase tracking-widest font-bold">Ledger de Conciliação Diária</strong>
                <span className="text-xs text-gray-500 font-mono">Simulação de Fluxo de Caixa</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-[#070708] text-gray-400 uppercase tracking-widest text-[9px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Código</th>
                    <th className="py-3 px-4 font-semibold">Data</th>
                    <th className="py-3 px-4 font-semibold">Descrição da Transação</th>
                    <th className="py-3 px-4 font-semibold">Operação</th>
                    <th className="py-3 px-4 font-semibold">Método</th>
                    <th className="py-3 px-4 text-right font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-950 font-mono text-gray-300">
                  {getFilteredTransactions().map(tx => (
                    <tr key={tx.id} className="hover:bg-white/2">
                      <td className="py-3.5 px-4 text-gray-500 font-bold">{tx.id}</td>
                      <td className="py-3.5 px-4">{tx.date}</td>
                      <td className="py-3.5 px-4 text-white font-sans">{tx.description}</td>
                      <td className="py-3.5 px-4 uppercase text-[10px]">
                        {tx.type === 'income' ? (
                          <span className="text-emerald-400">Ativo In</span>
                        ) : (
                          <span className="text-rose-400">Passivo Out</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">{tx.paymentMethod || 'faturamento'}</td>
                      <td className={`py-3.5 px-4 text-right font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: AFFILIATE COMMISSION PANEL AND INFLUENCERS */}
        {activeTab === 'afiliados' && (
          <div className="flex flex-col gap-4" id="afiliados_tab_content">
            <div className="bg-[#111214] border border-gray-900 rounded-2xl overflow-hidden p-5 flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6C29A]">Parcerias e Afiliados Premium (Concierges & Influencers)</h4>
                <p className="text-[10px] text-gray-400 mt-1">Monitore indicações enviadas de hotéis 5 estrelas e academias de alto padrão com comissionamentos pré-programados</p>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                {storeState.affiliates.map(aff => {
                  const referralsList = storeState.affiliateReferrals.filter(ref => ref.affiliateId === aff.id);
                  return (
                    <div key={aff.id} className="p-4 bg-black/40 border border-gray-950 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-850">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-semibold text-white">{aff.name}</h5>
                          <span className="text-[9px] bg-[#B08D57]/15 text-[#C5A46D] px-2 py-0.2 rounded font-mono font-bold uppercase tracking-wider">Cupom: {aff.code}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">{aff.phone} • {aff.commissionPercentage}% de comissão fixa nos cortes e assinaturas</p>
                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {referralsList.length} Clientes indicados com sucesso
                        </p>
                      </div>

                      <div className="flex gap-4 items-center shrink-0 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-left md:text-right">
                          <span className="text-[9px] text-[#6E8B8E] block uppercase tracking-wider">Pendente Acumulado</span>
                          <strong className="text-sm font-bold font-mono text-[#D6C29A]">R$ {aff.balancePending.toFixed(2)}</strong>
                          <span className="text-[9px] text-gray-500 block">Pago: R$ {aff.balancePaid}</span>
                        </div>
                        
                        {aff.balancePending > 0 ? (
                          <button
                            id={`btn_settle_affiliate_${aff.id}`}
                            onClick={() => handleSettleAffiliate(aff.id, aff.name)}
                            className="bg-[#B08D57] hover:bg-[#8A6A3D] text-black font-semibold text-xs px-3.5 py-2 rounded-lg uppercase transition-all duration-150 cursor-pointer"
                          >
                            Quitar Balanço
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 px-3.5 py-2 border border-emerald-900/40 bg-emerald-500/5 rounded-lg uppercase tracking-wide">
                            Saldo em Dia
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MASS BULK WHATSAPP CAMPAIGNS */}
        {activeTab === 'campanhas' && (
          <div className="flex flex-col gap-4" id="campanhas_tab_content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form to trigger bulk campaign */}
              <div className="lg:col-span-2 bg-[#111214] border border-gray-900 rounded-2xl p-5 flex flex-col gap-4">
                <div className="border-b border-gray-950 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6C29A]">Disparar Nova Campanha de Atendimento</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Crie réguas de relacionamento automáticas ou promocionais para engajamento rápido</p>
                </div>

                <form onSubmit={handleSendCampaign} className="flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 uppercase">Título Interno da Campanha</label>
                    <input 
                      required
                      type="text"
                      className="bg-black p-2.5 border border-gray-800 rounded focus:border-[#B08D57] text-white"
                      value={campaignTitle}
                      onChange={e => setCampaignTitle(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-medium">Filtro de Destinatários (CRM Cluster)</label>
                    <select 
                      value={campaignTarget}
                      onChange={e => setCampaignTarget(e.target.value as any)}
                      className="bg-black p-2.5 border border-gray-800 rounded text-white"
                    >
                      <option value="all">Fãs e Clientes Gerais (Todos do CRM)</option>
                      <option value="vip">Apenas Associados VIP Ativos (Club Black/Gold/Bronze)</option>
                      <option value="inactive30">Clientes sem visita nos últimos 30 dias (Recuperação de Churn)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-medium flex justify-between">
                      <span>Mensagem do WhatsApp (Suporta Markup)</span>
                      <span className="text-[#C5A46D] font-mono">[NOME] insere dinâmico</span>
                    </label>
                    <textarea 
                      required
                      rows={4}
                      className="bg-black p-2.5 border border-gray-800 rounded focus:border-[#B08D57] font-sans text-white leading-normal"
                      value={campaignContent}
                      onChange={e => setCampaignContent(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    id="btn_send_bulk_campaign"
                    className="w-fit bg-[#B08D57] hover:bg-[#8A6A3D] text-black font-semibold text-xs py-3 px-6 rounded-xl uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-black" /> Disparar Campanha Imperial via WhatsApp
                  </button>
                </form>
              </div>

              {/* Live WhatsApp Simulator log feed */}
              <div className="bg-[#111214] border border-gray-900 rounded-2xl p-5 flex flex-col gap-4">
                <div className="border-b border-gray-950 pb-3 flex justify-between items-center text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Log de Transmissão (Simulador)</h4>
                  <span className="text-emerald-400 font-mono animate-pulse">● LIVE</span>
                </div>
                <div className="flex flex-col gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                  {storeState.whatsappMessages.map(msg => (
                    <div key={msg.id} className="p-3 bg-black/60 rounded-xl border border-gray-950 relative">
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-950 px-1.5 py-0.2 rounded absolute top-2 right-2 uppercase">Entregue</span>
                      <h5 className="text-[10px] font-bold text-[#D6C29A]">{msg.customerName} ({msg.to})</h5>
                      <span className="text-[8px] text-gray-500 block mt-0.5">Disparado em: {msg.sentAt.split('T')[0]}</span>
                      <p className="text-[10px] text-gray-300 font-serif leading-relaxed mt-2 p-2 bg-black/40 border-l-2 border-[#B08D57] rounded-r whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: GENERAL CRM METRICS AND SETTINGS */}
        {activeTab === 'config' && (
          <div className="flex flex-col gap-4" id="config_tab_content">
            <div className="bg-[#111214] border border-gray-900 rounded-2xl p-6 max-w-lg">
              <div className="border-b border-gray-950 pb-3 mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6C29A]">Configuração de Regras de Negócio</h4>
                <p className="text-[10px] text-gray-400 mt-1">Configure paradas do calendário, fidelidades e automatismos globais</p>
              </div>

              <div className="flex flex-col gap-4.5 text-xs text-gray-300">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white block">Buffer de Segurança do Calendário</span>
                    <span className="text-[10px] text-gray-550 block">Intervalo técnico mínimo entre as poltronas dos barbeiros</span>
                  </div>
                  <span className="font-mono font-bold text-white bg-black border border-gray-850 px-4 py-1.5 rounded">{storeState.settings.appointmentBufferMinutes} Minutos</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-950 pt-4">
                  <div>
                    <span className="font-semibold text-white block">Limite Desistência do Agendamento</span>
                    <span className="text-[10px] text-gray-550 block">Tempo limite em que o cliente final pode cancelar sua vaga</span>
                  </div>
                  <span className="font-mono font-bold text-white bg-black border border-gray-850 px-4 py-1.5 rounded">{storeState.settings.allowCancellationHoursBefore} Horas antes</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-950 pt-4">
                  <div>
                    <span className="font-semibold text-white block">Multiplicador do Cashback / Fidelidade</span>
                    <span className="text-[10px] text-gray-550 block">Quantos pontos são atribuídos a cada Real faturado</span>
                  </div>
                  <span className="font-mono font-bold text-white bg-black border border-gray-850 px-4 py-1.5 rounded">{storeState.settings.pointsPerRealSpent} ponto por R$ 10</span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-950 pt-4 bg-black/30 p-3.5 rounded-xl border border-gray-850">
                  <div>
                    <span className="font-semibold text-[#D6C29A] block">Ativar Transmissor de WhatsApp</span>
                    <span className="text-[10px] text-gray-400 block">Simulador central de mensagens diretas e bulk de relacionamento</span>
                  </div>
                  <span className="text-emerald-400 font-bold uppercase text-[10px]">Habilitado</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
