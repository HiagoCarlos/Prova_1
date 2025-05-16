// controllers/authController.js
const User = require('../models/funcionario');
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = {
  register: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Verifica se usuário já existe
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Cria novo usuário
      const user = await User.create({ email, password });
      
      // Cria token JWT
      const token = jwt.sign({ userId: user._id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

      res.status(201).json({ token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Verifica credenciais
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Cria token JWT
      const token = jwt.sign({ userId: user._id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};