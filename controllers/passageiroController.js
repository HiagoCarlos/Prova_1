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
      // Opções de filtro
      const { vooId, statusCheckIn, pagina = 1, limite = 10 } = req.query;
      
      // Construir query
      const query = {};
      if (vooId) query.vooId = vooId;
      if (statusCheckIn) query.statusCheckIn = statusCheckIn;

      // Paginação
      const skip = (pagina - 1) * limite;
      
      // Busca com populate e paginação
      const [passageiros, total] = await Promise.all([
        Passageiro.find(query)
          .populate('vooId', 'numeroVoo origem destino')
          .skip(skip)
          .limit(parseInt(limite))
          .sort({ createdAt: -1 }),
        Passageiro.countDocuments(query)
      ]);

      // Calcular total de páginas
      const totalPaginas = Math.ceil(total / limite);

      res.json({
        total,
        totalPaginas,
        paginaAtual: parseInt(pagina),
        limite: parseInt(limite),
        passageiros: passageiros.map(p => ({
          id: p._id,
          nome: p.nome,
          cpf: p.cpf,
          voo: p.vooId ? {
            numero: p.vooId.numeroVoo,
            origem: p.vooId.origem,
            destino: p.vooId.destino
          } : null,
          statusCheckIn: p.statusCheckIn,
          criadoEm: p.createdAt
        }))
      });

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