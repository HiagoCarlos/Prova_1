const mongoose = require('mongoose');

const vooSchema = new mongoose.Schema({
  numeroVoo: { 
    type: String, 
    required: [true, 'Número do voo é obrigatório'],
    unique: true,
    uppercase: true 
  },
  origem: { 
    type: String, 
    required: [true, 'Origem é obrigatória'],
    trim: true 
  },
  destino: { 
    type: String, 
    required: [true, 'Destino é obrigatório'],
    trim: true 
  },
  dataHoraPartida: { 
    type: Date, 
    required: [true, 'Data/hora de partida é obrigatória'],
    validate: {
      validator: function(value) {
        // Verifica se a data é hoje ou no futuro
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Início do dia atual
        return value >= hoje;
      },
      message: 'Data/hora deve ser hoje ou no futuro'
    }
  },
  portaoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Portao',
    default: null 
  },
  status: { 
    type: String, 
    enum: ['programado', 'embarque', 'concluído', 'cancelado', 'atrasado'],
    default: 'programado' 
  },
  passageiros: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Passageiro' 
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true } 
});

module.exports = mongoose.model('Voo', vooSchema);