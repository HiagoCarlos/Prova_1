const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const funcionarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 6,
    select: false
  },
  cargo: {
    type: String,
    required: [true, 'Cargo é obrigatório'],
    enum: ['admin', 'operador', 'supervisor'],
    default: 'operador'
  }
}, { timestamps: true });

// Método para comparar senhas
funcionarioSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hash da senha antes de salvar
funcionarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Funcionario', funcionarioSchema);