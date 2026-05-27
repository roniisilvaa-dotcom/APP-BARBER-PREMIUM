/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'client' | 'barber' | 'manager' | 'owner' | 'affiliate';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  city: string;
  rating: number;
  imageUrl: string;
  openingHour: string; // "09:00"
  closingHour: string; // "20:00"
}

export interface ServiceCategory {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  durationMinutes: number; // e.g. 30, 45, 60
  description: string;
}

export interface Barber {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  branchIds: string[]; // works in these branches
  specialties: string[];
  bio: string;
  commissionPercentage: number; // e.g., 0.40 (40%)
}

export interface BlockedTime {
  id: string;
  barberId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "14:00"
  endTime: string; // "15:00"
  reason: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  branchId: string;
  barberId: string;
  serviceId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "14:30"
  status: AppointmentStatus;
  pricePaid: number;
  notes?: string;
  createdAt: string;
  whatsappSentStatus: 'not_sent' | 'sent' | 'failed';
}

export interface SubscriptionPlan {
  id: string;
  name: 'Club Bronze' | 'Club Gold' | 'Club Black';
  price: number; // Monthly price
  cutsPerMonth: number;
  barbasPerMonth: number;
  priorityBooking: boolean;
  productDiscountPercentage: number; // e.g. 10 for 10%
  description: string;
  benefits: string[];
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  planId: string;
  status: 'active' | 'overdue' | 'cancelled';
  startDate: string; // "YYYY-MM-DD"
  nextBillingDate: string; // "YYYY-MM-DD"
  cutsUsedThisMonth: number;
  barbasUsedThisMonth: number;
  pricePaid: number;
}

export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense';
  category: 'service' | 'subscription' | 'product_sale' | 'salary' | 'rent' | 'supplies' | 'marketing' | 'other';
  amount: number;
  date: string; // "YYYY-MM-DD"
  description: string;
  branchId: string;
  paymentMethod?: 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'recurring';
  referenceId?: string; // appointmentId, subscriptionId, etc.
}

export interface CommissionPayoff {
  id: string;
  barberIdOrAffiliateId: string;
  type: 'barber' | 'affiliate';
  amount: number;
  date: string;
  status: 'pending' | 'paid';
  periodStart: string;
  periodEnd: string;
}

export interface Affiliate {
  id: string;
  name: string;
  phone: string;
  code: string; // "BARBERVIP10"
  commissionPercentage: number; // percentage of first subscription payment, e.g. 15 for 15%
  balancePending: number;
  balancePaid: number;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  customerName: string;
  customerPhone: string;
  serviceOrSubscriptionType: 'subscription' | 'service';
  revenue: number;
  commissionEarned: number;
  date: string;
  status: 'pending' | 'settled';
}

export interface LoyaltyWallet {
  customerId: string;
  points: number;
  history: {
    id: string;
    points: number;
    type: 'earned' | 'redeemed';
    description: string;
    date: string;
  }[];
}

export interface WhatsAppMessage {
  id: string;
  to: string;
  customerName: string;
  content: string;
  sentAt: string;
  triggerEvent: string; // e.g. "Booking Reminder", "Subscription Activated", "Promotion"
  status: 'queued' | 'sent' | 'delivered';
}

export interface Campaign {
  id: string;
  title: string;
  content: string;
  targetGroup: 'all' | 'vip' | 'inactive30' | 'birthdays';
  sentCount: number;
  date: string;
}

export interface GlobalSettings {
  id: string;
  salonName: string;
  appointmentBufferMinutes: number; // e.g. 10
  allowCancellationHoursBefore: number; // e.g. 4 hours
  pointsPerRealSpent: number; // e.g. 1 point per R$ 10 spent
  whatsappIntegrationEnabled: boolean;
}
