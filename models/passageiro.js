const mongoose = require('mongoose');

const passageiroSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: [true, 'Nome é obrigatório'] 
  },
  cpf: { 
    type: String, 
    required: [true, 'CPF é obrigatório'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v);
      },
      message: 'CPF inválido! Use o formato 123.456.789-09'
    }
  },
  vooId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Voo' 
  },
  statusCheckIn: { 
    type: String, 
    enum: ['pendente', 'realizado'],
    default: 'pendente' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Passageiro', passageiroSchema);