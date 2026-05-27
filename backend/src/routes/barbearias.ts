import { Router, Request, Response } from 'express'
import { query } from '../db/client'
import { authMiddleware } from '../middleware/auth'
const router = Router()
router.use(authMiddleware)

router.get('/me', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  if (!barbearia_id) return res.status(404).json({ error: 'Sem barbearia vinculada' })
  try {
    const r = await query('SELECT * FROM barbearias WHERE id=$1', [barbearia_id])
    if (!r.rows.length) return res.status(404).json({ error: 'Nao encontrada' })
    res.json(r.rows[0])
  } catch { res.status(500).json({ error: 'Erro ao buscar barbearia' }) }
})

router.patch('/me', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  if (!barbearia_id) return res.status(404).json({ error: 'Sem barbearia vinculada' })
  const { nome, descricao, telefone, whatsapp, email, logo_url } = req.body
  try {
    const r = await query('UPDATE barbearias SET nome=COALESCE($1,nome), descricao=COALESCE($2,descricao), telefone=COALESCE($3,telefone), whatsapp=COALESCE($4,whatsapp), email=COALESCE($5,email), logo_url=COALESCE($6,logo_url), atualizado_em=NOW() WHERE id=$7 RETURNING *',
      [nome,descricao,telefone,whatsapp,email,logo_url,barbearia_id])
    res.json(r.rows[0])
  } catch { res.status(500).json({ error: 'Erro ao atualizar' }) }
})

router.get('/filiais', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  try {
    const r = await query('SELECT * FROM filiais WHERE barbearia_id=$1 AND ativa=true ORDER BY nome', [barbearia_id])
    res.json(r.rows)
  } catch { res.status(500).json({ error: 'Erro ao buscar filiais' }) }
})

router.post('/filiais', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { nome, endereco, telefone, cidade } = req.body
  if (!nome) return res.status(400).json({ error: 'Nome obrigatorio' })
  try {
    const r = await query('INSERT INTO filiais (barbearia_id,nome,endereco,telefone,cidade) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [barbearia_id,nome,endereco||null,telefone||null,cidade||null])
    res.status(201).json(r.rows[0])
  } catch { res.status(500).json({ error: 'Erro ao criar filial' }) }
})

router.get('/dashboard', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const hoje = new Date().toISOString().slice(0,10)
  const mesInicio = hoje.slice(0,7)+'-01'
  try {
    const [ag, fin, cli, barb] = await Promise.all([
      query(`SELECT COUNT(*) FILTER (WHERE data=$2) as hoje, COUNT(*) FILTER (WHERE status='pending') as pendentes, COUNT(*) FILTER (WHERE status='completed' AND data>=$3) as concluidos_mes FROM agendamentos WHERE barbearia_id=$1`, [barbearia_id,hoje,mesInicio]),
      query(`SELECT SUM(CASE WHEN tipo='receita' AND data>=$2 THEN valor ELSE 0 END) as receita_mes, SUM(CASE WHEN tipo='despesa' AND data>=$2 THEN valor ELSE 0 END) as despesa_mes FROM lancamentos WHERE barbearia_id=$1`, [barbearia_id,mesInicio]),
      query(`SELECT COUNT(*) as total FROM clientes WHERE barbearia_id=$1 AND ativo=true`, [barbearia_id]),
      query(`SELECT COUNT(*) as total FROM barbeiros WHERE barbearia_id=$1 AND ativo=true`, [barbearia_id]),
    ])
    res.json({ agendamentos: ag.rows[0], financeiro: fin.rows[0], clientes: cli.rows[0], barbeiros: barb.rows[0] })
  } catch { res.status(500).json({ error: 'Erro ao buscar dashboard' }) }
})

export default router
