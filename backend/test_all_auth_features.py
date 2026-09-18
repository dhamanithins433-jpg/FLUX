import json
from app import app

def run_all_core_tests():
    client = app.test_client()
    print("======================================================")
    print("      ALL EXISTING PORTAL FEATURES AUTOMATED TEST     ")
    print("======================================================")

    # 1. Student Login
    print("\n--- TEST 1: Student Login ---")
    r = client.post('/api/auth/login', json={'userId': 'SVCET001', 'password': 'student123', 'role': 'student'})
    assert r.status_code == 200, f"Student login failed: {r.data}"
    stu_res = r.get_json()
    stu_token = stu_res['token']
    print(f"[OK] Student login OK: {stu_res['user']['name']} (Role: {stu_res['user']['role']})")

    # 2. Faculty Login
    print("\n--- TEST 2: Faculty Login ---")
    r = client.post('/api/auth/login', json={'userId': 'FAC001', 'password': 'faculty123', 'role': 'faculty'})
    assert r.status_code == 200, f"Faculty login failed: {r.data}"
    fac_res = r.get_json()
    fac_token = fac_res['token']
    print(f"[OK] Faculty login OK: {fac_res['user']['name']} (Role: {fac_res['user']['role']})")

    # 3. Admin Login
    print("\n--- TEST 3: Admin Login ---")
    r = client.post('/api/auth/login', json={'userId': 'ADM001', 'password': 'admin123', 'role': 'college'})
    assert r.status_code == 200, f"Admin login failed: {r.data}"
    adm_res = r.get_json()
    adm_token = adm_res['token']
    print(f"[OK] Admin login OK: {adm_res['user']['name']} (Role: {adm_res['user']['role']})")

    # 4. Student Profile
    print("\n--- TEST 4: Student Self Profile ---")
    headers = {'Authorization': f'Bearer {stu_token}'}
    r = client.get('/api/student/profile', headers=headers)
    assert r.status_code == 200, f"Profile error: {r.data}"
    prof = r.get_json()['profile']
    print(f"[OK] Profile: {prof['name']}, Dept: {prof['department']}, Reg: {prof['register_no']}")

    # 5. Student Attendance
    print("\n--- TEST 5: Student Self Attendance ---")
    r = client.get('/api/student/attendance', headers=headers)
    assert r.status_code == 200, f"Attendance error: {r.data}"
    att = r.get_json()
    print(f"[OK] Attendance: total_classes={att.get('total_classes', 0)}, percentage={att.get('percentage', 0)}%")

    # 6. Student Fees
    print("\n--- TEST 6: Student Self Fees ---")
    r = client.get('/api/student/fees', headers=headers)
    assert r.status_code == 200, f"Fees error: {r.data}"
    fees = r.get_json()
    print(f"[OK] Fees: Paid={fees.get('fee', {}).get('paid_amount')}, Balance={fees.get('fee', {}).get('balance')}")

    # 7. Admin Student List
    print("\n--- TEST 7: Admin Students Endpoint ---")
    adm_headers = {'Authorization': f'Bearer {adm_token}'}
    r = client.get('/api/admin/students', headers=adm_headers)
    assert r.status_code == 200, f"Admin students error: {r.data}"
    students = r.get_json()['students']
    print(f"[OK] Admin students list OK: {len(students)} students found")

    print("\n======================================================")
    print("ALL EXISTING STUDENT, FACULTY, AND ADMIN FEATURES OK! ")
    print("======================================================")

if __name__ == '__main__':
    run_all_core_tests()
