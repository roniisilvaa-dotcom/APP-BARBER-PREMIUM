import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db/client'

const router = Router()

router.post('/registro', async (req: Request, res: Response) => {
  const { nome, email, senha, role = 'dono', nome_barbearia, slug } = req.body
  if (!nome || !email || !senha) return res.status(400).json({ error: 'Nome, email e senha obrigatorios' })
  try {
    const existing = await query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email ja cadastrado' })
    const senha_hash = await bcrypt.hash(senha, 12)
    let barbearia_id: string | null = null
    if (role === 'dono' && nome_barbearia) {
      const slugFinal = slug || nome_barbearia.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const barb = await query('INSERT INTO barbearias (nome, slug) VALUES ($1, $2) RETURNING id', [nome_barbearia, slugFinal])
      barbearia_id = barb.rows[0].id
    }
    const user = await query(
      'INSERT INTO usuarios (nome, email, senha_hash, role, barbearia_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, nome, email, role, barbearia_id',
      [nome, email, senha_hash, role, barbearia_id]
    )
    const payload = { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role, barbearia_id: user.rows[0].barbearia_id, nome: user.rows[0].nome }
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
    res.status(201).json({ token, user: payload })
  } catch (err: unknown) {
    console.error('Erro registro:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, senha } = req.body
  if (!email || !senha) return res.status(400).json({ error: 'Email e senha obrigatorios' })
  try {
    const result = await query('SELECT id, nome, email, senha_hash, role, barbearia_id, ativo FROM usuarios WHERE email = $1', [email])
    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciais invalidas' })
    const user = result.rows[0]
    if (!user.ativo) return res.status(403).json({ error: 'Conta desativada' })
    const ok = await bcrypt.compare(senha, user.senha_hash)
    if (!ok) return res.status(401).json({ error: 'Credenciais invalidas' })
    const payload = { id: user.id, email: user.email, role: user.role, barbearia_id: user.barbearia_id, nome: user.nome }
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
    res.json({ token, user: payload })
  } catch (err) {
    console.error('Erro login:', err)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/me', async (req: Request, res: Response) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Nao autenticado' })
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'secret')
    res.json(payload)
  } catch {
    res.status(401).json({ error: 'Token invalido' })
  }
})

export default router
