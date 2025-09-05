-- สร้างตาราง duty_schedule สำหรับจัดการตารางเวร
CREATE TABLE IF NOT EXISTS duty_schedule (
    duty_id SERIAL PRIMARY KEY,               -- รหัสเวร (Auto Increment)
    duty_date DATE NOT NULL,                  -- วันที่เข้าเวร
    officer_id INT NOT NULL,                  -- รหัสเจ้าหน้าที่ที่เข้าเวรโดยดึงจากตาราง unit_structure คอลั่ม position_number	
    dutyhead INT NOT NULL,                    -- ผู้ควบคุมดูแลเวรโดยใช้เป็นรหัส unit_code เพราะจะต้องเรียงลำดับอาวุโสถ้ากำหนดบุคคลถ้ามีคนลาจะเกิดปัญหา
    shift_type VARCHAR(10) NOT NULL CHECK (shift_type IN ('day', 'night')), -- ช่วงเวลา: 'day' หรือ 'night'
    day_type VARCHAR(20) NOT NULL CHECK (day_type IN ('normal', 'holiday')), -- ประเภทวัน: 'normal' หรือ 'holiday'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- วันที่บันทึก
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- วันที่แก้ไขล่าสุด
);

-- สร้าง index สำหรับการค้นหาที่มีประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_duty_schedule_date ON duty_schedule(duty_date);
CREATE INDEX IF NOT EXISTS idx_duty_schedule_officer ON duty_schedule(officer_id);
CREATE INDEX IF NOT EXISTS idx_duty_schedule_dutyhead ON duty_schedule(dutyhead);
CREATE INDEX IF NOT EXISTS idx_duty_schedule_shift ON duty_schedule(shift_type);
CREATE INDEX IF NOT EXISTS idx_duty_schedule_composite ON duty_schedule(duty_date, officer_id, shift_type);

-- สร้าง unique constraint เพื่อป้องกันการซ้ำกันของเวร
ALTER TABLE duty_schedule ADD CONSTRAINT unique_officer_duty 
UNIQUE (duty_date, officer_id, shift_type);

-- เพิ่ม comment สำหรับตาราง
COMMENT ON TABLE duty_schedule IS 'ตารางเก็บข้อมูลการจัดเวรรักษาการ';
COMMENT ON COLUMN duty_schedule.duty_id IS 'รหัสเวร (Primary Key)';
COMMENT ON COLUMN duty_schedule.duty_date IS 'วันที่เข้าเวร';
COMMENT ON COLUMN duty_schedule.officer_id IS 'รหัสเจ้าหน้าที่ (อ้างอิงจาก unit_structure.position_number)';
COMMENT ON COLUMN duty_schedule.dutyhead IS 'หัวหน้าเวร (อ้างอิงจาก units.unit_code)';
COMMENT ON COLUMN duty_schedule.shift_type IS 'ช่วงเวลา: day (08:30-16:30) หรือ night (16:30-08:30)';
COMMENT ON COLUMN duty_schedule.day_type IS 'ประเภทวัน: normal (วันทำการ) หรือ holiday (วันหยุด)';
COMMENT ON COLUMN duty_schedule.created_at IS 'วันที่สร้างข้อมูล';
COMMENT ON COLUMN duty_schedule.updated_at IS 'วันที่แก้ไขข้อมูลล่าสุด';

-- สร้าง trigger สำหรับอัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_duty_schedule_updated_at 
BEFORE UPDATE ON duty_schedule 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ตัวอย่างข้อมูลสำหรับทดสอบ (ปรับแต่งตามข้อมูลจริง)
-- INSERT INTO duty_schedule (duty_date, officer_id, dutyhead, shift_type, day_type) VALUES
-- ('2024-09-01', 12345, 101, 'day', 'normal'),
-- ('2024-09-01', 12346, 101, 'night', 'normal'),
-- ('2024-09-02', 12347, 102, 'day', 'holiday'),
-- ('2024-09-02', 12348, 102, 'night', 'holiday');
