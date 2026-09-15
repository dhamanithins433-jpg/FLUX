import os
import uuid
import datetime
import jwt
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
        'name': user['name'],
        'role': user['role'],
        'department': user.get('department', ''),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

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
        user_id = data.get('userId') or data.get('registerNumber') or ''
        user_id = user_id.strip()
        password = data.get('password', '')
        selected_role = data.get('role', '').strip()

        if not user_id or not password:
            return jsonify({'message': 'User ID and Password are required'}), 400

        query = "SELECT * FROM users WHERE user_id = ?"
        params = [user_id]
        if selected_role:
            query += " AND role = ?"
            params.append(selected_role)

        user = db.execute_query(query, params, fetch_one=True)
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'message': 'Invalid credentials. Please check your ID and Password.'}), 401

        token = create_token(user)
        user_info = {
            'id': user['id'],
            'name': user['name'],
            'userId': user['user_id'],
            'email': user['email'],
            'role': user['role'],
            'department': user.get('department', '')
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
    query = "SELECT * FROM subjects WHERE 1=1"
    params = []
    if dept:
        query += " AND department = ?"
        params.append(dept)
    query += " ORDER BY subject_code ASC"
    subjects = db.execute_query(query, params, fetch_all=True)
    return jsonify({'subjects': subjects}), 200

# ----------------- ATTENDANCE ENDPOINTS -----------------

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
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
    records = db.execute_query(
        "SELECT a.*, s.subject_name FROM attendance a LEFT JOIN subjects s ON a.subject_code = s.subject_code WHERE a.register_no = ? ORDER BY a.date DESC",
        (reg_no,), fetch_all=True
    )
    total = len(records)
    present = sum(1 for r in records if r['status'] == 'Present')
    late = sum(1 for r in records if r['status'] == 'Late')
    absent = sum(1 for r in records if r['status'] == 'Absent')
    effective_present = present + (late * 0.5)
    pct = round((effective_present / total) * 100, 1) if total > 0 else 100.0

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
    records = db.execute_query(
        """
        SELECT m.*, s.subject_name
        FROM marks m
        LEFT JOIN subjects s ON m.subject_code = s.subject_code
        WHERE m.register_no = ?
        ORDER BY m.subject_code, m.exam_type
        """,
        (reg_no,), fetch_all=True
    )
    grouped = {}
    for r in records:
        e = r['exam_type']
        if e not in grouped:
            grouped[e] = []
        grouped[e].append(r)

    total_score = sum(r['marks_obtained'] for r in records)
    total_max = sum(r['max_marks'] for r in records)
    avg_pct = round((total_score / total_max) * 100, 1) if total_max > 0 else 0.0

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
        rate = 94.2

    return jsonify({
        'total_students': students_cnt,
        'total_faculty': faculty_cnt,
        'total_revenue': total_rev,
        'total_collected': total_col,
        'total_outstanding': total_due,
        'attendance_rate': rate
    }), 200

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
