/**
 * BarberPro Premium — WhatsApp Business API Webhook
 *
 * Recebe mensagens do cliente via WhatsApp Business Cloud API (Meta),
 * usa Gemini AI para interpretar a intenção e agenda automaticamente.
 *
 * Setup necessário (Meta Developer Console):
 *   - Criar app Meta Business
 *   - Ativar WhatsApp Business API
 *   - Configurar webhook: POST /api/whatsapp/webhook
 *   - Verificar token: GET  /api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=X&hub.verify_token=SEU_TOKEN
 */

import { Router, Request, Response } from 'express'
import { GoogleGenAI } from '@google/genai'
import { query } from '../db/client'

const router = Router()

// ─── Verificação do Webhook (GET) ─────────────────────────────────────────────
// Meta exige confirmar o webhook com um desafio na primeira configuração
router.get('/webhook', (req: Request, res: Response) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'barberpro_webhook_2026'

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp Webhook verificado com sucesso!')
    res.status(200).send(challenge)
  } else {
    console.error('❌ Token de verificação do webhook inválido')
    res.status(403).json({ error: 'Token invalido' })
  }
})

// ─── Receber Mensagens (POST) ─────────────────────────────────────────────────
router.post('/webhook', async (req: Request, res: Response) => {
  const body = req.body

  // Meta envia object 'whatsapp_business_account'
  if (body.object !== 'whatsapp_business_account') {
    return res.sendStatus(404)
  }

  // Responder 200 imediatamente para o Meta não reenviar
  res.sendStatus(200)

  try {
    for (const entry of (body.entry || [])) {
      for (const change of (entry.changes || [])) {
        if (change.field !== 'messages') continue

        const value = change.value
        const messages = value?.messages || []
        const metadata = value?.metadata

        for (const msg of messages) {
          // Só processa mensagens de texto
          if (msg.type !== 'text') continue

          const fromPhone = msg.from // ex: "5511999998888"
          const text = msg.text?.body || ''
          const wabaId = metadata?.phone_number_id

          console.log(`📱 WhatsApp recebido de ${fromPhone}: "${text}"`)

          // Processar com Gemini AI
          await processWhatsAppMessage(fromPhone, text, wabaId)
        }
      }
    }
  } catch (err) {
    console.error('Erro ao processar webhook WhatsApp:', err)
  }
})

