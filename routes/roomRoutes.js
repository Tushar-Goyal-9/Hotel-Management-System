const express = require('express');
const { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, getAvailableRooms } = require('../controllers/roomController');
const { authenticate } = require('../middleware/auth');
const { roomValidation, validate } = require('../middleware/validation');
const router = express.Router();

router.use(authenticate);
router.get('/', getRooms);
router.get('/availability', getAvailableRooms);
router.get('/:id', getRoomById);
router.post('/', roomValidation, validate, createRoom);
router.put('/:id', roomValidation, validate, updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;