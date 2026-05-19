const pool = require('../config/db');

// Record a payment for a booking
const createPayment = async (req, res) => {
    const { booking_id, amount, payment_method } = req.body;
    try {
        // Get booking details
        const [bookingRows] = await pool.query('SELECT total_price FROM bookings WHERE id = ?', [booking_id]);
        if (bookingRows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        const totalDue = parseFloat(bookingRows[0].total_price);
        
        // Get total paid so far
        const [paidRows] = await pool.query('SELECT SUM(amount) as total_paid FROM payments WHERE booking_id = ? AND status = "completed"', [booking_id]);
        const totalPaid = paidRows[0].total_paid || 0;
        
        const newAmount = parseFloat(amount);
        if (totalPaid + newAmount > totalDue) {
            return res.status(400).json({ success: false, message: `Payment exceeds remaining balance. Remaining: ${(totalDue - totalPaid).toFixed(2)}` });
        }
        
        const [result] = await pool.query(
            'INSERT INTO payments (booking_id, amount, payment_method, status) VALUES (?, ?, ?, "completed")',
            [booking_id, amount, payment_method]
        );
        const [newPayment] = await pool.query('SELECT * FROM payments WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newPayment[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get bill: total cost, payments made, due amount
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
                due_amount: due > 0 ? due : 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { createPayment, getBill };