require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const config = require('./config'); 


// Middlewares
app.use(express.json());
// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aeroporto', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado ao MongoDB'))
.catch(err => console.error('❌ Erro no MongoDB:', err));

app.use(cors());
app.use(express.json());

// Rotas
const passageiroRoutes = require('./routes/passageiroRoutes');
const portaoRoutes = require('./routes/portaoRoutes');
const vooRoutes = require('./routes/vooRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/passageiros', passageiroRoutes);
app.use('/api/portoes', portaoRoutes);
app.use('/api', vooRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));