import os
import uuid
import datetime
import jwt
import csv
import io
from functools import wraps
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

from db import db

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

PORT = int(os.getenv('PORT', 5001))
JWT_SECRET = os.getenv('JWT_SECRET', 'svcet_flux_secret_key_2026_jwt')

def create_token(user):
    payload = {
        'id': user['id'],
        'user_id': user['user_id'],
        'register_no': user['user_id'],
        'faculty_id': user.get('faculty_id') or user['user_id'],
        'name': user['name'],
        'role': user['role'],
        'department': user.get('department', ''),
        'designation': user.get('designation', ''),
        'year': user.get('year', 1),
        'semester': user.get('semester', 1),
        'section': user.get('section', 'A'),
        'batch': user.get('batch', '2024-2028'),
        'phone': user.get('phone', ''),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def token_required(allowed_roles=None):
    """
    Role-based authentication decorator.
    Verifies JWT token from Authorization: Bearer <token> or query param.
    Injects decoded user payload as the first argument to the route handler.
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get('Authorization', '')
            token = None
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            elif request.args.get('token'):
                token = request.args.get('token')

            if not token:
                return jsonify({'message': 'Authentication token is required'}), 401

            try:
                current_user = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Session expired. Please log in again.'}), 401
            except Exception:
                return jsonify({'message': 'Invalid authentication token'}), 401

            if allowed_roles:
                user_role = current_user.get('role', '').lower()
                matched = False
                for role in allowed_roles:
                    r = role.lower()
                    if r == user_role or (r in ('admin', 'college') and user_role in ('admin', 'college')):
                        matched = True
                        break
                if not matched:
                    return jsonify({'message': f"Access forbidden: User role '{user_role}' cannot access this resource."}), 403

            return f(current_user, *args, **kwargs)
        return decorated
    return decorator

def get_optional_auth_user():
    """Helper to extract user token if present without forcing 401 (for legacy routes)"""
    auth_header = request.headers.get('Authorization', '')
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    elif request.args.get('token'):
        token = request.args.get('token')

    if not token:
        return None
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except Exception:
        return None

def calculate_grade(marks_obtained, max_marks=100):
    try:
        pct = (float(marks_obtained) / float(max_marks)) * 100
    except (ZeroDivisionError, ValueError, TypeError):
        return 'RA'
    if pct >= 90:
        return 'O'
    elif pct >= 80:
        return 'A+'
    elif pct >= 70:
        return 'A'
    elif pct >= 60:
        return 'B+'
    elif pct >= 50:
        return 'B'
    else:
        return 'RA'

# ----------------- AUTH ENDPOINTS -----------------

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        register_number = data.get('registerNumber', '').strip()
        department = data.get('department', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'student').strip()

        if not name or not register_number or not department or not email or not password:
            return jsonify({'message': 'All fields are required'}), 400

        existing = db.execute_query(
            "SELECT id FROM users WHERE user_id = ? OR email = ?",
            (register_number, email), fetch_one=True
        )
        if existing:
            return jsonify({'message': 'Email or Register Number already registered'}), 409

        hashed_pw = generate_password_hash(password)

        db.execute_query(
            "INSERT INTO users (name, user_id, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?, ?)",
            (name, register_number, email, hashed_pw, role, department),
            commit=True
        )

        if role == 'student':
            db.execute_query(
                "INSERT INTO students (register_no, name, department, year, email, phone) VALUES (?, ?, ?, ?, ?, ?)",
                (register_number, name, department, 1, email, ''),
                commit=True
            )
            db.execute_query(
                "INSERT INTO fees (register_no, tuition_fee, exam_fee, transport_fee, hostel_fee, other_fee, paid_amount) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (register_number, 60000, 5000, 8000, 0, 2000, 0),
                commit=True
            )

        return jsonify({'message': 'Account created successfully'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        user_id = data.get('userId') or data.get('registerNumber') or data.get('user_id') or data.get('username') or ''
        user_id = user_id.strip()
        password = data.get('password', '')
        selected_role = data.get('role', '').strip()

        if not user_id or not password:
            return jsonify({'message': 'User ID and Password are required'}), 400

        query = "SELECT * FROM users WHERE LOWER(user_id) = LOWER(?)"
        params = [user_id]
        if selected_role:
            query += " AND LOWER(role) = LOWER(?)"
            params.append(selected_role)

        user = db.execute_query(query, params, fetch_one=True)
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'message': 'Invalid credentials. Please check your Register Number / ID and Password.'}), 401

        # Fetch student or teacher record depending on role
        student_rec = None
        teacher_rec = None
        if user['role'] == 'student':
            student_rec = db.execute_query("SELECT * FROM students WHERE register_no = ?", (user['user_id'],), fetch_one=True)
        elif user['role'] == 'faculty':
            teacher_rec = db.execute_query("SELECT * FROM teachers WHERE faculty_id = ?", (user['user_id'],), fetch_one=True)

        user_for_token = dict(user)
        if student_rec:
            for k in ('year', 'semester', 'section', 'batch', 'phone'):
                if student_rec.get(k) is not None:
                    user_for_token[k] = student_rec[k]
        elif teacher_rec:
            for k in ('designation', 'phone', 'department'):
                if teacher_rec.get(k) is not None:
                    user_for_token[k] = teacher_rec[k]

        token = create_token(user_for_token)
        user_info = {
            'id': user['id'],
            'name': (teacher_rec and teacher_rec.get('name')) or user['name'],
            'userId': user['user_id'],
            'register_no': user['user_id'],
            'faculty_id': user['user_id'],
            'email': (teacher_rec and teacher_rec.get('email')) or user['email'],
            'role': user['role'],
            'department': (teacher_rec and teacher_rec.get('department')) or user.get('department', ''),
            'designation': (teacher_rec and teacher_rec.get('designation')) or user.get('designation', 'Faculty Member'),
            'year': (student_rec and student_rec.get('year')) or user.get('year', 1),
            'semester': (student_rec and student_rec.get('semester')) or user.get('semester', 1),
            'section': (student_rec and student_rec.get('section')) or user.get('section', 'A'),
            'batch': (student_rec and student_rec.get('batch')) or user.get('batch', '2024-2028'),
            'phone': (teacher_rec and teacher_rec.get('phone')) or (student_rec and student_rec.get('phone')) or user.get('phone', '')
        }
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user_info
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401
    token = auth_header.split(' ')[1]
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return jsonify({'user': decoded}), 200
    except Exception:
        return jsonify({'message': 'Invalid token'}), 401

# ----------------- DIRECTORY DATA -----------------

@app.route('/api/students', methods=['GET'])
def get_students():
    dept = request.args.get('department')
    year = request.args.get('year')
    query = "SELECT * FROM students WHERE 1=1"
    params = []
    if dept:
        query += " AND department = ?"
        params.append(dept)
    if year:
        query += " AND year = ?"
        params.append(year)
    query += " ORDER BY register_no ASC"
    students = db.execute_query(query, params, fetch_all=True)
    return jsonify({'students': students}), 200

@app.route('/api/teachers', methods=['GET'])
def get_teachers():
    teachers = db.execute_query("SELECT * FROM teachers ORDER BY name ASC", fetch_all=True)
    return jsonify({'teachers': teachers}), 200

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    dept = request.args.get('department')
    semester = request.args.get('semester')
    query = "SELECT * FROM subjects WHERE 1=1"
    params = []
    if dept:
        query += " AND (department = ? OR department LIKE ?)"
        params.extend([dept, f"%{dept}%"])
    if semester and semester != 'All':
        try:
            query += " AND semester = ?"
            params.append(int(semester))
        except ValueError:
            pass
    query += " ORDER BY subject_code ASC"
    subjects = db.execute_query(query, params, fetch_all=True)
    return jsonify({'subjects': subjects}), 200

# ----------------- SECURE STUDENT DATA ISOLATION ENDPOINTS -----------------

@app.route('/api/student/profile', methods=['GET'])
@token_required(allowed_roles=['student', 'college', 'admin', 'faculty'])
def get_student_profile(current_user):
    target_reg = current_user['user_id']
    if current_user['role'] in ('college', 'admin', 'faculty') and request.args.get('register_no'):
        target_reg = request.args.get('register_no').strip()

    student = db.execute_query(
        "SELECT * FROM students WHERE register_no = ?",
        (target_reg,), fetch_one=True
    )
    user_rec = db.execute_query(
        "SELECT name, email, phone, role, created_at, year, semester, section, batch, department FROM users WHERE user_id = ?",
        (target_reg,), fetch_one=True
    )
    if not student and not user_rec:
        return jsonify({'message': 'Student profile not found in database'}), 404

    profile = {
        'register_no': target_reg,
        'name': (student and student.get('name')) or (user_rec and user_rec.get('name')) or target_reg,
        'email': (student and student.get('email')) or (user_rec and user_rec.get('email')) or '',
        'phone': (student and student.get('phone')) or (user_rec and user_rec.get('phone')) or '',
        'department': (student and student.get('department')) or (user_rec and user_rec.get('department')) or '',
        'year': (student and student.get('year')) or (user_rec and user_rec.get('year')) or 1,
        'semester': (student and student.get('semester')) or (user_rec and user_rec.get('semester')) or 1,
        'section': (student and student.get('section')) or (user_rec and user_rec.get('section')) or 'A',
        'batch': (student and student.get('batch')) or (user_rec and user_rec.get('batch')) or '2024-2028',
        'created_at': (student and student.get('created_at')) or (user_rec and user_rec.get('created_at')) or ''
    }
    return jsonify({'profile': profile}), 200

@app.route('/api/student/attendance', methods=['GET'])
@token_required(allowed_roles=['student'])
def get_auth_student_attendance(current_user):
    reg_no = current_user['user_id']
    records = db.execute_query(
        """
        SELECT a.*, s.subject_name 
        FROM attendance a 
        LEFT JOIN subjects s ON a.subject_code = s.subject_code 
        WHERE a.register_no = ? 
        ORDER BY a.date DESC
        """,
        (reg_no,), fetch_all=True
    ) or []
    total = len(records)
    if total == 0:
        return jsonify({
            'register_no': reg_no,
            'total_classes': 0,
            'present': 0,
            'absent': 0,
            'late': 0,
            'percentage': None,
            'records': []
        }), 200

    present = sum(1 for r in records if r['status'] == 'Present')
    late = sum(1 for r in records if r['status'] == 'Late')
    absent = sum(1 for r in records if r['status'] == 'Absent')
    effective_present = present + (late * 0.5)
    pct = round((effective_present / total) * 100, 1)

    return jsonify({
        'register_no': reg_no,
        'total_classes': total,
        'present': present,
        'absent': absent,
        'late': late,
        'percentage': pct,
        'records': records
    }), 200

@app.route('/api/student/marks', methods=['GET'])
@token_required(allowed_roles=['student'])
def get_auth_student_marks(current_user):
    reg_no = current_user['user_id']
    records = db.execute_query(
        """
        SELECT m.*, s.subject_name
        FROM marks m
        LEFT JOIN subjects s ON m.subject_code = s.subject_code
        WHERE m.register_no = ?
        ORDER BY m.subject_code, m.exam_type
        """,
        (reg_no,), fetch_all=True
    ) or []

    if not records:
        return jsonify({
            'register_no': reg_no,
            'records': [],
            'grouped': {},
            'average_percentage': None
        }), 200

    grouped = {}
    for r in records:
        e = r['exam_type']
        if e not in grouped:
            grouped[e] = []
        grouped[e].append(r)

    total_score = sum(r['marks_obtained'] for r in records)
    total_max = sum(r['max_marks'] for r in records)
    avg_pct = round((total_score / total_max) * 100, 1) if total_max > 0 else None

    return jsonify({
        'register_no': reg_no,
        'records': records,
        'grouped': grouped,
        'average_percentage': avg_pct
    }), 200

@app.route('/api/student/fees', methods=['GET'])
@token_required(allowed_roles=['student'])
def get_auth_student_fees(current_user):
    reg_no = current_user['user_id']
    student = db.execute_query(
        "SELECT * FROM students WHERE register_no = ?",
        (reg_no,), fetch_one=True
    )
    fee = db.execute_query(
        """
        SELECT
            tuition_fee, exam_fee, transport_fee, hostel_fee, other_fee,
            (tuition_fee + exam_fee + transport_fee + hostel_fee + other_fee) AS total_fee,
            paid_amount,
            (tuition_fee + exam_fee + transport_fee + hostel_fee + other_fee - paid_amount) AS balance
        FROM fees
        WHERE register_no = ?
        """,
        (reg_no,), fetch_one=True
    )
    transactions = db.execute_query(
        "SELECT * FROM payments WHERE register_no = ? ORDER BY paid_at DESC",
        (reg_no,), fetch_all=True
    ) or []

    return jsonify({
        'student': student,
        'fee': fee,
        'transactions': transactions
    }), 200

@app.route('/api/student/courses', methods=['GET'])
@token_required(allowed_roles=['student', 'college', 'admin', 'faculty'])
def get_auth_student_courses(current_user):
    reg_no = current_user['user_id']
    student = db.execute_query("SELECT * FROM students WHERE register_no = ?", (reg_no,), fetch_one=True)
    dept = (student and student.get('department')) or current_user.get('department') or 'Computer Science Engineering'
    sem = (student and student.get('semester')) or current_user.get('semester') or 3

    subjects = db.execute_query(
        "SELECT * FROM subjects WHERE (department LIKE ? OR department = ?) AND (semester = ? OR ? IS NULL) ORDER BY subject_code ASC",
        (f"%{dept}%", dept, sem, None),
        fetch_all=True
    ) or []

    return jsonify({
        'department': dept,
        'semester': sem,
        'subjects': subjects
    }), 200

# ----------------- ATTENDANCE ENDPOINTS -----------------

@app.route('/api/attendance', methods=['GET', 'POST'])
def handle_attendance():
    if request.method == 'POST':
        try:
            data = request.get_json() or {}
            reg_no = data.get('register_no') or data.get('registerNumber') or ''
            reg_no = reg_no.strip()
            date_str = data.get('date', datetime.date.today().strftime('%Y-%m-%d'))
            subj = data.get('subject_code', 'CS3301')
            status = data.get('status', 'Present')
            remarks = data.get('remarks', '')
            recorded_by = data.get('recorded_by') or 'Faculty'

            if not reg_no:
                return jsonify({'message': 'Register number is required'}), 400

            existing = db.execute_query(
                "SELECT id FROM attendance WHERE register_no = ? AND date = ? AND subject_code = ?",
                (reg_no, date_str, subj), fetch_one=True
            )
            if existing:
                db.execute_query(
                    "UPDATE attendance SET status = ?, remarks = ?, recorded_by = ? WHERE id = ?",
                    (status, remarks, recorded_by, existing['id']), commit=True
                )
                action = "updated"
            else:
                db.execute_query(
                    "INSERT INTO attendance (register_no, date, status, subject_code, recorded_by, remarks) VALUES (?, ?, ?, ?, ?, ?)",
                    (reg_no, date_str, status, subj, recorded_by, remarks), commit=True
                )
                action = "recorded"

            return jsonify({
                'message': f'Attendance for {reg_no} ({subj}) on {date_str} {action} successfully',
                'status': 'success'
            }), 200
        except Exception as e:
            return jsonify({'message': str(e)}), 500

    dept = request.args.get('department', 'Computer Science Engineering')
    year = request.args.get('year', '3')
    date_str = request.args.get('date', datetime.date.today().strftime('%Y-%m-%d'))
    subj = request.args.get('subject_code', 'CS3301')

    students = db.execute_query(
        "SELECT register_no, name, department, year FROM students WHERE department = ? AND year = ? ORDER BY register_no ASC",
        (dept, year), fetch_all=True
    )

    att_records = db.execute_query(
        "SELECT register_no, status, remarks FROM attendance WHERE date = ? AND subject_code = ?",
        (date_str, subj), fetch_all=True
    )
    att_map = {r['register_no']: r for r in att_records}

    result = []
    for s in students:
        reg = s['register_no']
        record = att_map.get(reg)
        result.append({
            'register_no': reg,
            'name': s['name'],
            'department': s['department'],
            'year': s['year'],
            'status': record['status'] if record else 'Present',
            'remarks': record['remarks'] if record else ''
        })

    return jsonify({
        'department': dept,
        'year': year,
        'date': date_str,
        'subject_code': subj,
        'records': result
    }), 200

@app.route('/api/attendance/batch', methods=['POST'])
def save_batch_attendance():
    try:
        data = request.get_json() or {}
        date_str = data.get('date', datetime.date.today().strftime('%Y-%m-%d'))
        subj = data.get('subject_code', 'CS3301')
        recorded_by = data.get('recorded_by', 'Faculty')
        records = data.get('records', [])

        for r in records:
            reg_no = r.get('register_no')
            status = r.get('status', 'Present')
            remarks = r.get('remarks', '')

            existing = db.execute_query(
                "SELECT id FROM attendance WHERE register_no = ? AND date = ? AND subject_code = ?",
                (reg_no, date_str, subj), fetch_one=True
            )
            if existing:
                db.execute_query(
                    "UPDATE attendance SET status = ?, remarks = ?, recorded_by = ? WHERE id = ?",
                    (status, remarks, recorded_by, existing['id']), commit=True
                )
            else:
                db.execute_query(
                    "INSERT INTO attendance (register_no, date, status, subject_code, recorded_by, remarks) VALUES (?, ?, ?, ?, ?, ?)",
                    (reg_no, date_str, status, subj, recorded_by, remarks), commit=True
                )

        return jsonify({'message': f'Attendance for {len(records)} students saved successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/attendance/student/<reg_no>', methods=['GET'])
def get_student_attendance(reg_no):
    caller = get_optional_auth_user()
    if caller and caller.get('role') == 'student' and caller.get('user_id') != reg_no:
        return jsonify({'message': "Access forbidden: You cannot view another student's attendance records"}), 403

    records = db.execute_query(
        "SELECT a.*, s.subject_name FROM attendance a LEFT JOIN subjects s ON a.subject_code = s.subject_code WHERE a.register_no = ? ORDER BY a.date DESC",
        (reg_no,), fetch_all=True
    ) or []
    total = len(records)
    if total == 0:
        return jsonify({
            'register_no': reg_no,
            'total_classes': 0,
            'present': 0,
            'absent': 0,
            'late': 0,
            'percentage': None,
            'records': []
        }), 200

    present = sum(1 for r in records if r['status'] == 'Present')
    late = sum(1 for r in records if r['status'] == 'Late')
    absent = sum(1 for r in records if r['status'] == 'Absent')
    effective_present = present + (late * 0.5)
    pct = round((effective_present / total) * 100, 1)

    return jsonify({
        'register_no': reg_no,
        'total_classes': total,
        'present': present,
        'absent': absent,
        'late': late,
        'percentage': pct,
        'records': records
    }), 200

# ----------------- MARKS ENDPOINTS -----------------

@app.route('/api/marks', methods=['GET'])
def get_marks():
    dept = request.args.get('department', 'Computer Science Engineering')
    year = request.args.get('year', '3')
    subj = request.args.get('subject_code', 'CS3301')
    exam_type = request.args.get('exam_type', 'Internal Assessment 1')

    students = db.execute_query(
        "SELECT register_no, name, department, year FROM students WHERE department = ? AND year = ? ORDER BY register_no ASC",
        (dept, year), fetch_all=True
    )

    marks_records = db.execute_query(
        "SELECT register_no, marks_obtained, max_marks, grade FROM marks WHERE subject_code = ? AND exam_type = ?",
        (subj, exam_type), fetch_all=True
    )
    marks_map = {r['register_no']: r for r in marks_records}

    result = []
    for s in students:
        reg = s['register_no']
        rec = marks_map.get(reg)
        marks_obt = rec['marks_obtained'] if rec else 0.0
        max_m = rec['max_marks'] if rec else 100.0
        grd = rec['grade'] if rec else calculate_grade(marks_obt, max_m)
        result.append({
            'register_no': reg,
            'name': s['name'],
            'department': s['department'],
            'year': s['year'],
            'marks_obtained': marks_obt,
            'max_marks': max_m,
            'grade': grd
        })

    return jsonify({
        'department': dept,
        'year': year,
        'subject_code': subj,
        'exam_type': exam_type,
        'records': result
    }), 200

@app.route('/api/marks/batch', methods=['POST'])
def save_batch_marks():
    try:
        data = request.get_json() or {}
        subj = data.get('subject_code', 'CS3301')
        exam_type = data.get('exam_type', 'Internal Assessment 1')
        recorded_by = data.get('recorded_by', 'Faculty')
        records = data.get('records', [])

        for r in records:
            reg_no = r.get('register_no')
            marks_obt = float(r.get('marks_obtained', 0))
            max_m = float(r.get('max_marks', 100))
            grade = calculate_grade(marks_obt, max_m)

            existing = db.execute_query(
                "SELECT id FROM marks WHERE register_no = ? AND subject_code = ? AND exam_type = ?",
                (reg_no, subj, exam_type), fetch_one=True
            )
            if existing:
                db.execute_query(
                    "UPDATE marks SET marks_obtained = ?, max_marks = ?, grade = ?, recorded_by = ? WHERE id = ?",
                    (marks_obt, max_m, grade, recorded_by, existing['id']), commit=True
                )
            else:
                db.execute_query(
                    "INSERT INTO marks (register_no, subject_code, exam_type, marks_obtained, max_marks, grade, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (reg_no, subj, exam_type, marks_obt, max_m, grade, recorded_by), commit=True
                )

        return jsonify({'message': f'Marks for {len(records)} students recorded successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/marks/student/<reg_no>', methods=['GET'])
def get_student_marks(reg_no):
    caller = get_optional_auth_user()
    if caller and caller.get('role') == 'student' and caller.get('user_id') != reg_no:
        return jsonify({'message': "Access forbidden: You cannot view another student's marks records"}), 403

    records = db.execute_query(
        """
        SELECT m.*, s.subject_name
        FROM marks m
        LEFT JOIN subjects s ON m.subject_code = s.subject_code
        WHERE m.register_no = ?
        ORDER BY m.subject_code, m.exam_type
        """,
        (reg_no,), fetch_all=True
    ) or []

    if not records:
        return jsonify({
            'register_no': reg_no,
            'records': [],
            'grouped': {},
            'average_percentage': None
        }), 200

    grouped = {}
    for r in records:
        e = r['exam_type']
        if e not in grouped:
            grouped[e] = []
        grouped[e].append(r)

    total_score = sum(r['marks_obtained'] for r in records)
    total_max = sum(r['max_marks'] for r in records)
    avg_pct = round((total_score / total_max) * 100, 1) if total_max > 0 else None

    return jsonify({
        'register_no': reg_no,
        'records': records,
        'grouped': grouped,
        'average_percentage': avg_pct
    }), 200

# ----------------- FEES & PAYMENT ENDPOINTS -----------------

@app.route('/api/fees', methods=['GET'])
def get_all_fees():
    query = """
    SELECT
        s.register_no,
        s.name,
        s.department,
        s.year,
        s.email,
        f.tuition_fee,
        f.exam_fee,
        f.transport_fee,
        f.hostel_fee,
        f.other_fee,
        (f.tuition_fee + f.exam_fee + f.transport_fee + f.hostel_fee + f.other_fee) AS total_fee,
        f.paid_amount,
        (f.tuition_fee + f.exam_fee + f.transport_fee + f.hostel_fee + f.other_fee - f.paid_amount) AS balance
    FROM students s
    LEFT JOIN fees f ON s.register_no = f.register_no
    ORDER BY s.register_no ASC
    """
    fee_list = db.execute_query(query, fetch_all=True)

    total_receivable = sum(f['total_fee'] or 0 for f in fee_list)
    total_collected = sum(f['paid_amount'] or 0 for f in fee_list)
    total_outstanding = sum(f['balance'] or 0 for f in fee_list)

    return jsonify({
        'fees': fee_list,
        'summary': {
            'total_students': len(fee_list),
            'total_receivable': total_receivable,
            'total_collected': total_collected,
            'total_outstanding': total_outstanding
        }
    }), 200

@app.route('/api/fees/student/<reg_no>', methods=['GET'])
def get_student_fee(reg_no):
    caller = get_optional_auth_user()
    if caller and caller.get('role') == 'student' and caller.get('user_id') != reg_no:
        return jsonify({'message': "Access forbidden: You cannot view another student's fee records"}), 403

    student = db.execute_query(
        "SELECT * FROM students WHERE register_no = ?",
        (reg_no,), fetch_one=True
    )
    if not student:
        return jsonify({'message': 'Student not found'}), 404

    fee = db.execute_query(
        """
        SELECT
            tuition_fee, exam_fee, transport_fee, hostel_fee, other_fee,
            (tuition_fee + exam_fee + transport_fee + hostel_fee + other_fee) AS total_fee,
            paid_amount,
            (tuition_fee + exam_fee + transport_fee + hostel_fee + other_fee - paid_amount) AS balance
        FROM fees
        WHERE register_no = ?
        """,
        (reg_no,), fetch_one=True
    )

    transactions = db.execute_query(
        "SELECT * FROM payments WHERE register_no = ? ORDER BY paid_at DESC",
        (reg_no,), fetch_all=True
    )

    return jsonify({
        'student': student,
        'fee': fee,
        'transactions': transactions
    }), 200

@app.route('/api/fees/offline-payment', methods=['POST'])
def record_offline_payment():
    try:
        data = request.get_json() or {}
        reg_no = data.get('register_no')
        amount = float(data.get('amount', 0))
        method = data.get('payment_method', 'Cash')
        notes = data.get('notes', 'Manual payment receipt')
        collected_by = data.get('collected_by', 'ADM001')

        if not reg_no or amount <= 0:
            return jsonify({'message': 'Valid register number and positive amount required'}), 400

        fee = db.execute_query("SELECT * FROM fees WHERE register_no = ?", (reg_no,), fetch_one=True)
        if not fee:
            return jsonify({'message': 'Fee record not found'}), 404

        new_paid = float(fee['paid_amount']) + amount
        db.execute_query(
            "UPDATE fees SET paid_amount = ? WHERE register_no = ?",
            (new_paid, reg_no), commit=True
        )

        receipt_no = f"REC-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        txn_id = f"OFF-{uuid.uuid4().hex[:8].upper()}"

        db.execute_query(
            """
            INSERT INTO payments (receipt_no, transaction_id, register_no, amount, payment_method, payment_type, status, collected_by, notes)
            VALUES (?, ?, ?, ?, ?, 'offline', 'Success', ?, ?)
            """,
            (receipt_no, txn_id, reg_no, amount, method, collected_by, notes),
            commit=True
        )

        updated_fee = db.execute_query(
            """
            SELECT
                (tuition_fee + exam_fee + transport_fee + hostel_fee + other_fee) as total_fee,
                paid_amount,
                (tuition_fee + exam_fee + transport_fee + hostel_fee + other_fee - paid_amount) as balance
            FROM fees WHERE register_no = ?
            """,
            (reg_no,), fetch_one=True
        )

        return jsonify({
            'message': 'Offline payment logged successfully',
            'receipt': {
                'receipt_no': receipt_no,
                'transaction_id': txn_id,
                'register_no': reg_no,
                'amount': amount,
                'payment_method': method,
                'payment_type': 'offline',
                'collected_by': collected_by,
                'paid_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'total_fee': updated_fee['total_fee'],
                'paid_amount': updated_fee['paid_amount'],
                'remaining_balance': updated_fee['balance']
            }
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/fees/online-payment', methods=['POST'])
def process_online_payment():
    try:
        data = request.get_json() or {}
        reg_no = data.get('register_no')
        amount = float(data.get('amount', 0))
        method = data.get('payment_method', 'Credit Card')
        card_name = data.get('card_holder_name', 'Student')

        if not reg_no or amount <= 0:
            return jsonify({'message': 'Invalid payment request'}), 400

        fee = db.execute_query("SELECT * FROM fees WHERE register_no = ?", (reg_no,), fetch_one=True)
        if not fee:
            return jsonify({'message': 'Fee record not found'}), 404

        new_paid = float(fee['paid_amount']) + amount
        db.execute_query(
            "UPDATE fees SET paid_amount = ? WHERE register_no = ?",
            (new_paid, reg_no), commit=True
        )

        receipt_no = f"PAY-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        utr = data.get('utr_reference')
        if utr:
            base_txn = f"UPI-{utr.strip()}"
            existing = db.execute_query("SELECT id FROM payments WHERE transaction_id = ?", (base_txn,), fetch_one=True)
            if existing:
                txn_id = f"{base_txn}-{uuid.uuid4().hex[:4].upper()}"
            else:
                txn_id = base_txn
            notes = f"UPI Payment via QR (Payee: Dhamanithi N S, UTR: {utr.strip()})"
        else:
            txn_id = f"TXN-SVCET-{uuid.uuid4().hex[:8].upper()}"
            notes = f"Online Gateway Payment by {card_name} ({method})"

        db.execute_query(
            """
            INSERT INTO payments (receipt_no, transaction_id, register_no, amount, payment_method, payment_type, status, collected_by, notes)
            VALUES (?, ?, ?, ?, ?, 'online', 'Success', 'Online Gateway', ?)
            """,
            (receipt_no, txn_id, reg_no, amount, method, notes),
            commit=True
        )

        updated_fee = db.execute_query(
            """
            SELECT
                (tuition_fee + exam_fee + transport_fee + hostel_fee + other_fee) as total_fee,
                paid_amount,
                (tuition_fee + exam_fee + transport_fee + hostel_fee + other_fee - paid_amount) as balance
            FROM fees WHERE register_no = ?
            """,
            (reg_no,), fetch_one=True
        )

        return jsonify({
            'message': 'Payment processed successfully',
            'receipt': {
                'receipt_no': receipt_no,
                'transaction_id': txn_id,
                'register_no': reg_no,
                'amount': amount,
                'payment_method': method,
                'payment_type': 'online',
                'paid_at': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'total_fee': updated_fee['total_fee'],
                'paid_amount': updated_fee['paid_amount'],
                'remaining_balance': updated_fee['balance']
            }
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    students_cnt = db.execute_query("SELECT COUNT(*) as c FROM students", fetch_one=True)['c']
    faculty_cnt = db.execute_query("SELECT COUNT(*) as c FROM teachers", fetch_one=True)['c']
    fees_sum = db.execute_query(
        """
        SELECT
            SUM(tuition_fee + exam_fee + transport_fee + hostel_fee + other_fee) as total,
            SUM(paid_amount) as collected
        FROM fees
        """, fetch_one=True
    )
    total_rev = fees_sum['total'] or 0
    total_col = fees_sum['collected'] or 0
    total_due = total_rev - total_col

    today = datetime.date.today().strftime('%Y-%m-%d')
    att = db.execute_query("SELECT status FROM attendance WHERE date = ?", (today,), fetch_all=True)
    if att:
        pres = sum(1 for a in att if a['status'] == 'Present')
        rate = round((pres / len(att)) * 100, 1)
    else:
        all_att = db.execute_query("SELECT status FROM attendance", fetch_all=True)
        if all_att:
            pres = sum(1 for a in all_att if a['status'] == 'Present')
            rate = round((pres / len(all_att)) * 100, 1)
        else:
            rate = 0.0

    return jsonify({
        'total_students': students_cnt,
        'total_faculty': faculty_cnt,
        'total_revenue': total_rev,
        'total_collected': total_col,
        'total_outstanding': total_due,
        'attendance_rate': rate
    }), 200

# ----------------- ADMIN STUDENT MANAGEMENT ENDPOINTS -----------------

@app.route('/api/admin/students', methods=['GET'])
@token_required(allowed_roles=['college', 'admin'])
def admin_get_students(current_user):
    search = request.args.get('search', '').strip()
    dept = request.args.get('department', '').strip()
    year = request.args.get('year', '').strip()
    semester = request.args.get('semester', '').strip()
    section = request.args.get('section', '').strip()

    query = """
        SELECT s.*, u.email as user_email, u.phone as user_phone,
               f.tuition_fee, f.paid_amount,
               (f.tuition_fee + f.exam_fee + f.transport_fee + f.hostel_fee + f.other_fee - f.paid_amount) AS balance
        FROM students s
        LEFT JOIN users u ON s.register_no = u.user_id
        LEFT JOIN fees f ON s.register_no = f.register_no
        WHERE 1=1
    """
    params = []
    if search:
        query += " AND (s.register_no LIKE ? OR s.name LIKE ? OR s.email LIKE ?)"
        wild = f"%{search}%"
        params.extend([wild, wild, wild])
    if dept and dept != 'All':
        query += " AND s.department = ?"
        params.append(dept)
    if year and year != 'All':
        query += " AND s.year = ?"
        params.append(year)
    if semester and semester != 'All':
        query += " AND s.semester = ?"
        params.append(semester)
    if section and section != 'All':
        query += " AND s.section = ?"
        params.append(section)

    query += " ORDER BY s.register_no ASC"
    students = db.execute_query(query, params, fetch_all=True) or []
    return jsonify({'students': students, 'total': len(students)}), 200

@app.route('/api/admin/students', methods=['POST'])
@token_required(allowed_roles=['college', 'admin'])
def admin_create_student(current_user):
    try:
        data = request.get_json() or {}
        reg_no = data.get('register_no', '').strip()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        dept = data.get('department', 'Computer Science Engineering').strip()
        year = int(data.get('year', 1) or 1)
        semester = int(data.get('semester', 1) or 1)
        section = data.get('section', 'A').strip().upper()
        batch = data.get('batch', '2024-2028').strip()
        password = data.get('password', 'student123').strip() or 'student123'
        tuition_fee = float(data.get('tuition_fee', 60000) or 60000)
        exam_fee = float(data.get('exam_fee', 5000) or 5000)
        transport_fee = float(data.get('transport_fee', 0) or 0)
        hostel_fee = float(data.get('hostel_fee', 0) or 0)
        other_fee = float(data.get('other_fee', 2000) or 2000)
        paid_amount = float(data.get('paid_amount', 0) or 0)

        if not reg_no or not name or not email:
            return jsonify({'message': 'Register Number, Full Name, and Email are required.'}), 400

        existing_reg = db.execute_query(
            "SELECT id FROM users WHERE user_id = ? UNION SELECT id FROM students WHERE register_no = ?",
            (reg_no, reg_no), fetch_one=True
        )
        if existing_reg:
            return jsonify({'message': f"Student with Register Number '{reg_no}' already exists"}), 409

        existing_email = db.execute_query(
            "SELECT id FROM users WHERE email = ? UNION SELECT id FROM students WHERE email = ?",
            (email, email), fetch_one=True
        )
        if existing_email:
            return jsonify({'message': f"Account with email '{email}' already registered"}), 409

        pw_hash = generate_password_hash(password)

        db.execute_query(
            """
            INSERT INTO users (name, user_id, email, password_hash, role, department, phone, batch, year, semester, section)
            VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?, ?, ?)
            """,
            (name, reg_no, email, pw_hash, dept, phone, batch, year, semester, section),
            commit=True
        )

        db.execute_query(
            """
            INSERT INTO students (register_no, name, department, year, semester, section, batch, email, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (reg_no, name, dept, year, semester, section, batch, email, phone),
            commit=True
        )

        db.execute_query(
            """
            INSERT INTO fees (register_no, tuition_fee, exam_fee, transport_fee, hostel_fee, other_fee, paid_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (reg_no, tuition_fee, exam_fee, transport_fee, hostel_fee, other_fee, paid_amount),
            commit=True
        )

        new_student = db.execute_query("SELECT * FROM students WHERE register_no = ?", (reg_no,), fetch_one=True)
        return jsonify({
            'message': f"Student {name} ({reg_no}) enrolled successfully.",
            'student': new_student
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/students/<register_no>', methods=['PUT'])
@token_required(allowed_roles=['college', 'admin'])
def admin_update_student(current_user, register_no):
    try:
        data = request.get_json() or {}
        student = db.execute_query("SELECT * FROM students WHERE register_no = ?", (register_no,), fetch_one=True)
        if not student:
            return jsonify({'message': f"Student '{register_no}' not found"}), 404

        name = data.get('name', student['name']).strip()
        dept = data.get('department', student['department']).strip()
        year = int(data.get('year', student.get('year', 1)) or 1)
        semester = int(data.get('semester', student.get('semester', 1)) or 1)
        section = data.get('section', student.get('section', 'A')).strip().upper()
        batch = data.get('batch', student.get('batch', '2024-2028')).strip()
        email = data.get('email', student.get('email', '')).strip()
        phone = data.get('phone', student.get('phone', '')).strip()

        db.execute_query(
            """
            UPDATE students 
            SET name = ?, department = ?, year = ?, semester = ?, section = ?, batch = ?, email = ?, phone = ?
            WHERE register_no = ?
            """,
            (name, dept, year, semester, section, batch, email, phone, register_no),
            commit=True
        )

        db.execute_query(
            """
            UPDATE users 
            SET name = ?, department = ?, year = ?, semester = ?, section = ?, batch = ?, email = ?, phone = ?
            WHERE user_id = ?
            """,
            (name, dept, year, semester, section, batch, email, phone, register_no),
            commit=True
        )

        updated = db.execute_query("SELECT * FROM students WHERE register_no = ?", (register_no,), fetch_one=True)
        return jsonify({'message': f"Student {register_no} updated successfully", 'student': updated}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/students/<register_no>', methods=['DELETE'])
@token_required(allowed_roles=['college', 'admin'])
def admin_delete_student(current_user, register_no):
    try:
        student = db.execute_query("SELECT * FROM students WHERE register_no = ?", (register_no,), fetch_one=True)
        if not student:
            return jsonify({'message': f"Student '{register_no}' not found"}), 404

        db.execute_query("DELETE FROM students WHERE register_no = ?", (register_no,), commit=True)
        db.execute_query("DELETE FROM users WHERE user_id = ?", (register_no,), commit=True)
        db.execute_query("DELETE FROM fees WHERE register_no = ?", (register_no,), commit=True)
        db.execute_query("DELETE FROM marks WHERE register_no = ?", (register_no,), commit=True)
        db.execute_query("DELETE FROM attendance WHERE register_no = ?", (register_no,), commit=True)
        db.execute_query("DELETE FROM payments WHERE register_no = ?", (register_no,), commit=True)

        return jsonify({'message': f"Student '{register_no}' and all associated records permanently removed."}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/students/<register_no>/reset-password', methods=['POST'])
@token_required(allowed_roles=['college', 'admin'])
def admin_reset_password(current_user, register_no):
    try:
        data = request.get_json() or {}
        new_password = data.get('new_password', 'student123').strip() or 'student123'
        user = db.execute_query("SELECT id FROM users WHERE user_id = ?", (register_no,), fetch_one=True)
        if not user:
            return jsonify({'message': f"User account for '{register_no}' not found"}), 404

        pw_hash = generate_password_hash(new_password)
        db.execute_query("UPDATE users SET password_hash = ? WHERE user_id = ?", (pw_hash, register_no), commit=True)

        return jsonify({'message': f"Password for '{register_no}' successfully reset."}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/students/import-csv', methods=['POST'])
@token_required(allowed_roles=['college', 'admin'])
def admin_import_students_csv(current_user):
    try:
        csv_text = ""
        if 'file' in request.files:
            file = request.files['file']
            csv_text = file.read().decode('utf-8', errors='ignore')
        else:
            data = request.get_json() or {}
            csv_text = data.get('csv_content', '')

        if not csv_text.strip():
            return jsonify({'message': 'No CSV content provided'}), 400

        reader = csv.DictReader(io.StringIO(csv_text.strip()))
        imported = []
        errors = []

        for row_idx, row in enumerate(reader, start=2):
            clean_row = {k.strip().lower(): v.strip() for k, v in row.items() if k}
            reg_no = clean_row.get('register_no') or clean_row.get('reg_no') or clean_row.get('regno') or clean_row.get('userid')
            name = clean_row.get('name') or clean_row.get('student_name')
            email = clean_row.get('email') or f"{reg_no.lower()}@svcet.edu.in" if reg_no else None
            phone = clean_row.get('phone') or clean_row.get('mobile') or ''
            dept = clean_row.get('department') or clean_row.get('dept') or 'Computer Science Engineering'
            year = int(clean_row.get('year', 1) or 1)
            semester = int(clean_row.get('semester', 1) or 1)
            section = (clean_row.get('section', 'A') or 'A').upper()
            batch = clean_row.get('batch', '2024-2028') or '2024-2028'
            password = clean_row.get('password', 'student123') or 'student123'
            tuition_fee = float(clean_row.get('tuition_fee', 60000) or 60000)
            exam_fee = float(clean_row.get('exam_fee', 5000) or 5000)
            paid_amount = float(clean_row.get('paid_amount', 0) or 0)

            if not reg_no or not name:
                errors.append(f"Row {row_idx}: Missing register_no or name")
                continue

            existing = db.execute_query(
                "SELECT id FROM users WHERE user_id = ? UNION SELECT id FROM students WHERE register_no = ?",
                (reg_no, reg_no), fetch_one=True
            )
            if existing:
                errors.append(f"Row {row_idx}: Register number '{reg_no}' already exists in database (Skipped)")
                continue

            pw_hash = generate_password_hash(password)
            try:
                db.execute_query(
                    """
                    INSERT INTO users (name, user_id, email, password_hash, role, department, phone, batch, year, semester, section)
                    VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?, ?, ?)
                    """,
                    (name, reg_no, email, pw_hash, dept, phone, batch, year, semester, section),
                    commit=True
                )
                db.execute_query(
                    """
                    INSERT INTO students (register_no, name, department, year, semester, section, batch, email, phone)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (reg_no, name, dept, year, semester, section, batch, email, phone),
                    commit=True
                )
                db.execute_query(
                    """
                    INSERT INTO fees (register_no, tuition_fee, exam_fee, transport_fee, hostel_fee, other_fee, paid_amount)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (reg_no, tuition_fee, exam_fee, 0, 0, 2000, paid_amount),
                    commit=True
                )
                imported.append(reg_no)
            except Exception as row_err:
                errors.append(f"Row {row_idx} ({reg_no}): {str(row_err)}")

        return jsonify({
            'message': f"CSV Import complete: {len(imported)} student(s) enrolled, {len(errors)} issues.",
            'imported_count': len(imported),
            'failed_count': len(errors),
            'imported_registers': imported,
            'errors': errors
        }), 200
    except Exception as e:
        return jsonify({'message': f"CSV parsing error: {str(e)}"}), 500

@app.route('/api/admin/students/csv-template', methods=['GET'])
def download_csv_template():
    template_path = BASE_DIR / 'students_template.csv'
    if template_path.exists():
        with open(template_path, 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        content = "register_no,name,email,phone,department,year,semester,section,batch,password,tuition_fee,exam_fee,paid_amount\nSVCET010,Kavitha S,kavitha@svcet.edu,9876543210,Computer Science Engineering,2,4,A,2024-2028,Student@123,50000,2500,25000\n"
    return (content, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="students_template.csv"'
    })

# ----------------- ADMIN FACULTY MANAGEMENT ENDPOINTS -----------------

@app.route('/api/admin/faculty', methods=['GET'])
@token_required(allowed_roles=['college', 'admin'])
def admin_get_faculty(current_user):
    search = request.args.get('search', '').strip()
    dept = request.args.get('department', '').strip()

    query = """
        SELECT t.*, u.phone as user_phone, u.email as user_email, u.designation as user_designation
        FROM teachers t
        LEFT JOIN users u ON t.faculty_id = u.user_id
        WHERE 1=1
    """
    params = []
    if search:
        query += " AND (t.faculty_id LIKE ? OR t.name LIKE ? OR t.email LIKE ? OR t.designation LIKE ?)"
        wild = f"%{search}%"
        params.extend([wild, wild, wild, wild])
    if dept and dept != 'All':
        query += " AND t.department = ?"
        params.append(dept)

    query += " ORDER BY t.faculty_id ASC"
    faculty_list = db.execute_query(query, params, fetch_all=True) or []
    for f in faculty_list:
        if not f.get('phone') and f.get('user_phone'):
            f['phone'] = f['user_phone']
        if not f.get('email') and f.get('user_email'):
            f['email'] = f['user_email']
        if not f.get('designation') and f.get('user_designation'):
            f['designation'] = f['user_designation']

    return jsonify({'faculty': faculty_list, 'total': len(faculty_list)}), 200

@app.route('/api/admin/faculty', methods=['POST'])
@token_required(allowed_roles=['college', 'admin'])
def admin_create_faculty(current_user):
    try:
        data = request.get_json() or {}
        faculty_id = data.get('faculty_id', '').strip().upper()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        dept = data.get('department', 'Computer Science Engineering').strip()
        designation = data.get('designation', 'Assistant Professor').strip() or 'Assistant Professor'
        password = data.get('password', 'faculty123').strip() or 'faculty123'

        if not faculty_id or not name or not email:
            return jsonify({'message': 'Faculty ID, Full Name, and Email are required.'}), 400

        existing_id = db.execute_query(
            "SELECT id FROM users WHERE user_id = ? UNION SELECT id FROM teachers WHERE faculty_id = ?",
            (faculty_id, faculty_id), fetch_one=True
        )
        if existing_id:
            return jsonify({'message': f"Faculty with ID '{faculty_id}' already exists"}), 409

        existing_email = db.execute_query(
            "SELECT id FROM users WHERE email = ? UNION SELECT id FROM teachers WHERE email = ?",
            (email, email), fetch_one=True
        )
        if existing_email:
            return jsonify({'message': f"Account with email '{email}' already registered"}), 409

        pw_hash = generate_password_hash(password)

        db.execute_query(
            """
            INSERT INTO users (name, user_id, email, password_hash, role, department, phone, designation)
            VALUES (?, ?, ?, ?, 'faculty', ?, ?, ?)
            """,
            (name, faculty_id, email, pw_hash, dept, phone, designation),
            commit=True
        )

        db.execute_query(
            """
            INSERT INTO teachers (faculty_id, name, department, email, designation, phone)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (faculty_id, name, dept, email, designation, phone),
            commit=True
        )

        new_faculty = db.execute_query("SELECT * FROM teachers WHERE faculty_id = ?", (faculty_id,), fetch_one=True)
        return jsonify({
            'message': f"Faculty {name} ({faculty_id}) enrolled successfully.",
            'faculty': new_faculty
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/faculty/<faculty_id>', methods=['PUT'])
@token_required(allowed_roles=['college', 'admin'])
def admin_update_faculty(current_user, faculty_id):
    try:
        data = request.get_json() or {}
        faculty = db.execute_query("SELECT * FROM teachers WHERE faculty_id = ?", (faculty_id,), fetch_one=True)
        if not faculty:
            return jsonify({'message': f"Faculty member '{faculty_id}' not found"}), 404

        name = data.get('name', faculty['name']).strip()
        dept = data.get('department', faculty['department']).strip()
        email = data.get('email', faculty.get('email', '')).strip()
        phone = data.get('phone', faculty.get('phone', '')).strip()
        designation = data.get('designation', faculty.get('designation', 'Assistant Professor')).strip()

        db.execute_query(
            """
            UPDATE teachers 
            SET name = ?, department = ?, email = ?, phone = ?, designation = ?
            WHERE faculty_id = ?
            """,
            (name, dept, email, phone, designation, faculty_id),
            commit=True
        )

        db.execute_query(
            """
            UPDATE users 
            SET name = ?, department = ?, email = ?, phone = ?, designation = ?
            WHERE user_id = ?
            """,
            (name, dept, email, phone, designation, faculty_id),
            commit=True
        )

        updated = db.execute_query("SELECT * FROM teachers WHERE faculty_id = ?", (faculty_id,), fetch_one=True)
        return jsonify({'message': f"Faculty {faculty_id} updated successfully", 'faculty': updated}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/faculty/<faculty_id>', methods=['DELETE'])
@token_required(allowed_roles=['college', 'admin'])
def admin_delete_faculty(current_user, faculty_id):
    try:
        faculty = db.execute_query("SELECT * FROM teachers WHERE faculty_id = ?", (faculty_id,), fetch_one=True)
        if not faculty:
            return jsonify({'message': f"Faculty member '{faculty_id}' not found"}), 404

        db.execute_query("DELETE FROM teachers WHERE faculty_id = ?", (faculty_id,), commit=True)
        db.execute_query("DELETE FROM users WHERE user_id = ?", (faculty_id,), commit=True)

        return jsonify({'message': f"Faculty member '{faculty_id}' permanently removed."}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/faculty/<faculty_id>/reset-password', methods=['POST'])
@token_required(allowed_roles=['college', 'admin'])
def admin_reset_faculty_password(current_user, faculty_id):
    try:
        data = request.get_json() or {}
        new_password = data.get('new_password', 'faculty123').strip() or 'faculty123'
        user = db.execute_query("SELECT id FROM users WHERE user_id = ?", (faculty_id,), fetch_one=True)
        if not user:
            return jsonify({'message': f"User account for '{faculty_id}' not found"}), 404

        pw_hash = generate_password_hash(new_password)
        db.execute_query("UPDATE users SET password_hash = ? WHERE user_id = ?", (pw_hash, faculty_id), commit=True)

        return jsonify({'message': f"Password for '{faculty_id}' successfully reset."}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/faculty/import-csv', methods=['POST'])
@token_required(allowed_roles=['college', 'admin'])
def admin_import_faculty_csv(current_user):
    try:
        csv_text = ""
        if 'file' in request.files:
            file = request.files['file']
            csv_text = file.read().decode('utf-8', errors='ignore')
        else:
            data = request.get_json() or {}
            csv_text = data.get('csv_content', '')

        if not csv_text.strip():
            return jsonify({'message': 'No CSV content provided'}), 400

        reader = csv.DictReader(io.StringIO(csv_text.strip()))
        imported = []
        errors = []

        for row_idx, row in enumerate(reader, start=2):
            clean_row = {k.strip().lower(): v.strip() for k, v in row.items() if k}
            faculty_id = clean_row.get('faculty_id') or clean_row.get('fac_id') or clean_row.get('userid')
            name = clean_row.get('name') or clean_row.get('faculty_name')
            email = clean_row.get('email') or (f"{faculty_id.lower()}@svcet.edu.in" if faculty_id else None)
            phone = clean_row.get('phone') or clean_row.get('mobile') or ''
            dept = clean_row.get('department') or clean_row.get('dept') or 'Computer Science Engineering'
            designation = clean_row.get('designation') or clean_row.get('role') or 'Assistant Professor'
            password = clean_row.get('password', 'faculty123') or 'faculty123'

            if not faculty_id or not name:
                errors.append(f"Row {row_idx}: Missing faculty_id or name")
                continue

            existing = db.execute_query(
                "SELECT id FROM users WHERE user_id = ? UNION SELECT id FROM teachers WHERE faculty_id = ?",
                (faculty_id, faculty_id), fetch_one=True
            )
            if existing:
                errors.append(f"Row {row_idx}: Faculty ID '{faculty_id}' already exists in database (Skipped)")
                continue

            pw_hash = generate_password_hash(password)
            try:
                db.execute_query(
                    """
                    INSERT INTO users (name, user_id, email, password_hash, role, department, phone, designation)
                    VALUES (?, ?, ?, ?, 'faculty', ?, ?, ?)
                    """,
                    (name, faculty_id, email, pw_hash, dept, phone, designation),
                    commit=True
                )
                db.execute_query(
                    """
                    INSERT INTO teachers (faculty_id, name, department, email, designation, phone)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (faculty_id, name, dept, email, designation, phone),
                    commit=True
                )
                imported.append(faculty_id)
            except Exception as row_err:
                errors.append(f"Row {row_idx} ({faculty_id}): {str(row_err)}")

        return jsonify({
            'message': f"Faculty CSV Import complete: {len(imported)} faculty member(s) enrolled, {len(errors)} issues.",
            'imported_count': len(imported),
            'failed_count': len(errors),
            'imported_faculty': imported,
            'errors': errors
        }), 200
    except Exception as e:
        return jsonify({'message': f"CSV parsing error: {str(e)}"}), 500

@app.route('/api/admin/faculty/csv-template', methods=['GET'])
def download_faculty_csv_template():
    template_path = BASE_DIR / 'faculty_template.csv'
    if template_path.exists():
        with open(template_path, 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        content = "faculty_id,name,email,phone,department,designation,password\nFAC001,Dr. Ramanathan K,ramanathan@svcet.edu.in,9876543220,Computer Science Engineering,Professor & HOD,faculty123\n"
    return (content, 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="faculty_template.csv"'
    })

# ----------------- FACULTY SELF-SERVICE & PROFILE ENDPOINTS -----------------

@app.route('/api/faculty/profile', methods=['GET'])
@token_required(allowed_roles=['faculty', 'college', 'admin'])
def get_faculty_profile(current_user):
    target_id = current_user['user_id']
    if current_user['role'] in ('college', 'admin') and request.args.get('faculty_id'):
        target_id = request.args.get('faculty_id').strip()

    teacher = db.execute_query(
        "SELECT * FROM teachers WHERE faculty_id = ?",
        (target_id,), fetch_one=True
    )
    user_rec = db.execute_query(
        "SELECT email, phone, role, created_at, designation, department FROM users WHERE user_id = ?",
        (target_id,), fetch_one=True
    )
    if not teacher and not user_rec:
        return jsonify({'message': 'Faculty profile not found in database'}), 404

    dept = (teacher and teacher.get('department')) or current_user.get('department', '')
    handled_subjects = db.execute_query(
        """
        SELECT DISTINCT s.subject_code, s.subject_name, s.department, s.semester 
        FROM subjects s
        WHERE s.department = ?
        ORDER BY s.subject_code ASC
        """,
        (dept,),
        fetch_all=True
    ) or []

    profile = {
        'faculty_id': target_id,
        'name': (teacher and teacher.get('name')) or current_user.get('name', ''),
        'email': (teacher and teacher.get('email')) or (user_rec and user_rec.get('email')) or '',
        'phone': (teacher and teacher.get('phone')) or (user_rec and user_rec.get('phone')) or '',
        'department': dept,
        'designation': (teacher and teacher.get('designation')) or (user_rec and user_rec.get('designation')) or 'Assistant Professor',
        'created_at': (teacher and teacher.get('created_at')) or (user_rec and user_rec.get('created_at')) or '',
        'subjects_handled': handled_subjects
    }
    return jsonify({'profile': profile}), 200

# ----------------- FACULTY ATTENDANCE & MARKS ENDPOINTS -----------------

@app.route('/api/faculty/students', methods=['GET'])
@token_required(allowed_roles=['faculty', 'college', 'admin'])
def faculty_get_students(current_user):
    dept = request.args.get('department', current_user.get('department', 'Computer Science Engineering'))
    semester = request.args.get('semester')
    year = request.args.get('year')
    section = request.args.get('section')

    query = "SELECT register_no, name, department, year, semester, section FROM students WHERE 1=1"
    params = []
    if dept and dept != 'All':
        query += " AND department = ?"
        params.append(dept)
    if semester and semester != 'All':
        query += " AND semester = ?"
        params.append(semester)
    elif year and year != 'All':
        query += " AND year = ?"
        params.append(year)
    if section and section != 'All':
        query += " AND section = ?"
        params.append(section)

    query += " ORDER BY register_no ASC"
    students = db.execute_query(query, params, fetch_all=True) or []
    return jsonify({'students': students, 'total': len(students)}), 200

@app.route('/api/faculty/attendance', methods=['POST'])
@token_required(allowed_roles=['faculty', 'college', 'admin'])
def faculty_save_attendance(current_user):
    try:
        data = request.get_json() or {}
        date_str = data.get('date', datetime.date.today().strftime('%Y-%m-%d'))
        subj = data.get('subject_code', 'CS3301')
        recorded_by = current_user.get('user_id', 'Faculty')
        records = data.get('records', [])

        for r in records:
            reg_no = r.get('register_no')
            status = r.get('status', 'Present')
            remarks = r.get('remarks', '')

            existing = db.execute_query(
                "SELECT id FROM attendance WHERE register_no = ? AND date = ? AND subject_code = ?",
                (reg_no, date_str, subj), fetch_one=True
            )
            if existing:
                db.execute_query(
                    "UPDATE attendance SET status = ?, remarks = ?, recorded_by = ? WHERE id = ?",
                    (status, remarks, recorded_by, existing['id']), commit=True
                )
            else:
                db.execute_query(
                    "INSERT INTO attendance (register_no, date, status, subject_code, recorded_by, remarks) VALUES (?, ?, ?, ?, ?, ?)",
                    (reg_no, date_str, status, subj, recorded_by, remarks), commit=True
                )

        return jsonify({'message': f'Attendance for {len(records)} students recorded to database successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/faculty/marks', methods=['POST'])
@token_required(allowed_roles=['faculty', 'college', 'admin'])
def faculty_save_marks(current_user):
    try:
        data = request.get_json() or {}
        subj = data.get('subject_code', 'CS3301')
        exam_type = data.get('exam_type', 'Internal Assessment 1')
        recorded_by = current_user.get('user_id', 'Faculty')
        records = data.get('records', [])

        for r in records:
            reg_no = r.get('register_no')
            marks_obt = float(r.get('marks_obtained', 0))
            max_m = float(r.get('max_marks', 100))
            grade = calculate_grade(marks_obt, max_m)

            existing = db.execute_query(
                "SELECT id FROM marks WHERE register_no = ? AND subject_code = ? AND exam_type = ?",
                (reg_no, subj, exam_type), fetch_one=True
            )
            if existing:
                db.execute_query(
                    "UPDATE marks SET marks_obtained = ?, max_marks = ?, grade = ?, recorded_by = ? WHERE id = ?",
                    (marks_obt, max_m, grade, recorded_by, existing['id']), commit=True
                )
            else:
                db.execute_query(
                    "INSERT INTO marks (register_no, subject_code, exam_type, marks_obtained, max_marks, grade, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (reg_no, subj, exam_type, marks_obt, max_m, grade, recorded_by), commit=True
                )

        return jsonify({'message': f'Marks for {len(records)} students recorded successfully'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ----------------- HEALTH CHECK ENDPOINT -----------------

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint returning system & database connection status.
    Verifies that Flask is connected to the database safely without leaking credentials.
    """
    try:
        health_info = db.check_health()
        return jsonify(health_info), 200
    except Exception as e:
        return jsonify({'status': 'error', 'database': 'disconnected', 'message': str(e)}), 500

# ----------------- COURSES & CURRICULUM ENDPOINTS -----------------

@app.route('/api/courses', methods=['GET'])
def get_all_courses():
    try:
        courses = db.execute_query("SELECT * FROM courses ORDER BY name ASC", fetch_all=True)
        return jsonify({'courses': courses or []}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/courses/cse', methods=['GET'])
def get_cse_course():
    try:
        course = db.execute_query("SELECT * FROM courses WHERE code = 'CSE'", fetch_one=True)
        if not course:
            return jsonify({'message': 'Course not found'}), 404
        
        regulations = db.execute_query(
            "SELECT * FROM regulations WHERE course_id = ? ORDER BY year DESC",
            (course['id'],), fetch_all=True
        ) or []
        
        total_subjects = db.execute_query(
            "SELECT COUNT(*) as cnt FROM subjects WHERE department LIKE '%Computer Science%'",
            fetch_one=True
        )['cnt']
        
        total_materials = db.execute_query(
            "SELECT COUNT(*) as cnt FROM study_materials",
            fetch_one=True
        )['cnt']

        return jsonify({
            'course': course,
            'regulations': regulations,
            'stats': {
                'total_regulations': len(regulations),
                'total_subjects': total_subjects,
                'total_materials': total_materials,
                'accreditation': "Anna University Affiliated & NBA Accredited"
            }
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/courses/cse/regulations', methods=['GET'])
def get_cse_regulations():
    try:
        cse = db.execute_query("SELECT id FROM courses WHERE code = 'CSE'", fetch_one=True)
        course_id = cse['id'] if cse else 1
        regulations = db.execute_query(
            "SELECT * FROM regulations WHERE course_id = ? ORDER BY year DESC",
            (course_id,), fetch_all=True
        )
        return jsonify({'regulations': regulations or []}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/courses/<course_code>', methods=['GET'])
def get_department_course(course_code):
    try:
        code_upper = course_code.strip().upper()
        # Fast path for CSE
        if code_upper == 'CSE':
            return get_cse_course()

        course = db.execute_query(
            "SELECT * FROM courses WHERE UPPER(code) = ? OR UPPER(name) LIKE ? OR UPPER(department) LIKE ?",
            (code_upper, f"%{code_upper}%", f"%{code_upper}%"),
            fetch_one=True
        )
        if not course:
            return jsonify({'message': f'Department {course_code} not found'}), 404

        regulations = db.execute_query(
            "SELECT * FROM regulations WHERE course_id = ? ORDER BY year DESC",
            (course['id'],), fetch_all=True
        ) or []

        total_subjects = db.execute_query(
            """
            SELECT COUNT(DISTINCT s.id) as cnt
            FROM subjects s
            LEFT JOIN semesters sem ON s.semester_id = sem.id
            LEFT JOIN regulations r ON sem.regulation_id = r.id
            WHERE r.course_id = ? OR s.department LIKE ?
            """,
            (course['id'], f"%{course['department']}%"),
            fetch_one=True
        )['cnt']

        total_materials = db.execute_query(
            """
            SELECT COUNT(DISTINCT m.id) as cnt
            FROM study_materials m
            JOIN subjects s ON m.subject_id = s.id
            LEFT JOIN semesters sem ON s.semester_id = sem.id
            LEFT JOIN regulations r ON sem.regulation_id = r.id
            WHERE r.course_id = ? OR s.department LIKE ?
            """,
            (course['id'], f"%{course['department']}%"),
            fetch_one=True
        )['cnt']

        return jsonify({
            'course': course,
            'regulations': regulations,
            'stats': {
                'total_regulations': len(regulations),
                'total_subjects': total_subjects,
                'total_materials': total_materials,
                'accreditation': "Anna University Affiliated & AICTE Approved"
            }
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/courses/<course_code>/regulations', methods=['GET'])
def get_department_regulations(course_code):
    try:
        code_upper = course_code.strip().upper()
        if code_upper == 'CSE':
            return get_cse_regulations()

        course = db.execute_query(
            "SELECT id FROM courses WHERE UPPER(code) = ? OR UPPER(name) LIKE ? OR UPPER(department) LIKE ?",
            (code_upper, f"%{code_upper}%", f"%{code_upper}%"),
            fetch_one=True
        )
        if not course:
            return jsonify({'message': f'Department {course_code} not found'}), 404

        regulations = db.execute_query(
            "SELECT * FROM regulations WHERE course_id = ? ORDER BY year DESC",
            (course['id'],), fetch_all=True
        )
        return jsonify({'regulations': regulations or []}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# Route aliases for CSE regulation and semester sub-paths (supporting AdminPortal.jsx)
@app.route('/api/courses/cse/regulations/<int:reg_id>/semesters', methods=['GET'])
def get_cse_reg_semesters_alias(reg_id):
    return get_regulation_semesters(str(reg_id))

@app.route('/api/courses/cse/semesters/<int:semester_id>/subjects', methods=['GET'])
def get_cse_sem_subjects_alias(semester_id):
    return get_semester_subjects(semester_id)

@app.route('/api/regulations/<reg_identifier>/semesters', methods=['GET'])
def get_regulation_semesters(reg_identifier):
    try:
        reg = None
        if str(reg_identifier).isdigit():
            val = int(reg_identifier)
            reg = db.execute_query("SELECT * FROM regulations WHERE id = ? OR year = ?", (val, val), fetch_one=True)
        if not reg:
            reg = db.execute_query("SELECT * FROM regulations WHERE code = ? OR name LIKE ?", (reg_identifier, f"%{reg_identifier}%"), fetch_one=True)
        
        if not reg:
            return jsonify({'message': 'Regulation not found'}), 404
        
        semesters = db.execute_query(
            "SELECT * FROM semesters WHERE regulation_id = ? ORDER BY semester_number ASC",
            (reg['id'],), fetch_all=True
        ) or []

        for s in semesters:
            sub_cnt = db.execute_query(
                "SELECT COUNT(*) as cnt FROM subjects WHERE semester_id = ?",
                (s['id'],), fetch_one=True
            )['cnt']
            s['subject_count'] = sub_cnt

        return jsonify({
            'regulation': reg,
            'semesters': semesters
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/semesters/<int:semester_id>/subjects', methods=['GET'])
def get_semester_subjects(semester_id):
    try:
        sem = db.execute_query("SELECT * FROM semesters WHERE id = ?", (semester_id,), fetch_one=True)
        if not sem:
            return jsonify({'message': 'Semester not found'}), 404
        
        reg = db.execute_query("SELECT * FROM regulations WHERE id = ?", (sem['regulation_id'],), fetch_one=True)
        
        subjects = db.execute_query(
            "SELECT * FROM subjects WHERE semester_id = ? ORDER BY subject_code ASC",
            (semester_id,), fetch_all=True
        ) or []

        for sub in subjects:
            mat_cnt = db.execute_query(
                "SELECT COUNT(*) as cnt FROM study_materials WHERE subject_id = ?",
                (sub['id'],), fetch_one=True
            )['cnt']
            sub['material_count'] = mat_cnt

        return jsonify({
            'semester': sem,
            'regulation': reg,
            'subjects': subjects
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/subjects/<int:subject_id>', methods=['GET'])
def get_subject_detail(subject_id):
    try:
        subject = db.execute_query("SELECT * FROM subjects WHERE id = ?", (subject_id,), fetch_one=True)
        if not subject:
            return jsonify({'message': 'Subject not found'}), 404
        
        semester = None
        regulation = None
        if subject.get('semester_id'):
            semester = db.execute_query("SELECT * FROM semesters WHERE id = ?", (subject['semester_id'],), fetch_one=True)
            if semester and semester.get('regulation_id'):
                regulation = db.execute_query("SELECT * FROM regulations WHERE id = ?", (semester['regulation_id'],), fetch_one=True)

        return jsonify({
            'subject': subject,
            'semester': semester,
            'regulation': regulation
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/subjects/<int:subject_id>/materials', methods=['GET'])
def get_subject_materials(subject_id):
    try:
        subject = db.execute_query("SELECT * FROM subjects WHERE id = ?", (subject_id,), fetch_one=True)
        if not subject:
            return jsonify({'message': 'Subject not found'}), 404
        
        semester = None
        regulation = None
        if subject.get('semester_id'):
            semester = db.execute_query("SELECT * FROM semesters WHERE id = ?", (subject['semester_id'],), fetch_one=True)
            if semester and semester.get('regulation_id'):
                regulation = db.execute_query("SELECT * FROM regulations WHERE id = ?", (semester['regulation_id'],), fetch_one=True)

        materials = db.execute_query(
            "SELECT * FROM study_materials WHERE subject_id = ? ORDER BY unit ASC, title ASC",
            (subject_id,), fetch_all=True
        ) or []

        categories = {
            "Lecture Notes": [],
            "Important Questions": [],
            "Normal Notes": [],
            "Question Paper": [],
            "Video Lecture": [],
            "Syllabus": [],
            "Useful Resources": []
        }

        for m in materials:
            mtype = m.get('material_type', 'Useful Resources')
            if mtype not in categories:
                categories[mtype] = []
            categories[mtype].append(m)

        return jsonify({
            'subject': subject,
            'semester': semester,
            'regulation': regulation,
            'total_materials': len(materials),
            'materials': materials,
            'grouped_materials': categories
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/courses/cse/search', methods=['GET'])
def search_cse_content():
    try:
        q = request.args.get('q', '').strip()
        if not q:
            return jsonify({'subjects': [], 'materials': []}), 200
        
        # Expand common search synonyms/acronyms
        synonyms = {
            'dbms': ['database', 'management', 'dbms'],
            'toc': ['theory of computation', 'automata', 'toc'],
            'os': ['operating system', 'operating systems'],
            'cn': ['computer network', 'computer networks'],
            'daa': ['algorithms', 'design and analysis'],
            'ds': ['data structures', 'structures'],
            'ai': ['artificial intelligence', 'machine learning'],
            'aiml': ['artificial intelligence', 'machine learning'],
            'oose': ['object oriented software', 'software engineering'],
            'cd': ['compiler design']
        }

        search_terms = [q]
        lower_q = q.lower()
        if lower_q in synonyms:
            search_terms.extend(synonyms[lower_q])

        sub_clauses = []
        sub_params = []
        for term in search_terms:
            wild = f"%{term}%"
            sub_clauses.append("(s.subject_code LIKE ? OR s.subject_name LIKE ? OR s.department LIKE ? OR CAST(s.semester AS TEXT) LIKE ?)")
            sub_params.extend([wild, wild, wild, wild])

        where_sub = " OR ".join(sub_clauses)
        subjects = db.execute_query(
            f"""
            SELECT DISTINCT s.*, sem.semester_number, sem.title as semester_title, r.name as regulation_name
            FROM subjects s
            LEFT JOIN semesters sem ON s.semester_id = sem.id
            LEFT JOIN regulations r ON sem.regulation_id = r.id
            WHERE {where_sub}
            ORDER BY s.semester ASC, s.subject_code ASC
            """,
            sub_params,
            fetch_all=True
        ) or []

        matched_subj_ids = [s['id'] for s in subjects]
        mat_clauses = []
        mat_params = []
        for term in search_terms:
            wild = f"%{term}%"
            mat_clauses.append("(m.title LIKE ? OR m.source LIKE ? OR m.material_type LIKE ? OR m.unit LIKE ?)")
            mat_params.extend([wild, wild, wild, wild])

        if matched_subj_ids:
            placeholders = ','.join(['?'] * len(matched_subj_ids))
            mat_where = f"({' OR '.join(mat_clauses)}) OR m.subject_id IN ({placeholders})"
            mat_params.extend(matched_subj_ids)
        else:
            mat_where = " OR ".join(mat_clauses)

        materials = db.execute_query(
            f"""
            SELECT DISTINCT m.*, s.subject_code, s.subject_name, s.semester_id
            FROM study_materials m
            JOIN subjects s ON m.subject_id = s.id
            WHERE {mat_where}
            ORDER BY m.material_type ASC
            """,
            mat_params,
            fetch_all=True
        ) or []

        return jsonify({
            'query': q,
            'total_matches': len(subjects) + len(materials),
            'subjects': subjects,
            'materials': materials
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/courses/<course_code>/search', methods=['GET'])
def search_department_content(course_code):
    try:
        q = request.args.get('q', '').strip()
        if not q:
            return jsonify({'subjects': [], 'materials': []}), 200

        code_upper = course_code.strip().upper()
        if code_upper == 'CSE':
            return search_cse_content()

        course = db.execute_query(
            "SELECT * FROM courses WHERE UPPER(code) = ? OR UPPER(name) LIKE ? OR UPPER(department) LIKE ?",
            (code_upper, f"%{code_upper}%", f"%{code_upper}%"),
            fetch_one=True
        )
        course_id = course['id'] if course else None

        search_terms = [q]
        lower_q = q.lower()
        sub_clauses = []
        sub_params = []
        for term in search_terms:
            wild = f"%{term}%"
            sub_clauses.append("(s.subject_code LIKE ? OR s.subject_name LIKE ?)")
            sub_params.extend([wild, wild])

        where_sub = " OR ".join(sub_clauses)
        dept_filter = ""
        dept_params = []
        if course_id:
            dept_filter = " AND (r.course_id = ? OR s.department LIKE ?)"
            dept_params = [course_id, f"%{course['department']}%"]

        subjects = db.execute_query(
            f"""
            SELECT DISTINCT s.*, sem.semester_number, sem.title as semester_title, r.name as regulation_name
            FROM subjects s
            LEFT JOIN semesters sem ON s.semester_id = sem.id
            LEFT JOIN regulations r ON sem.regulation_id = r.id
            WHERE ({where_sub}){dept_filter}
            ORDER BY s.semester ASC, s.subject_code ASC
            """,
            sub_params + dept_params,
            fetch_all=True
        ) or []

        matched_subj_ids = [s['id'] for s in subjects]
        mat_clauses = []
        mat_params = []
        for term in search_terms:
            wild = f"%{term}%"
            mat_clauses.append("(m.title LIKE ? OR m.source LIKE ? OR m.material_type LIKE ? OR m.unit LIKE ?)")
            mat_params.extend([wild, wild, wild, wild])

        if matched_subj_ids:
            placeholders = ','.join(['?'] * len(matched_subj_ids))
            mat_where = f"({' OR '.join(mat_clauses)}) OR m.subject_id IN ({placeholders})"
            mat_params.extend(matched_subj_ids)
        else:
            mat_where = " OR ".join(mat_clauses)

        materials = db.execute_query(
            f"""
            SELECT DISTINCT m.*, s.subject_code, s.subject_name, s.semester_id
            FROM study_materials m
            JOIN subjects s ON m.subject_id = s.id
            LEFT JOIN semesters sem ON s.semester_id = sem.id
            LEFT JOIN regulations r ON sem.regulation_id = r.id
            WHERE ({mat_where}){dept_filter}
            ORDER BY m.material_type ASC
            """,
            mat_params + dept_params,
            fetch_all=True
        ) or []

        return jsonify({
            'query': q,
            'department': course_code,
            'total_matches': len(subjects) + len(materials),
            'subjects': subjects,
            'materials': materials
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ----------------- ADMIN SUBJECT MANAGEMENT -----------------

@app.route('/api/subjects', methods=['POST'])
def add_subject():
    try:
        data = request.get_json() or {}
        code = data.get('subject_code', '').strip().upper()
        name = data.get('subject_name', '').strip()
        dept = data.get('department', '').strip() or 'Computer Science Engineering'
        semester = int(data.get('semester', 1))
        semester_id = data.get('semester_id')
        credits = int(data.get('credits', 3))

        if not code or not name:
            return jsonify({'message': 'Subject code and name are required.'}), 400

        existing = db.execute_query("SELECT id FROM subjects WHERE subject_code = ?", (code,), fetch_one=True)
        if existing:
            return jsonify({'message': f'Subject with code {code} already exists.'}), 409

        sub_id = db.execute_query(
            """
            INSERT INTO subjects (subject_code, subject_name, department, semester, semester_id, credits)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (code, name, dept, semester, semester_id, credits),
            commit=True
        )

        new_sub = db.execute_query("SELECT * FROM subjects WHERE id = ?", (sub_id,), fetch_one=True)
        return jsonify({'message': 'Subject created successfully.', 'subject': new_sub}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/subjects/<int:subject_id>', methods=['PUT'])
def update_subject(subject_id):
    try:
        data = request.get_json() or {}
        existing = db.execute_query("SELECT * FROM subjects WHERE id = ?", (subject_id,), fetch_one=True)
        if not existing:
            return jsonify({'message': 'Subject not found'}), 404

        name = data.get('subject_name', existing['subject_name']).strip()
        dept = data.get('department', existing['department']).strip()
        semester = int(data.get('semester', existing.get('semester', 1)))
        credits = int(data.get('credits', existing.get('credits', 3)))

        db.execute_query(
            """
            UPDATE subjects
            SET subject_name = ?, department = ?, semester = ?, credits = ?
            WHERE id = ?
            """,
            (name, dept, semester, credits, subject_id),
            commit=True
        )

        updated = db.execute_query("SELECT * FROM subjects WHERE id = ?", (subject_id,), fetch_one=True)
        return jsonify({'message': 'Subject updated successfully.', 'subject': updated}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/subjects/<int:subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    try:
        existing = db.execute_query("SELECT * FROM subjects WHERE id = ?", (subject_id,), fetch_one=True)
        if not existing:
            return jsonify({'message': 'Subject not found'}), 404

        db.execute_query("DELETE FROM study_materials WHERE subject_id = ?", (subject_id,), commit=True)
        db.execute_query("DELETE FROM subjects WHERE id = ?", (subject_id,), commit=True)
        return jsonify({'message': 'Subject deleted successfully.'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ----------------- ADMIN STUDY MATERIAL MANAGEMENT -----------------

@app.route('/api/study-materials', methods=['GET'])
def get_all_study_materials():
    try:
        subj_id = request.args.get('subject_id')
        mtype = request.args.get('material_type')
        query = """
            SELECT m.*, s.subject_code, s.subject_name, s.semester, s.department
            FROM study_materials m
            JOIN subjects s ON m.subject_id = s.id
            WHERE 1=1
        """
        params = []
        if subj_id:
            query += " AND m.subject_id = ?"
            params.append(subj_id)
        if mtype and mtype != 'All':
            query += " AND m.material_type = ?"
            params.append(mtype)
        query += " ORDER BY s.subject_code ASC, m.unit ASC"
        materials = db.execute_query(query, params, fetch_all=True) or []
        return jsonify({'materials': materials}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/study-materials', methods=['POST'])
def add_study_material():
    try:
        data = request.get_json() or {}
        subject_id = data.get('subject_id')
        title = data.get('title', '').strip()
        material_type = data.get('material_type', 'Useful Resources').strip()
        unit = data.get('unit', '').strip() or 'All Units'
        url = data.get('url', '').strip()
        source = data.get('source', '').strip() or 'Faculty Portal'
        academic_year = data.get('academic_year', '').strip() or '2024'

        if not subject_id or not title or not url:
            return jsonify({'message': 'Subject, Title, and URL are required.'}), 400

        if not (url.startswith('http://') or url.startswith('https://')):
            return jsonify({'message': 'Invalid URL. Must begin with http:// or https://'}), 400

        insert_id = db.execute_query(
            """
            INSERT INTO study_materials (subject_id, title, material_type, unit, url, source, academic_year)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (subject_id, title, material_type, unit, url, source, academic_year),
            commit=True
        )

        new_mat = db.execute_query("SELECT * FROM study_materials WHERE id = ?", (insert_id,), fetch_one=True)
        return jsonify({
            'message': 'Study material added successfully.',
            'material': new_mat
        }), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/study-materials/<int:material_id>', methods=['PUT'])
def update_study_material(material_id):
    try:
        data = request.get_json() or {}
        existing = db.execute_query("SELECT * FROM study_materials WHERE id = ?", (material_id,), fetch_one=True)
        if not existing:
            return jsonify({'message': 'Material not found'}), 404

        title = data.get('title', existing['title']).strip()
        material_type = data.get('material_type', existing['material_type']).strip()
        unit = data.get('unit', existing.get('unit', 'All Units')).strip()
        url = data.get('url', existing['url']).strip()
        source = data.get('source', existing.get('source', '')).strip()
        academic_year = data.get('academic_year', existing.get('academic_year', '2024')).strip()

        if not (url.startswith('http://') or url.startswith('https://')):
            return jsonify({'message': 'Invalid URL. Must begin with http:// or https://'}), 400

        db.execute_query(
            """
            UPDATE study_materials
            SET title = ?, material_type = ?, unit = ?, url = ?, source = ?, academic_year = ?
            WHERE id = ?
            """,
            (title, material_type, unit, url, source, academic_year, material_id),
            commit=True
        )

        updated = db.execute_query("SELECT * FROM study_materials WHERE id = ?", (material_id,), fetch_one=True)
        return jsonify({
            'message': 'Study material updated successfully.',
            'material': updated
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/study-materials/<int:material_id>', methods=['DELETE'])
def delete_study_material(material_id):
    try:
        existing = db.execute_query("SELECT * FROM study_materials WHERE id = ?", (material_id,), fetch_one=True)
        if not existing:
            return jsonify({'message': 'Material not found'}), 404

        db.execute_query("DELETE FROM study_materials WHERE id = ?", (material_id,), commit=True)
        return jsonify({'message': 'Study material deleted successfully.'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ----------------- ENTRY POINT -----------------

if __name__ == '__main__':
    db.init_db()
    print(f"[SVCET Backend] Starting Python API Server on http://localhost:{PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=False)
