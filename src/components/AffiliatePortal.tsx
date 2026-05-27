/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Coins, 
  Users, 
  TrendingUp, 
  Copy, 
  Share2, 
  Gift, 
  CheckCircle, 
  AlertCircle,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { globalStore } from '../data/store';

interface AffiliatePortalProps {
  onNotifyTriggered: (msg: string) => void;
}

export const AffiliatePortal: React.FC<AffiliatePortalProps> = ({ onNotifyTriggered }) => {
  const [storeState, setStoreState] = useState({ ...globalStore });
  const [selectedAffiliateId, setSelectedAffiliateId] = useState<string>('aff_pedro');

  useEffect(() => {
    const unsub = globalStore.subscribe(() => {
      setStoreState({ ...globalStore });
    });
    return unsub;
  }, []);

  const activeAffiliate = storeState.affiliates.find(a => a.id === selectedAffiliateId)!;
  const referralsList = storeState.affiliateReferrals.filter(ref => ref.affiliateId === selectedAffiliateId);

  const statsReferralCount = referralsList.length;
  // Calculate total revenue generated from referrals
  const statsRevenueGenerated = referralsList.reduce((sum, r) => sum + r.revenue, 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://barberpro.com.br/invite?coupon=${activeAffiliate.code}`);
    onNotifyTriggered('Link de indicação exclusivo copiado para a área de transferência!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeAffiliate.code);
    onNotifyTriggered('Código / Cupom de comissão copiado!');
  };

  return (
    <div className="w-full max-w-sm mx-auto aspect-[9/18.5] bg-[#070708] rounded-[48px] border-8 border-[#1a1b1e] shadow-2xl relative overflow-hidden flex flex-col font-sans" id="affiliate-phone-container">
      {/* Phone Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#1a1b1e] rounded-b-2xl z-50 flex items-center justify-center">
        <div className="w-12 h-1 bg-black rounded-full mb-1"></div>
      </div>

      <div className="flex-1 flex flex-col pt-8 pb-4 px-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-850">
        
        {/* Profile Affiliate Switcher Header */}
        <div className="flex items-center justify-between border-b border-[#B08D57]/20 pb-3 mb-4 mt-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#B08D57] shrink-0" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D6C29A] font-mono">Parceiro Indicador</span>
          </div>

          <select 
            id="affiliate_portal_selector"
            value={selectedAffiliateId}
            onChange={(e) => setSelectedAffiliateId(e.target.value)}
            className="bg-black border border-[#B08D57]/30 rounded px-2.5 py-1 text-[11px] font-bold text-white focus:outline-none focus:border-[#B08D57] font-mono"
          >
            {storeState.affiliates.map(aff => (
              <option key={aff.id} value={aff.id}>{aff.name.split(' ')[0]}</option>
            ))}
          </select>
        </div>

        {/* Affiliate Main Welcome card */}
        <div className="glass border border-[#B08D57]/40 rounded-2xl p-4 flex flex-col relative overflow-hidden bg-[#111214]">
          <Gift className="w-10 h-10 text-[#C5A46D] opacity-15 absolute right-2.5 top-2.5" />
          <span className="text-[8px] uppercase font-semibold text-[#6E8B8E] tracking-widest font-mono">Painel de Indicação VIP</span>
          <h4 className="text-sm font-bold text-white mt-1 font-serif serif">{activeAffiliate.name}</h4>
          <p className="text-[9px] text-[#C5A46D] mt-0.5 font-medium">Comissão contratual de {activeAffiliate.commissionPercentage}% por checkout</p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <span className="text-[8px] text-gray-400 uppercase font-medium block">Saldo Pendente</span>
              <strong className="text-sm font-bold font-serif serif text-white block">R$ {activeAffiliate.balancePending.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-[8px] text-gray-400 uppercase font-medium block">Balanço Pago</span>
              <strong className="text-sm font-bold font-serif serif text-[#D6C29A] block font-semibold">R$ {activeAffiliate.balancePaid.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Coupon and link sharing tools */}
        <div className="glass border border-[#B08D57]/25 rounded-2xl p-4 mt-4 flex flex-col gap-3">
          <span className="text-[9px] text-[#D6C29A] uppercase tracking-wider font-bold font-mono">Gerador de Divulgação</span>
          
          {/* Coupon Display bar */}
          <div className="flex items-center justify-between bg-black p-2.5 rounded-lg border border-[#B08D57]/10">
            <div>
              <span className="text-[8px] text-gray-500 block">SEU CUPOM EXCLUSIVO</span>
              <strong className="text-xs font-mono font-bold text-[#D6C29A] tracking-wider uppercase">{activeAffiliate.code}</strong>
            </div>
            <button 
              id="copy_coupon_code_btn"
              onClick={handleCopyCode}
              className="btn-premium p-1 px-2 text-[9px] font-bold rounded-lg hover:bg-opacity-95 flex items-center gap-1 uppercase shrink-0"
            >
              <Copy className="w-3 h-3 text-black" /> Copiar
            </button>
          </div>

          {/* Link Display bar */}
          <div className="flex items-center justify-between bg-black p-2.5 rounded-lg border border-[#B08D57]/10">
            <div className="truncate pr-2">
              <span className="text-[8px] text-gray-500 block">LINK DO AGENDAMENTO</span>
              <span className="text-[9px] text-gray-300 font-mono truncate block">barberpro.com.br/?ref={activeAffiliate.code}</span>
            </div>
            <button 
              id="copy_referral_link_btn"
              onClick={handleCopyLink}
              className="p-1 px-2 text-[9px] font-bold bg-black border border-[#B08D57]/30 text-[#D6C29A] rounded-lg hover:border-[#B08D57] flex items-center gap-1 uppercase shrink-0 font-mono"
            >
              <Share2 className="w-3 h-3" /> Compartilhar
            </button>
          </div>
        </div>

        {/* Simple conversion stats progress */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="glass p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[8px] text-gray-400 block">INDICADOS</span>
              <strong className="text-sm font-semibold text-white mt-1 block font-mono">{statsReferralCount} ativos</strong>
            </div>
            <Users className="w-6 h-6 text-[#6E8B8E] opacity-30" />
          </div>
          <div className="glass p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[8px] text-gray-400 block font-sans">FUT. GERADO</span>
              <strong className="text-sm font-serif serif text-[#D6C29A] font-bold mt-1 block">R$ {statsRevenueGenerated}</strong>
            </div>
            <TrendingUp className="w-6 h-6 text-[#B08D57] opacity-30" />
          </div>
        </div>

        {/* Detailed referrals list history */}
        <div className="flex flex-col gap-2.5 mt-5">
          <h4 className="text-xs uppercase tracking-widest text-[#6E8B8E] ml-1 font-mono">Histórico de Cadastros</h4>
          
          {referralsList.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center py-6 bg-black/30 rounded-xl border border-gray-950">
              Nenhuma indicação convertida ainda. Compartilhe seu cupom!
            </p>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[160px] overflow-y-auto pr-1">
              {referralsList.map(ref => {
                const isPaid = ref.status === 'settled';
                return (
                  <div key={ref.id} className="p-3 bg-gradient-to-r from-[#111214] to-[#111214]/60 border border-[#B09D57]/10 rounded-xl flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-white">{ref.customerName}</h5>
                      <span className="text-[9px] text-gray-400 block mt-0.5 font-mono">{ref.date} • {ref.serviceOrSubscriptionType === 'subscription' ? 'Assinatura VIP' : 'Atendimento avulso'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-serif serif text-white">R$ {ref.commissionEarned.toFixed(2)}</span>
                      <span className={`text-[8px] font-bold block mt-0.5 uppercase ${isPaid ? 'text-emerald-400' : 'text-amber-500'}`}>
                        {isPaid ? 'Consolidado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <div className="bg-[#111214]/90 border-t border-gray-900 py-4 text-center z-13 rounded-b-[40px]">
        <span className="text-[9px] uppercase tracking-widest text-gray-400 font-mono">BarberPro Premium • Afiliado Conectado</span>
      </div>
    </div>
  );
};
