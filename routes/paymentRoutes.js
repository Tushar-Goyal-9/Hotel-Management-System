const express = require('express');
const { createPayment, getBill } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const router = express.Router();

router.use(authenticate);
router.post('/', [
    body('booking_id').isInt(),
    body('amount').isNumeric(),
    body('payment_method').isIn(['cash', 'card', 'online'])
], validate, createPayment);
router.get('/bill/:id', [
    param('id').isInt()
], validate, getBill);

module.exports = router;