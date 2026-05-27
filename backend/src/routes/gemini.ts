import { Router, Request, Response } from 'express'
import { GoogleGenAI } from '@google/genai'
import { authMiddleware } from '../middleware/auth'
const router = Router()
router.use(authMiddleware)

router.post('/campanha', async (req: Request, res: Response) => {
  const { prompt, contexto } = req.body
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Gemini AI nao configurado' })
  if (!prompt) return res.status(400).json({ error: 'Prompt obrigatorio' })
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Voce e um assistente de marketing para barbearias premium.\nContexto: ${contexto||'Barbearia premium'}\nCrie mensagem WhatsApp (max 300 chars, tom elegante, inclua [NOME]):\n${prompt}`
    })
    res.json({ mensagem: response.text })
  } catch (err) {
    console.error('Erro Gemini:', err)
    res.status(500).json({ error: 'Erro ao gerar mensagem' })
  }
})

export default router
