const express = require('express');
const router = express.Router();
const vooController = require('../controllers/vooController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas
router.get('/', vooController.listar);
router.get('/:id', vooController.obterPorId);
router.get('/relatorio/dia', vooController.relatorioDia);

// Rotas protegidas
router.post('/', authMiddleware, vooController.criar);
router.post('/:passageiroId/associar', authMiddleware, vooController.associarPassageiro);

// Rotas apenas para admin
router.put('/:id', authMiddleware, authMiddleware.isAdmin, vooController.atualizar);
router.delete('/:id', authMiddleware, authMiddleware.isAdmin, vooController.remover);

module.exports = router;