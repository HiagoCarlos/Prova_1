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
    validate: {
      validator: function(value) {
        // Permite datas a partir do início do dia atual
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        return value >= hoje;
      },
      message: 'Data/hora deve ser no futuro'
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