/**
 * useApiSync — quando autenticado, carrega dados reais do backend
 * e injeta no globalStore para todas as telas usarem.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  barbeirosApi, clientesApi, agendamentosApi,
  servicosApi, financeiroApi, barbeariasApi,
  type BarbeariaDB
} from '../services/api'
import { globalStore } from '../data/store'

export function useApiSync() {
  const { isAuthenticated, user } = useAuth()
  const [synced, setSynced] = useState(false)
  const [barbearia, setBarbearia] = useState<BarbeariaDB | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) { setSynced(false); return }
    setLoading(true)

    async function sync() {
      try {
        // Buscar dados em paralelo
        const [barbeiros, clientes, agendamentos, servicos, financeiro, lancamentos] = await Promise.allSettled([
          barbeirosApi.list(),
          clientesApi.list(),
          agendamentosApi.list(),
          servicosApi.list(),
          financeiroApi.resumo(),
          financeiroApi.list()
        ])

        // Buscar info da barbearia
        if (user?.barbearia_id) {
          try {
            const barb = await barbeariasApi.me()
            setBarbearia(barb)
          } catch { /* barbearia sem rota get ainda */ }
        }

        // Injetar barbeiros reais no store
        if (barbeiros.status === 'fulfilled' && barbeiros.value.length > 0) {
          globalStore.barbers = barbeiros.value.map(b => ({
            id: b.id,
            name: b.nome,
            role: 'Barbeiro',
            rating: b.rating,
            reviewsCount: 0,
            imageUrl: b.foto_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(b.nome)}&backgroundColor=8A6A3D&textColor=ffffff`,
            branchIds: globalStore.branches.map(br => br.id),
            specialties: b.especialidades || [],
            bio: b.bio || '',
            commissionPercentage: (b.comissao_percentual || 40) / 100
          }))
        }

        // Injetar clientes reais
        if (clientes.status === 'fulfilled' && clientes.value.length > 0) {
          globalStore.customers = clientes.value.map(c => ({
            id: c.id,
            name: c.nome,
            phone: c.telefone,
            email: c.email || '',
            vip: (c.pontos_fidelidade || 0) > 100,
            status: 'Nenhum',
            joined: c.criado_em?.split('T')[0] || '2026-01-01',
            totalSpent: Number(c.total_gasto) || 0,
            loyaltyPoints: c.pontos_fidelidade || 0
          }))
        }

        // Injetar agendamentos reais
        if (agendamentos.status === 'fulfilled' && agendamentos.value.length > 0) {
          const serviceMap = globalStore.services.reduce<Record<string, string>>((acc, s) => { acc[s.name.toLowerCase()] = s.id; return acc }, {})
          const barberMap = globalStore.barbers.reduce<Record<string, string>>((acc, b) => { acc[b.id] = b.id; return acc }, {})

          globalStore.appointments = agendamentos.value.map(a => ({
            id: a.id,
            branchId: a.filial_id || (globalStore.branches[0]?.id || 'br_jardins'),
            barberId: barberMap[a.barbeiro_id] || a.barbeiro_id,
            serviceId: a.servico_id,
            customerId: a.cliente_id || '',
            customerName: a.cliente_nome || 'Cliente',
            customerPhone: a.cliente_tel || '',
            date: a.data,
            time: a.hora?.slice(0, 5) || '09:00',
            status: a.status,
            pricePaid: Number(a.preco_pago) || 0,
            createdAt: new Date().toISOString(),
            whatsappSentStatus: 'sent' as const
          }))
        }

        // Injetar lançamentos financeiros reais
        if (lancamentos.status === 'fulfilled' && lancamentos.value.length > 0) {
          globalStore.financials = lancamentos.value.map(l => ({
            id: l.id,
            type: l.tipo as 'income' | 'expense',
            category: mapCategoria(l.categoria),
            amount: Number(l.valor) || 0,
            date: l.data?.split('T')[0] || new Date().toISOString().split('T')[0],
            description: l.descricao,
            branchId: globalStore.branches[0]?.id || 'br_jardins',
            paymentMethod: l.forma_pagamento as 'pix' | 'credit_card' | undefined
          }))
        }

        setSynced(true)
      } catch (err) {
        console.error('Erro ao sincronizar dados com API:', err)
        setSynced(true) // fallback para localStorage data
      } finally {
        setLoading(false)
      }
    }

    sync()
  }, [isAuthenticated, user])

  return { synced, barbearia, loading }
}

function mapCategoria(cat: string): 'service' | 'subscription' | 'product_sale' | 'salary' | 'rent' | 'supplies' | 'marketing' | 'other' {
  const map: Record<string, 'service' | 'subscription' | 'product_sale' | 'salary' | 'rent' | 'supplies' | 'marketing' | 'other'> = {
    servico: 'service', service: 'service',
    assinatura: 'subscription', subscription: 'subscription',
    produto: 'product_sale',
    comissao: 'salary', salario: 'salary', salary: 'salary',
    aluguel: 'rent', rent: 'rent',
    estoque: 'supplies', supplies: 'supplies',
    marketing: 'marketing',
  }
  return map[cat?.toLowerCase()] || 'other'
}
