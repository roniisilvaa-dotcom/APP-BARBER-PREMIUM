import { Router, Request, Response } from 'express'
import { query } from '../db/client'
import { authMiddleware } from '../middleware/auth'
const router = Router()
router.use(authMiddleware)

router.get('/', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { inicio, fim } = req.query
  let sql = 'SELECT l.*, b.nome as barbeiro_nome FROM lancamentos l LEFT JOIN barbeiros b ON b.id=l.barbeiro_id WHERE l.barbearia_id=$1'
  const params: unknown[] = [barbearia_id]; let idx=2
  if (inicio) { sql+=` AND l.data>=$${idx++}`; params.push(inicio) }
  if (fim) { sql+=` AND l.data<=$${idx++}`; params.push(fim) }
  sql+=' ORDER BY l.data DESC'
  try { res.json((await query(sql, params)).rows) }
  catch { res.status(500).json({ error: 'Erro ao buscar lancamentos' }) }
})

router.get('/resumo', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { inicio, fim } = req.query
  try {
    const r = await query(
      `SELECT SUM(CASE WHEN tipo='receita' THEN valor ELSE 0 END) as receita,
        SUM(CASE WHEN tipo='despesa' THEN valor ELSE 0 END) as despesa,
        SUM(CASE WHEN tipo='receita' THEN valor WHEN tipo='despesa' THEN -valor ELSE 0 END) as lucro,
        SUM(comissao_valor) as total_comissoes
        FROM lancamentos WHERE barbearia_id=$1 AND ($2::date IS NULL OR data>=$2) AND ($3::date IS NULL OR data<=$3)`,
      [barbearia_id, inicio||null, fim||null])
    res.json(r.rows[0])
  } catch { res.status(500).json({ error: 'Erro ao buscar resumo' }) }
})

router.post('/', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { tipo, categoria, descricao, valor, forma_pagamento, barbeiro_id, filial_id, data } = req.body
  if (!tipo||!categoria||!descricao||!valor) return res.status(400).json({ error: 'Campos obrigatorios faltando' })
  try {
    const r = await query('INSERT INTO lancamentos (barbearia_id,filial_id,tipo,categoria,descricao,valor,forma_pagamento,barbeiro_id,data) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [barbearia_id,filial_id||null,tipo,categoria,descricao,valor,forma_pagamento||null,barbeiro_id||null,data||new Date()])
    res.status(201).json(r.rows[0])
  } catch { res.status(500).json({ error: 'Erro ao criar lancamento' }) }
})

export default router