// ─── Processamento com Gemini AI ─────────────────────────────────────────────
async function processWhatsAppMessage(fromPhone: string, text: string, wabaId: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY não configurada — WhatsApp AI desativado')
    return
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  // Usar Gemini para extrair intenção de agendamento
  const prompt = `Você é o assistente inteligente da BarberPro Premium. Um cliente enviou a mensagem abaixo via WhatsApp.
Analise e extraia as informações de agendamento se houver intenção clara.

Mensagem do cliente: "${text}"

Responda APENAS em JSON no seguinte formato (sem markdown, sem explicação):
{
  "intencao": "agendar" | "cancelar" | "consultar" | "outro",
  "nome_cliente": "nome se mencionado ou null",
  "servico_solicitado": "corte" | "barba" | "corte_barba" | null,
  "data_preferida": "YYYY-MM-DD se mencionada ou null",
  "hora_preferida": "HH:MM se mencionada ou null",
  "barbeiro_preferido": "nome se mencionado ou null",
  "mensagem_resposta": "mensagem elegante para enviar de volta ao cliente confirmando ou pedindo mais informações (max 200 chars, tom premium, português)"
}`

  let parsed: {
    intencao: string
    nome_cliente: string | null
    servico_solicitado: string | null
    data_preferida: string | null
    hora_preferida: string | null
    barbeiro_preferido: string | null
    mensagem_resposta: string
  }

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt
    })
    const rawText = res.text?.trim() || '{}'
    // Remove markdown code blocks if present
    const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    parsed = JSON.parse(jsonStr)
  } catch (err) {
    console.error('Erro Gemini ao interpretar mensagem WhatsApp:', err)
    return
  }

  console.log('🤖 Gemini interpretou:', parsed)

  // Salvar mensagem recebida no banco
  try {
    // Encontrar barbearia pelo número de telefone do WABA (phone_number_id)
    // Na prática cada barbearia teria seu próprio número conectado
    // Para MVP, usamos a primeira barbearia ativa
    const barbResult = await query(
      'SELECT id, nome FROM barbearias WHERE ativo=true ORDER BY criado_em LIMIT 1',
      []
    )
    if (!barbResult.rows.length) return

    const barbearia = barbResult.rows[0]
    const barbearia_id = barbearia.id

    // Normalizar telefone (remover +55 se vier)
    const telefone = fromPhone.replace(/^\+/, '').replace(/^55/, '')

    // Registrar na tabela de agendamentos pendentes ou mensagem
    // Por enquanto, salvar como log no console e registrar cliente se novo
    let cliente = (await query(
      'SELECT id, nome FROM clientes WHERE barbearia_id=$1 AND (telefone=$2 OR whatsapp=$2) LIMIT 1',
      [barbearia_id, telefone]
    )).rows[0]

    if (!cliente && parsed.nome_cliente) {
      // Criar cliente novo automaticamente
      const newClient = await query(
        'INSERT INTO clientes (barbearia_id, nome, telefone, whatsapp, notas) VALUES ($1,$2,$3,$3,$4) RETURNING id, nome',
        [barbearia_id, parsed.nome_cliente, telefone, `Cliente captado via WhatsApp em ${new Date().toLocaleDateString('pt-BR')}`]
      )
      cliente = newClient.rows[0]
      console.log(`✅ Novo cliente criado via WhatsApp: ${cliente.nome} (${telefone})`)
    }

    // Se intenção é agendar e temos dados suficientes, criar agendamento pendente
    if (parsed.intencao === 'agendar' && cliente && parsed.data_preferida && parsed.hora_preferida) {
      // Buscar serviço que corresponde
      const serviceQuery = parsed.servico_solicitado === 'barba'
        ? 'SELECT id FROM servicos WHERE barbearia_id=$1 AND ativo=true AND nome ILIKE \'%barba%\' LIMIT 1'
        : 'SELECT id FROM servicos WHERE barbearia_id=$1 AND ativo=true AND nome ILIKE \'%corte%\' LIMIT 1'

      const serviceRes = await query(serviceQuery, [barbearia_id])

      const barbeiro = parsed.barbeiro_preferido
        ? (await query('SELECT id FROM barbeiros WHERE barbearia_id=$1 AND ativo=true AND nome ILIKE $2 LIMIT 1',
            [barbearia_id, `%${parsed.barbeiro_preferido}%`])).rows[0]
        : (await query('SELECT id FROM barbeiros WHERE barbearia_id=$1 AND ativo=true LIMIT 1', [barbearia_id])).rows[0]

      if (serviceRes.rows.length && barbeiro) {
        await query(
          `INSERT INTO agendamentos (barbearia_id, cliente_id, barbeiro_id, servico_id, data, hora, preco_pago, origem, notas, status)
           VALUES ($1,$2,$3,$4,$5,$6,0,$7,$8,'pending')`,
          [
            barbearia_id,
            cliente.id,
            barbeiro.id,
            serviceRes.rows[0].id,
            parsed.data_preferida,
            parsed.hora_preferida,
            'whatsapp',
            `Agendamento automático via WhatsApp. Mensagem original: "${text}"`
          ]
        )
        console.log(`📅 Agendamento criado via WhatsApp: ${cliente.nome} em ${parsed.data_preferida} ${parsed.hora_preferida}`)
      }
    }

    // Enviar resposta ao cliente via WhatsApp API
    if (parsed.mensagem_resposta && process.env.WHATSAPP_TOKEN && wabaId) {
      await sendWhatsAppReply(fromPhone, parsed.mensagem_resposta, wabaId)
    }

  } catch (dbErr) {
    console.error('Erro ao salvar agendamento WhatsApp no banco:', dbErr)
  }
}

// ─── Enviar Mensagem de Resposta via WhatsApp Cloud API ───────────────────────
async function sendWhatsAppReply(to: string, message: string, phoneNumberId: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        })
      }
    )
    if (response.ok) {
      console.log(`✅ Resposta WhatsApp enviada para ${to}`)
    } else {
      const err = await response.text()
      console.error('Erro ao enviar resposta WhatsApp:', err)
    }
  } catch (err) {
    console.error('Erro na chamada WhatsApp Cloud API:', err)
  }
}

// ─── Status do Webhook (para verificar configuração) ─────────────────────────
router.get('/status', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    whatsapp_configured: !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    gemini_configured: !!process.env.GEMINI_API_KEY,
    verify_token_set: !!process.env.WHATSAPP_VERIFY_TOKEN,
    webhook_url: 'Configure em: Meta Developer Console → App → WhatsApp → Webhooks',
    docs: 'https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks'
  })
})

export default router
