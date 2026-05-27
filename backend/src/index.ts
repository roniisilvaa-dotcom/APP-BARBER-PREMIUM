import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import authRouter from './routes/auth'
import agendamentosRouter from './routes/agendamentos'
import barbeirosRouter from './routes/barbeiros'
import clientesRouter from './routes/clientes'
import servicosRouter from './routes/servicos'
import financeiroRouter from './routes/financeiro'
import barbeariasRouter from './routes/barbearias'
import geminiRouter from './routes/gemini'
import publicRouter from './routes/public'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 300 }))

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date(), app: 'BarberPro Premium API' }))

app.use('/api/auth', authRouter)
app.use('/api/agendamentos', agendamentosRouter)
app.use('/api/barbeiros', barbeirosRouter)
app.use('/api/clientes', clientesRouter)
app.use('/api/servicos', servicosRouter)
app.use('/api/financeiro', financeiroRouter)
app.use('/api/barbearias', barbeariasRouter)
app.use('/api/gemini', geminiRouter)
app.use('/api/public', publicRouter)

app.use((_req, res) => res.status(404).json({ error: 'Rota nao encontrada' }))
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro:', err)
  res.status(500).json({ error: 'Erro interno' })
})

// Inicia servidor local (ignorado em ambiente serverless Vercel)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`✅ BarberPro Premium API na porta ${PORT} | ${process.env.NODE_ENV||'development'}`)
  })
}

export default app
