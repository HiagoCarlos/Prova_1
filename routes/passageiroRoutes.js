const express = require('express');
const router = express.Router();
const PassageiroController = require('../controllers/passageiroController');

router.post('/', PassageiroController.criar);
router.get('/', PassageiroController.listar);
router.put('/:id/check-in', PassageiroController.atualizarCheckIn);

module.exports = router;