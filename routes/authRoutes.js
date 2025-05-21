const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de cadastro de funcionários (POST /funcionarios)
router.post('/funcionarios', authController.register);

// Rota de login (POST /login)
router.post('/login', authController.login);

module.exports = router;