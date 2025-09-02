// my-api/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { firstname, lastname, phone, email, username, password, ...otherData } = req.body;
    if (!firstname || !lastname || !phone || !email || !username || !password) {
        return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
            INSERT INTO officers (prefix, firstname, lastname, phone, email, dob, position, affiliation, department, generation, appointment_method, username, password, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
            RETURNING id;
        `;
        await pool.query(sql, [
            otherData.prefix, firstname, lastname, phone, email, otherData.dob, otherData.position, 
            otherData.affiliation, otherData.department, otherData.generation, otherData.appointment_method, 
            username, hashedPassword
        ]);
        res.status(201).json({ success: true, message: "สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ" });
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(409).json({ success: false, message: "Username หรือเบอร์โทรศัพท์นี้มีในระบบแล้ว" });
        }
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
    }
    try {
        const result = await pool.query('SELECT * FROM officers WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...userData } = user;
            // สร้าง Token สำหรับยืนยันตัวตน
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.json({ success: true, message: "เข้าสู่ระบบสำเร็จ", user: userData, token });
        } else {
            res.status(401).json({ success: false, message: "Username หรือ Password ไม่ถูกต้อง" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;