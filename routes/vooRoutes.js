const express = require('express');
const router = express.Router();
const vooController = require('../controllers/vooController');

// Rotas para voos
router.get('/voos', vooController.listar);
router.post('/voos', vooController.criar);
router.get('/voos/:id', vooController.obterPorId);
router.put('/voos/:id', vooController.atualizar);
router.delete('/voos/:id', vooController.remover);

// Relatórios
router.get('/voos/relatorio/dia', vooController.relatorioDia);

// Associação de passageiros
router.put('/passageiros/:passageiroId/associar-voo', vooController.associarPassageiro);

module.exports = router;