import urllib.request
import urllib.error
import json

BASE_URL = 'http://localhost:5001'

def api_call(path, method='GET', data=None, token=None):
    url = f'{BASE_URL}{path}'
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode() if data else None,
        headers=headers,
        method=method
    )
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode()
            try:
                return resp.status, json.loads(content)
            except Exception:
                return resp.status, content
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {'error': body}

def run_tests():
    print("======================================================")
    print("      SVCET COLLEGE PORTAL AUTOMATED TEST SUITE       ")
    print("======================================================")

    # 1. LOGIN & JWT ROLES
    print("\n--- TEST 1: Role-Based Authentication ---")
    status, student_login = api_call('/api/auth/login', 'POST', {
        'userId': 'SVCET001', 'password': 'student123', 'role': 'student'
    })
    assert status == 200, f"Student login failed: {student_login}"
    student_token = student_login['token']
    assert student_login['user']['role'] == 'student'
    print(f"[OK] Student Login Success: {student_login['user']['name']} (Role: {student_login['user']['role']})")
    print(f"  Profile Fields: Sem {student_login['user']['semester']}, Sec {student_login['user']['section']}, Batch {student_login['user']['batch']}")

    status, faculty_login = api_call('/api/auth/login', 'POST', {
        'userId': 'FAC001', 'password': 'faculty123', 'role': 'faculty'
    })
    assert status == 200, f"Faculty login failed: {faculty_login}"
    faculty_token = faculty_login['token']
    assert faculty_login['user']['role'] == 'faculty'
    print(f"[OK] Faculty Login Success: {faculty_login['user']['name']} (Role: {faculty_login['user']['role']})")

    status, admin_login = api_call('/api/auth/login', 'POST', {
        'userId': 'ADM001', 'password': 'admin123', 'role': 'college'
    })
    assert status == 200, f"Admin login failed: {admin_login}"
    admin_token = admin_login['token']
    assert admin_login['user']['role'] == 'college'
    print(f"[OK] Admin Login Success: {admin_login['user']['name']} (Role: {admin_login['user']['role']})")

    # 2. SECURE STUDENT DATA ISOLATION
    print("\n--- TEST 2: Student Data Isolation & Authorization ---")
    status, student_profile = api_call('/api/student/profile', 'GET', token=student_token)
    assert status == 200, f"Student profile error: {student_profile}"
    assert student_profile['profile']['register_no'] == 'SVCET001'
    print(f"[OK] Self Profile Access (/api/student/profile): {student_profile['profile']['name']} ({student_profile['profile']['register_no']})")

    status, student_att = api_call('/api/student/attendance', 'GET', token=student_token)
    assert status == 200, f"Student attendance error: {student_att}"
    print(f"[OK] Self Attendance Access (/api/student/attendance): Total classes: {student_att['total_classes']}, Percentage: {student_att['percentage']}%")

    status, student_fees = api_call('/api/student/fees', 'GET', token=student_token)
    assert status == 200, f"Student fees error: {student_fees}"
    print(f"[OK] Self Fees Access (/api/student/fees): Paid: INR {student_fees['fee']['paid_amount']}, Balance: INR {student_fees['fee']['balance']}")

    # Cross-access attempt: SVCET001 tries to access SVCET002's records
    status, cross_att = api_call('/api/attendance/student/SVCET002', 'GET', token=student_token)
    assert status == 403, f"Expected 403 Forbidden for cross-student access, got {status}: {cross_att}"
    print(f"[OK] Data Isolation Block Verified: Student attempting to access other student data got HTTP 403 Forbidden ({cross_att['message']})")

    # 3. ADMIN STUDENT MANAGEMENT: ADD STUDENT
    print("\n--- TEST 3: Admin Student CRUD Management ---")
    new_student_data = {
        'register_no': 'SVCET999',
        'name': 'Pooja Test Student',
        'email': 'pooja.test@svcet.edu.in',
        'phone': '9876500999',
        'department': 'Computer Science Engineering',
        'year': 2,
        'semester': 4,
        'section': 'B',
        'batch': '2024-2028',
        'password': 'PoojaPassword@123',
        'tuition_fee': 55000,
        'exam_fee': 3000
    }
    status, add_res = api_call('/api/admin/students', 'POST', new_student_data, token=admin_token)
    assert status in (201, 409), f"Add student failed: {add_res}"
    print(f"[OK] Admin Add Student Result: {add_res['message']}")

    # 4. EDIT STUDENT
    update_data = {
        'name': 'Pooja Test Student Updated',
        'department': 'Computer Science Engineering',
        'year': 2,
        'semester': 4,
        'section': 'A',
        'batch': '2024-2028',
        'email': 'pooja.updated@svcet.edu.in',
        'phone': '9876500999'
    }
    status, edit_res = api_call('/api/admin/students/SVCET999', 'PUT', update_data, token=admin_token)
    assert status == 200, f"Edit student failed: {edit_res}"
    print(f"[OK] Admin Edit Student: {edit_res['message']} (Section: {edit_res['student']['section']})")

    # 5. RESET PASSWORD & TEST LOGIN
    status, reset_res = api_call('/api/admin/students/SVCET999/reset-password', 'POST', {
        'new_password': 'BrandNewPassword@456'
    }, token=admin_token)
    assert status == 200, f"Reset password failed: {reset_res}"
    print(f"[OK] Admin Reset Password: {reset_res['message']}")

    status, new_login = api_call('/api/auth/login', 'POST', {
        'userId': 'SVCET999', 'password': 'BrandNewPassword@456', 'role': 'student'
    })
    assert status == 200, f"Login with reset password failed: {new_login}"
    print(f"[OK] Login With Newly Reset Password Succeeded for {new_login['user']['name']}")

    # 6. DELETE STUDENT
    status, del_res = api_call('/api/admin/students/SVCET999', 'DELETE', token=admin_token)
    assert status == 200, f"Delete student failed: {del_res}"
    print(f"[OK] Admin Delete Student: {del_res['message']}")

    # 7. BULK IMPORT CSV
    print("\n--- TEST 4: Admin Bulk CSV Import ---")
    csv_payload = {
        'csv_content': "register_no,name,email,phone,department,year,semester,section,batch,password,tuition_fee,exam_fee,paid_amount\n" +
                       "SVCET888,Rohan Sharma,rohan@svcet.edu,9876543299,Information Technology,2,4,A,2024-2028,student123,50000,2500,20000\n"
    }
    status, csv_res = api_call('/api/admin/students/import-csv', 'POST', csv_payload, token=admin_token)
    assert status == 200, f"CSV Import failed: {csv_res}"
    print(f"[OK] CSV Import Response: {csv_res['message']} (Imported: {csv_res['imported_count']}, Skipped: {csv_res['failed_count']})")

    # Clean up Rohan
    api_call('/api/admin/students/SVCET888', 'DELETE', token=admin_token)
    print("[OK] Bulk Imported Test Student Cleaned Up")

    # 8. FACULTY ATTENDANCE & MARKS
    print("\n--- TEST 5: Faculty Attendance & Marks ---")
    status, fac_students = api_call('/api/faculty/students?department=Computer%20Science%20Engineering&semester=6', 'GET', token=faculty_token)
    assert status == 200, f"Faculty students roster error: {fac_students}"
    print(f"[OK] Faculty Students Roster: Loaded {fac_students['total']} students for CSE Sem 6")

    # 9. REAL FACULTY PROFILE API
    print("\n--- TEST 6: Real Faculty Profile Database Verification ---")
    status, fac_profile = api_call('/api/faculty/profile', 'GET', token=faculty_token)
    assert status == 200, f"Faculty profile error: {fac_profile}"
    assert fac_profile['profile']['faculty_id'] == 'FAC001'
    assert 'email' in fac_profile['profile']
    assert 'designation' in fac_profile['profile']
    print(f"[OK] Faculty Profile (/api/faculty/profile): {fac_profile['profile']['name']} ({fac_profile['profile']['faculty_id']})")
    print(f"  Designation: {fac_profile['profile']['designation']}, Dept: {fac_profile['profile']['department']}")

    # 10. ADMIN FACULTY MANAGEMENT: LIST & FILTER
    print("\n--- TEST 7: Admin Faculty Directory & Filter ---")
    status, fac_list = api_call('/api/admin/faculty', 'GET', token=admin_token)
    assert status == 200, f"Faculty list failed: {fac_list}"
    assert 'faculty' in fac_list
    assert len(fac_list['faculty']) >= 1
    print(f"[OK] Admin Faculty Directory: {fac_list['total']} faculty members registered in database")

    # 11. ADMIN ENROLL FACULTY (CREATE)
    print("\n--- TEST 8: Admin Add Faculty Member ---")
    new_faculty = {
        'faculty_id': 'FAC999',
        'name': 'Dr. Test Professor',
        'email': 'test.prof@svcet.edu.in',
        'phone': '9876500888',
        'department': 'Computer Science Engineering',
        'designation': 'Assistant Professor',
        'password': 'FacultyPass@123'
    }
    status, add_fac_res = api_call('/api/admin/faculty', 'POST', new_faculty, token=admin_token)
    assert status in (201, 409), f"Add faculty failed: {add_fac_res}"
    print(f"[OK] Admin Add Faculty: {add_fac_res['message']}")

    # 12. ADMIN EDIT FACULTY
    print("\n--- TEST 9: Admin Edit Faculty Member ---")
    edit_faculty = {
        'name': 'Dr. Test Professor (Promoted)',
        'email': 'test.prof.promoted@svcet.edu.in',
        'phone': '9876500889',
        'department': 'Computer Science Engineering',
        'designation': 'Associate Professor'
    }
    status, edit_fac_res = api_call('/api/admin/faculty/FAC999', 'PUT', edit_faculty, token=admin_token)
    assert status == 200, f"Edit faculty failed: {edit_fac_res}"
    assert edit_fac_res['faculty']['designation'] == 'Associate Professor'
    print(f"[OK] Admin Edit Faculty: {edit_fac_res['message']} (Designation: {edit_fac_res['faculty']['designation']})")

    # 13. ADMIN RESET FACULTY PASSWORD & TEST LOGIN
    print("\n--- TEST 10: Admin Reset Faculty Password & Authentication ---")
    status, reset_fac_res = api_call('/api/admin/faculty/FAC999/reset-password', 'POST', {
        'new_password': 'UpdatedFacultyPass@456'
    }, token=admin_token)
    assert status == 200, f"Reset faculty password failed: {reset_fac_res}"
    print(f"[OK] Admin Reset Faculty Password: {reset_fac_res['message']}")

    status, new_fac_login = api_call('/api/auth/login', 'POST', {
        'userId': 'FAC999', 'password': 'UpdatedFacultyPass@456', 'role': 'faculty'
    })
    assert status == 200, f"Login with reset faculty password failed: {new_fac_login}"
    assert new_fac_login['user']['role'] == 'faculty'
    print(f"[OK] Login with newly reset password succeeded for {new_fac_login['user']['name']} ({new_fac_login['user']['userId']})")

    # 14. ADMIN DELETE FACULTY
    print("\n--- TEST 11: Admin Delete Faculty Member ---")
    status, del_fac_res = api_call('/api/admin/faculty/FAC999', 'DELETE', token=admin_token)
    assert status == 200, f"Delete faculty failed: {del_fac_res}"
    print(f"[OK] Admin Delete Faculty: {del_fac_res['message']}")

    # 15. ADMIN BULK CSV IMPORT FACULTY
    print("\n--- TEST 12: Admin Bulk Import Faculty via CSV ---")
    fac_csv_payload = {
        'csv_content': "faculty_id,name,email,phone,department,designation,password\n" +
                       "FAC888,Dr. Bulk Faculty,bulk.fac@svcet.edu.in,9876500777,Information Technology,Professor,BulkPass@123\n"
    }
    status, fac_csv_res = api_call('/api/admin/faculty/import-csv', 'POST', fac_csv_payload, token=admin_token)
    assert status == 200, f"Faculty CSV Import failed: {fac_csv_res}"
    assert fac_csv_res['imported_count'] == 1
    print(f"[OK] Faculty CSV Bulk Import: {fac_csv_res['message']} (Imported: {fac_csv_res['imported_count']}, Skipped: {fac_csv_res['failed_count']})")

    # Verify Bulk Imported Faculty can login
    status, bulk_fac_login = api_call('/api/auth/login', 'POST', {
        'userId': 'FAC888', 'password': 'BulkPass@123', 'role': 'faculty'
    })
    assert status == 200, f"Bulk imported faculty login failed: {bulk_fac_login}"
    print(f"[OK] Bulk Imported Faculty Login Verified for {bulk_fac_login['user']['name']} ({bulk_fac_login['user']['userId']})")

    # Clean up FAC888
    api_call('/api/admin/faculty/FAC888', 'DELETE', token=admin_token)
    print("[OK] Bulk Imported Test Faculty Cleaned Up")

    # 16. CSV TEMPLATE DOWNLOAD
    print("\n--- TEST 13: Faculty CSV Template Download ---")
    status, template_res = api_call('/api/admin/faculty/csv-template', 'GET')
    assert status == 200, f"Template download failed: {template_res}"
    print("[OK] Faculty CSV Template Available & Verified")

    print("\n======================================================")
    print("      ALL 13 TEST & INTEGRATION SUITES PASSED! [OK]   ")
    print("======================================================")

if __name__ == '__main__':
    run_tests()
