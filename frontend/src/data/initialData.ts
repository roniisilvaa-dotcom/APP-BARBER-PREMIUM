/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Branch, 
  Service, 
  ServiceCategory, 
  Barber, 
  SubscriptionPlan,
  Appointment,
  Subscription,
  FinancialTransaction,
  Affiliate,
  AffiliateReferral,
  GlobalSettings
} from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br_jardins',
    name: 'BarberPro Jardins',
    address: 'Alameda Lorena, 1850 - Jardins, São Paulo - SP',
    phone: '(11) 98765-4321',
    city: 'São Paulo',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
    openingHour: '09:00',
    closingHour: '21:00'
  },
  {
    id: 'br_leblon',
    name: 'BarberPro Leblon',
    address: 'Av. Ataulfo de Paiva, 640 - Leblon, Rio de Janeiro - RJ',
    phone: '(21) 99888-7766',
    city: 'Rio de Janeiro',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600',
    openingHour: '09:00',
    closingHour: '20:00'
  },
  {
    id: 'br_savassi',
    name: 'BarberPro Savassi',
    address: 'Rua Sergipe, 1200 - Savassi, Belo Horizonte - MG',
    phone: '(31) 97777-8888',
    city: 'Belo Horizonte',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600',
    openingHour: '10:00',
    closingHour: '21:00'
  }
];

export const INITIAL_CATEGORIES: ServiceCategory[] = [
  { id: 'cat_hair', name: 'Corte & Visagismo' },
  { id: 'cat_beard', name: 'Barba & SPA' },
  { id: 'cat_aesthetic', name: 'Estética Premium' }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'ser_corte_signature',
    name: 'Corte Signature BarberPro',
    categoryId: 'cat_hair',
    price: 150.00,
    durationMinutes: 45,
    description: 'Diagnóstico de visagismo, lavagem terapêutica com ozônio de vapor, corte personalizado e finalização com pomada importada.'
  },
  {
    id: 'ser_barba_luxury',
    name: 'Barba Imperial & Toalha Quente',
    categoryId: 'cat_beard',
    price: 110.00,
    durationMinutes: 30,
    description: 'Barbear clássico com espuma aquecida, massagem facial vibratória, óleo hidratante de sândalo e toalha quente aromatizada.'
  },
  {
    id: 'ser_combo_real',
    name: 'Experiência Real (Corte + Barba + SPA)',
    categoryId: 'cat_hair',
    price: 240.00,
    durationMinutes: 75,
    description: 'Nosso combo supremo. Inclui o Corte Signature, a Barba Imperial, e peelings faciais suavizantes com dose de Whisky Single Malt cortesia.'
  },
  {
    id: 'ser_platinado_elite',
    name: 'Platinado / Coloração Platinum',
    categoryId: 'cat_aesthetic',
    price: 280.00,
    durationMinutes: 120,
    description: 'Colorometria avançada com protetor de couro cabeludo, produtos italianos e tonalização perfeita sem ardência.'
  },
  {
    id: 'ser_selagem_premium',
    name: 'Alinhamento Capilar Sutil',
    categoryId: 'cat_hair',
    price: 190.00,
    durationMinutes: 60,
    description: 'Redução de frizz e alinhamento do fio com aminoácidos nobres, proporcionando naturalidade e balanço.'
  },
  {
    id: 'ser_massagem_ozone',
    name: 'Terapia Capilar Detox & Massagem',
    categoryId: 'cat_aesthetic',
    price: 130.00,
    durationMinutes: 45,
    description: 'Peeling do couro cabeludo, alta frequência para circulação sanguínea, massagem capilar craniana relaxante e hidratação profunda.'
  }
];

