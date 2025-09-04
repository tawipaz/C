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

// Helper function to retry database queries with exponential backoff
async function retryQuery(queryFn, maxRetries = 2, baseDelay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Database query attempt ${attempt}/${maxRetries}`);
            const result = await queryFn();
            console.log(`✅ Database query successful on attempt ${attempt}`);
            return result;
        } catch (error) {
            console.error(`❌ Query attempt ${attempt} failed:`, error.message);
            
            // Don't retry for certain types of errors
            if (error.code === '23505' || // Unique violation
                error.code === '23503' || // Foreign key violation
                error.code === '42P01' || // Table doesn't exist
                error.code === '42703') { // Column doesn't exist
                console.log(`🚫 Not retrying - permanent error: ${error.code}`);
                throw error;
            }
            
            if (attempt === maxRetries) {
                console.log(`💀 All ${maxRetries} attempts failed, giving up`);
                throw error;
            }
            
            // Longer delay for cloud connections
            const delay = baseDelay * attempt + Math.random() * 1000;
            console.log(`⏳ Retrying query in ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

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
        
        if (!unit_code || !unit_name) {
            return res.status(400).json({
                success: false,
                message: 'รหัสส่วนงานและชื่อส่วนงานเป็นข้อมูลที่จำเป็น'
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
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                message: 'รหัสส่วนงานนี้มีอยู่แล้ว'
            });
        }
        console.error('Create duty unit error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// PUT /api/unit-structure/duty-units/:duty_id (Update duty unit)
router.put('/duty-units/:duty_id', async (req, res) => {
    try {
        const { duty_id } = req.params;
        const { unit_code, unit_name } = req.body;
        
        if (!unit_code || !unit_name) {
            return res.status(400).json({
                success: false,
                message: 'รหัสส่วนงานและชื่อส่วนงานเป็นข้อมูลที่จำเป็น'
            });
        }
        
        const updateQuery = `
            UPDATE duty_unit 
            SET unit_code = $1, unit_name = $2 
            WHERE duty_id = $3 
            RETURNING duty_id, unit_code, unit_name
        `;
        
        const result = await pool.query(updateQuery, [unit_code, unit_name, duty_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลส่วนงาน'
            });
        }
        
        res.json({
            success: true,
            message: 'อัปเดตส่วนงานสำเร็จ',
            data: result.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                message: 'รหัสส่วนงานนี้มีอยู่แล้ว'
            });
        }
        console.error('Update duty unit error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
            error: error.message
        });
    }
});

