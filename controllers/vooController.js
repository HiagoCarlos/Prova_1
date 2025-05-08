const Voo = require('../models/Voo');
const Passageiro = require('../models/Passageiro');

module.exports = {
  async criar(req, res) {
    try {
      const { numeroVoo } = req.body;
      
      // Verifica se número do voo já existe
      const vooExistente = await Voo.findOne({ numeroVoo });
      if (vooExistente) {
        return res.status(400).json({ erro: 'Número de voo já cadastrado' });
      }

      const voo = await Voo.create(req.body);
      res.status(201).json(voo);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

  async relatorioDia(req, res) {
    try {
      const hoje = new Date();
      const inicioDia = new Date(hoje.setHours(0, 0, 0, 0));
      const fimDia = new Date(hoje.setHours(23, 59, 59, 999));
  
      const voos = await Voo.find({
        dataHoraPartida: {
          $gte: inicioDia,
          $lte: fimDia
        }
      }).populate('portaoId passageiros');
  
      res.json({
        data: hoje.toLocaleDateString('pt-BR'),
        voos: voos.map(voo => ({
          numeroVoo: voo.numeroVoo,
          partida: voo.dataHoraPartida,
          portao: voo.portaoId?.codigo || 'Não atribuído',
          passageiros: voo.passageiros.map(p => ({
            nome: p.nome,
            checkIn: p.statusCheckIn
          }))
        }))
      });
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
};