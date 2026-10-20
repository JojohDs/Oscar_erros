/* ============================================================================
 *  EXERCÍCIO DE TREINO — ARQUIVO INTENCIONALMENTE VULNERÁVEL
 * ----------------------------------------------------------------------------
 *  Disciplina: Informática para Internet — Segurança em APIs REST
 *
 *  Este arquivo contém FALHAS DE SEGURANÇA DE PROPÓSITO. Sua tarefa é
 *  encontrá-las e corrigi-las (veja a lista de tarefas no final).
 *
 *  ⚠️  NÃO USE ESTE CÓDIGO EM PRODUÇÃO.
 *  ⚠️  NÃO EXPONHA À INTERNET. Rode apenas na sua máquina (localhost),
 *      em uma base de dados de teste, para o exercício.
 *
 *  São 6 falhas, as mesmas estudadas na aula. Boa caça. 🔍
 * ==========================================================================*/

const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Conexão com o banco (base de TESTE, local)
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'admin123',          // (1)
  database: 'tarefas_treino',
  port: 5432,
});

// (A) Erro na linha 26, (B) Exposição da senha do banco, peritindoque qualquer pessoa tenh acesso ao banco (C) , (D) Usar váriaveis em ambientes.



// ---------------------------------------------------------------------------
// GET /tarefas — lista todas as tarefas
// ---------------------------------------------------------------------------
app.get('/tarefas', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM tarefas ORDER BY id');
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message, stack: error.stack });   // (2)
  }
});

//(A) Erro na linha 43, (B) Exposição de infomações e dados pessoais, (C) , (D) Registrar erros do servidor e retornar com mensagem de error.

// ---------------------------------------------------------------------------
// GET /tarefas/buscar?termo=... — busca tarefas pelo título
// ---------------------------------------------------------------------------
app.get('/tarefas/buscar', async (req, res) => {
  const { termo } = req.query;
  // monta a consulta juntando o texto do usuário direto no SQL
  const sql = "SELECT * FROM tarefas WHERE titulo LIKE '%" + termo + "%'";   // (3)
  const resultado = await pool.query(sql);
  res.json(resultado.rows);
});

//(A) Erro na linha 55, (B) Injeção do SQL, (C), (D) Usar consultas parametrizadas

// ---------------------------------------------------------------------------
// POST /tarefas — cria uma tarefa
// ---------------------------------------------------------------------------
app.post('/tarefas', async (req, res) => {
  const { titulo } = req.body;
  // guarda o que vier, do jeito que vier                                    // (4)
  const sql = "INSERT INTO tarefas (titulo, concluida) VALUES ('" + titulo + "', false) RETURNING *";
  const resultado = await pool.query(sql);
  res.status(201).json(resultado.rows[0]);
});

//(A) Erro na linha 68, (B) Injeção do SQL e dados inválidos, (C), (D) Validar o tipo, validar o tamanho do título e parametrizar a consulta

// ---------------------------------------------------------------------------
// PUT /tarefas/:id — marca uma tarefa como concluída
// ---------------------------------------------------------------------------
app.put('/tarefas/:id', async (req, res) => {
  const { id } = req.params;
  const resultado = await pool.query(
    'UPDATE tarefas SET concluida = true WHERE id = $1 RETURNING *',
    [id]
  );
  res.json(resultado.rows[0]);
});

// ---------------------------------------------------------------------------
// DELETE /tarefas/:id — apaga uma tarefa
// ---------------------------------------------------------------------------
app.delete('/tarefas/:id', async (req, res) => {                            // (5)
  const { id } = req.params;
  await pool.query('DELETE FROM tarefas WHERE id = $1', [id]);
  res.status(204).send();
});

//(A) Erro na linha 90, (B) Caso o id não for enviado ou o banco para de rodar o sevidor ficará foria de ar, (C), (D) Validar o ID, verificar o resultado 
// e aplicar autorização quando houver usuário

// ---------------------------------------------------------------------------
// Sobe o servidor
// ---------------------------------------------------------------------------
app.listen(3000, () => {                                                    // (6)
  console.log('API de tarefas (TREINO) rodando em http://localhost:3000');
});

//(A) Erro na linha 102, (B) Maior exposição a ataques e configurações  inseguras, (C), (D) Aplicar configurações seguras, como Helmet, e manter o servidor restrito ao ambiente de treino

/* ============================================================================
 *  TAREFAS DO ALUNO
 * ----------------------------------------------------------------------------
 *  1. Leia cada rota e aponte TODOS os pontos onde uma entrada do usuário
 *     entra no sistema sem ser checada ou tratada.
 *  2. Encontre as 6 falhas de segurança escondidas neste arquivo. Para cada
 *     uma, anote: (a) em que linha está, (b) qual é o risco, (c) a categoria
 *     OWASP e (d) como corrigir.
 *  3. Reescreva o arquivo corrigindo as falhas. Teste que a API continua
 *     funcionando depois da correção.
 *  4. Dica: os números entre parênteses nos comentários (1)…(6) marcam onde
 *     está cada falha — mas o PORQUÊ e a CORREÇÃO são com você.
 *
 *  Consulte a apostila e os slides da aula "Segurança em APIs REST".
 *  Lema: "Toda entrada do usuário é mentira até prova em contrário."
 * ==========================================================================*/