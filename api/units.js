// my-api/routes/units.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET /api/units (มาจาก getAllUnits)
router.get('/', async (req, res) => {
    try {
        // This SQL query has been fixed
        const sql = `
            SELECT 
                u.unit_id AS id, 
                u.unit_name, 
                u.supervisor_id,
                CONCAT(o_sup.firstname, ' ', o_sup.lastname) as supervisor_name,
                json_agg(json_build_object('id', o_mem.id, 'name', CONCAT(o_mem.firstname, ' ', o_mem.lastname))) FILTER (WHERE o_mem.id IS NOT NULL) as members
            FROM Units u
            LEFT JOIN officers o_sup ON u.supervisor_id = o_sup.id
            LEFT JOIN officers o_mem ON o_mem.unit_id = u.unit_id
            GROUP BY u.unit_id, u.unit_name, u.supervisor_id, supervisor_name
            ORDER BY u.unit_name
        `;
        const result = await pool.query(sql);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// POST /api/units (มาจาก createUnit)
router.post('/', async (req, res) => {
    const { unit_name, supervisor_id } = req.body;
    if (!unit_name) {
        return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อหน่วยงาน' });
    }
    try {
        await pool.query('INSERT INTO Units (unit_name, supervisor_id) VALUES ($1, $2)', [unit_name, supervisor_id || null]);
        res.status(201).json({ success: true, message: 'เพิ่มหน่วยงานสำเร็จ' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// PUT /api/units/:id (มาจาก updateUnit)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { unit_name, supervisor_id } = req.body;
    if (!unit_name) {
        return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
    }
    try {
        await pool.query('UPDATE Units SET unit_name = $1, supervisor_id = $2 WHERE unit_id = $3', [unit_name, supervisor_id || null, id]);
        res.json({ success: true, message: 'อัปเดตหน่วยงานสำเร็จ' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// DELETE /api/units/:id (มาจาก deleteUnit)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM Units WHERE unit_id = $1', [id]);
        res.json({ success: true, message: 'ลบหน่วยงานสำเร็จ' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;