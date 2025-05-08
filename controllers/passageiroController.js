const Passageiro = require('../models/Passageiro');
const Voo = require('../models/Voo');

module.exports = {
  async criar(req, res) {
    try {
      const { cpf, vooId } = req.body;
      
      // Verifica se CPF já existe
      const cpfExistente = await Passageiro.findOne({ cpf });
      if (cpfExistente) {
        return res.status(400).json({ erro: 'CPF já cadastrado' });
      }

      // Verifica se voo existe
      if (vooId) {
        const voo = await Voo.findById(vooId);
        if (!voo) {
          return res.status(400).json({ erro: 'Voo não encontrado' });
        }
      }

      const passageiro = await Passageiro.create(req.body);
      res.status(201).json(passageiro);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

  async listar(req, res) {
    try {
      const passageiros = await Passageiro.find().populate('vooId', 'numeroVoo status');
      res.json(passageiros);
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  },

  async atualizarCheckIn(req, res) {
    try {
      const { statusCheckIn } = req.body;
      const passageiro = await Passageiro.findById(req.params.id).populate('vooId');
      
      if (!passageiro) {
        return res.status(404).json({ erro: 'Passageiro não encontrado' });
      }

      // Verifica se voo está em embarque
      if (statusCheckIn === 'realizado' && passageiro.vooId?.status !== 'embarque') {
        return res.status(400).json({ erro: 'Check-in só pode ser realizado para voos em embarque' });
      }

      passageiro.statusCheckIn = statusCheckIn;
      await passageiro.save();

      res.json(passageiro);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  }
};