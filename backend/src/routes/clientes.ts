import { Router, Request, Response } from 'express'
import { query } from '../db/client'
import { authMiddleware } from '../middleware/auth'
const router = Router()
router.use(authMiddleware)

router.get('/', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { busca } = req.query
  let sql = 'SELECT * FROM clientes WHERE barbearia_id=$1 AND ativo=true'
  const params: unknown[] = [barbearia_id]
  if (busca) { sql+=' AND (nome ILIKE $2 OR telefone ILIKE $2)'; params.push(`%${busca}%`) }
  sql+=' ORDER BY nome'
  try { res.json((await query(sql, params)).rows) }
  catch { res.status(500).json({ error: 'Erro ao buscar clientes' }) }
})

router.post('/', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { nome, telefone, whatsapp, email, data_nascimento, notas } = req.body
  if (!nome||!telefone) return res.status(400).json({ error: 'Nome e telefone obrigatorios' })
  try {
    const r = await query('INSERT INTO clientes (barbearia_id,nome,telefone,whatsapp,email,data_nascimento,notas) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [barbearia_id,nome,telefone,whatsapp||null,email||null,data_nascimento||null,notas||null])
    res.status(201).json(r.rows[0])
  } catch { res.status(500).json({ error: 'Erro ao criar cliente' }) }
})

export default router
