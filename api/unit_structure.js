const express = require('express');
const pool = require('../db'); // ใช้ PostgreSQL pool ที่มีอยู่
const router = express.Router();

// Helper function to validate unit structure data
function validateUnitStructure(data, isUpdate = false) {
    const errors = [];
    
    if (!isUpdate || data.position_number !== undefined) {
        if (!data.position_number) {
            errors.push('เลขตำแหน่งเป็นข้อมูลที่จำเป็น');
        }
    }
    
    if (!isUpdate || data.unit_name !== undefined) {
        if (!data.unit_name || data.unit_name.trim() === '') {
            errors.push('ชื่อส่วนงานเป็นข้อมูลที่จำเป็น');
        }
    }
    
    if (!isUpdate || data.unit_code !== undefined) {
        if (!data.unit_code || data.unit_code.trim() === '') {
            errors.push('รหัสส่วนงานเป็นข้อมูลที่จำเป็น');
        }
    }
    
    if (!isUpdate || data.role !== undefined) {
        if (!['member', 'supervisor', 'director'].includes(data.role)) {
            errors.push('บทบาทต้องเป็น member, supervisor หรือ director เท่านั้น');
        }
    }
    
    if (!isUpdate || data.seniority_order !== undefined) {
        if (!Number.isInteger(Number(data.seniority_order)) || Number(data.seniority_order) < 1) {
            errors.push('ลำดับอาวุโสต้องเป็นตัวเลขที่มากกว่า 0');
        }
    }
    
    return errors;
}

module.exports = router;

