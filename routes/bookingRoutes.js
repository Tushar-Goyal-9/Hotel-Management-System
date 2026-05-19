const express = require('express');
const { getBookings, getBookingById, createBooking, updateBooking, cancelBooking } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { bookingValidation, validate } = require('../middleware/validation');
const router = express.Router();

router.use(authenticate);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', bookingValidation, validate, createBooking);
router.put('/:id', bookingValidation, validate, updateBooking);
router.delete('/:id', cancelBooking);

module.exports = router;