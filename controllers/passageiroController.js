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
      const passageiroId = req.params.id;

      // Busca o passageiro e popula os dados do voo
      const passageiro = await Passageiro.findById(passageiroId).populate('vooId');
      
      if (!passageiro) {
        return res.status(404).json({ erro: 'Passageiro não encontrado' });
      }

      // Verifica se o passageiro está associado a um voo
      if (!passageiro.vooId) {
        return res.status(400).json({ erro: 'Passageiro não está associado a nenhum voo' });
      }

      // Verifica se o voo está em status "embarque"
      if (statusCheckIn === 'realizado' && passageiro.vooId.status !== 'embarque') {
        return res.status(400).json({ 
          erro: 'Check-in só pode ser realizado para voos em embarque',
          statusAtualDoVoo: passageiro.vooId.status,
          vooId: passageiro.vooId._id,
          numeroVoo: passageiro.vooId.numeroVoo
        });
      }

      // Atualiza o status do check-in
      passageiro.statusCheckIn = statusCheckIn;
      await passageiro.save();

      res.json({
        mensagem: `Check-in ${statusCheckIn} atualizado com sucesso`,
        passageiro: {
          id: passageiro._id,
          nome: passageiro.nome,
          voo: {
            id: passageiro.vooId._id,
            numero: passageiro.vooId.numeroVoo,
            status: passageiro.vooId.status
          },
          statusCheckIn: passageiro.statusCheckIn
        }
      });

    } catch (err) {
      res.status(500).json({ erro: err.message });
    }
  }
};