// GET /api/unit-structure (Get all unit structures with officer details)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                us.*,
                du.unit_name,
                o.prefix,
                o.firstname,
                o.lastname,
                o.phone,
                CONCAT(o.prefix, ' ', o.firstname, ' ', o.lastname) as full_name
            FROM unit_structure us
            LEFT JOIN officers o ON us.position_number = o.position_number
            LEFT JOIN duty_unit du ON us.unit_code = du.unit_code
            ORDER BY us.unit_code, us.seniority_order
        `;
        
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get unit structures error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// GET /api/unit-structure/:id (Get unit structure by ID)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                us.*,
                du.unit_name,
                o.prefix,
                o.firstname,
                o.lastname,
                o.phone,
                CONCAT(o.prefix, ' ', o.firstname, ' ', o.lastname) as full_name
            FROM unit_structure us
            LEFT JOIN officers o ON us.position_number = o.position_number
            LEFT JOIN duty_unit du ON us.unit_code = du.unit_code
            WHERE us.id = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลโครงสร้างส่วนงาน'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get unit structure by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// GET /api/unit-structure/by-unit/:unit_code (Get units grouped by unit_code)
router.get('/by-unit/:unit_code', async (req, res) => {
    try {
        const { unit_code } = req.params;
        
        const query = `
            SELECT 
                us.*,
                du.unit_name,
                o.prefix,
                o.firstname,
                o.lastname,
                o.phone,
                CONCAT(o.prefix, ' ', o.firstname, ' ', o.lastname) as full_name
            FROM unit_structure us
            LEFT JOIN officers o ON us.position_number = o.position_number
            LEFT JOIN duty_unit du ON us.unit_code = du.unit_code
            WHERE us.unit_code = $1
            ORDER BY us.seniority_order
        `;
        
        const result = await pool.query(query, [unit_code]);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get units by code error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// POST /api/unit-structure (Create new unit structure)
router.post('/', async (req, res) => {
    try {
        const { position_number, unit_code, role, seniority_order } = req.body;
        
        // Validate input
        const validationErrors = validateUnitStructure(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: validationErrors.join(', ')
            });
        }
        
        // Check if unit_code exists in duty_unit table
        const unitCheck = await pool.query(
            'SELECT unit_code FROM duty_unit WHERE unit_code = $1',
            [unit_code]
        );
        
        if (unitCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'ไม่พบรหัสส่วนงานนี้ในระบบ'
            });
        }
        
        // Check if position_number exists in officers table
        const officerCheck = await pool.query(
            'SELECT position_number FROM officers WHERE position_number = $1',
            [position_number]
        );
        
        if (officerCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'ไม่พบเลขตำแหน่งนี้ในระบบ'
            });
        }
        
        // Check if position_number already exists in unit_structure
        const existingPosition = await pool.query(
            'SELECT id FROM unit_structure WHERE position_number = $1',
            [position_number]
        );
        
        if (existingPosition.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'เลขตำแหน่งนี้ถูกใช้งานแล้วในโครงสร้างส่วนงาน'
            });
        }
        
        // Check role constraints
        if (role === 'director') {
            const directorCheck = await pool.query(
                'SELECT id FROM unit_structure WHERE role = $1',
                ['director']
            );
            
            if (directorCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'มีผู้อำนวยการศูนย์รักษาความปลอดภัยแล้ว (สามารถมีได้เพียงคนเดียว)'
                });
            }
        }
        
        if (role === 'supervisor') {
            const supervisorCheck = await pool.query(
                'SELECT id FROM unit_structure WHERE role = $1 AND unit_code = $2',
                ['supervisor', unit_code]
            );
            
            if (supervisorCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ส่วนงานนี้มีหัวหน้าส่วนแล้ว (สามารถมีได้เพียงคนเดียวต่อส่วน)'
                });
            }
            
            // For supervisor, seniority_order should be 1
            if (Number(seniority_order) !== 1) {
                return res.status(400).json({
                    success: false,
                    message: 'หัวหน้าส่วนต้องมีลำดับอาวุโสเป็น 1 เสมอ'
                });
            }
        }
        
        // Check if seniority_order already exists in the same unit
        const seniorityCheck = await pool.query(
            'SELECT id FROM unit_structure WHERE unit_code = $1 AND seniority_order = $2',
            [unit_code, seniority_order]
        );
        
        if (seniorityCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'ลำดับอาวุโสนี้ถูกใช้แล้วในส่วนงานนี้'
            });
        }
        
        const insertQuery = `
            INSERT INTO unit_structure 
            (position_number, unit_code, role, seniority_order, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING id
        `;
        
        const result = await pool.query(insertQuery, [
            position_number,
            unit_code,
            role,
            seniority_order
        ]);
        
        res.json({
            success: true,
            message: 'สร้างโครงสร้างส่วนงานสำเร็จ',
            data: {
                id: result.rows[0].id,
                position_number,
                unit_code,
                role,
                seniority_order
            }
        });
    } catch (error) {
        console.error('Create unit structure error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// PUT /api/unit-structure/:id (Update unit structure)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { position_number, unit_code, role, seniority_order } = req.body;
        
        // Validate input
        const validationErrors = validateUnitStructure(req.body, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: validationErrors.join(', ')
            });
        }
        
        // Get current data
        const currentData = await pool.query(
            'SELECT * FROM unit_structure WHERE id = $1',
            [id]
        );
        
        if (currentData.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลโครงสร้างส่วนงาน'
            });
        }
        
        const current = currentData.rows[0];
        
        // Check unit_code if changed
        if (unit_code && unit_code !== current.unit_code) {
            const unitCheck = await pool.query(
                'SELECT unit_code FROM duty_unit WHERE unit_code = $1',
                [unit_code]
            );
            
            if (unitCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ไม่พบรหัสส่วนงานนี้ในระบบ'
                });
            }
        }
        
        // Check position_number if changed
        if (position_number && position_number !== current.position_number) {
            const officerCheck = await pool.query(
                'SELECT position_number FROM officers WHERE position_number = $1',
                [position_number]
            );
            
            if (officerCheck.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ไม่พบเลขตำแหน่งนี้ในระบบ'
                });
            }
            
            const existingPosition = await pool.query(
                'SELECT id FROM unit_structure WHERE position_number = $1 AND id != $2',
                [position_number, id]
            );
            
            if (existingPosition.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'เลขตำแหน่งนี้ถูกใช้งานแล้วในโครงสร้างส่วนงาน'
                });
            }
        }
        
        // Check role constraints if changed
        if (role && role !== current.role) {
            if (role === 'director') {
                const directorCheck = await pool.query(
                    'SELECT id FROM unit_structure WHERE role = $1 AND id != $2',
                    ['director', id]
                );
                
                if (directorCheck.rows.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'มีผู้อำนวยการศูนย์รักษาความปลอดภัยแล้ว'
                    });
                }
            }
            
            if (role === 'supervisor') {
                const checkUnitCode = unit_code || current.unit_code;
                const supervisorCheck = await pool.query(
                    'SELECT id FROM unit_structure WHERE role = $1 AND unit_code = $2 AND id != $3',
                    ['supervisor', checkUnitCode, id]
                );
                
                if (supervisorCheck.rows.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'ส่วนงานนี้มีหัวหน้าส่วนแล้ว'
                    });
                }
            }
        }
        
        // Check seniority_order if changed
        if (seniority_order && seniority_order !== current.seniority_order) {
            const checkUnitCode = unit_code || current.unit_code;
            const seniorityCheck = await pool.query(
                'SELECT id FROM unit_structure WHERE unit_code = $1 AND seniority_order = $2 AND id != $3',
                [checkUnitCode, seniority_order, id]
            );
            
            if (seniorityCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ลำดับอาวุโสนี้ถูกใช้แล้วในส่วนงานนี้'
                });
            }
        }
        
        // Build update query
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;
        
        if (position_number !== undefined) {
            updateFields.push(`position_number = $${paramIndex++}`);
            updateValues.push(position_number);
        }
        if (unit_code !== undefined) {
            updateFields.push(`unit_code = $${paramIndex++}`);
            updateValues.push(unit_code);
        }
        if (role !== undefined) {
            updateFields.push(`role = $${paramIndex++}`);
            updateValues.push(role);
        }
        if (seniority_order !== undefined) {
            updateFields.push(`seniority_order = $${paramIndex++}`);
            updateValues.push(seniority_order);
        }
        
        updateFields.push(`updated_at = NOW()`);
        updateValues.push(id);
        
        const updateQuery = `
            UPDATE unit_structure 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
        `;
        
        await pool.query(updateQuery, updateValues);
        
        res.json({
            success: true,
            message: 'อัปเดตโครงสร้างส่วนงานสำเร็จ'
        });
    } catch (error) {
        console.error('Update unit structure error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// DELETE /api/unit-structure/:id (Delete unit structure)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM unit_structure WHERE id = $1',
            [id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลโครงสร้างส่วนงาน'
            });
        }
        
        res.json({
            success: true,
            message: 'ลบโครงสร้างส่วนงานสำเร็จ'
        });
    } catch (error) {
        console.error('Delete unit structure error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// GET /api/unit-structure/available/officers (Get available officers not yet in unit_structure)
router.get('/available/officers', async (req, res) => {
    try {
        const query = `
            SELECT 
                o.position_number,
                o.prefix,
                o.firstname,
                o.lastname,
                CONCAT(o.prefix, ' ', o.firstname, ' ', o.lastname) as full_name
            FROM officers o
            LEFT JOIN unit_structure us ON o.position_number = us.position_number
            WHERE us.position_number IS NULL
            ORDER BY o.position_number
        `;
        
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get available officers error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// GET /api/unit-structure/check-role/:role (Check role availability)
router.get('/check-role/:role', async (req, res) => {
    try {
        const { role } = req.params;
        const { unit_code, exclude_id } = req.query;
        
        let isAvailable = true;
        let message = '';
        
        if (role === 'director') {
            const query = exclude_id 
                ? 'SELECT id FROM unit_structure WHERE role = $1 AND id != $2'
                : 'SELECT id FROM unit_structure WHERE role = $1';
            const params = exclude_id ? ['director', exclude_id] : ['director'];
            
            const result = await pool.query(query, params);
            
            if (result.rows.length > 0) {
                isAvailable = false;
                message = 'มีผู้อำนวยการศูนย์รักษาความปลอดภัยแล้ว';
            }
        } else if (role === 'supervisor' && unit_code) {
            const query = exclude_id 
                ? 'SELECT id FROM unit_structure WHERE role = $1 AND unit_code = $2 AND id != $3'
                : 'SELECT id FROM unit_structure WHERE role = $1 AND unit_code = $2';
            const params = exclude_id ? ['supervisor', unit_code, exclude_id] : ['supervisor', unit_code];
            
            const result = await pool.query(query, params);
            
            if (result.rows.length > 0) {
                isAvailable = false;
                message = 'ส่วนงานนี้มีหัวหน้าส่วนแล้ว';
            }
        }
        
        res.json({
            success: true,
            available: isAvailable,
            message: message
        });
    } catch (error) {
        console.error('Check role availability error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// GET /api/unit-structure/hierarchy (Get unit hierarchy organized by roles)
router.get('/hierarchy', async (req, res) => {
    try {
        const query = `
            SELECT 
                us.*,
                o.prefix,
                o.firstname,
                o.lastname,
                o.phone,
                du.unit_name,
                CONCAT(o.prefix, ' ', o.firstname, ' ', o.lastname) as full_name
            FROM unit_structure us
            LEFT JOIN officers o ON us.position_number = o.position_number
            LEFT JOIN duty_unit du ON us.unit_code = du.unit_code
            ORDER BY 
                CASE us.role 
                    WHEN 'director' THEN 1 
                    WHEN 'supervisor' THEN 2 
                    WHEN 'member' THEN 3 
                END,
                us.unit_code,
                us.seniority_order
        `;
        
        const result = await pool.query(query);
        
        // Group by role and unit
        const hierarchy = {
            director: null,
            units: {}
        };
        
        result.rows.forEach(item => {
            if (item.role === 'director') {
                hierarchy.director = item;
            } else {
                if (!hierarchy.units[item.unit_code]) {
                    hierarchy.units[item.unit_code] = {
                        unit_code: item.unit_code,
                        unit_name: item.unit_name,
                        supervisor: null,
                        members: []
                    };
                }
                
                if (item.role === 'supervisor') {
                    hierarchy.units[item.unit_code].supervisor = item;
                } else {
                    hierarchy.units[item.unit_code].members.push(item);
                }
            }
        });
        
        res.json({
            success: true,
            data: hierarchy
        });
    } catch (error) {
        console.error('Get hierarchy error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// ===== DUTY UNIT MANAGEMENT ENDPOINTS =====

// GET /api/unit-structure/duty-units (Get all duty units)
router.get('/duty-units', async (req, res) => {
    try {
        const query = `
            SELECT 
                duty_id,
                unit_code,
                unit_name
            FROM duty_unit
            ORDER BY unit_code
        `;
        
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get duty units error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// POST /api/unit-structure/duty-units (Create new duty unit)
router.post('/duty-units', async (req, res) => {
    try {
        const { unit_code, unit_name } = req.body;
        
        // Validate input
        if (!unit_code || !unit_name) {
            return res.status(400).json({
                success: false,
                message: 'ต้องระบุรหัสส่วนงานและชื่อส่วนงาน'
            });
        }
        
        if (unit_code.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'รหัสส่วนงานต้องไม่เกิน 10 ตัวอักษร'
            });
        }
        
        if (unit_name.length > 200) {
            return res.status(400).json({
                success: false,
                message: 'ชื่อส่วนงานต้องไม่เกิน 200 ตัวอักษร'
            });
        }
        
        // Check if unit_code already exists
        const existingUnit = await pool.query(
            'SELECT duty_id FROM duty_unit WHERE unit_code = $1',
            [unit_code]
        );
        
        if (existingUnit.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'รหัสส่วนงานนี้มีอยู่แล้วในระบบ'
            });
        }
        
        const insertQuery = `
            INSERT INTO duty_unit (unit_code, unit_name)
            VALUES ($1, $2)
            RETURNING duty_id, unit_code, unit_name
        `;
        
        const result = await pool.query(insertQuery, [unit_code, unit_name]);
        
        res.json({
            success: true,
            message: 'สร้างส่วนงานสำเร็จ',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create duty unit error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// PUT /api/unit-structure/duty-units/:id (Update duty unit)
router.put('/duty-units/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { unit_code, unit_name } = req.body;
        
        // Validate input
        if (!unit_code || !unit_name) {
            return res.status(400).json({
                success: false,
                message: 'ต้องระบุรหัสส่วนงานและชื่อส่วนงาน'
            });
        }
        
        if (unit_code.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'รหัสส่วนงานต้องไม่เกิน 10 ตัวอักษร'
            });
        }
        
        if (unit_name.length > 200) {
            return res.status(400).json({
                success: false,
                message: 'ชื่อส่วนงานต้องไม่เกิน 200 ตัวอักษร'
            });
        }
        
        // Check if duty unit exists
        const existingUnit = await pool.query(
            'SELECT duty_id, unit_code FROM duty_unit WHERE duty_id = $1',
            [id]
        );
        
        if (existingUnit.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลส่วนงานนี้'
            });
        }
        
        // Check if new unit_code already exists (except current record)
        if (unit_code !== existingUnit.rows[0].unit_code) {
            const duplicateCheck = await pool.query(
                'SELECT duty_id FROM duty_unit WHERE unit_code = $1 AND duty_id != $2',
                [unit_code, id]
            );
            
            if (duplicateCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'รหัสส่วนงานนี้มีอยู่แล้วในระบบ'
                });
            }
        }
        
        const updateQuery = `
            UPDATE duty_unit 
            SET unit_code = $1, unit_name = $2
            WHERE duty_id = $3
            RETURNING duty_id, unit_code, unit_name
        `;
        
        const result = await pool.query(updateQuery, [unit_code, unit_name, id]);
        
        res.json({
            success: true,
            message: 'อัปเดตส่วนงานสำเร็จ',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update duty unit error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// DELETE /api/unit-structure/duty-units/:id (Delete duty unit)
router.delete('/duty-units/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if duty unit is being used in unit_structure
        const usageCheck = await pool.query(
            'SELECT COUNT(*) as count FROM unit_structure WHERE unit_code = (SELECT unit_code FROM duty_unit WHERE duty_id = $1)',
            [id]
        );
        
        if (parseInt(usageCheck.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'ไม่สามารถลบส่วนงานนี้ได้ เนื่องจากมีการใช้งานในโครงสร้างส่วนงาน'
            });
        }
        
        const result = await pool.query(
            'DELETE FROM duty_unit WHERE duty_id = $1',
            [id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลส่วนงานนี้'
            });
        }
        
        res.json({
            success: true,
            message: 'ลบส่วนงานสำเร็จ'
        });
    } catch (error) {
        console.error('Delete duty unit error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

module.exports = router;
