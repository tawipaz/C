-- สร้างตาราง unit_structure สำหรับจัดการโครงสร้างส่วนงาน
CREATE TABLE IF NOT EXISTS unit_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    position_number VARCHAR(50) NOT NULL UNIQUE,
    unit_name VARCHAR(255) NOT NULL,
    unit_number VARCHAR(10) NOT NULL,
    role ENUM('member', 'supervisor', 'director') NOT NULL DEFAULT 'member',
    seniority_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint ไปยังตาราง officers
    FOREIGN KEY (position_number) REFERENCES officers(position_number) ON DELETE CASCADE,
    
    -- Unique constraint สำหรับ unit_number + seniority_order
    UNIQUE KEY unique_unit_seniority (unit_number, seniority_order),
    
    -- Index สำหรับการค้นหาที่รวดเร็ว
    INDEX idx_unit_number (unit_number),
    INDEX idx_role (role),
    INDEX idx_seniority (seniority_order)
);

-- เพิ่ม constraint เพื่อตรวจสอบรูปแบบ unit_number (2 ตัวอักษร + 2 ตัวเลข)
ALTER TABLE unit_structure 
ADD CONSTRAINT chk_unit_number_format 
CHECK (unit_number REGEXP '^[a-zA-Z]{2}[0-9]{2}$');

-- เพิ่ม constraint เพื่อตรวจสอบว่า seniority_order ต้องมากกว่า 0
ALTER TABLE unit_structure 
ADD CONSTRAINT chk_seniority_order_positive 
CHECK (seniority_order > 0);

-- เพิ่ม trigger เพื่อตรวจสอบข้อจำกัดของ role
DELIMITER //

CREATE TRIGGER check_role_constraints_before_insert
    BEFORE INSERT ON unit_structure
    FOR EACH ROW
BEGIN
    -- ตรวจสอบว่ามี director เพียงคนเดียว
    IF NEW.role = 'director' AND (SELECT COUNT(*) FROM unit_structure WHERE role = 'director') > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'มีผู้อำนวยการศูนย์รักษาความปลอดภัยได้เพียงคนเดียวเท่านั้น';
    END IF;
    
    -- ตรวจสอบว่า supervisor ของแต่ละ unit มีได้เพียงคนเดียว
    IF NEW.role = 'supervisor' AND (SELECT COUNT(*) FROM unit_structure WHERE role = 'supervisor' AND unit_number = NEW.unit_number) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'แต่ละส่วนงานสามารถมีหัวหน้าส่วนได้เพียงคนเดียวเท่านั้น';
    END IF;
    
    -- ตรวจสอบว่า supervisor ต้องมี seniority_order = 1
    IF NEW.role = 'supervisor' AND NEW.seniority_order != 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'หัวหน้าส่วนต้องมีลำดับอาวุโสเป็น 1 เสมอ';
    END IF;
END//

CREATE TRIGGER check_role_constraints_before_update
    BEFORE UPDATE ON unit_structure
    FOR EACH ROW
BEGIN
    -- ตรวจสอบว่ามี director เพียงคนเดียว (ยกเว้นตัวเอง)
    IF NEW.role = 'director' AND NEW.role != OLD.role AND 
       (SELECT COUNT(*) FROM unit_structure WHERE role = 'director' AND id != NEW.id) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'มีผู้อำนวยการศูนย์รักษาความปลอดภัยได้เพียงคนเดียวเท่านั้น';
    END IF;
    
    -- ตรวจสอบว่า supervisor ของแต่ละ unit มีได้เพียงคนเดียว (ยกเว้นตัวเอง)
    IF NEW.role = 'supervisor' AND (NEW.role != OLD.role OR NEW.unit_number != OLD.unit_number) AND
       (SELECT COUNT(*) FROM unit_structure WHERE role = 'supervisor' AND unit_number = NEW.unit_number AND id != NEW.id) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'แต่ละส่วนงานสามารถมีหัวหน้าส่วนได้เพียงคนเดียวเท่านั้น';
    END IF;
    
    -- ตรวจสอบว่า supervisor ต้องมี seniority_order = 1
    IF NEW.role = 'supervisor' AND NEW.seniority_order != 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'หัวหน้าส่วนต้องมีลำดับอาวุโสเป็น 1 เสมอ';
    END IF;
END//

DELIMITER ;

-- ข้อมูลตัวอย่างสำหรับทดสอบ (ให้แก้ไข position_number ให้ตรงกับข้อมูลจริงในตาราง officers)
-- INSERT INTO unit_structure (position_number, unit_name, unit_number, role, seniority_order) VALUES
-- ('001', 'ศูนย์รักษาความปลอดภัย', 'dir1', 'director', 1),
-- ('002', 'ส่วนรักษาความปลอดภัยกลางวัน', 'cs01', 'supervisor', 1),
-- ('003', 'ส่วนรักษาความปลอดภัยกลางวัน', 'cs01', 'member', 2),
-- ('004', 'ส่วนรักษาความปลอดภัยกลางวัน', 'cs01', 'member', 3),
-- ('005', 'ส่วนรักษาความปลอดภัยกลางคืน', 'cs02', 'supervisor', 1),
-- ('006', 'ส่วนรักษาความปลอดภัยกลางคืน', 'cs02', 'member', 2);

-- คำสั่ง SQL สำหรับดูข้อมูลโครงสร้างส่วนงาน
-- SELECT 
--     us.*,
--     o.prefix,
--     o.firstname,
--     o.lastname,
--     o.rank,
--     CONCAT(o.prefix, ' ', o.firstname, ' ', o.lastname) as full_name
-- FROM unit_structure us
-- LEFT JOIN officers o ON us.position_number = o.position_number
-- ORDER BY 
--     CASE us.role 
--         WHEN 'director' THEN 1 
--         WHEN 'supervisor' THEN 2 
--         WHEN 'member' THEN 3 
--     END,
--     us.unit_number,
--     us.seniority_order;