export const INITIAL_BARBERS: Barber[] = [
  {
    id: 'bar_enzo',
    name: 'Enzo Magnani',
    role: 'Art Director & Master Visagist',
    rating: 4.9,
    reviewsCount: 324,
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    branchIds: ['br_jardins', 'br_savassi'],
    specialties: ['Visagismo 3D', 'Cortes Clássicos', 'Fade Moderno'],
    bio: 'Mais de 12 anos de experiência formados em academias europeias de Londres e Milão. Especialista em adaptar o corte ao formato do rosto masculino.',
    commissionPercentage: 0.40
  },
  {
    id: 'bar_marcus',
    name: 'Marcus Aurelius',
    role: 'Senior Barber & Shave Specialist',
    rating: 4.8,
    reviewsCount: 210,
    imageUrl: 'https://images.unsplash.com/photo-1622039737229-27e5c7bec5df?auto=format&fit=crop&q=80&w=200',
    branchIds: ['br_jardins', 'br_leblon'],
    specialties: ['Navalha Livre', 'Tratamentos de Barba', 'Alinhamento com Toalha'],
    bio: 'Especialista na secular escola italiana de barbearia. Defensor da toalha quente e da precisão extrema no desenho da barba.',
    commissionPercentage: 0.40
  },
  {
    id: 'bar_alexandre',
    name: 'Alexandre "The King"',
    role: 'Modern Style Creator',
    rating: 4.9,
    reviewsCount: 180,
    imageUrl: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&q=80&w=200',
    branchIds: ['br_leblon', 'br_savassi'],
    specialties: ['High Fade', 'Colorimetria Avançada', 'Custom Designs'],
    bio: 'Inovador, especialista em cortes urbanos modernos, platinado perfeito, e texturas capilares contemporâneas.',
    commissionPercentage: 0.42
  },
  {
    id: 'bar_gianluca',
    name: 'Gianluca Borghese',
    role: 'European Classic Master',
    rating: 5.0,
    reviewsCount: 95,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    branchIds: ['br_jardins'],
    specialties: ['Tesoura Clássica', 'SPA de Alto Luxo', 'Massagem Craniana'],
    bio: 'Diretamente de Florença, Gianluca traz o refinamento absoluto. Considera a barbearia uma arte de alto luxo e relaxamento.',
    commissionPercentage: 0.45
  }
];

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_bronze',
    name: 'Club Bronze',
    price: 79.90,
    cutsPerMonth: 2,
    barbasPerMonth: 0,
    priorityBooking: true,
    productDiscountPercentage: 10,
    description: 'Perfeito para manter o corte impecável quinzenalmente.',
    benefits: [
      '2 Cortes Signature por mês',
      'Agendamento online priorizado',
      '10% de desconto em cosméticos BarberPro',
      'Café espresso premium incluído em cada visita'
    ]
  },
  {
    id: 'plan_gold',
    name: 'Club Gold',
    price: 129.90,
    cutsPerMonth: 3,
    barbasPerMonth: 2,
    priorityBooking: true,
    productDiscountPercentage: 15,
    description: 'Nosso clube mais popular. Visual completo quinzenal e barba alinhada.',
    benefits: [
      '3 Cortes Signature por mês',
      '2 Barbas Imperiais por mês',
      'Agendamento prioritário com barbeiro favorito',
      '15% de desconto em cosméticos BarberPro',
      'Chopp Premium ou Água de Coco em cada visita'
    ]
  },
  {
    id: 'plan_black',
    name: 'Club Black',
    price: 199.90,
    cutsPerMonth: 99, // Unlimited model
    barbasPerMonth: 99, // Unlimited model
    priorityBooking: true,
    productDiscountPercentage: 25,
    description: 'A experiência executiva máxima. Cortes e barba ilimitados, relaxamento e SPA.',
    benefits: [
      'Cortes Signature Ilimitados',
      'Barbas Imperiais Ilimitadas',
      'Acesso livre ao SPA Capilar mensalmente',
      'Reservas de emergência garantidas (Encaixes)',
      '25% de desconto em cosméticos e presentes BarberPro',
      'Open Bar Premium: Whisky Single Malt, Chopp Artesanal e Café Espresso',
      'Estacionamento valet gratuito'
    ]
  }
];

