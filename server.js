require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Conexão com MongoDB
mongoose.connect('mongodb://localhost:27017/seubanco', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => console.error('❌ Erro no MongoDB:', err));

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/passageiros', require('./routes/passageiroRoutes'));
app.use('/api/portoes', require('./routes/portaoRoutes'));
app.use('/api/voos', require('./routes/vooRoutes'));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API do Sistema de Aeroporto' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));