// DELETE /api/unit-structure/duty-units/:duty_id (Delete duty unit)
router.delete('/duty-units/:duty_id', async (req, res) => {
    try {
        const { duty_id } = req.params;
        
        // Check if duty unit is being used in unit_structure
        const usageCheck = await pool.query(
            'SELECT COUNT(*) as count FROM unit_structure WHERE unit_code = (SELECT unit_code FROM duty_unit WHERE duty_id = $1)',
            [duty_id]
        );

        if (parseInt(usageCheck.rows[0].count) > 0) {
            return res.status(400).json({
                success: false,
                message: 'ไม่สามารถลบส่วนงานนี้ได้ เนื่องจากมีการใช้งานในโครงสร้างส่วนงาน'
            });
        }

        const result = await pool.query('DELETE FROM duty_unit WHERE duty_id = $1', [duty_id]);        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลส่วนงาน'
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
                CONCAT(o.prefix, ' ', o.firstname, ' ', o.lastname) as full_name,
                du.unit_name
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
        console.error('Get unit hierarchy error:', error);
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
                o.prefix,
                o.firstname,
                o.lastname,
                o.phone,
                CONCAT(o.prefix, ' ', o.firstname, ' ', o.lastname) as full_name,
                du.unit_name
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

// GET /api/unit-structure (Get all unit structures with officer details)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                us.*,
                o.prefix,
                o.firstname,
                o.lastname,
                o.phone,
                CONCAT(o.prefix, ' ', o.firstname, ' ', o.lastname) as full_name,
                du.unit_name
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
                o.prefix,
                o.firstname,
                o.lastname,
                o.phone,
                CONCAT(o.prefix, ' ', o.firstname, ' ', o.lastname) as full_name,
                du.unit_name
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

// POST /api/unit-structure (Create new unit structure)
router.post('/', async (req, res) => {
    try {
        const { position_number, unit_code, unit_name, role, seniority_order } = req.body;
        
        // Validate input data
        const validationErrors = validateUnitStructure(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: validationErrors
            });
        }
        
        // Check if position_number already exists
        const existingCheck = await pool.query(
            'SELECT id FROM unit_structure WHERE position_number = $1',
            [position_number]
        );
        
        if (existingCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'เลขตำแหน่งนี้มีอยู่ในโครงสร้างแล้ว'
            });
        }
        
        // Check if officer exists
        const officerCheck = await pool.query(
            'SELECT position_number FROM officers WHERE position_number = $1',
            [position_number]
        );
        
        if (officerCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลข้าราชการที่มีเลขตำแหน่งนี้'
            });
        }
        
        // Check if unit_code exists in duty_unit table
        const unitCheck = await pool.query(
            'SELECT unit_code, unit_name FROM duty_unit WHERE unit_code = $1',
            [unit_code]
        );
        
        if (unitCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลส่วนงานที่มีรหัสนี้'
            });
        }
        
        // Use unit_name from request body or get from duty_unit table
        const finalUnitName = unit_name || unitCheck.rows[0].unit_name;
        
        // Role-specific checks
        if (role === 'director') {
            const directorCheck = await pool.query(
                'SELECT id FROM unit_structure WHERE role = $1',
                ['director']
            );
            
            if (directorCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'มีผู้อำนวยการศูนย์รักษาความปลอดภัยแล้ว'
                });
            }
        } else if (role === 'supervisor') {
            const supervisorCheck = await pool.query(
                'SELECT id FROM unit_structure WHERE role = $1 AND unit_code = $2',
                ['supervisor', unit_code]
            );
            
            if (supervisorCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'ส่วนงานนี้มีหัวหน้าส่วนแล้ว'
                });
            }
        }
        
        // Auto-assign seniority order if not provided or if it conflicts
        let finalSeniorityOrder = seniority_order;
        
        if (!finalSeniorityOrder) {
            // If no seniority order provided, get the next available number
            const maxSeniorityResult = await pool.query(
                'SELECT COALESCE(MAX(seniority_order), 0) + 1 as next_order FROM unit_structure WHERE unit_code = $1',
                [unit_code]
            );
            finalSeniorityOrder = maxSeniorityResult.rows[0].next_order;
        } else {
            // Check if provided seniority order conflicts
            const seniorityCheck = await pool.query(
                'SELECT id FROM unit_structure WHERE unit_code = $1 AND seniority_order = $2',
                [unit_code, finalSeniorityOrder]
            );
            
            if (seniorityCheck.rows.length > 0) {
                // If conflicts, shift existing members down and insert at requested position
                await pool.query(
                    'UPDATE unit_structure SET seniority_order = seniority_order + 1 WHERE unit_code = $1 AND seniority_order >= $2',
                    [unit_code, finalSeniorityOrder]
                );
            }
        }
        
        const insertQuery = `
            INSERT INTO unit_structure (position_number, unit_code, unit_name, role, seniority_order)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const result = await pool.query(insertQuery, [position_number, unit_code, finalUnitName, role, finalSeniorityOrder]);
        
        res.json({
            success: true,
            message: 'สร้างโครงสร้างส่วนงานสำเร็จ',
            data: result.rows[0]
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
        
        // Validate input data
        const validationErrors = validateUnitStructure(req.body, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: validationErrors
            });
        }
        
        // Check if record exists
        const existingCheck = await pool.query(
            'SELECT * FROM unit_structure WHERE id = $1',
            [id]
        );
        
        if (existingCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลโครงสร้างส่วนงาน'
            });
        }
        
        const existing = existingCheck.rows[0];
        
        // Check if position_number is being changed and already exists elsewhere
        if (position_number && position_number !== existing.position_number) {
            const positionCheck = await pool.query(
                'SELECT id FROM unit_structure WHERE position_number = $1 AND id != $2',
                [position_number, id]
            );
            
            if (positionCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'เลขตำแหน่งนี้มีอยู่ในโครงสร้างแล้ว'
                });
            }
            
            // Check if new officer exists
            const officerCheck = await pool.query(
                'SELECT position_number FROM officers WHERE position_number = $1',
                [position_number]
            );
            
            if (officerCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบข้อมูลข้าราชการที่มีเลขตำแหน่งนี้'
                });
            }
        }
        
        // Check if unit_code exists in duty_unit table
        if (unit_code && unit_code !== existing.unit_code) {
            const unitCheck = await pool.query(
                'SELECT unit_code FROM duty_unit WHERE unit_code = $1',
                [unit_code]
            );
            
            if (unitCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบข้อมูลส่วนงานที่มีรหัสนี้'
                });
            }
        }
        
        // Role-specific checks
        if (role && role !== existing.role) {
            if (role === 'director') {
                const directorCheck = await pool.query(
                    'SELECT id FROM unit_structure WHERE role = $1 AND id != $2',
                    ['director', id]
                );
                
                if (directorCheck.rows.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: 'มีผู้อำนวยการศูนย์รักษาความปลอดภัยแล้ว'
                    });
                }
            } else if (role === 'supervisor') {
                const checkUnitCode = unit_code || existing.unit_code;
                const supervisorCheck = await pool.query(
                    'SELECT id FROM unit_structure WHERE role = $1 AND unit_code = $2 AND id != $3',
                    ['supervisor', checkUnitCode, id]
                );
                
                if (supervisorCheck.rows.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: 'ส่วนงานนี้มีหัวหน้าส่วนแล้ว'
                    });
                }
            }
        }
        
        // Check seniority order uniqueness within unit
        if (seniority_order && seniority_order !== existing.seniority_order) {
            const checkUnitCode = unit_code || existing.unit_code;
            const seniorityCheck = await pool.query(
                'SELECT id FROM unit_structure WHERE unit_code = $1 AND seniority_order = $2 AND id != $3',
                [checkUnitCode, seniority_order, id]
            );
            
            if (seniorityCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'ลำดับอาวุโสนี้มีอยู่แล้วในส่วนงาน'
                });
            }
        }
        
        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;
        
        if (position_number !== undefined) {
            updateFields.push(`position_number = $${paramIndex}`);
            updateValues.push(position_number);
            paramIndex++;
        }
        
        if (unit_code !== undefined) {
            updateFields.push(`unit_code = $${paramIndex}`);
            updateValues.push(unit_code);
            paramIndex++;
        }
        
        if (role !== undefined) {
            updateFields.push(`role = $${paramIndex}`);
            updateValues.push(role);
            paramIndex++;
        }
        
        if (seniority_order !== undefined) {
            updateFields.push(`seniority_order = $${paramIndex}`);
            updateValues.push(seniority_order);
            paramIndex++;
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'ไม่มีข้อมูลที่ต้องการอัปเดต'
            });
        }
        
        updateValues.push(id);
        const updateQuery = `
            UPDATE unit_structure 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        
        const result = await pool.query(updateQuery, updateValues);
        
        res.json({
            success: true,
            message: 'อัปเดตโครงสร้างส่วนงานสำเร็จ',
            data: result.rows[0]
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
            'DELETE FROM unit_structure WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบข้อมูลโครงสร้างส่วนงาน'
            });
        }
        
        res.json({
            success: true,
            message: 'ลบโครงสร้างส่วนงานสำเร็จ',
            data: result.rows[0]
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

module.exports = router;
