const Funcionario = require('../models/funcionario');
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = {
  register: async (req, res) => {
    try {
      const { nome, email, password, cargo } = req.body;
      
      // Verifica se funcionário já existe
      const funcionarioExistente = await Funcionario.findOne({ email });
      if (funcionarioExistente) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }

      // Cria novo funcionário
      const funcionario = await Funcionario.create({ nome, email, password, cargo });
      
      // Remove a senha do retorno
      funcionario.password = undefined;

      // Cria token JWT
      const token = jwt.sign(
        { 
          id: funcionario._id,
          nome: funcionario.nome,
          cargo: funcionario.cargo 
        }, 
        config.jwt.secret, 
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({ 
        mensagem: 'Funcionário cadastrado com sucesso',
        funcionario,
        token 
      });
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Verifica se funcionário existe
      const funcionario = await Funcionario.findOne({ email }).select('+password');
      if (!funcionario) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      // Verifica senha
      if (!(await funcionario.comparePassword(password))) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      // Remove a senha do retorno
      funcionario.password = undefined;

      // Cria token JWT
      const token = jwt.sign(
        { 
          id: funcionario._id,
          nome: funcionario.nome,
          cargo: funcionario.cargo 
        }, 
        config.jwt.secret, 
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({ 
        mensagem: 'Login realizado com sucesso',
        funcionario,
        token 
      });
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
};