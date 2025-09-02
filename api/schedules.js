// my-api/routes/schedules.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/schedules?month=5&year=2024
router.get('/', async (req, res) => {
    const { month, year } = req.query;
    if (!month || !year) {
        return res.status(400).json({ success: false, message: 'กรุณาระบุ month และ year' });
    }

    try {
        const sql = `
            SELECT 
                ds.schedule_id AS id,
                ds.duty_date,
                ds.shift_type_id,
                ds.unit_id,
                ds.notes,
                st.type_name AS shift_type_name,
                st.start_time,
                st.end_time,
                st.shift_category,
                u.unit_name,
                json_agg(
                    json_build_object(
                        'officer_id', o.id, 
                        'officer_name', CONCAT(o.prefix, o.firstname, ' ', o.lastname)
                    )
                ) FILTER (WHERE o.id IS NOT NULL) as officers
            FROM dutyschedules ds
            LEFT JOIN shifttypes st ON ds.shift_type_id = st.shift_type_id
            LEFT JOIN units u ON ds.unit_id = u.unit_id
            LEFT JOIN dutyassignments da ON ds.schedule_id = da.schedule_id
            LEFT JOIN officers o ON da.officer_id = o.id
            WHERE EXTRACT(MONTH FROM ds.duty_date) = $1 AND EXTRACT(YEAR FROM ds.duty_date) = $2
            GROUP BY ds.schedule_id, st.type_name, st.start_time, st.end_time, st.shift_category, u.unit_name
            ORDER BY ds.duty_date, st.start_time;
        `;
        const result = await pool.query(sql, [month, year]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.delete('/', async (req, res) => {
    const { schedule_id } = req.body;
    if (!schedule_id) {
        return res.status(400).json({ success: false, message: 'ไม่พบ schedule_id' });
    }
    try {
        await pool.query('DELETE FROM dutyassignments WHERE schedule_id = $1', [schedule_id]);
        await pool.query('DELETE FROM dutyschedules WHERE schedule_id = $1', [schedule_id]);
        res.json({ success: true, message: 'ลบตารางเวรสำเร็จ' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;