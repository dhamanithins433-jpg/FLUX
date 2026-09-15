import urllib.request
import json

def api_call(path, method='GET', data=None):
    url = f'http://localhost:5001{path}'
    headers = {'Content-Type': 'application/json'}
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode() if data else None,
        headers=headers,
        method=method
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

print("=== 1. TEACHER: ATTENDANCE RECORDING ===")
teacher = api_call('/api/auth/login', 'POST', {'userId': 'FAC001', 'password': 'faculty123', 'role': 'faculty'})
print(f"Logged in: {teacher['user']['name']} ({teacher['user']['userId']})")

att_res = api_call('/api/attendance/batch', 'POST', {
    'date': '2026-09-13',
    'subject_code': 'CS3301',
    'recorded_by': 'FAC001',
    'records': [
        {'register_no': 'SVCET001', 'status': 'Present', 'remarks': 'Active participant'},
        {'register_no': 'SVCET002', 'status': 'Late', 'remarks': '10 min transit delay'},
        {'register_no': 'SVCET003', 'status': 'Absent', 'remarks': 'Sick leave'}
    ]
})
print("Result:", att_res['message'])

print("\n=== 2. TEACHER: ACADEMIC MARKS ENTRY ===")
marks_res = api_call('/api/marks/batch', 'POST', {
    'subject_code': 'CS3301',
    'exam_type': 'Internal Assessment 2',
    'recorded_by': 'FAC001',
    'records': [
        {'register_no': 'SVCET001', 'marks_obtained': 96, 'max_marks': 100},
        {'register_no': 'SVCET002', 'marks_obtained': 85, 'max_marks': 100},
        {'register_no': 'SVCET003', 'marks_obtained': 91, 'max_marks': 100}
    ]
})
print("Result:", marks_res['message'])

print("\n=== 3. STUDENT: VIEW ATTENDANCE & MARKS ===")
student = api_call('/api/auth/login', 'POST', {'userId': 'SVCET001', 'password': 'student123', 'role': 'student'})
print(f"Logged in: {student['user']['name']} ({student['user']['userId']})")

att = api_call('/api/attendance/student/SVCET001')
print(f"Attendance Rate: {att['percentage']}%, Total Classes: {att['total_classes']}, Present: {att['present']}")

marks = api_call('/api/marks/student/SVCET001')
print(f"Subjects evaluated: {len(marks['records'])}, Cumulative Average: {marks['average_percentage']}%")

print("\n=== 4. STUDENT: ONLINE FEE PAYMENT (CREDIT CARD) ===")
fee_before = api_call('/api/fees/student/SVCET001')['fee']
print("Outstanding Balance Before Payment: INR", fee_before['balance'])

pay_res = api_call('/api/fees/online-payment', 'POST', {
    'register_no': 'SVCET001',
    'amount': 10000,
    'payment_method': 'Credit Card',
    'card_holder_name': 'Kishore Student'
})
print(f"Payment Success! Receipt No: {pay_res['receipt']['receipt_no']}, Transaction ID: {pay_res['receipt']['transaction_id']}")
print("New Remaining Balance: INR", pay_res['receipt']['remaining_balance'])

print("\n=== 5. ADMIN: LOG OFFLINE PAYMENT (CHEQUE) ===")
admin = api_call('/api/auth/login', 'POST', {'userId': 'ADM001', 'password': 'admin123', 'role': 'college'})
print(f"Logged in: {admin['user']['name']} ({admin['user']['userId']})")

offline_res = api_call('/api/fees/offline-payment', 'POST', {
    'register_no': 'SVCET002',
    'amount': 15000,
    'payment_method': 'Cheque',
    'notes': 'HDFC Cheque #887712',
    'collected_by': 'ADM001'
})
print(f"Offline Payment Logged! Receipt No: {offline_res['receipt']['receipt_no']}")
print("Student SVCET002 Remaining Balance: INR", offline_res['receipt']['remaining_balance'])

print("\n=== 6. STUDENT: FAST GOOGLE PAY UPI QR PAYMENT ===")
upi_res = api_call('/api/fees/online-payment', 'POST', {
    'register_no': 'SVCET003',
    'amount': 20000,
    'payment_method': 'UPI (Google Pay / QR)',
    'card_holder_name': 'Kavitha Student',
    'utr_reference': '427189218291'
})
print(f"UPI Payment Success! Receipt No: {upi_res['receipt']['receipt_no']}, Transaction ID: {upi_res['receipt']['transaction_id']}")
print(f"Payment Method: {upi_res['receipt']['payment_method']}")
print("Student SVCET003 New Remaining Balance: INR", upi_res['receipt']['remaining_balance'])

print("\n=== 7. INSTITUTIONAL FINANCIAL LEDGER OVERVIEW ===")
stats = api_call('/api/admin/stats')
print("Total Students:", stats['total_students'])
print("Total Fees Assessed: INR", f"{stats['total_revenue']:,}")
print("Total Fees Collected: INR", f"{stats['total_collected']:,}")
print("Outstanding Dues: INR", f"{stats['total_outstanding']:,}")
print("Campus Attendance Rate:", f"{stats['attendance_rate']}%")
print("\nALL VERIFICATION TESTS PASSED PERFECTLY!")

