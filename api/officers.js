// my-api/routes/officers.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// Helper to define columns to be returned, excluding sensitive ones like password
const OFFICER_COLUMNS_TO_RETURN = `
    id, phone, email, prefix, firstname, lastname, dob, "position", affiliation, 
    department, generation, appointment_method, education, work_history, 
    position_number, notes, age, role, status, created_at, updated_at, 
    username
`;

// GET /api/officers (Get all officers)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT ${OFFICER_COLUMNS_TO_RETURN}
            FROM officers
            WHERE (role IS NULL OR role NOT IN ('super_admin')) AND (status IS NULL OR status != 'deleted')
            ORDER BY firstname ASC, lastname ASC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching officers:', err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/officers/pending (Get users awaiting approval)
router.get('/pending', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, prefix, firstname, lastname, phone, email, "position", affiliation, department, generation, status, created_at
            FROM officers 
            WHERE status = 'pending' 
            ORDER BY created_at ASC
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching pending officers:', err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// GET /api/officers/:id (Get a single officer by ID)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`SELECT ${OFFICER_COLUMNS_TO_RETURN} FROM officers WHERE id = $1 AND (status IS NULL OR status != 'deleted')`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลเจ้าหน้าที่" });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(`Error fetching officer with id ${id}:`, err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PUT /api/officers/:id/status (Update user status)
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    // Added 'inactive' to the list of valid statuses
    if (!status || !['approved', 'rejected', 'active', 'inactive'].includes(status)) {
        return res.status(400).json({ success: false, message: "สถานะไม่ถูกต้อง" });
    }

    try {
        // 'approved' status from the frontend will be stored as 'active' in the DB
        const newStatus = (status === 'approved') ? 'active' : status;
        
        const result = await pool.query(
            `UPDATE officers SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING ${OFFICER_COLUMNS_TO_RETURN}`, 
            [newStatus, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลเจ้าหน้าที่" });
        }
        
        res.json({ success: true, message: "อัปเดตสถานะสำเร็จ", data: result.rows[0] });
    } catch (err) {
        console.error(`Error updating status for officer ${id}:`, err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// DELETE /api/officers/:id (Soft delete a user)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "UPDATE officers SET status = 'deleted', updated_at = NOW() WHERE id = $1 RETURNING id", 
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "ไม่พบข้อมูลเจ้าหน้าที่" });
        }
        
        res.json({ success: true, message: "ลบข้อมูลเจ้าหน้าที่สำเร็จ" });
    } catch (err) {
        console.error(`Error deleting officer ${id}:`, err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;