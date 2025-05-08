const express = require('express');
const router = express.Router();
const VooController = require('../controllers/VooController');

router.post('/', VooController.criar);
router.get('/relatorio/dia', VooController.relatorioDia);

module.exports = router;