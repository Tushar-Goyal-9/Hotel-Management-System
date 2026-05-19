const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

// Room validation rules
const roomValidation = [
    body('room_number').notEmpty().withMessage('Room number required'),
    body('type').notEmpty().withMessage('Room type required'),
    body('price_per_night').isNumeric().withMessage('Price must be number')
];

// Booking validation rules
const bookingValidation = [
    body('guest_name').notEmpty(),
    body('guest_email').isEmail(),
    body('room_id').isInt({ min: 1 }),
    body('check_in').isDate().custom((value, { req }) => {
        if (new Date(value) < new Date().setHours(0,0,0,0)) {
            throw new Error('Check-in date cannot be in the past');
        }
        return true;
    }),
    body('check_out').isDate().custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.check_in)) {
            throw new Error('Check-out must be after check-in');
        }
        return true;
    })
];

const loginValidation = [
    body('email').isEmail(),
    body('password').notEmpty()
];

module.exports = { validate, roomValidation, bookingValidation, loginValidation };