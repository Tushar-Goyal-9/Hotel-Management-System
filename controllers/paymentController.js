const pool = require('../config/db');

// Record a payment for a booking – now allows any amount (extras)
const createPayment = async (req, res) => {
    const { booking_id, amount, payment_method } = req.body;
    try {
        // Check if booking exists
        const [bookingRows] = await pool.query('SELECT total_price FROM bookings WHERE id = ?', [booking_id]);
        if (bookingRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        // ✅ No overpayment check – any positive amount is accepted (room + extras)
        const [result] = await pool.query(
            'INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?, ?, ?, "completed")',
            [booking_id, amount, payment_method]
        );
        const [newPayment] = await pool.query('SELECT * FROM payments WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newPayment[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get bill: total cost, payments made, due amount (due will be zero if total_paid >= total_price)
const getBill = async (req, res) => {
    const { id } = req.params; // booking id
    try {
        const [bookingRows] = await pool.query(`
            SELECT b.*, r.room_number, r.type 
            FROM bookings b JOIN rooms r ON b.room_id = r.id 
            WHERE b.id = ?
        `, [id]);
        if (bookingRows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        const booking = bookingRows[0];
        
        const [paymentRows] = await pool.query('SELECT * FROM payments WHERE booking_id = ?', [id]);
        const totalPaid = paymentRows.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const due = parseFloat(booking.total_price) - totalPaid;
        
        res.json({
            success: true,
            data: {
                booking: booking,
                payments: paymentRows,
                total_price: parseFloat(booking.total_price),
                total_paid: totalPaid,
                due_amount: due > 0 ? due : 0   // never negative
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// Get all payments (for dropdown population)
const getAllPayments = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM payments ORDER BY payment_date DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { createPayment, getBill,  getAllPayments };