export const INITIAL_CUSTOMERS = [
  { id: 'cust_roberto', name: 'Roberto Alencar', phone: '(11) 99122-3344', email: 'roberto@alencar.com', vip: true, status: 'Club Black', joined: '2025-10-15', totalSpent: 2850.00, loyaltyPoints: 285 },
  { id: 'cust_felipe', name: 'Felipe Diniz', phone: '(11) 98133-4455', email: 'felipe@diniz.com', vip: true, status: 'Club Gold', joined: '2025-11-20', totalSpent: 1620.00, loyaltyPoints: 160 },
  { id: 'cust_gustavo', name: 'Dr. Gustavo Salles', phone: '(11) 97144-5566', email: 'gustavo@salles.adv', vip: false, status: 'Nenhum', joined: '2026-01-10', totalSpent: 450.00, loyaltyPoints: 45 },
  { id: 'cust_marcelo', name: 'Marcelo Castro', phone: '(21) 96155-6677', email: 'marcelo@castro.me', vip: true, status: 'Club Bronze', joined: '2026-02-05', totalSpent: 870.00, loyaltyPoints: 85 },
  { id: 'cust_andre', name: 'André Malta', phone: '(31) 95166-7788', email: 'andre@malta.com', vip: false, status: 'Nenhum', joined: '2026-03-12', totalSpent: 240.00, loyaltyPoints: 24 }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    branchId: 'br_jardins',
    barberId: 'bar_enzo',
    serviceId: 'ser_combo_real',
    customerId: 'cust_roberto',
    customerName: 'Roberto Alencar',
    customerPhone: '(11) 99122-3344',
    date: '2026-05-26', // Yesterday
    time: '14:00',
    status: 'completed',
    pricePaid: 240.00,
    createdAt: '2026-05-25T10:15:00Z',
    whatsappSentStatus: 'sent'
  },
  {
    id: 'apt_2',
    branchId: 'br_jardins',
    barberId: 'bar_marcus',
    serviceId: 'ser_barba_luxury',
    customerId: 'cust_felipe',
    customerName: 'Felipe Diniz',
    customerPhone: '(11) 98133-4455',
    date: '2026-05-26', // Yesterday
    time: '16:30',
    status: 'completed',
    pricePaid: 110.00,
    createdAt: '2026-05-25T14:22:00Z',
    whatsappSentStatus: 'sent'
  },
  {
    id: 'apt_3',
    branchId: 'br_jardins',
    barberId: 'bar_enzo',
    serviceId: 'ser_corte_signature',
    customerId: 'cust_gustavo',
    customerName: 'Dr. Gustavo Salles',
    customerPhone: '(11) 97144-5566',
    date: '2026-05-27', // Today
    time: '10:00',
    status: 'confirmed',
    pricePaid: 150.00,
    createdAt: '2026-05-26T09:00:00Z',
    whatsappSentStatus: 'sent'
  },
  {
    id: 'apt_4',
    branchId: 'br_jardins',
    barberId: 'bar_gianluca',
    serviceId: 'ser_massagem_ozone',
    customerId: 'cust_roberto',
    customerName: 'Roberto Alencar',
    customerPhone: '(11) 99122-3344',
    date: '2026-05-27', // Today
    time: '13:30',
    status: 'confirmed',
    pricePaid: 130.00,
    createdAt: '2026-05-26T14:40:00Z',
    whatsappSentStatus: 'sent'
  },
  {
    id: 'apt_5',
    branchId: 'br_leblon',
    barberId: 'bar_marcus',
    serviceId: 'ser_corte_signature',
    customerId: 'cust_marcelo',
    customerName: 'Marcelo Castro',
    customerPhone: '(21) 96155-6677',
    date: '2026-05-28', // Tomorrow
    time: '15:00',
    status: 'confirmed',
    pricePaid: 150.00,
    createdAt: '2026-05-27T08:10:00Z',
    whatsappSentStatus: 'sent'
  },
  {
    id: 'apt_6',
    branchId: 'br_savassi',
    barberId: 'bar_enzo',
    serviceId: 'ser_combo_real',
    customerId: 'cust_andre',
    customerName: 'André Malta',
    customerPhone: '(31) 95166-7788',
    date: '2026-05-28', // Tomorrow
    time: '11:00',
    status: 'pending',
    pricePaid: 240.00,
    createdAt: '2026-05-27T10:30:00Z',
    whatsappSentStatus: 'sent'
  }
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_1',
    customerId: 'cust_roberto',
    customerName: 'Roberto Alencar',
    customerPhone: '(11) 99122-3344',
    planId: 'plan_black',
    status: 'active',
    startDate: '2026-01-15',
    nextBillingDate: '2026-06-15',
    cutsUsedThisMonth: 4,
    barbasUsedThisMonth: 3,
    pricePaid: 199.90
  },
  {
    id: 'sub_2',
    customerId: 'cust_felipe',
    customerName: 'Felipe Diniz',
    customerPhone: '(11) 98133-4455',
    planId: 'plan_gold',
    status: 'active',
    startDate: '2026-02-10',
    nextBillingDate: '2026-06-10',
    cutsUsedThisMonth: 1,
    barbasUsedThisMonth: 1,
    pricePaid: 129.90
  },
  {
    id: 'sub_3',
    customerId: 'cust_marcelo',
    customerName: 'Marcelo Castro',
    customerPhone: '(21) 96155-6677',
    planId: 'plan_bronze',
    status: 'active',
    startDate: '2026-03-05',
    nextBillingDate: '2026-06-05',
    cutsUsedThisMonth: 2,
    barbasUsedThisMonth: 0,
    pricePaid: 79.90
  }
];

