import { Router, Request, Response } from 'express'
import { query } from '../db/client'
import { authMiddleware } from '../middleware/auth'
const router = Router()
router.use(authMiddleware)

router.get('/', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  try {
    const r = await query('SELECT s.*, c.nome as categoria_nome FROM servicos s LEFT JOIN categorias_servico c ON c.id=s.categoria_id WHERE s.barbearia_id=$1 AND s.ativo=true ORDER BY s.nome', [barbearia_id])
    res.json(r.rows)
  } catch { res.status(500).json({ error: 'Erro ao buscar servicos' }) }
})

router.post('/', async (req: Request, res: Response) => {
  const { barbearia_id } = req.user!
  const { nome, descricao, preco, duracao_minutos=30, categoria_id } = req.body
  if (!nome||!preco) return res.status(400).json({ error: 'Nome e preco obrigatorios' })
  try {
    const r = await query('INSERT INTO servicos (barbearia_id,nome,descricao,preco,duracao_minutos,categoria_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [barbearia_id,nome,descricao||null,preco,duracao_minutos,categoria_id||null])
    res.status(201).json(r.rows[0])
  } catch { res.status(500).json({ error: 'Erro ao criar servico' }) }
})

export default router
