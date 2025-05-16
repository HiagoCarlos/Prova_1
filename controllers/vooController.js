const Voo = require('../models/Voo');
const Passageiro = require('../models/Passageiro');
const Portao = require('../models/Portao');

module.exports = {
  /**
   * Lista todos os voos
   */
  async listar(req, res) {
    try {
      const { origem, destino, data } = req.query;
      
      const filtro = {};
      if (origem) filtro.origem = origem;
      if (destino) filtro.destino = destino;
      if (data) {
        const dataInicio = new Date(data);
        dataInicio.setHours(0, 0, 0, 0);
        
        const dataFim = new Date(data);
        dataFim.setHours(23, 59, 59, 999);
        
        filtro.dataHoraPartida = {
          $gte: dataInicio,
          $lte: dataFim
        };
      }

      const voos = await Voo.find(filtro)
        .populate('portaoId')
        .populate('passageiros', 'nome cpf statusCheckIn');
      
      res.json(voos);
    } catch (error) {
      res.status(500).json({ 
        erro: 'Erro ao listar voos',
        detalhes: error.message 
      });
    }
  },

  /**
   * Cria um novo voo
   */
  async criar(req, res) {
    try {
      const { numeroVoo, portaoId } = req.body;

      // Verifica se número do voo já existe
      const vooExistente = await Voo.findOne({ numeroVoo });
      if (vooExistente) {
        return res.status(400).json({ erro: 'Número de voo já cadastrado' });
      }

      // Verifica se o portão existe
      if (portaoId) {
        const portao = await Portao.findById(portaoId);
        if (!portao) {
          return res.status(404).json({ erro: 'Portão não encontrado' });
        }
      }

      const voo = await Voo.create(req.body);
      res.status(201).json(voo);
    } catch (error) {
      res.status(400).json({ 
        erro: 'Erro ao criar voo',
        detalhes: error.message 
      });
    }
  },

  /**
   * Obtém detalhes de um voo específico
   */
  async obterPorId(req, res) {
    try {
      const voo = await Voo.findById(req.params.id)
        .populate('portaoId')
        .populate('passageiros', 'nome cpf statusCheckIn');
      
      if (!voo) {
        return res.status(404).json({ erro: 'Voo não encontrado' });
      }
      
      res.json(voo);
    } catch (error) {
      res.status(500).json({ 
        erro: 'Erro ao obter voo',
        detalhes: error.message 
      });
    }
  },

  /**
   * Atualiza um voo existente
   */
  async atualizar(req, res) {
    try {
      const { portaoId } = req.body;

      // Verifica se o portão existe
      if (portaoId) {
        const portao = await Portao.findById(portaoId);
        if (!portao) {
          return res.status(404).json({ erro: 'Portão não encontrado' });
        }
      }

      const voo = await Voo.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true }
      ).populate('portaoId');
      
      if (!voo) {
        return res.status(404).json({ erro: 'Voo não encontrado' });
      }
      
      res.json(voo);
    } catch (error) {
      res.status(400).json({ 
        erro: 'Erro ao atualizar voo',
        detalhes: error.message 
      });
    }
  },

  /**
   * Remove um voo
   */
  async remover(req, res) {
    try {
      const voo = await Voo.findByIdAndDelete(req.params.id);
      
      if (!voo) {
        return res.status(404).json({ erro: 'Voo não encontrado' });
      }
      
      // Remove referência do voo nos passageiros
      await Passageiro.updateMany(
        { vooId: req.params.id },
        { $unset: { vooId: "" } }
      );
      
      res.json({ mensagem: 'Voo removido com sucesso' });
    } catch (error) {
      res.status(500).json({ 
        erro: 'Erro ao remover voo',
        detalhes: error.message 
      });
    }
  },

  /**
   * Relatório de voos do dia
   */
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
      })
      .populate('portaoId')
      .populate('passageiros', 'nome cpf statusCheckIn');

      res.json({
        data: hoje.toLocaleDateString('pt-BR'),
        totalVoos: voos.length,
        voos: voos.map(voo => ({
          id: voo._id,
          numeroVoo: voo.numeroVoo,
          origem: voo.origem,
          destino: voo.destino,
          partida: voo.dataHoraPartida,
          portao: voo.portaoId?.codigo || 'Não atribuído',
          totalPassageiros: voo.passageiros.length,
          passageiros: voo.passageiros.map(p => ({
            nome: p.nome,
            cpf: p.cpf,
            checkIn: p.statusCheckIn
          }))
        }))
      });
    } catch (error) {
      res.status(500).json({ 
        erro: 'Erro ao gerar relatório',
        detalhes: error.message 
      });
    }
  },

  /**
   * Associa um passageiro a um voo
   */
  async associarPassageiro(req, res) {
    try {
      const { passageiroId } = req.params;
      const { vooId } = req.body;

      // Verifica se o passageiro existe
      const passageiro = await Passageiro.findById(passageiroId);
      if (!passageiro) {
        return res.status(404).json({ erro: 'Passageiro não encontrado' });
      }

      // Verifica se o voo existe
      const voo = await Voo.findById(vooId);
      if (!voo) {
        return res.status(404).json({ erro: 'Voo não encontrado' });
      }

      // Atualiza o voo do passageiro
      passageiro.vooId = vooId;
      await passageiro.save();

      // Adiciona o passageiro ao array de passageiros do voo (evitando duplicatas)
      if (!voo.passageiros.includes(passageiroId)) {
        voo.passageiros.push(passageiroId);
        await voo.save();
      }

      res.json({
        mensagem: 'Passageiro associado ao voo com sucesso',
        passageiro: {
          id: passageiro._id,
          nome: passageiro.nome,
          cpf: passageiro.cpf
        },
        voo: {
          id: voo._id,
          numeroVoo: voo.numeroVoo,
          partida: voo.dataHoraPartida
        }
      });
    } catch (error) {
      res.status(400).json({ 
        erro: 'Erro ao associar passageiro',
        detalhes: error.message 
      });
    }
  }
};