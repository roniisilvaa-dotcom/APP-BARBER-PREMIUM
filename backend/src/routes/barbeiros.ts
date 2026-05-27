import { Router, Request, Response } from 'express'
import { query } from '../db/client'
import { authMiddleware } from '../middleware/auth'
const router = Router()
router.use(authMiddleware)

router.get('/', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  try {
    const r = await query('SELECT * FROM barbeiros WHERE barbearia_id=$1 AND ativo=true ORDER BY nome', [barbearia_id])
    res.json(r.rows)
  } catch { res.status(500).json({ error: 'Erro ao buscar barbeiros' }) }
})

router.post('/', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { nome, foto_url, bio, telefone, comissao_percentual=40, especialidades=[] } = req.body
  if (!nome) return res.status(400).json({ error: 'Nome obrigatorio' })
  try {
    const r = await query('INSERT INTO barbeiros (barbearia_id,nome,foto_url,bio,telefone,comissao_percentual,especialidades) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [barbearia_id,nome,foto_url||null,bio||null,telefone||null,comissao_percentual,especialidades])
    res.status(201).json(r.rows[0])
  } catch { res.status(500).json({ error: 'Erro ao criar barbeiro' }) }
})

router.patch('/:id', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { nome, bio, comissao_percentual, ativo } = req.body
  try {
    const r = await query('UPDATE barbeiros SET nome=COALESCE($1,nome), bio=COALESCE($2,bio), comissao_percentual=COALESCE($3,comissao_percentual), ativo=COALESCE($4,ativo) WHERE id=$5 AND barbearia_id=$6 RETURNING *',
      [nome,bio,comissao_percentual,ativo,req.params.id,barbearia_id])
    if (!r.rows.length) return res.status(404).json({ error: 'Nao encontrado' })
    res.json(r.rows[0])
  } catch { res.status(500).json({ error: 'Erro ao atualizar' }) }
})

export default router
