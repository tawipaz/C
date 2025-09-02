// my-api/routes/officers.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/officers (มาจาก getAllOfficers)
router.get('/', async (req, res) => {
    // Implement filters from req.query if needed
    try {
        const result = await pool.query(`
            SELECT id, phone, email, prefix, firstname, lastname, dob, position, affiliation, department, generation, role, status, unit_id
            FROM officers
            WHERE (role IS NULL OR role NOT IN ('super_admin')) AND (status IS NULL OR status != 'deleted')
            ORDER BY firstname ASC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/officers/pending (มาจาก getPendingUsers)
router.get('/pending', async (req, res) => {
    try {
        const result = await pool.query("SELECT id, prefix, firstname, lastname, phone, position, department, status FROM officers WHERE status = 'pending' ORDER BY created_at ASC");
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PUT /api/officers/:id/status (มาจาก updateUserStatus)
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    let { status } = req.body;
    if (!status || !['approved', 'rejected', 'active'].includes(status)) {
        return res.status(400).json({ success: false, message: "สถานะไม่ถูกต้อง" });
    }
    try {
        const newStatus = (status === 'approved') ? 'active' : status;
        await pool.query('UPDATE officers SET status = $1 WHERE id = $2', [newStatus, id]);
        res.json({ success: true, message: "อัปเดตสถานะสำเร็จ" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;