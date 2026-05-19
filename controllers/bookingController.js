const pool = require('../config/db');

// Helper: check room availability (exclude bookingId if updating)
const isRoomAvailable = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
    let query = `
        SELECT COUNT(*) as count FROM bookings 
        WHERE room_id = ? AND status != 'cancelled' 
        AND check_in < ? AND check_out > ?
    `;
    let params = [roomId, checkOut, checkIn];
    if (excludeBookingId) {
        query += ` AND id != ?`;
        params.push(excludeBookingId);
    }
    const [rows] = await pool.query(query, params);
    return rows[0].count === 0;
};

// Get all bookings with pagination & filtering
const getBookings = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status ? `WHERE b.status = '${req.query.status}'` : '';
    try {
        const countQuery = `SELECT COUNT(*) as total FROM bookings b ${statusFilter}`;
        const [countResult] = await pool.query(countQuery);
        const total = countResult[0].total;
        const dataQuery = `
            SELECT b.*, r.room_number, r.type, r.price_per_night 
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            ${statusFilter}
            ORDER BY b.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.query(dataQuery, [limit, offset]);
        res.json({
            success: true,
            data: rows,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getBookingById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT b.*, r.room_number, r.type, r.price_per_night 
            FROM bookings b JOIN rooms r ON b.room_id = r.id 
            WHERE b.id = ?
        `, [id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const createBooking = async (req, res) => {
    const { guest_name, guest_email, room_id, check_in, check_out } = req.body;
    const created_by = req.user.id;
    try {
        // Get room price
        const [roomRows] = await pool.query('SELECT price_per_night FROM rooms WHERE id = ?', [room_id]);
        if (roomRows.length === 0) return res.status(400).json({ success: false, message: 'Invalid room' });
        const pricePerNight = parseFloat(roomRows[0].price_per_night);
        
        // Calculate nights and total price
        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        if (nights <= 0) return res.status(400).json({ success: false, message: 'Invalid date range' });
        const totalPrice = nights * pricePerNight;
        
        // Check availability
        const available = await isRoomAvailable(room_id, check_in, check_out);
        if (!available) {
            return res.status(409).json({ success: false, message: 'Room not available for selected dates' });
        }
        
        const [result] = await pool.query(
            `INSERT INTO bookings (room_id, guest_name, guest_email, check_in, check_out, total_price, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
            [room_id, guest_name, guest_email, check_in, check_out, totalPrice, created_by]
        );
        const [newBooking] = await pool.query('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newBooking[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateBooking = async (req, res) => {
    const { id } = req.params;
    const { guest_name, guest_email, room_id, check_in, check_out, status } = req.body;
    try {
        const [existing] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
        if (existing.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        let updateFields = {};
        if (guest_name) updateFields.guest_name = guest_name;
        if (guest_email) updateFields.guest_email = guest_email;
        if (status) updateFields.status = status;
        
        let newRoomId = room_id || existing[0].room_id;
        let newCheckIn = check_in || existing[0].check_in;
        let newCheckOut = check_out || existing[0].check_out;
        
        // If dates or room changed, recalc price and check availability
        let newTotalPrice = existing[0].total_price;
        if (room_id || check_in || check_out) {
            const [roomRows] = await pool.query('SELECT price_per_night FROM rooms WHERE id = ?', [newRoomId]);
            if (roomRows.length === 0) return res.status(400).json({ success: false, message: 'Invalid room' });
            const nights = Math.ceil((new Date(newCheckOut) - new Date(newCheckIn)) / (1000 * 60 * 60 * 24));
            if (nights <= 0) return res.status(400).json({ success: false, message: 'Invalid dates' });
            newTotalPrice = nights * parseFloat(roomRows[0].price_per_night);
            
            const available = await isRoomAvailable(newRoomId, newCheckIn, newCheckOut, id);
            if (!available) {
                return res.status(409).json({ success: false, message: 'Room not available for selected dates' });
            }
            updateFields.room_id = newRoomId;
            updateFields.check_in = newCheckIn;
            updateFields.check_out = newCheckOut;
            updateFields.total_price = newTotalPrice;
        }
        
        const fields = Object.keys(updateFields).map(f => `${f} = ?`).join(', ');
        const values = [...Object.values(updateFields), id];
        if (fields) {
            await pool.query(`UPDATE bookings SET ${fields} WHERE id = ?`, values);
        }
        const [updated] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
        res.json({ success: true, data: updated[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const cancelBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('UPDATE bookings SET status = "cancelled" WHERE id = ? AND status != "cancelled"', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Booking not found or already cancelled' });
        res.json({ success: true, message: 'Booking cancelled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getBookings, getBookingById, createBooking, updateBooking, cancelBooking, isRoomAvailable };