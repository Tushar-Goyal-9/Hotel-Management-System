const pool = require('../config/db');

// Get all rooms with optional pagination
const getRooms = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM rooms');
        const total = countResult[0].total;
        const [rows] = await pool.query('SELECT * FROM rooms LIMIT ? OFFSET ?', [limit, offset]);
        res.json({
            success: true,
            data: rows,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getRoomById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Room not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const createRoom = async (req, res) => {
    const { room_number, type, price_per_night, status = 'available' } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO rooms (room_number, type, price_per_night, status) VALUES (?, ?, ?, ?)',
            [room_number, type, price_per_night, status]
        );
        const [newRoom] = await pool.query('SELECT * FROM rooms WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newRoom[0] });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Room number already exists' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateRoom = async (req, res) => {
    const { id } = req.params;
    const { room_number, type, price_per_night, status } = req.body;
    try {
        const [existing] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ success: false, message: 'Room not found' });
        await pool.query(
            'UPDATE rooms SET room_number = ?, type = ?, price_per_night = ?, status = ? WHERE id = ?',
            [room_number, type, price_per_night, status, id]
        );
        const [updated] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
        res.json({ success: true, data: updated[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Room not found' });
        res.json({ success: true, message: 'Room deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Check room availability for date range
const getAvailableRooms = async (req, res) => {
    const { check_in, check_out } = req.query;
    if (!check_in || !check_out) {
        return res.status(400).json({ success: false, message: 'check_in and check_out required' });
    }
    try {
        const query = `
            SELECT r.* FROM rooms r
            WHERE r.status = 'available'
            AND r.id NOT IN (
                SELECT b.room_id FROM bookings b
                WHERE b.status != 'cancelled'
                AND b.check_in < ? AND b.check_out > ?
            )
        `;
        const [rows] = await pool.query(query, [check_out, check_in]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, getAvailableRooms };