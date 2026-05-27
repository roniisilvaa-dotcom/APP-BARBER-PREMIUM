/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Branch, 
  ServiceCategory, 
  Service, 
  Barber, 
  SubscriptionPlan,
  Appointment,
  Subscription,
  FinancialTransaction,
  Affiliate,
  AffiliateReferral,
  GlobalSettings,
  WhatsAppMessage,
  Campaign,
  LoyaltyWallet,
  AppointmentStatus
} from '../types';

import {
  INITIAL_BRANCHES,
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_BARBERS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_CUSTOMERS,
  INITIAL_APPOINTMENTS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_FINANCIALS,
  INITIAL_AFFILIATES,
  INITIAL_AFFILIATE_REFERRALS,
  INITIAL_SETTINGS
} from './initialData';

// Storage helper
const getStorageItem = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    console.error(`Error parsing ${key}`, e);
    return fallback;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export class BarberProStore {
  public branches: Branch[];
  public categories: ServiceCategory[];
  public services: Service[];
  public barbers: Barber[];
  public subscriptionPlans: SubscriptionPlan[];
  public customers: typeof INITIAL_CUSTOMERS;
  public appointments: Appointment[];
  public subscriptions: Subscription[];
  public financials: FinancialTransaction[];
  public affiliates: Affiliate[];
  public affiliateReferrals: AffiliateReferral[];
  public settings: GlobalSettings;
  public whatsappMessages: WhatsAppMessage[];
  public campaigns: Campaign[];
  public loyaltyWallets: LoyaltyWallet[];
  
  private listeners: (() => void)[] = [];

  constructor() {
    this.branches = getStorageItem('bp_branches', INITIAL_BRANCHES);
    this.categories = getStorageItem('bp_categories', INITIAL_CATEGORIES);
    this.services = getStorageItem('bp_services', INITIAL_SERVICES);
    this.barbers = getStorageItem('bp_barbers', INITIAL_BARBERS);
    this.subscriptionPlans = getStorageItem('bp_sub_plans', INITIAL_SUBSCRIPTION_PLANS);
    this.customers = getStorageItem('bp_customers', INITIAL_CUSTOMERS);
    this.appointments = getStorageItem('bp_appointments', INITIAL_APPOINTMENTS);
    this.subscriptions = getStorageItem('bp_subscriptions', INITIAL_SUBSCRIPTIONS);
    this.financials = getStorageItem('bp_financials', INITIAL_FINANCIALS);
    this.affiliates = getStorageItem('bp_affiliates', INITIAL_AFFILIATES);
    this.affiliateReferrals = getStorageItem('bp_affiliate_referrals', INITIAL_AFFILIATE_REFERRALS);
    this.settings = getStorageItem('bp_settings', INITIAL_SETTINGS);
    this.whatsappMessages = getStorageItem('bp_whatsapp', [
      {
        id: 'msg_init',
        to: '(11) 99122-3344',
        customerName: 'Roberto Alencar',
        content: '*BarberPro Premium*: Prezado Roberto, confirmamos sua assinatura no *Club Black*. Desfrute de cortes ilimitados e open bar na unidade Jardins.',
        sentAt: '2026-05-26T10:15:00Z',
        triggerEvent: 'Assinatura Ativa',
        status: 'delivered'
      }
    ]);
    this.campaigns = getStorageItem('bp_campaigns', [
      {
        id: 'camp_1',
        title: 'Campanha de Inverno VIP',
        content: 'Prezado [NOME], venha saborear nosso clássico Cappuccino de Inverno enquanto realiza sua terapia capilar.',
        targetGroup: 'vip',
        sentCount: 3,
        date: '2026-05-20'
      }
    ]);
    
    // Create initial loyalty wallets if not exist
    const defaultWallets: LoyaltyWallet[] = this.customers.map(c => ({
      customerId: c.id,
      points: c.loyaltyPoints,
      history: [
        {
          id: `lh_${c.id}_init`,
          points: c.loyaltyPoints,
          type: 'earned',
          description: 'Carga inicial de saldo fidelidade',
          date: '2026-05-01'
        }
      ]
    }));
    this.loyaltyWallets = getStorageItem('bp_loyalty_wallets', defaultWallets);
  }

  // Subscribe state changes
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    // Save to local storage
    setStorageItem('bp_branches', this.branches);
    setStorageItem('bp_categories', this.categories);
    setStorageItem('bp_services', this.services);
    setStorageItem('bp_barbers', this.barbers);
    setStorageItem('bp_customers', this.customers);
    setStorageItem('bp_appointments', this.appointments);
    setStorageItem('bp_subscriptions', this.subscriptions);
    setStorageItem('bp_financials', this.financials);
    setStorageItem('bp_affiliates', this.affiliates);
    setStorageItem('bp_affiliate_referrals', this.affiliateReferrals);
    setStorageItem('bp_settings', this.settings);
    setStorageItem('bp_whatsapp', this.whatsappMessages);
    setStorageItem('bp_campaigns', this.campaigns);
    setStorageItem('bp_loyalty_wallets', this.loyaltyWallets);

    this.listeners.forEach(l => l());
  }

  // CORE ALGORITHM: Calculating real-time available time slots
  // to never allow calendar collisions
  public getAvailableSlots(
    branchId: string, 
    barberId: string, 
    date: string, 
    serviceId: string
  ): string[] {
    const branch = this.branches.find(b => b.id === branchId);
    if (!branch) return [];

    const service = this.services.find(s => s.id === serviceId);
    if (!service) return [];

    const duration = service.durationMinutes;

    // Standard business hours: e.g. "09:00" to "21:00"
    const openParts = branch.openingHour.split(':').map(Number);
    const closeParts = branch.closingHour.split(':').map(Number);

    const openMinutes = openParts[0] * 60 + openParts[1];
    const closeMinutes = closeParts[0] * 60 + closeParts[1];

    // Build 30-minute intervals
    const candidates: string[] = [];
    const intervalMinutes = 30;

    for (let m = openMinutes; m < closeMinutes; m += intervalMinutes) {
      if (m + duration > closeMinutes) break; // Slot can't exceed closing time

      const hour = Math.floor(m / 60);
      const min = m % 60;
      const slotTimeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      candidates.push(slotTimeStr);
    }

    // Filter past times if selected date is today (statically set current date 2026-05-27 in simulation)
    const currentSimulatedDate = '2026-05-27';
    const currentSimulatedTime = '11:29';
    const isToday = date === currentSimulatedDate;

    // Fetch existing appointments for date, branch, barber that are NOT cancelled
    const activeAppoints = this.appointments.filter(apt => 
      apt.branchId === branchId &&
      apt.barberId === barberId &&
      apt.date === date &&
      apt.status !== 'cancelled'
    );

    return candidates.filter(slotTime => {
      // Past slot constraint
      if (isToday) {
        if (slotTime <= currentSimulatedTime) return false;
      }

      // Overlap with existing appointments check
      const candStart = this.timeToMinutes(slotTime);
      const candEnd = candStart + duration;

      for (const apt of activeAppoints) {
        const aptService = this.services.find(s => s.id === apt.serviceId);
        if (!aptService) continue;

        const aptStart = this.timeToMinutes(apt.time);
        const aptEnd = aptStart + aptService.durationMinutes;

        // Overlap condition: startA < endB AND startB < endA
        const isOverlap = candStart < aptEnd && aptStart < candEnd;
        if (isOverlap) {
          return false; // Collision detected
        }
      }

      return true;
    });
  }

  private timeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  // Create appointment with auto business rules (commissions, loyalty points, WhatsApp)
  public createAppointment(data: {
    branchId: string;
    barberId: string;
    serviceId: string;
    customerName: string;
    customerPhone: string;
    date: string;
    time: string;
    affiliateCode?: string;
  }): Appointment {
    // Check conflicts first
    const slots = this.getAvailableSlots(data.branchId, data.barberId, data.date, data.serviceId);
    if (!slots.includes(data.time)) {
      throw new Error('Este horário já foi reservado ou conflita com bloqueios de agenda. Por favor, selecione outro.');
    }

    const service = this.services.find(s => s.id === data.serviceId)!;
    const branch = this.branches.find(b => b.id === data.branchId)!;
    const barber = this.barbers.find(b => b.id === data.barberId)!;

    // Match or create customer in CRM
    let customer = this.customers.find(c => c.phone === data.customerPhone);
    if (!customer) {
      const newCustId = 'cust_' + Date.now();
      customer = {
        id: newCustId,
        name: data.customerName,
        phone: data.customerPhone,
        email: `${data.customerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        vip: false,
        status: 'Nenhum',
        joined: data.date,
        totalSpent: 0,
        loyaltyPoints: 0
      };
      this.customers.push(customer);
      
      // Seed loyalty wallet
      this.loyaltyWallets.push({
        customerId: newCustId,
        points: 0,
        history: []
      });
    }

    // Is there an active subscription discount?
    const customerSub = this.subscriptions.find(sub => sub.customerId === customer!.id && sub.status === 'active');
    let pricePaid = service.price;
    let isCoveredBySub = false;

    if (customerSub) {
      const plan = this.subscriptionPlans.find(p => p.id === customerSub.planId);
      
      // If service is Cut and has cuts remaining, or Black unlimited cuts
      if (service.categoryId === 'cat_hair' && (plan?.cutsPerMonth || 0) > customerSub.cutsUsedThisMonth) {
        pricePaid = 0;
        isCoveredBySub = true;
        customerSub.cutsUsedThisMonth += 1;
      }
      // If service is Beard and has barbas remaining, or Black unlimited barbas
      else if (service.categoryId === 'cat_beard' && (plan?.barbasPerMonth || 0) > customerSub.barbasUsedThisMonth) {
        pricePaid = 0;
        isCoveredBySub = true;
        customerSub.barbasUsedThisMonth += 1;
      }
      // Apply discount on general products or other services if not covered 100%
      else if (plan?.productDiscountPercentage) {
        pricePaid = service.price * (1 - plan.productDiscountPercentage / 100);
      }
    }

    const newAppointment: Appointment = {
      id: 'apt_' + Date.now(),
      branchId: data.branchId,
      barberId: data.barberId,
      serviceId: data.serviceId,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      date: data.date,
      time: data.time,
      status: 'confirmed',
      pricePaid: pricePaid,
      createdAt: new Date().toISOString(),
      whatsappSentStatus: 'sent'
    };

    this.appointments.push(newAppointment);

    // Update Customer Stats
    customer.totalSpent += pricePaid;
    const pointsEarned = Math.floor(pricePaid * this.settings.pointsPerRealSpent / 10);
    if (pointsEarned > 0) {
      customer.loyaltyPoints += pointsEarned;
      const wallet = this.loyaltyWallets.find(w => w.customerId === customer!.id);
      if (wallet) {
        wallet.points += pointsEarned;
        wallet.history.push({
          id: 'lh_' + Date.now(),
          points: pointsEarned,
          type: 'earned',
          description: `Pontos ganhos no agendamento: ${service.name}`,
          date: data.date
        });
      }
    }

    // Record Financial Income automatically if completed (we record confirmed as guaranteed forecast or complete transaction)
    const transactionId = 'tx_' + Date.now();
    this.financials.push({
      id: transactionId,
      type: 'income',
      category: 'service',
      amount: pricePaid,
      date: data.date,
      description: `Atendimento: ${customer.name} (${service.name})`,
      branchId: data.branchId,
      paymentMethod: pricePaid === 0 ? 'recurring' : 'pix',
      referenceId: newAppointment.id
    });

    // Auto-calculate Barber Commission
    // If client is paying membership, barber still receives commission on full price or specialized base rate!
    const basePriceForCommission = service.price;
    const commissionVal = Number((basePriceForCommission * barber.commissionPercentage).toFixed(2));
    
    // Create commission expense log as financial output
    this.financials.push({
      id: 'tx_comm_' + Date.now(),
      type: 'expense',
      category: 'salary',
      amount: commissionVal,
      date: data.date,
      description: `Comissão Barbeiro: ${barber.name} (${service.name})`,
      branchId: data.branchId,
      referenceId: newAppointment.id
    });

    // Check Affiliate Link Vouchers
    if (data.affiliateCode) {
      const affiliate = this.affiliates.find(a => a.code.toUpperCase() === data.affiliateCode?.toUpperCase());
      if (affiliate) {
        const affComm = Number((pricePaid * (affiliate.commissionPercentage / 100)).toFixed(2));
        if (affComm > 0) {
          affiliate.balancePending += affComm;
          this.affiliateReferrals.push({
            id: 'ref_' + Date.now(),
            affiliateId: affiliate.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            serviceOrSubscriptionType: 'service',
            revenue: pricePaid,
            commissionEarned: affComm,
            date: data.date,
            status: 'pending'
          });
        }
      }
    }

    // Queue WhatsApp message
    const msg: WhatsAppMessage = {
      id: 'msg_' + Date.now(),
      to: customer.phone,
      customerName: customer.name,
      content: `*Confirmado BarberPro Premium!* 
Ola *${customer.name}*, seu agendamento esta confirmado.
📅 *Data:* ${this.formatDatePt(data.date)}
⏰ *Horario:* ${data.time}
💈 *Barbeiro:* ${barber.name}
📍 *Unidade:* ${branch.name}
_Toalha quente e dose premium aguardam você!_`,
      sentAt: new Date().toISOString(),
      triggerEvent: 'Confirmacao de Horario',
      status: 'delivered'
    };
    this.whatsappMessages.unshift(msg);

    this.notify();
    return newAppointment;
  }

  // Cancel reservation
  public cancelAppointment(appointmentId: string): void {
    const apt = this.appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    apt.status = 'cancelled';

    // Reverse financial credit
    this.financials = this.financials.filter(tx => tx.referenceId !== appointmentId);

    // Queue WhatsApp notification
    const branch = this.branches.find(b => b.id === apt.branchId);
    const msg: WhatsAppMessage = {
      id: 'msg_' + Date.now(),
      to: apt.customerPhone,
      customerName: apt.customerName,
      content: `*Aviso BarberPro:* Seu agendamento para o dia ${this.formatDatePt(apt.date)} as ${apt.time} na unidade ${branch?.name || 'BarberPro'} foi *Cancelado*. Esperamos ver voce em breve!`,
      sentAt: new Date().toISOString(),
      triggerEvent: 'Cancelamento',
      status: 'delivered'
    };
    this.whatsappMessages.unshift(msg);

    this.notify();
  }

  // Activate VIP Club Subscription
  public buySubscription(customerId: string, planId: string, affiliateCode?: string): Subscription {
    const customer = this.customers.find(c => c.id === customerId)!;
    const plan = this.subscriptionPlans.find(p => p.id === planId)!;

    // Check if already active, set to cancelled or cancel old one
    this.subscriptions = this.subscriptions.filter(s => s.customerId !== customerId);

    const subscriptionId = 'sub_' + Date.now();
    const todayStr = '2026-05-27';
    // billing 30 days later
    const nextBilling = '2026-06-27';

    const newSub: Subscription = {
      id: subscriptionId,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      planId: planId,
      status: 'active',
      startDate: todayStr,
      nextBillingDate: nextBilling,
      cutsUsedThisMonth: 0,
      barbasUsedThisMonth: 0,
      pricePaid: plan.price
    };

    this.subscriptions.push(newSub);

    // Update customer VIP Status
    customer.vip = true;
    customer.status = plan.name;
    customer.totalSpent += plan.price;

    const pointsEarned = Math.floor(plan.price * this.settings.pointsPerRealSpent / 10);
    customer.loyaltyPoints += pointsEarned;
    const wallet = this.loyaltyWallets.find(w => w.customerId === customer.id);
    if (wallet) {
      wallet.points += pointsEarned;
      wallet.history.push({
        id: 'lh_' + Date.now(),
        points: pointsEarned,
        type: 'earned',
        description: `Ingresso no Clube de Assinatura: ${plan.name}`,
        date: todayStr
      });
    }

    // Register financial transaction
    this.financials.push({
      id: 'tx_' + Date.now(),
      type: 'income',
      category: 'subscription',
      amount: plan.price,
      date: todayStr,
      description: `Assinatura ${plan.name} Ativada: ${customer.name}`,
      branchId: 'br_jardins', // Default to leading outlet
      paymentMethod: 'recurring',
      referenceId: subscriptionId
    });

    // Affiliate Commission on subscription
    if (affiliateCode) {
      const affiliate = this.affiliates.find(a => a.code.toUpperCase() === affiliateCode.toUpperCase());
      if (affiliate) {
        const affComm = Number((plan.price * (affiliate.commissionPercentage / 100)).toFixed(2));
        if (affComm > 0) {
          affiliate.balancePending += affComm;
          this.affiliateReferrals.push({
            id: 'ref_' + Date.now(),
            affiliateId: affiliate.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            serviceOrSubscriptionType: 'subscription',
            revenue: plan.price,
            commissionEarned: affComm,
            date: todayStr,
            status: 'pending'
          });
        }
      }
    }

    // WhatsApp
    const msg: WhatsAppMessage = {
      id: 'msg_' + Date.now(),
      to: customer.phone,
      customerName: customer.name,
      content: `*Bem-vindo ao Clube BarberPro VIP!* 💎
Ola *${customer.name}*, sua assinatura do *${plan.name}* esta *Ativa*!
Preço: R$ ${plan.price.toFixed(2)}/mes.
Benefícios ativos:
👉 ${plan.cutsPerMonth === 99 ? 'Cortes Ilimitados' : plan.cutsPerMonth + ' cortes por mes'}
👉 ${plan.barbasPerMonth === 99 ? 'Barba Ilimitada' : plan.barbasPerMonth + ' barbas por mes'}
👉 Agendamento prioritario garantido
👉 ${plan.productDiscountPercentage}% de desconto em produtos
_Obrigado por escolher a excelencia! Viva o alto padrao._`,
      sentAt: new Date().toISOString(),
      triggerEvent: 'Assinatura Ativa',
      status: 'delivered'
    };
    this.whatsappMessages.unshift(msg);

    this.notify();
    return newSub;
  }

  // Trigger Bulk Promotional WhatsApp Campaign Simulation
  public triggerCampaign(title: string, content: string, target: 'all' | 'vip' | 'inactive30' | 'birthdays'): void {
    let targetCustomers = [...this.customers];
    
    if (target === 'vip') {
      targetCustomers = targetCustomers.filter(c => c.vip);
    } else if (target === 'inactive30') {
      // Inactive mock (simulate by selecting Felipe and Gustavo)
      targetCustomers = targetCustomers.filter(c => c.id === 'cust_gustavo' || c.id === 'cust_andre');
    }

    targetCustomers.forEach(cust => {
      // replace tag
      const personalizedContent = content.replace(/\[NOME\]/gi, cust.name);
      const msg: WhatsAppMessage = {
        id: 'msg_camp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        to: cust.phone,
        customerName: cust.name,
        content: personalizedContent,
        sentAt: new Date().toISOString(),
        triggerEvent: `Campanha: ${title}`,
        status: 'delivered'
      };
      this.whatsappMessages.unshift(msg);
    });

    const newCamp: Campaign = {
      id: 'camp_' + Date.now(),
      title,
      content,
      targetGroup: target,
      sentCount: targetCustomers.length,
      date: '2026-05-27'
    };

    this.campaigns.unshift(newCamp);
    this.notify();
  }

  // Affiliate Payout (marking as settled)
  public settleAffiliateCommission(affiliateId: string): void {
    const affiliate = this.affiliates.find(a => a.id === affiliateId);
    if (!affiliate) return;

    const amount = affiliate.balancePending;
    if (amount <= 0) return;

    affiliate.balancePaid += amount;
    affiliate.balancePending = 0;

    // Settle associated referrals
    this.affiliateReferrals.forEach(ref => {
      if (ref.affiliateId === affiliateId && ref.status === 'pending') {
        ref.status = 'settled';
      }
    });

    // Record on business financial logs as payout
    this.financials.push({
      id: 'tx_payout_' + Date.now(),
      type: 'expense',
      category: 'salary',
      amount: amount,
      date: '2026-05-27',
      description: `Pagamento Comissão Afiliado: ${affiliate.name}`,
      branchId: 'br_jardins'
    });

    this.notify();
  }

  // Update customer loyalty points and log history
  public updateCustomerLoyalty(customerId: string, newPoints: number, rewardName: string): void {
    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) return;
    customer.loyaltyPoints = newPoints;
    
    const wallet = this.loyaltyWallets.find(w => w.customerId === customerId);
    if (wallet) {
      wallet.points = newPoints;
      wallet.history.push({
        id: 'lh_redeem_' + Date.now(),
        points: newPoints,
        type: 'redeemed',
        description: `Prêmio resgatado: ${rewardName}`,
        date: '2026-05-27'
      });
    }
    this.notify();
  }

  // Helper date formatter
  private formatDatePt(dateStr: string): string {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
}

// Global store singleton
export const globalStore = new BarberProStore();
