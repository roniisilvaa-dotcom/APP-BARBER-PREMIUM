/**
 * BarberPro Premium — App principal
 * - Autenticado como dono/gerente → AdminPortal direto (tela cheia)
 * - Autenticado como barbeiro → BarberPortal
 * - Demo mode → showcase com todos os portais
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Scissors, MessageSquare, LogOut, User, Sparkles, Smartphone, UserCheck, Trophy, Monitor } from 'lucide-react'
import { globalStore } from './data/store'
import { AdminPortal } from './components/AdminPortal'
import { BarberPortal } from './components/BarberPortal'
import { AffiliatePortal } from './components/AffiliatePortal'
import { ClientPortal } from './components/ClientPortal'
import { AuthScreen } from './components/AuthScreen'
import { useAuth } from './context/AuthContext'
import { useApiSync } from './hooks/useApiSync'

export default function App() {
  const { isAuthenticated, isDemoMode, loading, user, logout } = useAuth()
  const { barbearia } = useApiSync()
  const [latestNotification, setLatestNotification] = useState<string | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  // Para demo mode — switcher de portais
  const [demoRole, setDemoRole] = useState<'client' | 'admin' | 'barber' | 'affiliate'>('admin')

  // ⚠️ Hooks SEMPRE antes de qualquer return condicional
  useEffect(() => {
    const unsub = globalStore.subscribe(() => {
      const lastMsg = globalStore.whatsappMessages[0]
      if (lastMsg) {
        setLatestNotification(`WhatsApp para ${lastMsg.customerName}: ${lastMsg.content}`)
        setShowNotification(true)
        const t = setTimeout(() => setShowNotification(false), 8000)
        return () => clearTimeout(t)
      }
    })
    return unsub
  }, [])

  const notify = (msg: string) => {
    setLatestNotification(msg)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 5000)
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#B08D57]/30 border-t-[#B08D57] rounded-full animate-spin" />
      </div>
    )
  }

  // ── Não autenticado → tela de login ─────────────────────────
  if (!isAuthenticated && !isDemoMode) {
    return <AuthScreen />
  }

  // ── DONO / GERENTE → AdminPortal tela cheia ─────────────────
  if (isAuthenticated && (user?.role === 'dono' || user?.role === 'gerente')) {
    return (
      <div className="min-h-screen bg-[#070708] text-gray-200 flex flex-col">
        {/* Header compacto */}
        <header className="border-b border-[#B08D57]/20 bg-[#070708]/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8A6A3D] to-[#D6C29A] p-[1.5px]">
              <div className="w-full h-full bg-black rounded-[9px] flex items-center justify-center">
                <Scissors className="w-4 h-4 text-[#D6C29A] -rotate-12" />
              </div>
            </div>
            <div>
              <span className="text-sm font-serif font-semibold tracking-widest text-white uppercase">
                {barbearia?.nome || 'BarberPro'}
              </span>
              <span className="ml-2 text-[9px] bg-[#B08D57]/10 text-[#D6C29A] border border-[#B08D57]/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                Premium
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
              <User className="w-3.5 h-3.5 text-[#B08D57]" />
              {user?.nome}
            </span>
            <button
              onClick={logout}
              title="Sair"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 hover:bg-red-400/10 px-2.5 py-1.5 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* Admin Portal — tela cheia */}
        <main className="flex-1 overflow-hidden">
          <AdminPortal onNotifyTriggered={notify} />
        </main>

        {/* Toast WhatsApp */}
        <NotificationToast show={showNotification} message={latestNotification} onClose={() => setShowNotification(false)} />
      </div>
    )
  }

  // ── BARBEIRO → BarberPortal ──────────────────────────────────
  if (isAuthenticated && user?.role === 'barbeiro') {
    return (
      <div className="min-h-screen bg-[#070708] text-gray-200 flex flex-col">
        <header className="border-b border-[#B08D57]/20 bg-[#070708]/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8A6A3D] to-[#D6C29A] p-[1.5px]">
              <div className="w-full h-full bg-black rounded-[9px] flex items-center justify-center">
                <Scissors className="w-4 h-4 text-[#D6C29A] -rotate-12" />
              </div>
            </div>
            <span className="text-sm font-serif font-semibold tracking-widest text-white uppercase">
              {barbearia?.nome || 'BarberPro'}
            </span>
          </div>
          <button onClick={logout} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-red-400/10 transition-all">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </header>
        <main className="flex-1 p-4">
          <BarberPortal onNotifyTriggered={notify} />
        </main>
        <NotificationToast show={showNotification} message={latestNotification} onClose={() => setShowNotification(false)} />
      </div>
    )
  }

  // ── DEMO MODE → Showcase completo com switcher ───────────────
  return (
    <div className="min-h-screen bg-[#070708] text-gray-200 flex flex-col">
      {/* Header showcase */}
      <header className="border-b border-[#B08D57]/20 bg-[#070708]/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-3 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8A6A3D] to-[#D6C29A] p-[1.5px]">
            <div className="w-full h-full bg-black rounded-[9px] flex items-center justify-center">
              <Scissors className="w-4 h-4 text-[#D6C29A] -rotate-12" />
            </div>
          </div>
          <div>
            <span className="text-sm font-serif font-semibold tracking-widest text-white uppercase">BarberPro</span>
            <span className="ml-2 text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
              Demo
            </span>
          </div>
        </div>

        {/* Role switcher */}
        <div className="flex bg-[#111214] border border-[#B08D57]/20 p-1 rounded-2xl gap-0.5">
          {([
            { id: 'client', icon: <Smartphone className="w-3.5 h-3.5" />, label: 'Cliente' },
            { id: 'barber', icon: <UserCheck className="w-3.5 h-3.5" />, label: 'Barbeiro' },
            { id: 'affiliate', icon: <Trophy className="w-3.5 h-3.5" />, label: 'Afiliado' },
            { id: 'admin', icon: <Monitor className="w-3.5 h-3.5" />, label: 'Admin' },
          ] as { id: typeof demoRole; icon: React.ReactNode; label: string }[]).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setDemoRole(id)}
              className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                demoRole === id
                  ? 'bg-gradient-to-r from-[#8A6A3D] to-[#B08D57] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <button onClick={logout} className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-400/10 transition-all">
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={demoRole}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex items-center justify-center"
          >
            {demoRole === 'client' && <ClientPortal onNotifyTriggered={notify} />}
            {demoRole === 'barber' && <BarberPortal onNotifyTriggered={notify} />}
            {demoRole === 'affiliate' && <AffiliatePortal onNotifyTriggered={notify} />}
            {demoRole === 'admin' && (
              <div className="w-full">
                <AdminPortal onNotifyTriggered={notify} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <NotificationToast show={showNotification} message={latestNotification} onClose={() => setShowNotification(false)} />
    </div>
  )
}

// ── Componente de notificação WhatsApp ───────────────────────────
function NotificationToast({ show, message, onClose }: { show: boolean; message: string | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {show && message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="fixed bottom-5 right-4 z-50 max-w-xs bg-[#111214] border border-[#B08D57]/30 rounded-2xl shadow-2xl p-4 flex gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-bold text-white uppercase tracking-wide block">WhatsApp</span>
            <p className="text-[10px] text-gray-300 mt-1 leading-relaxed line-clamp-3">{message}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white shrink-0 self-start text-lg leading-none">×</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
