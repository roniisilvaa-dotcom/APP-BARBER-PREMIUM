/**
 * BarberPro Premium — Auth Screen (Login / Register)
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Scissors, Mail, Lock, User, Building2, Eye, EyeOff, Loader2, Sparkles, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Mode = 'login' | 'register'

export function AuthScreen() {
  const { login, registro, enterDemoMode } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  // Form fields
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nomeBarbearia, setNomeBarbearia] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, senha)
      } else {
        if (!nome.trim()) { setError('Nome obrigatório'); setLoading(false); return }
        await registro({ nome, email, senha, nome_barbearia: nomeBarbearia || undefined })
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setError(null)
    setNome('')
    setEmail('')
    setSenha('')
    setNomeBarbearia('')
  }

  return (
    <div className="min-h-screen bg-[#070708] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#B08D57]/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#8A6A3D]/4 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8A6A3D] to-[#D6C29A] p-[2px] shadow-xl shadow-[#B08D57]/20 mb-4">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Scissors className="w-7 h-7 text-[#D6C29A] transform -rotate-12" />
            </div>
          </div>
          <h1 className="text-2xl font-serif font-semibold tracking-[0.2em] text-white uppercase">BarberPro</h1>
          <p className="text-[#B08D57] text-xs tracking-[0.3em] uppercase mt-0.5">Premium</p>
        </div>

        {/* Card */}
        <div className="bg-[#0e0f10] border border-[#B08D57]/15 rounded-2xl p-7 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-[#141516] rounded-xl p-1">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-gradient-to-r from-[#8A6A3D] to-[#B08D57] text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 16 : -16 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B08D57]/60" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    required
                    className="w-full bg-[#141516] border border-[#B08D57]/15 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#B08D57]/40 focus:ring-1 focus:ring-[#B08D57]/20 transition-all"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B08D57]/60" />
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#141516] border border-[#B08D57]/15 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#B08D57]/40 focus:ring-1 focus:ring-[#B08D57]/20 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B08D57]/60" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-[#141516] border border-[#B08D57]/15 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#B08D57]/40 focus:ring-1 focus:ring-[#B08D57]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#B08D57] transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === 'register' && (
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B08D57]/60" />
                  <input
                    type="text"
                    placeholder="Nome da sua barbearia (opcional)"
                    value={nomeBarbearia}
                    onChange={e => setNomeBarbearia(e.target.value)}
                    className="w-full bg-[#141516] border border-[#B08D57]/15 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#B08D57]/40 focus:ring-1 focus:ring-[#B08D57]/20 transition-all"
                  />
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8A6A3D] to-[#C4A55A] text-white font-semibold text-sm tracking-wide hover:from-[#9A7A4D] hover:to-[#D4B56A] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#B08D57]/20"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? (
                      <>Entrar no Painel</>
                    ) : (
                      <><Crown className="w-4 h-4" />Criar Minha Barbearia</>
                    )}
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-[#B08D57]/10" />
            <span className="text-gray-600 text-xs">ou</span>
            <div className="flex-1 border-t border-[#B08D57]/10" />
          </div>

          {/* Demo Mode */}
          <button
            onClick={enterDemoMode}
            className="w-full py-2.5 rounded-xl border border-[#B08D57]/20 text-[#B08D57] text-sm font-medium hover:bg-[#B08D57]/8 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Explorar em Modo Demo
          </button>

          {mode === 'register' && (
            <p className="text-gray-600 text-[11px] text-center mt-4 leading-relaxed">
              Ao criar uma conta, você concorda com os nossos{' '}
              <span className="text-[#B08D57]/60 cursor-pointer hover:text-[#B08D57]">Termos de Uso</span>
              {' '}e{' '}
              <span className="text-[#B08D57]/60 cursor-pointer hover:text-[#B08D57]">Política de Privacidade</span>.
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-5">
          O SaaS mais elegante para barbearias premium do Brasil 🇧🇷
        </p>
      </motion.div>
    </div>
  )
}