export const INITIAL_FINANCIALS: FinancialTransaction[] = [
  // Income From Cuts
  { id: 'tx_1', type: 'income', category: 'service', amount: 240.00, date: '2026-05-26', description: 'Atendimento: Roberto Alencar', branchId: 'br_jardins', paymentMethod: 'credit_card', referenceId: 'apt_1' },
  { id: 'tx_2', type: 'income', category: 'service', amount: 110.00, date: '2026-05-26', description: 'Atendimento: Felipe Diniz', branchId: 'br_jardins', paymentMethod: 'pix', referenceId: 'apt_2' },
  
  // Income from Subscriptions
  { id: 'tx_3', type: 'income', category: 'subscription', amount: 199.90, date: '2026-05-15', description: 'Recorrência Club Black: Roberto Alencar', branchId: 'br_jardins', paymentMethod: 'recurring', referenceId: 'sub_1' },
  { id: 'tx_4', type: 'income', category: 'subscription', amount: 129.90, date: '2026-05-10', description: 'Recorrência Club Gold: Felipe Diniz', branchId: 'br_jardins', paymentMethod: 'recurring', referenceId: 'sub_2' },
  { id: 'tx_5', type: 'income', category: 'subscription', amount: 79.90, date: '2026-05-05', description: 'Recorrência Club Bronze: Marcelo Castro', branchId: 'br_leblon', paymentMethod: 'recurring', referenceId: 'sub_3' },
  
  // Income from product sales
  { id: 'tx_6', type: 'income', category: 'product_sale', amount: 89.00, date: '2026-05-26', description: 'Venda de Pomada Modeladora Matte BarberPro', branchId: 'br_jardins', paymentMethod: 'pix' },
  { id: 'tx_7', type: 'income', category: 'product_sale', amount: 120.00, date: '2026-05-25', description: 'Venda de Óleo Hidratante Sândalo Premium', branchId: 'br_leblon', paymentMethod: 'credit_card' },

  // Expenses
  { id: 'tx_8', type: 'expense', category: 'rent', amount: 4500.00, date: '2026-05-01', description: 'Aluguel Comercial Imóvel Jardins', branchId: 'br_jardins' },
  { id: 'tx_9', type: 'expense', category: 'rent', amount: 3800.00, date: '2026-05-01', description: 'Aluguel Comercial Imóvel Leblon', branchId: 'br_leblon' },
  { id: 'tx_10', type: 'expense', category: 'supplies', amount: 450.00, date: '2026-05-10', description: 'Compra de suprimentos de barberia (Toalhas, Lâminas)', branchId: 'br_jardins' },
  { id: 'tx_11', type: 'expense', category: 'marketing', amount: 1200.00, date: '2026-05-08', description: 'Anúncios de tráfego pago (Instagram Ads)', branchId: 'br_jardins' }
];

export const INITIAL_AFFILIATES: Affiliate[] = [
  { id: 'aff_pedro', name: 'Pedro Henrique (Influencer)', phone: '(11) 98877-6655', code: 'PEDROVIP', commissionPercentage: 20, balancePending: 98.00, balancePaid: 450.00 },
  { id: 'aff_hotel_fasano', name: 'Parceria Concierge Fasano', phone: '(11) 3897-4000', code: 'FASANOLUX', commissionPercentage: 15, balancePending: 43.50, balancePaid: 1200.00 },
  { id: 'aff_academia_reebok', name: 'Concierge Reebok Club', phone: '(11) 95544-3322', code: 'REEBOKPRO', commissionPercentage: 15, balancePending: 0.00, balancePaid: 850.00 }
];

export const INITIAL_AFFILIATE_REFERRALS: AffiliateReferral[] = [
  { id: 'ref_1', affiliateId: 'aff_pedro', customerName: 'Felipe Diniz', customerPhone: '(11) 98133-4455', serviceOrSubscriptionType: 'subscription', revenue: 129.90, commissionEarned: 25.98, date: '2026-02-10', status: 'settled' },
  { id: 'ref_2', affiliateId: 'aff_hotel_fasano', customerName: 'Roberto Alencar', customerPhone: '(11) 99122-3344', serviceOrSubscriptionType: 'subscription', revenue: 199.90, commissionEarned: 29.99, date: '2026-01-15', status: 'settled' },
  { id: 'ref_3', affiliateId: 'aff_pedro', customerName: 'Rodrigo Faro', customerPhone: '(11) 97766-5544', serviceOrSubscriptionType: 'subscription', revenue: 199.90, commissionEarned: 39.98, date: '2026-05-24', status: 'pending' }
];

export const INITIAL_SETTINGS: GlobalSettings = {
  id: 'global_config',
  salonName: 'BarberPro Premium',
  appointmentBufferMinutes: 10,
  allowCancellationHoursBefore: 4,
  pointsPerRealSpent: 1, // 1 point per Real spent
  whatsappIntegrationEnabled: true
};
