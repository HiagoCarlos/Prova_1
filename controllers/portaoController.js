const Portao = require('../models/Portao');
const Voo = require('../models/Voo');

module.exports = {
  async criar(req, res) {
    try {
      const { codigo } = req.body;
      
      // Verifica formato do código
      if (!/^[A-Z]\d+$/.test(codigo)) {
        return res.status(400).json({ erro: 'Formato inválido (ex: A1, B2)' });
      }

      // Verifica se código já existe
      const codigoExistente = await Portao.findOne({ codigo });
      if (codigoExistente) {
        return res.status(400).json({ erro: 'Código já cadastrado' });
      }

      const portao = await Portao.create({ codigo });
      res.status(201).json(portao);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

  async atribuirVoo(req, res) {
    try {
      const { portaoId, vooId } = req.params;
      
      const portao = await Portao.findById(portaoId);
      const voo = await Voo.findById(vooId);

      if (!portao || !voo) {
        return res.status(404).json({ erro: 'Portão ou voo não encontrado' });
      }

      if (!portao.disponivel) {
        return res.status(400).json({ erro: 'Portão já está ocupado' });
      }

      if (voo.status !== 'programado') {
        return res.status(400).json({ erro: 'Só é possível atribuir portão a voos programados' });
      }

      // Atualiza portão
      portao.disponivel = false;
      portao.vooAtual = vooId;
      await portao.save();

      // Atualiza voo
      voo.portaoId = portaoId;
      voo.status = 'embarque';
      await voo.save();

      res.json({
        mensagem: `Voo ${voo.numeroVoo} atribuído ao Portão ${portao.codigo}`,
        portao,
        voo
      });
    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
};