const express = require('express');
const router = express.Router();
const PortaoController = require('../controllers/portaoController');

router.post('/', PortaoController.criar);
router.post('/:portaoId/atribuir-voo/:vooId', PortaoController.atribuirVoo);

module.exports = router;