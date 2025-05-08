const mongoose = require('mongoose');

const portaoSchema = new mongoose.Schema({
  codigo: { 
    type: String, 
    required: [true, 'Código do portão é obrigatório'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]\d+$/, 'Formato inválido (ex: A1, B2)']
  },
  disponivel: { 
    type: Boolean, 
    default: true 
  },
  vooAtual: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Voo',
    default: null 
  }
}, { timestamps: true });

module.exports = mongoose.model('Portao', portaoSchema);