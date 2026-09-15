-- =============================================================================
-- SVCET COLLEGE PORTAL - MySQL DATABASE MIGRATION & SCHEMA UPGRADE SCRIPT
-- Database: svcet_fees_portal
-- =============================================================================

CREATE DATABASE IF NOT EXISTS svcet_fees_portal;
USE svcet_fees_portal;

-- 1. USERS TABLE (Unified Authentication & Role Control)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(20) DEFAULT '',
    batch VARCHAR(20) DEFAULT '2024-2028',
    year INT DEFAULT 1,
    semester INT DEFAULT 1,
    section VARCHAR(10) DEFAULT 'A',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. STUDENTS TABLE (Official Academic Profile & Register Records)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year INT DEFAULT 1,
    semester INT DEFAULT 1,
    section VARCHAR(10) DEFAULT 'A',
    batch VARCHAR(20) DEFAULT '2024-2028',
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TEACHERS TABLE (Faculty Directory)
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    designation VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. SUBJECTS TABLE (Academic Curriculum & Semester Courses)
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INT DEFAULT 1,
    semester_id INT DEFAULT NULL,
    credits INT DEFAULT 3
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ATTENDANCE TABLE (Daily Lecture Attendance Logs)
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_no VARCHAR(20) NOT NULL,
    date VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    subject_code VARCHAR(20),
    recorded_by VARCHAR(50),
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. MARKS TABLE (Assessment & Examination Marks)
CREATE TABLE IF NOT EXISTS marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_no VARCHAR(20) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    max_marks DECIMAL(5,2) DEFAULT 100.00,
    grade VARCHAR(5),
    recorded_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. FEES TABLE (Annual Student Fee Structure & Ledger)
CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_no VARCHAR(20) UNIQUE NOT NULL,
    tuition_fee DECIMAL(10,2) DEFAULT 0.00,
    exam_fee DECIMAL(10,2) DEFAULT 0.00,
    transport_fee DECIMAL(10,2) DEFAULT 0.00,
    hostel_fee DECIMAL(10,2) DEFAULT 0.00,
    other_fee DECIMAL(10,2) DEFAULT 0.00,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. PAYMENTS TABLE (Transaction Records & Invoices)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    register_no VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Success',
    collected_by VARCHAR(50),
    notes VARCHAR(255),
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
-- SAFE COLUMN MIGRATIONS (Applies if tables already exist from previous versions)
-- -----------------------------------------------------------------------------

-- Alter students
ALTER TABLE students ADD COLUMN IF NOT EXISTS semester INT DEFAULT 1;
ALTER TABLE students ADD COLUMN IF NOT EXISTS section VARCHAR(10) DEFAULT 'A';
ALTER TABLE students ADD COLUMN IF NOT EXISTS batch VARCHAR(20) DEFAULT '2024-2028';

-- Alter users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS batch VARCHAR(20) DEFAULT '2024-2028';
ALTER TABLE users ADD COLUMN IF NOT EXISTS year INT DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS semester INT DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS section VARCHAR(10) DEFAULT 'A';

-- Alter subjects
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS semester_id INT DEFAULT NULL;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS credits INT DEFAULT 3;

-- -----------------------------------------------------------------------------
-- INDEXES FOR DATA ISOLATION & HIGH QUERY PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_reg ON students(register_no);
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_att_reg ON attendance(register_no);
CREATE INDEX IF NOT EXISTS idx_marks_reg ON marks(register_no);
CREATE INDEX IF NOT EXISTS idx_fees_reg ON fees(register_no);
CREATE INDEX IF NOT EXISTS idx_pay_reg ON payments(register_no);
