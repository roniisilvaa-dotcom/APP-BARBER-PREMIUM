import { pool } from './client'
const schema = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS usuarios (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), nome TEXT NOT NULL, email TEXT UNIQUE NOT NULL, senha_hash TEXT NOT NULL, role TEXT DEFAULT 'dono' CHECK (role IN ('dono','gerente','barbeiro','recepcionista','afiliado')), barbearia_id UUID, ativo BOOLEAN DEFAULT true, criado_em TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS barbearias (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), nome TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, descricao TEXT, telefone TEXT, whatsapp TEXT, email TEXT, logo_url TEXT, plano TEXT DEFAULT 'starter' CHECK (plano IN ('starter','premium','franquia')), ativo BOOLEAN DEFAULT true, criado_em TIMESTAMPTZ DEFAULT NOW(), atualizado_em TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE usuarios ADD CONSTRAINT IF NOT EXISTS fk_usuario_barbearia FOREIGN KEY (barbearia_id) REFERENCES barbearias(id) ON DELETE SET NULL NOT VALID;
CREATE TABLE IF NOT EXISTS filiais (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), barbearia_id UUID NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE, nome TEXT NOT NULL, endereco JSONB DEFAULT '{}', telefone TEXT, cidade TEXT, rating NUMERIC(3,2) DEFAULT 5.0, horario_abertura TEXT DEFAULT '09:00', horario_fechamento TEXT DEFAULT '20:00', ativa BOOLEAN DEFAULT true, criado_em TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS categorias_servico (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), barbearia_id UUID NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE, nome TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS servicos (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), barbearia_id UUID NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE, categoria_id UUID REFERENCES categorias_servico(id), nome TEXT NOT NULL, descricao TEXT, preco NUMERIC(10,2) NOT NULL, duracao_minutos INTEGER DEFAULT 30, ativo BOOLEAN DEFAULT true, criado_em TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS barbeiros (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), usuario_id UUID REFERENCES usuarios(id), barbearia_id UUID NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE, nome TEXT NOT NULL, foto_url TEXT, bio TEXT, telefone TEXT, rating NUMERIC(3,2) DEFAULT 5.0, comissao_percentual NUMERIC(5,2) DEFAULT 40.00, especialidades TEXT[] DEFAULT '{}', ativo BOOLEAN DEFAULT true, criado_em TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS clientes (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), barbearia_id UUID NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE, nome TEXT NOT NULL, telefone TEXT NOT NULL, whatsapp TEXT, email TEXT, data_nascimento DATE, notas TEXT, total_visitas INTEGER DEFAULT 0, total_gasto NUMERIC(10,2) DEFAULT 0, pontos_fidelidade INTEGER DEFAULT 0, ultima_visita TIMESTAMPTZ, ativo BOOLEAN DEFAULT true, criado_em TIMESTAMPTZ DEFAULT NOW(), atualizado_em TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS agendamentos (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), barbearia_id UUID NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE, filial_id UUID REFERENCES filiais(id), cliente_id UUID REFERENCES clientes(id), barbeiro_id UUID NOT NULL REFERENCES barbeiros(id), servico_id UUID NOT NULL REFERENCES servicos(id), data DATE NOT NULL, hora TIME NOT NULL, status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')), preco_pago NUMERIC(10,2) NOT NULL, forma_pagamento TEXT, notas TEXT, origem TEXT DEFAULT 'app', wa_status TEXT DEFAULT 'not_sent', criado_em TIMESTAMPTZ DEFAULT NOW(), atualizado_em TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_agendamentos_barbearia ON agendamentos(barbearia_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_barbeiro ON agendamentos(barbeiro_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE TABLE IF NOT EXISTS planos_assinatura (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), barbearia_id UUID NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE, nome TEXT NOT NULL, preco NUMERIC(10,2) NOT NULL, cortes_mes INTEGER DEFAULT 0, barbas_mes INTEGER DEFAULT 0, ativo BOOLEAN DEFAULT true, criado_em TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS assinaturas (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), barbearia_id UUID NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE, cliente_id UUID NOT NULL REFERENCES clientes(id), plano_id UUID NOT NULL REFERENCES planos_assinatura(id), status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa','pausada','cancelada','inadimplente')), inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(), vencimento TIMESTAMPTZ NOT NULL, preco_pago NUMERIC(10,2) NOT NULL, criado_em TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS lancamentos (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), barbearia_id UUID NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE, filial_id UUID REFERENCES filiais(id), agendamento_id UUID REFERENCES agendamentos(id), barbeiro_id UUID REFERENCES barbeiros(id), tipo TEXT NOT NULL CHECK (tipo IN ('receita','despesa')), categoria TEXT NOT NULL, descricao TEXT NOT NULL, valor NUMERIC(10,2) NOT NULL, comissao_valor NUMERIC(10,2) DEFAULT 0, forma_pagamento TEXT, data TIMESTAMPTZ NOT NULL DEFAULT NOW(), criado_em TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_lancamentos_barbearia ON lancamentos(barbearia_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data);
CREATE TABLE IF NOT EXISTS afiliados (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), barbearia_id UUID NOT NULL REFERENCES barbearias(id) ON DELETE CASCADE, nome TEXT NOT NULL, email TEXT, telefone TEXT, codigo_referral TEXT UNIQUE NOT NULL, comissao_percentual NUMERIC(5,2) DEFAULT 10.0, total_indicacoes INTEGER DEFAULT 0, total_ganho NUMERIC(10,2) DEFAULT 0, ativo BOOLEAN DEFAULT true, criado_em TIMESTAMPTZ DEFAULT NOW());
`
async function migrate() {
  const client = await pool.connect()
  try {
    console.log('Iniciando migracao Neon...')
    await client.query(schema)
    console.log('Schema criado com sucesso!')
  } catch (err) {
    console.error('Erro na migracao:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}
migrate()
