// config.js
module.exports = {
  // Configurações do JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'nao',
    expiresIn: '1h'
  },

  // Configurações do banco de dados
  database: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/aeroporto'
  },

  // Outras configurações
  server: {
    port: process.env.PORT || 3000
  }
};