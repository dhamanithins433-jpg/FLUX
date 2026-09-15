import os
import sqlite3
import datetime
from pathlib import Path
from dotenv import load_dotenv

# Try importing mysql.connector
try:
    import mysql.connector
    from mysql.connector import errorcode
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'svcet_fees_portal')

class DatabaseManager:
    def __init__(self):
        self.use_mysql = False
        self.sqlite_path = BASE_DIR / 'college_portal.sqlite3'
        self.test_connection()

    def test_connection(self):
        if MYSQL_AVAILABLE:
            try:
                # Test MySQL connection
                conn = mysql.connector.connect(
                    host=DB_HOST,
                    port=DB_PORT,
                    user=DB_USER,
                    password=DB_PASSWORD,
                    connection_timeout=2
                )
                cursor = conn.cursor()
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
                conn.database = DB_NAME
                cursor.close()
                conn.close()
                self.use_mysql = True
                print(f"[Database] Connected to MySQL database '{DB_NAME}' successfully at {DB_HOST}:{DB_PORT}")
                return
            except Exception as e:
                print(f"[Database] MySQL connection attempt returned: {e}")
                print(f"[Database] Falling back seamlessly to local database: {self.sqlite_path}")
        else:
            print("[Database] mysql-connector-python not available, using SQLite.")
        self.use_mysql = False

    def get_connection(self):
        if self.use_mysql:
            try:
                conn = mysql.connector.connect(
                    host=DB_HOST,
                    port=DB_PORT,
                    user=DB_USER,
                    password=DB_PASSWORD,
                    database=DB_NAME
                )
                return conn
            except Exception as e:
                print(f"[Database] MySQL connection failed on request ({e}), falling back to SQLite.")
                self.use_mysql = False

        conn = sqlite3.connect(str(self.sqlite_path))
        conn.row_factory = sqlite3.Row
        return conn

    def execute_query(self, query, params=(), commit=False, fetch_one=False, fetch_all=False):
        conn = self.get_connection()
        cursor = conn.cursor()
        # Convert placeholders: MySQL uses %s, SQLite uses ?
        if self.use_mysql:
            mysql_query = query.replace('?', '%s')
            cursor.execute(mysql_query, params)
        else:
            sqlite_query = query.replace('%s', '?')
            cursor.execute(sqlite_query, params)

        data = None
        insert_id = None
        if fetch_one:
            row = cursor.fetchone()
            if row:
                if self.use_mysql:
                    columns = [col[0] for col in cursor.description]
                    data = dict(zip(columns, row))
                else:
                    data = dict(row)
        elif fetch_all:
            rows = cursor.fetchall()
            if self.use_mysql:
                columns = [col[0] for col in cursor.description]
                data = [dict(zip(columns, r)) for r in rows]
            else:
                data = [dict(r) for r in rows]

        if commit:
            conn.commit()
            insert_id = cursor.lastrowid

        cursor.close()
        conn.close()
        return data if (fetch_one or fetch_all) else insert_id

    def init_db(self):
        print("[Database] Initializing database schema...")
        conn = self.get_connection()
        cursor = conn.cursor()

        is_mysql = self.use_mysql
        auto_inc = "AUTO_INCREMENT" if is_mysql else "AUTOINCREMENT"

        schema = [
            f"""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY {auto_inc},
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
            )
            """,
            f"""
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY {auto_inc},
                register_no VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                department VARCHAR(100),
                year INT DEFAULT 1,
                semester INT DEFAULT 1,
                section VARCHAR(10) DEFAULT 'A',
                batch VARCHAR(20) DEFAULT '2024-2028',
                email VARCHAR(100),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            f"""
            CREATE TABLE IF NOT EXISTS teachers (
                id INTEGER PRIMARY KEY {auto_inc},
                faculty_id VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                department VARCHAR(100),
                email VARCHAR(100),
                designation VARCHAR(100)
            )
            """,
            f"""
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY {auto_inc},
                subject_code VARCHAR(20) UNIQUE NOT NULL,
                subject_name VARCHAR(100) NOT NULL,
                department VARCHAR(100),
                semester INT DEFAULT 1
            )
            """,
            f"""
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY {auto_inc},
                register_no VARCHAR(20) NOT NULL,
                date VARCHAR(10) NOT NULL,
                status VARCHAR(20) NOT NULL,
                subject_code VARCHAR(20),
                recorded_by VARCHAR(50),
                remarks VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            f"""
            CREATE TABLE IF NOT EXISTS marks (
                id INTEGER PRIMARY KEY {auto_inc},
                register_no VARCHAR(20) NOT NULL,
                subject_code VARCHAR(20) NOT NULL,
                exam_type VARCHAR(50) NOT NULL,
                marks_obtained DECIMAL(5,2) NOT NULL,
                max_marks DECIMAL(5,2) DEFAULT 100,
                grade VARCHAR(5),
                recorded_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            f"""
            CREATE TABLE IF NOT EXISTS fees (
                id INTEGER PRIMARY KEY {auto_inc},
                register_no VARCHAR(20) UNIQUE NOT NULL,
                tuition_fee DECIMAL(10,2) DEFAULT 0,
                exam_fee DECIMAL(10,2) DEFAULT 0,
                transport_fee DECIMAL(10,2) DEFAULT 0,
                hostel_fee DECIMAL(10,2) DEFAULT 0,
                other_fee DECIMAL(10,2) DEFAULT 0,
                paid_amount DECIMAL(10,2) DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            f"""
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY {auto_inc},
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
            )
            """,
            f"""
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY {auto_inc},
                name VARCHAR(150) NOT NULL,
                code VARCHAR(20) UNIQUE NOT NULL,
                department VARCHAR(100) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            f"""
            CREATE TABLE IF NOT EXISTS regulations (
                id INTEGER PRIMARY KEY {auto_inc},
                course_id INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(20) NOT NULL,
                year INT NOT NULL,
                description TEXT,
                is_active INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            f"""
            CREATE TABLE IF NOT EXISTS semesters (
                id INTEGER PRIMARY KEY {auto_inc},
                regulation_id INTEGER NOT NULL,
                semester_number INT NOT NULL,
                title VARCHAR(50) NOT NULL,
                academic_year VARCHAR(50)
            )
            """,
            f"""
            CREATE TABLE IF NOT EXISTS study_materials (
                id INTEGER PRIMARY KEY {auto_inc},
                subject_id INTEGER NOT NULL,
                title VARCHAR(255) NOT NULL,
                material_type VARCHAR(50) NOT NULL,
                unit VARCHAR(50),
                url TEXT NOT NULL,
                source VARCHAR(150),
                academic_year VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        ]

        for stmt in schema:
            cursor.execute(stmt)

        # Ensure subjects, students, and users have all required columns
        try:
            if is_mysql:
                # Subjects migrations
                for col_stmt in [
                    "ALTER TABLE subjects ADD COLUMN semester_id INT DEFAULT NULL",
                    "ALTER TABLE subjects ADD COLUMN credits INT DEFAULT 3",
                    "ALTER TABLE students ADD COLUMN semester INT DEFAULT 1",
                    "ALTER TABLE students ADD COLUMN section VARCHAR(10) DEFAULT 'A'",
                    "ALTER TABLE students ADD COLUMN batch VARCHAR(20) DEFAULT '2024-2028'",
                    "ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT ''",
                    "ALTER TABLE users ADD COLUMN batch VARCHAR(20) DEFAULT '2024-2028'",
                    "ALTER TABLE users ADD COLUMN year INT DEFAULT 1",
                    "ALTER TABLE users ADD COLUMN semester INT DEFAULT 1",
                    "ALTER TABLE users ADD COLUMN section VARCHAR(10) DEFAULT 'A'"
                ]:
                    try:
                        cursor.execute(col_stmt)
                    except Exception:
                        pass

                # Indexes
                for idx_stmt in [
                    "CREATE INDEX idx_students_reg ON students(register_no)",
                    "CREATE INDEX idx_users_uid ON users(user_id)",
                    "CREATE INDEX idx_att_reg ON attendance(register_no)",
                    "CREATE INDEX idx_marks_reg ON marks(register_no)",
                    "CREATE INDEX idx_fees_reg ON fees(register_no)",
                    "CREATE INDEX idx_pay_reg ON payments(register_no)"
                ]:
                    try:
                        cursor.execute(idx_stmt)
                    except Exception:
                        pass
            else:
                # SQLite column checks
                cursor.execute("PRAGMA table_info(subjects)")
                existing_cols_sub = [row[1] for row in cursor.fetchall()]
                if 'semester_id' not in existing_cols_sub:
                    cursor.execute("ALTER TABLE subjects ADD COLUMN semester_id INT DEFAULT NULL")
                if 'credits' not in existing_cols_sub:
                    cursor.execute("ALTER TABLE subjects ADD COLUMN credits INT DEFAULT 3")

                cursor.execute("PRAGMA table_info(students)")
                existing_cols_stu = [row[1] for row in cursor.fetchall()]
                if 'semester' not in existing_cols_stu:
                    cursor.execute("ALTER TABLE students ADD COLUMN semester INT DEFAULT 1")
                if 'section' not in existing_cols_stu:
                    cursor.execute("ALTER TABLE students ADD COLUMN section VARCHAR(10) DEFAULT 'A'")
                if 'batch' not in existing_cols_stu:
                    cursor.execute("ALTER TABLE students ADD COLUMN batch VARCHAR(20) DEFAULT '2024-2028'")

                cursor.execute("PRAGMA table_info(users)")
                existing_cols_usr = [row[1] for row in cursor.fetchall()]
                if 'phone' not in existing_cols_usr:
                    cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT ''")
                if 'batch' not in existing_cols_usr:
                    cursor.execute("ALTER TABLE users ADD COLUMN batch VARCHAR(20) DEFAULT '2024-2028'")
                if 'year' not in existing_cols_usr:
                    cursor.execute("ALTER TABLE users ADD COLUMN year INT DEFAULT 1")
                if 'semester' not in existing_cols_usr:
                    cursor.execute("ALTER TABLE users ADD COLUMN semester INT DEFAULT 1")
                if 'section' not in existing_cols_usr:
                    cursor.execute("ALTER TABLE users ADD COLUMN section VARCHAR(10) DEFAULT 'A'")

                # Indexes for SQLite
                for idx_stmt in [
                    "CREATE INDEX IF NOT EXISTS idx_students_reg ON students(register_no)",
                    "CREATE INDEX IF NOT EXISTS idx_users_uid ON users(user_id)",
                    "CREATE INDEX IF NOT EXISTS idx_att_reg ON attendance(register_no)",
                    "CREATE INDEX IF NOT EXISTS idx_marks_reg ON marks(register_no)",
                    "CREATE INDEX IF NOT EXISTS idx_fees_reg ON fees(register_no)",
                    "CREATE INDEX IF NOT EXISTS idx_pay_reg ON payments(register_no)"
                ]:
                    try:
                        cursor.execute(idx_stmt)
                    except Exception:
                        pass
        except Exception as err:
            print(f"[Database] Notice on schema migrations: {err}")

        conn.commit()
        cursor.close()
        conn.close()

        self.seed_data()

    def seed_data(self):
        from werkzeug.security import generate_password_hash

        # 1. Seed Users if empty
        users_count = self.execute_query("SELECT COUNT(*) as cnt FROM users", fetch_one=True)
        if users_count and users_count.get('cnt', 0) == 0:
            print("[Database] Seeding initial users...")
            demo_users = [
                # Admin
                ("Campus Administrator", "ADM001", "admin@svcet.edu.in", generate_password_hash("admin123"), "college", "Administration"),
                # Faculty
                ("prof. lokeshwaran K", "FAC001", "lokeshwaran@svcet.edu.in", generate_password_hash("faculty123"), "faculty", "Computer Science Engineering"),
                ("Prof. Mageshwari M", "FAC002", "Mageshwari@svcet.edu.in", generate_password_hash("faculty123"), "faculty", "Information Technology"),
                ("prof. Suresh Babu", "FAC003", "suresh@svcet.edu.in", generate_password_hash("faculty123"), "faculty", "Mechanical Engineering"),
                ("Prof. Latha S", "FAC004", "latha@svcet.edu.in", generate_password_hash("faculty123"), "faculty", "Electronics & Communication"),
                # Students
                ("Kishore", "SVCET001", "student1@svcet.edu.in", generate_password_hash("student123"), "student", "Computer Science Engineering"),
                ("Arun Kumar", "SVCET002", "student2@svcet.edu.in", generate_password_hash("student123"), "student", "Information Technology"),
                ("Rahul Raj", "SVCET003", "student3@svcet.edu.in", generate_password_hash("student123"), "student", "Computer Science Engineering"),
                ("Vijay Kumar", "SVCET004", "student4@svcet.edu.in", generate_password_hash("student123"), "student", "Mechanical Engineering"),
                ("Ajay Prakash", "SVCET005", "student5@svcet.edu.in", generate_password_hash("student123"), "student", "Electronics & Communication")
            ]
            for u in demo_users:
                self.execute_query(
                    "INSERT INTO users (name, user_id, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?, ?)",
                    u, commit=True
                )

        # 2. Seed Teacher
        teachers_count = self.execute_query("SELECT COUNT(*) as cnt FROM teachers", fetch_one=True)
        if teachers_count and teachers_count.get('cnt', 0) == 0:
            demo_teachers = [
                ("FAC001", "prof. lokeshwaran K", "Computer Science Engineering", "lokeshwaran@svcet.edu.in", "Head of Department"),
                ("FAC002", "Prof. Mageshwari M", "Information Technology", "Mageshwari@svcet.edu.in", "Assistant Professor"),
                ("FAC003", "prof. Suresh Babu", "Mechanical Engineering", "suresh@svcet.edu.in", "Associate Professor"),
                ("FAC004", "Prof. Latha S", "Electronics & Communication", "latha@svcet.edu.in", "Assistant Professor")
            ]
            for t in demo_teachers:
                self.execute_query(
                    "INSERT INTO teachers (faculty_id, name, department, email, designation) VALUES (?, ?, ?, ?, ?)",
                    t, commit=True
                )

        # 3. Seed Students
        students_count = self.execute_query("SELECT COUNT(*) as cnt FROM students", fetch_one=True)
        if students_count and students_count.get('cnt', 0) == 0:
            demo_students = [
                ("SVCET001", "Kishore", "Computer Science Engineering", 3, "student1@svcet.edu.in", "+91 9876543210"),
                ("SVCET002", "Arun Kumar", "Information Technology", 3, "student2@svcet.edu.in", "+91 9876543211"),
                ("SVCET003", "Rahul Raj", "Computer Science Engineering", 2, "student3@svcet.edu.in", "+91 9876543212"),
                ("SVCET004", "Vijay Kumar", "Mechanical Engineering", 4, "student4@svcet.edu.in", "+91 9876543213"),
                ("SVCET005", "Ajay Prakash", "Electronics & Communication", 3, "student5@svcet.edu.in", "+91 9876543214")
            ]
            for s in demo_students:
                self.execute_query(
                    "INSERT INTO students (register_no, name, department, year, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
                    s, commit=True
                )

        # 4. Seed Subjects
        subj_count = self.execute_query("SELECT COUNT(*) as cnt FROM subjects", fetch_one=True)
        if subj_count and subj_count.get('cnt', 0) == 0:
            demo_subjects = [
                ("CS3301", "Data Structures & Algorithms", "Computer Science Engineering", 3),
                ("CS3302", "Database Management Systems", "Computer Science Engineering", 3),
                ("CS3303", "Operating Systems", "Computer Science Engineering", 3),
                ("IT3301", "Web Technologies & Cloud", "Information Technology", 3),
                ("EC3301", "Digital Electronics & Signals", "Electronics & Communication", 3),
                ("ME3301", "Thermal Engineering", "Mechanical Engineering", 4)
            ]
            for sub in demo_subjects:
                self.execute_query(
                    "INSERT INTO subjects (subject_code, subject_name, department, semester) VALUES (?, ?, ?, ?)",
                    sub, commit=True
                )

        # 5. Seed Fees (Matching your exact svcet_fees_portal structure & records)
        fees_count = self.execute_query("SELECT COUNT(*) as cnt FROM fees", fetch_one=True)
        if fees_count and fees_count.get('cnt', 0) == 0:
            demo_fees = [
                ("SVCET001", 60000, 5000, 10000, 10000, 5000, 60000),
                ("SVCET002", 60000, 5000, 8000, 0, 3000, 50000),
                ("SVCET003", 55000, 5000, 10000, 10000, 2000, 40000),
                ("SVCET004", 58000, 5000, 0, 15000, 3000, 65000),
                ("SVCET005", 60000, 5000, 8000, 10000, 2000, 70000)
            ]
            for f in demo_fees:
                self.execute_query(
                    "INSERT INTO fees (register_no, tuition_fee, exam_fee, transport_fee, hostel_fee, other_fee, paid_amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    f, commit=True
                )

        # 6. Seed Attendance (past 5 working days)
        att_count = self.execute_query("SELECT COUNT(*) as cnt FROM attendance", fetch_one=True)
        if att_count and att_count.get('cnt', 0) == 0:
            today = datetime.date.today()
            reg_nos = ["SVCET001", "SVCET002", "SVCET003", "SVCET004", "SVCET005"]
            statuses = [
                ["Present", "Present", "Present", "Absent", "Present"],
                ["Present", "Late", "Present", "Present", "Present"],
                ["Present", "Present", "Absent", "Present", "Present"],
                ["Late", "Present", "Present", "Present", "Present"],
                ["Present", "Present", "Present", "Present", "Present"],
            ]
            for day_idx in range(5):
                att_date = (today - datetime.timedelta(days=(5 - day_idx))).strftime('%Y-%m-%d')
                for s_idx, reg_no in enumerate(reg_nos):
                    status = statuses[day_idx][s_idx]
                    self.execute_query(
                        "INSERT INTO attendance (register_no, date, status, subject_code, recorded_by, remarks) VALUES (?, ?, ?, ?, ?, ?)",
                        (reg_no, att_date, status, "CS3301", "FAC001", "Regular lecture session"),
                        commit=True
                    )

        # 7. Seed Marks
        marks_count = self.execute_query("SELECT COUNT(*) as cnt FROM marks", fetch_one=True)
        if marks_count and marks_count.get('cnt', 0) == 0:
            demo_marks = [
                ("SVCET001", "CS3301", "Internal Assessment 1", 88.0, 100.0, "A+", "FAC001"),
                ("SVCET001", "CS3302", "Internal Assessment 1", 94.0, 100.0, "O", "FAC001"),
                ("SVCET001", "CS3303", "Internal Assessment 1", 82.0, 100.0, "A", "FAC001"),
                ("SVCET002", "CS3301", "Internal Assessment 1", 76.0, 100.0, "B+", "FAC001"),
                ("SVCET002", "IT3301", "Internal Assessment 1", 85.0, 100.0, "A", "FAC002"),
                ("SVCET003", "CS3301", "Internal Assessment 1", 91.0, 100.0, "O", "FAC001"),
                ("SVCET004", "ME3301", "Internal Assessment 1", 79.0, 100.0, "B+", "FAC003"),
                ("SVCET005", "EC3301", "Internal Assessment 1", 84.0, 100.0, "A", "FAC004"),
            ]
            for m in demo_marks:
                self.execute_query(
                    "INSERT INTO marks (register_no, subject_code, exam_type, marks_obtained, max_marks, grade, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    m, commit=True
                )

        # 8. Seed Initial Payment History
        pay_count = self.execute_query("SELECT COUNT(*) as cnt FROM payments", fetch_one=True)
        if pay_count and pay_count.get('cnt', 0) == 0:
            demo_payments = [
                ("REC-2026-001", "TXN-SVCET-9901", "SVCET001", 60000.0, "Cash", "offline", "Success", "ADM001", "Initial semester tuition deposit"),
                ("REC-2026-002", "TXN-SVCET-9902", "SVCET002", 50000.0, "Cheque", "offline", "Success", "ADM001", "Cheque #40291 HDFC Bank"),
                ("REC-2026-003", "TXN-SVCET-9903", "SVCET003", 40000.0, "Demand Draft", "offline", "Success", "ADM001", "DD #8812 SBI Bank"),
                ("REC-2026-004", "TXN-SVCET-9904", "SVCET004", 65000.0, "Cash", "offline", "Success", "ADM001", "Hostel & Tuition fee"),
                ("REC-2026-005", "TXN-SVCET-9905", "SVCET005", 70000.0, "Cash", "offline", "Success", "ADM001", "Annual fee installment")
            ]
            for p in demo_payments:
                self.execute_query(
                    "INSERT INTO payments (receipt_no, transaction_id, register_no, amount, payment_method, payment_type, status, collected_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    p, commit=True
                )

        # 9. Seed Courses, Regulations, and Semesters
        cse_course = self.execute_query("SELECT * FROM courses WHERE code = ?", ("CSE",), fetch_one=True)
        if not cse_course:
            print("[Database] Seeding Computer Science and Engineering course...")
            cse_id = self.execute_query(
                """
                INSERT INTO courses (name, code, department, description)
                VALUES (?, ?, ?, ?)
                """,
                (
                    "Computer Science and Engineering (CSE)",
                    "CSE",
                    "Computer Science Engineering",
                    "Pioneering computational thinking, algorithms, artificial intelligence, cloud architectures, cybersecurity, and modern software engineering under Anna University curriculum."
                ),
                commit=True
            )
        else:
            cse_id = cse_course['id']

        # Seed Regulations for CSE
        reg_2021 = self.execute_query("SELECT * FROM regulations WHERE course_id = ? AND code = ?", (cse_id, "R2021"), fetch_one=True)
        if not reg_2021:
            reg_2021_id = self.execute_query(
                """
                INSERT INTO regulations (course_id, name, code, year, description, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    cse_id,
                    "Regulation 2021",
                    "R2021",
                    2021,
                    "Anna University CBCS Curriculum with verified semester courses, unit-wise notes, and authentic academic resources.",
                    1
                ),
                commit=True
            )
        else:
            reg_2021_id = reg_2021['id']

        reg_2025 = self.execute_query("SELECT * FROM regulations WHERE course_id = ? AND code = ?", (cse_id, "R2025"), fetch_one=True)
        if not reg_2025:
            reg_2025_id = self.execute_query(
                """
                INSERT INTO regulations (course_id, name, code, year, description, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    cse_id,
                    "Regulation 2025",
                    "R2025",
                    2025,
                    "Next-generation Industry 5.0 & AI-integrated Curriculum (Syllabus and Course Modules in active preparation).",
                    1
                ),
                commit=True
            )
        else:
            reg_2025_id = reg_2025['id']

        # Seed Semesters 1 to 8 for Regulation 2021
        r2021_sem_map = {}
        for sem_num in range(1, 9):
            sem_record = self.execute_query(
                "SELECT * FROM semesters WHERE regulation_id = ? AND semester_number = ?",
                (reg_2021_id, sem_num), fetch_one=True
            )
            year_name = "First Year" if sem_num in (1, 2) else "Second Year" if sem_num in (3, 4) else "Third Year" if sem_num in (5, 6) else "Final Year"
            if not sem_record:
                sem_id = self.execute_query(
                    """
                    INSERT INTO semesters (regulation_id, semester_number, title, academic_year)
                    VALUES (?, ?, ?, ?)
                    """,
                    (reg_2021_id, sem_num, f"Semester {sem_num}", year_name),
                    commit=True
                )
                r2021_sem_map[sem_num] = sem_id
            else:
                r2021_sem_map[sem_num] = sem_record['id']

        # Seed Semesters 1 to 8 for Regulation 2025 (architecture ready)
        for sem_num in range(1, 9):
            sem_record = self.execute_query(
                "SELECT * FROM semesters WHERE regulation_id = ? AND semester_number = ?",
                (reg_2025_id, sem_num), fetch_one=True
            )
            year_name = "First Year" if sem_num in (1, 2) else "Second Year" if sem_num in (3, 4) else "Third Year" if sem_num in (5, 6) else "Final Year"
            if not sem_record:
                self.execute_query(
                    """
                    INSERT INTO semesters (regulation_id, semester_number, title, academic_year)
                    VALUES (?, ?, ?, ?)
                    """,
                    (reg_2025_id, sem_num, f"Semester {sem_num}", year_name),
                    commit=True
                )

        # 10. Seed Official Anna University Regulation 2021 CSE Subjects (Semesters 1-8)
        # Format: (code, name, semester_number, credits)
        official_cse_subjects = [
            # Semester 1
            ("HS3152", "Professional English - I", 1, 3),
            ("MA3151", "Matrices and Calculus", 1, 4),
            ("PH3151", "Engineering Physics", 1, 3),
            ("CY3151", "Engineering Chemistry", 1, 3),
            ("GE3151", "Problem Solving and Python Programming", 1, 3),
            ("GE3152", "Heritage of Tamils (தமிழர் மரபு)", 1, 1),
            # Semester 2
            ("HS3252", "Professional English - II", 2, 2),
            ("MA3251", "Statistics and Numerical Methods", 2, 4),
            ("PH3256", "Physics for Information Science", 2, 3),
            ("BE3251", "Basic Electrical and Electronics Engineering", 2, 3),
            ("GE3251", "Engineering Graphics", 2, 4),
            ("CS3251", "Programming in C", 2, 3),
            ("GE3252", "Tamils and Technology (தமிழரும் தொழில்நுட்பமும்)", 2, 1),
            # Semester 3
            ("MA3354", "Discrete Mathematics", 3, 4),
            ("CS3351", "Digital Principles and Computer Organization", 3, 4),
            ("CS3352", "Foundations of Data Science", 3, 3),
            ("CS3301", "Data Structures", 3, 3),
            ("CS3391", "Object Oriented Programming", 3, 3),
            # Semester 4
            ("CS3452", "Theory of Computation", 4, 3),
            ("CS3491", "Artificial Intelligence and Machine Learning", 4, 4),
            ("CS3492", "Database Management Systems", 4, 3),
            ("CS3401", "Algorithms", 4, 4),
            ("CS3451", "Introduction to Operating Systems", 4, 3),
            ("GE3451", "Environmental Sciences and Sustainability", 4, 2),
            # Semester 5
            ("CS3591", "Computer Networks", 5, 4),
            ("CS3501", "Compiler Design", 5, 4),
            ("CB3491", "Cryptography and Cyber Security", 5, 3),
            ("CS3551", "Distributed Computing", 5, 3),
            ("CCS334", "Big Data Analytics", 5, 3),
            # Semester 6
            ("CCS356", "Object Oriented Software Engineering", 6, 4),
            ("CS3691", "Embedded Systems and IoT", 6, 4),
            ("CCS338", "Computer Vision", 6, 3),
            ("CCS346", "Cloud Computing", 6, 3),
            # Semester 7
            ("GE3791", "Human Values and Ethics", 7, 2),
            ("GE3751", "Principles of Management", 7, 3),
            ("CS3701", "Deep Learning", 7, 3),
            ("CS3711", "Summer Internship / Industry Project", 7, 2),
            # Semester 8
            ("CS3811", "Project Work / Internship", 8, 10),
            ("CCS370", "Quantum Computing", 8, 3)
        ]

        for code, name, sem_num, creds in official_cse_subjects:
            sem_id = r2021_sem_map.get(sem_num)
            existing_sub = self.execute_query("SELECT id FROM subjects WHERE subject_code = ?", (code,), fetch_one=True)
            if existing_sub:
                self.execute_query(
                    "UPDATE subjects SET subject_name = ?, semester_id = ?, credits = ?, department = ?, semester = ? WHERE subject_code = ?",
                    (name, sem_id, creds, "Computer Science Engineering", sem_num, code),
                    commit=True
                )
            else:
                self.execute_query(
                    "INSERT INTO subjects (subject_code, subject_name, department, semester, semester_id, credits) VALUES (?, ?, ?, ?, ?, ?)",
                    (code, name, "Computer Science Engineering", sem_num, sem_id, creds),
                    commit=True
                )

        # 11. Seed High-Quality Verified Study Materials
        # Check if materials exist for CS3452
        toc_sub = self.execute_query("SELECT id FROM subjects WHERE subject_code = 'CS3452'", fetch_one=True)
        if toc_sub:
            toc_id = toc_sub['id']
            mat_count = self.execute_query("SELECT COUNT(*) as c FROM study_materials WHERE subject_id = ?", (toc_id,), fetch_one=True)['c']
            if mat_count == 0:
                print("[Database] Seeding verified study materials for CS3452 Theory of Computation...")
                materials_data = [
                    # Syllabus
                    (toc_id, "Anna University Regulation 2021 B.E. CSE Official Syllabus Copy", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/IandC/B.E.CSE.pdf", "Anna University Centre for Academic Courses", "2021-26"),
                    # Lecture Notes
                    (toc_id, "Unit 1: Automata and Regular Expressions (DFA, NFA, Epsilon Transitions)", "Lecture Notes", "Unit 1", "https://www.brainkart.com/subject/Theory-of-Computation_410/", "BrainKart & Affiliated Faculty", "2024"),
                    (toc_id, "Unit 2: Regular Expressions, Languages and Pumping Lemma", "Lecture Notes", "Unit 2", "https://www.brainkart.com/subject/Theory-of-Computation_410/", "BrainKart & Affiliated Faculty", "2024"),
                    (toc_id, "Unit 3: Context-Free Grammar (CFG) and Pushdown Automata (PDA)", "Lecture Notes", "Unit 3", "https://www.brainkart.com/subject/Theory-of-Computation_410/", "BrainKart & Affiliated Faculty", "2024"),
                    (toc_id, "Unit 4: Normal Forms (CNF, GNF) and Turing Machines", "Lecture Notes", "Unit 4", "https://www.brainkart.com/subject/Theory-of-Computation_410/", "BrainKart & Affiliated Faculty", "2024"),
                    (toc_id, "Unit 5: Undecidability, Post Correspondence Problem & NP-Completeness", "Lecture Notes", "Unit 5", "https://www.brainkart.com/subject/Theory-of-Computation_410/", "BrainKart & Affiliated Faculty", "2024"),
                    # Important Questions
                    (toc_id, "CS3452 Unit-Wise 2-Mark & 13/16-Mark Question Bank with Solutions", "Important Questions", "All Units", "https://www.brainkart.com/subject/Theory-of-Computation_410/", "Anna University Faculty Solved Bank", "2024"),
                    (toc_id, "High Probability Examination Problems: DFA/NFA Conversions & Grammars", "Important Questions", "Unit 1 & 2", "https://www.geeksforgeeks.org/introduction-of-theory-of-computation/", "GeeksforGeeks CS Portal", "2024"),
                    # Normal Notes
                    (toc_id, "Comprehensive Automata Theory & Computation Notes", "Normal Notes", "All Units", "https://www.geeksforgeeks.org/introduction-of-theory-of-computation/", "GeeksforGeeks Learning", "2024"),
                    # Question Papers
                    (toc_id, "Anna University End-Semester Previous Year Question Paper Bank (2022-2024)", "Question Paper", "All Units", "https://www.brainkart.com/subject/Theory-of-Computation_410/", "BrainKart Question Archive", "2023-2024"),
                    # Video Lectures
                    (toc_id, "Complete Theory of Computation & Automata Video Lecture Series", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgp46KUv4ZY64ZXmnwLcbcM", "Neso Academy (YouTube)", "2023"),
                    (toc_id, "Theory of Computation (TOC) Full Course Playlist with Solved Problems", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFM9Lj5G9G_76adtyb4ef6i", "Gate Smashers (YouTube)", "2023"),
                    # Useful Resources
                    (toc_id, "NPTEL IIT Kanpur: Theory of Computation National Course Archive", "Useful Resources", "All Units", "https://nptel.ac.in/courses/106104028", "NPTEL Ministry of Education", "2023"),
                    (toc_id, "JFLAP: Interactive Formal Languages and Automata Simulation Software", "Useful Resources", "Software Tool", "http://www.jflap.org/", "Duke University / JFLAP", "2024")
                ]
                for m in materials_data:
                    self.execute_query(
                        """
                        INSERT INTO study_materials (subject_id, title, material_type, unit, url, source, academic_year)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        m, commit=True
                    )

        # Seed CS3401 Algorithms
        algo_sub = self.execute_query("SELECT id FROM subjects WHERE subject_code = 'CS3401'", fetch_one=True)
        if algo_sub:
            algo_id = algo_sub['id']
            if self.execute_query("SELECT COUNT(*) as c FROM study_materials WHERE subject_id = ?", (algo_id,), fetch_one=True)['c'] == 0:
                print("[Database] Seeding verified study materials for CS3401 Algorithms...")
                algo_materials = [
                    (algo_id, "Anna University Regulation 2021 B.E. CSE Syllabus (CS3401)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/IandC/B.E.CSE.pdf", "Anna University Centre for Academic Courses", "2021-26"),
                    (algo_id, "Design and Analysis of Algorithms Full Lecture Playlist", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiHcmS4i14bI0VrMbZTUvlTa", "Gate Smashers (YouTube)", "2023"),
                    (algo_id, "Algorithms and Complexity Theory Video Tutorials", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLBlnK6fEyqRj9lld8sWIUNwlKfdUoPd1Y", "Neso Academy (YouTube)", "2023"),
                    (algo_id, "Comprehensive Algorithms: Dynamic Programming, Greedy & Graphs", "Normal Notes", "All Units", "https://www.geeksforgeeks.org/fundamentals-of-algorithms/", "GeeksforGeeks", "2024"),
                    (algo_id, "NPTEL IIT Madras: Design and Analysis of Algorithms Online Course", "Useful Resources", "All Units", "https://nptel.ac.in/courses/106106131", "NPTEL", "2023")
                ]
                for m in algo_materials:
                    self.execute_query("INSERT INTO study_materials (subject_id, title, material_type, unit, url, source, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?)", m, commit=True)

        # Seed CS3492 Database Management Systems
        dbms_sub = self.execute_query("SELECT id FROM subjects WHERE subject_code = 'CS3492'", fetch_one=True)
        if dbms_sub:
            dbms_id = dbms_sub['id']
            if self.execute_query("SELECT COUNT(*) as c FROM study_materials WHERE subject_id = ?", (dbms_id,), fetch_one=True)['c'] == 0:
                print("[Database] Seeding verified study materials for CS3492 DBMS...")
                dbms_materials = [
                    (dbms_id, "Anna University Regulation 2021 B.E. CSE Syllabus (CS3492)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/IandC/B.E.CSE.pdf", "Anna University Centre for Academic Courses", "2021-26"),
                    (dbms_id, "Database Management Systems Complete Course Video Series", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8C9ExFgQb5OTDZvTC", "Gate Smashers (YouTube)", "2023"),
                    (dbms_id, "Relational Models, SQL, Normalization & Transactions Tutorials", "Normal Notes", "All Units", "https://www.geeksforgeeks.org/dbms/", "GeeksforGeeks", "2024"),
                    (dbms_id, "NPTEL IIT Kharagpur: Database Management Systems Course", "Useful Resources", "All Units", "https://nptel.ac.in/courses/106105175", "NPTEL", "2023")
                ]
                for m in dbms_materials:
                    self.execute_query("INSERT INTO study_materials (subject_id, title, material_type, unit, url, source, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?)", m, commit=True)

        # Seed CS3591 Computer Networks
        cn_sub = self.execute_query("SELECT id FROM subjects WHERE subject_code = 'CS3591'", fetch_one=True)
        if cn_sub:
            cn_id = cn_sub['id']
            if self.execute_query("SELECT COUNT(*) as c FROM study_materials WHERE subject_id = ?", (cn_id,), fetch_one=True)['c'] == 0:
                print("[Database] Seeding verified study materials for CS3591 Computer Networks...")
                cn_materials = [
                    (cn_id, "Anna University Regulation 2021 B.E. CSE Syllabus (CS3591)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/IandC/B.E.CSE.pdf", "Anna University Centre for Academic Courses", "2021-26"),
                    (cn_id, "Computer Networks Complete Video Lecture Course", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_", "Gate Smashers (YouTube)", "2023"),
                    (cn_id, "Computer Network Protocols, OSI Model & Routing Tutorials", "Normal Notes", "All Units", "https://www.geeksforgeeks.org/computer-network-tutorials/", "GeeksforGeeks", "2024")
                ]
                for m in cn_materials:
                    self.execute_query("INSERT INTO study_materials (subject_id, title, material_type, unit, url, source, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?)", m, commit=True)

        # Seed CS3301 Data Structures
        ds_sub = self.execute_query("SELECT id FROM subjects WHERE subject_code = 'CS3301'", fetch_one=True)
        if ds_sub:
            ds_id = ds_sub['id']
            if self.execute_query("SELECT COUNT(*) as c FROM study_materials WHERE subject_id = ?", (ds_id,), fetch_one=True)['c'] == 0:
                print("[Database] Seeding verified study materials for CS3301 Data Structures...")
                ds_materials = [
                    (ds_id, "Anna University Regulation 2021 B.E. CSE Syllabus (CS3301)", "Syllabus", "All Units", "https://cac.annauniv.edu/aidetails/afug_2021_fu/Revised/IandC/B.E.CSE.pdf", "Anna University Centre for Academic Courses", "2021-26"),
                    (ds_id, "Data Structures and Algorithms Video Tutorials", "Video Lecture", "All Units", "https://www.youtube.com/playlist?list=PLxCzCOWd7aiEwaANNt3wiohZV4L1uciSm", "Gate Smashers (YouTube)", "2023"),
                    (ds_id, "Data Structures Documentation & Implementations", "Normal Notes", "All Units", "https://www.geeksforgeeks.org/data-structures/", "GeeksforGeeks", "2024")
                ]
                for m in ds_materials:
                    self.execute_query("INSERT INTO study_materials (subject_id, title, material_type, unit, url, source, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?)", m, commit=True)

        print("[Database] Schema and seed data successfully verified.")

db = DatabaseManager()
if __name__ == '__main__':
    db.init_db()
