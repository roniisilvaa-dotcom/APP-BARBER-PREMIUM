import { Router, Request, Response } from 'express'
import { query } from '../db/client'
import { authMiddleware } from '../middleware/auth'
const router = Router()
router.use(authMiddleware)

router.get('/', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { data, barbeiro_id, filial_id, status } = req.query
  let sql = `SELECT a.*, c.nome as cliente_nome, c.telefone as cliente_tel, b.nome as barbeiro_nome, s.nome as servico_nome, s.duracao_minutos
    FROM agendamentos a
    LEFT JOIN clientes c ON c.id=a.cliente_id
    LEFT JOIN barbeiros b ON b.id=a.barbeiro_id
    LEFT JOIN servicos s ON s.id=a.servico_id
    WHERE a.barbearia_id=$1`
  const params: unknown[] = [barbearia_id]; let idx=2
  if (data) { sql+=` AND a.data=$${idx++}`; params.push(data) }
  if (barbeiro_id) { sql+=` AND a.barbeiro_id=$${idx++}`; params.push(barbeiro_id) }
  if (filial_id) { sql+=` AND a.filial_id=$${idx++}`; params.push(filial_id) }
  if (status) { sql+=` AND a.status=$${idx++}`; params.push(status) }
  sql+=' ORDER BY a.data ASC, a.hora ASC'
  try { res.json((await query(sql, params)).rows) }
  catch (err) { res.status(500).json({ error: 'Erro ao buscar agendamentos' }) }
})

router.post('/', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { cliente_id, barbeiro_id, servico_id, filial_id, data, hora, preco_pago, forma_pagamento, notas, origem='app' } = req.body
  if (!barbeiro_id||!servico_id||!data||!hora||!preco_pago) return res.status(400).json({ error: 'Campos obrigatorios faltando' })
  try {
    const r = await query(
      'INSERT INTO agendamentos (barbearia_id,filial_id,cliente_id,barbeiro_id,servico_id,data,hora,preco_pago,forma_pagamento,notas,origem) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [barbearia_id,filial_id||null,cliente_id||null,barbeiro_id,servico_id,data,hora,preco_pago,forma_pagamento||null,notas||null,origem]
    )
    res.status(201).json(r.rows[0])
  } catch (err) { res.status(500).json({ error: 'Erro ao criar agendamento' }) }
})

router.patch('/:id', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { status } = req.body
  try {
    const r = await query('UPDATE agendamentos SET status=$1, atualizado_em=NOW() WHERE id=$2 AND barbearia_id=$3 RETURNING *', [status, req.params.id, barbearia_id])
    if (!r.rows.length) return res.status(404).json({ error: 'Nao encontrado' })
    res.json(r.rows[0])
  } catch (err) { res.status(500).json({ error: 'Erro ao atualizar' }) }
})

export default router
