"""
=============================================================================
SVCET STUDENT ONBOARDING & DATA INSERTION UTILITY
=============================================================================
Use this script to easily add real students to your college portal.
You can:
  1. Add students directly by editing the REAL_STUDENTS list below.
  2. Or import from a CSV file (e.g. students.csv).

To run this script:
    python backend/add_students.py
=============================================================================
"""

import os
import csv
import sys
from pathlib import Path
from werkzeug.security import generate_password_hash

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from db import db

def add_single_student(
    name,
    register_no,
    department,
    email,
    password="student123",
    year=1,
    semester=1,
    section="A",
    batch="2024-2028",
    phone="",
    tuition_fee=60000,
    exam_fee=5000,
    transport_fee=0,
    hostel_fee=0,
    other_fee=2000,
    paid_amount=0
):
    """
    Inserts a student into all required tables:
      1. users (for authentication & login)
      2. students (profile records)
      3. fees (institutional ledger & balance tracking)
    """
    try:
        # 1. Check if user already exists
        existing = db.execute_query(
            "SELECT id FROM users WHERE user_id = ? OR email = ?",
            (register_no, email),
            fetch_one=True
        )
        if existing:
            print(f"[-] Skipped: Student {register_no} ({name}) already exists in database.")
            return False

        # 2. Insert into users table
        pw_hash = generate_password_hash(password)
        db.execute_query(
            """
            INSERT INTO users (name, user_id, email, password_hash, role, department, phone, batch, year, semester, section)
            VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?, ?, ?)
            """,
            (name, register_no, email, pw_hash, department, phone, batch, year, semester, section),
            commit=True
        )

        # 3. Insert into students table
        db.execute_query(
            """
            INSERT INTO students (register_no, name, department, year, semester, section, batch, email, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (register_no, name, department, year, semester, section, batch, email, phone),
            commit=True
        )

        # 4. Insert into fees table
        db.execute_query(
            """
            INSERT INTO fees (register_no, tuition_fee, exam_fee, transport_fee, hostel_fee, other_fee, paid_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (register_no, tuition_fee, exam_fee, transport_fee, hostel_fee, other_fee, paid_amount),
            commit=True
        )

        net_fee = tuition_fee + exam_fee + transport_fee + hostel_fee + other_fee
        balance = net_fee - paid_amount
        print(f"[OK] Added: {name} | Reg: {register_no} | Dept: {department} | Sem: {semester} | Sec: {section} | Dues: Rs.{balance}")
        return True

    except Exception as e:
        print(f"[!] Error adding {register_no}: {e}")
        return False


def import_from_list():
    """
    EDIT THIS LIST TO ADD YOUR REAL STUDENTS!
    Format for each student:
      (Name, Register_Number, Department, Email, Password, Year, Phone, Tuition_Fee, Exam_Fee, Transport, Hostel, Other, Paid_Amount)
    """
    REAL_STUDENTS = [
        # Example 1
        {
            "name": "Kavitha S",
            "register_no": "112424104021",
            "department": "Computer Science Engineering",
            "email": "kavitha.s@svcet.edu.in",
            "password": "student123",
            "year": 1,
            "phone": "+91 9840123456",
            "tuition_fee": 65000,
            "exam_fee": 5000,
            "transport_fee": 10000,
            "hostel_fee": 0,
            "other_fee": 2000,
            "paid_amount": 30000  # Paid Rs. 30,000, Remaining balance will be Rs. 52,000
        },
        # Example 2
        {
            "name": "Siddharth M",
            "register_no": "112424104022",
            "department": "Artificial Intelligence & Data Science",
            "email": "siddharth.m@svcet.edu.in",
            "password": "student123",
            "year": 1,
            "phone": "+91 9789123456",
            "tuition_fee": 70000,
            "exam_fee": 5000,
            "transport_fee": 0,
            "hostel_fee": 15000,
            "other_fee": 3000,
            "paid_amount": 50000
        }
        # Add as many real students here as you want!
    ]

    print("\n--- ONBOARDING REAL STUDENTS FROM LIST ---")
    added_count = 0
    for s in REAL_STUDENTS:
        success = add_single_student(
            name=s["name"],
            register_no=s["register_no"],
            department=s["department"],
            email=s["email"],
            password=s.get("password", "student123"),
            year=s.get("year", 1),
            phone=s.get("phone", ""),
            tuition_fee=s.get("tuition_fee", 60000),
            exam_fee=s.get("exam_fee", 5000),
            transport_fee=s.get("transport_fee", 0),
            hostel_fee=s.get("hostel_fee", 0),
            other_fee=s.get("other_fee", 2000),
            paid_amount=s.get("paid_amount", 0)
        )
        if success:
            added_count += 1

    print(f"\nDone! {added_count} student(s) successfully processed.\n")


def import_from_csv(csv_path="students.csv"):
    """
    Imports students from a CSV file.
    Expected CSV columns (header row):
      name,register_no,department,email,password,year,phone,tuition_fee,exam_fee,transport_fee,hostel_fee,other_fee,paid_amount
    """
    if not os.path.exists(csv_path):
        print(f"[!] CSV file not found at: {csv_path}")
        return

    print(f"\n--- IMPORTING STUDENTS FROM CSV: {csv_path} ---")
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            add_single_student(
                name=row["name"].strip(),
                register_no=row["register_no"].strip(),
                department=row["department"].strip(),
                email=row["email"].strip(),
                password=row.get("password", "student123").strip(),
                year=int(row.get("year", 1)),
                phone=row.get("phone", "").strip(),
                tuition_fee=float(row.get("tuition_fee", 60000)),
                exam_fee=float(row.get("exam_fee", 5000)),
                transport_fee=float(row.get("transport_fee", 0)),
                hostel_fee=float(row.get("hostel_fee", 0)),
                other_fee=float(row.get("other_fee", 2000)),
                paid_amount=float(row.get("paid_amount", 0))
            )


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1].endswith(".csv"):
        import_from_csv(sys.argv[1])
    else:
        import_from_list()
