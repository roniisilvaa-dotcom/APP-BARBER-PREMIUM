import { Router, Request, Response } from 'express'
import { query } from '../db/client'
const router = Router()

router.get('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params
  try {
    const barb = await query('SELECT id, nome, descricao, telefone, whatsapp, logo_url FROM barbearias WHERE slug=$1 AND ativo=true', [slug])
    if (!barb.rows.length) return res.status(404).json({ error: 'Nao encontrada' })
    const { id } = barb.rows[0]
    const [filiais, servicos, barbeiros] = await Promise.all([
      query('SELECT * FROM filiais WHERE barbearia_id=$1 AND ativa=true', [id]),
      query('SELECT * FROM servicos WHERE barbearia_id=$1 AND ativo=true', [id]),
      query('SELECT id,nome,foto_url,rating,especialidades FROM barbeiros WHERE barbearia_id=$1 AND ativo=true', [id]),
    ])
    res.json({ barbearia: barb.rows[0], filiais: filiais.rows, servicos: servicos.rows, barbeiros: barbeiros.rows })
  } catch { res.status(500).json({ error: 'Erro ao buscar dados' }) }
})

router.post('/:slug/agendar', async (req: Request, res: Response) => {
  const { slug } = req.params
  const { nome, telefone, barbeiro_id, servico_id, data, hora, filial_id } = req.body
  if (!nome||!telefone||!barbeiro_id||!servico_id||!data||!hora) return res.status(400).json({ error: 'Dados incompletos' })
  try {
    const barb = await query('SELECT id FROM barbearias WHERE slug=$1 AND ativo=true', [slug])
    if (!barb.rows.length) return res.status(404).json({ error: 'Nao encontrada' })
    const barbearia_id = barb.rows[0].id
    const svc = await query('SELECT preco FROM servicos WHERE id=$1', [servico_id])
    if (!svc.rows.length) return res.status(404).json({ error: 'Servico nao encontrado' })
    let cli = await query('SELECT id FROM clientes WHERE telefone=$1 AND barbearia_id=$2', [telefone, barbearia_id])
    let cliente_id: string
    if (!cli.rows.length) {
      const novo = await query('INSERT INTO clientes (barbearia_id,nome,telefone) VALUES ($1,$2,$3) RETURNING id', [barbearia_id,nome,telefone])
      cliente_id = novo.rows[0].id
    } else { cliente_id = cli.rows[0].id }
    const ag = await query('INSERT INTO agendamentos (barbearia_id,filial_id,cliente_id,barbeiro_id,servico_id,data,hora,preco_pago,origem) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,\'online\') RETURNING *',
      [barbearia_id,filial_id||null,cliente_id,barbeiro_id,servico_id,data,hora,svc.rows[0].preco])
    res.status(201).json({ agendamento: ag.rows[0], mensagem: 'Agendamento realizado com sucesso!' })
  } catch { res.status(500).json({ error: 'Erro ao agendar' }) }
})

export default router
