const express = require('express');
const { login } = require('../controllers/authController');
const { loginValidation, validate } = require('../middleware/validation');
const router = express.Router();

router.post('/login', loginValidation, validate, login);

module.exports = router;