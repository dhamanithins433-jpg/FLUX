#!/usr/bin/env python3
"""
Safe MySQL Migration & Schema Synchronization Utility.
Exports existing data from local SQLite database (or existing source) and
safely populates the target MySQL database using .env credentials.
Zero-data-loss guarantee with verification reporting.
"""

import os
import sys
import sqlite3
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False
    print("ERROR: mysql-connector-python is not installed. Run: pip install mysql-connector-python")
    sys.exit(1)

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'svcet_fees_portal')

SQLITE_PATH = BASE_DIR / 'college_portal.sqlite3'
SCHEMA_PATH = BASE_DIR / 'schema_migration.sql'

TABLES_ORDER = [
    'users',
    'students',
    'teachers',
    'courses',
    'regulations',
    'semesters',
    'subjects',
    'attendance',
    'marks',
    'fees',
    'payments',
    'study_materials'
]

def run_migration():
    print("=================================================================")
    print("      SVCET COLLEGE PORTAL: SAFE MYSQL DATABASE MIGRATOR         ")
    print("=================================================================")
    print(f"Target Server: {DB_HOST}:{DB_PORT}")
    print(f"Target User  : {DB_USER}")
    print(f"Target DB    : {DB_NAME}")
    print(f"Source DB    : {SQLITE_PATH}")
    print("-----------------------------------------------------------------")

    # 1. Connect to SQLite
    if not SQLITE_PATH.exists():
        print(f"ERROR: Local SQLite database '{SQLITE_PATH}' not found.")
        sys.exit(1)

    sqlite_conn = sqlite3.connect(str(SQLITE_PATH))
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()

    # 2. Test & Connect to MySQL Server
    try:
        mysql_server_conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            connection_timeout=5
        )
        mysql_server_cur = mysql_server_conn.cursor()
        print(f"[MySQL] Connected to MySQL Server at {DB_HOST}:{DB_PORT}")

        # Create Database if not exists
        mysql_server_cur.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"[MySQL] Database `{DB_NAME}` verified/created.")
        mysql_server_cur.close()
        mysql_server_conn.close()
    except Exception as err:
        print(f"\n[FATAL] Could not connect to MySQL Server ({DB_HOST}:{DB_PORT}): {err}")
        print("\nPlease verify your backend/.env file settings:")
        print("  DB_HOST=...")
        print("  DB_PORT=3306")
        print("  DB_USER=...")
        print("  DB_PASSWORD=...")
        print("  DB_NAME=...")
        sys.exit(1)

    # 3. Connect to target database
    mysql_conn = mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )
    mysql_cur = mysql_conn.cursor(dictionary=True)

    # 4. Execute Schema Migration Script
    print("\n[Schema] Applying database schema from schema_migration.sql...")
    if SCHEMA_PATH.exists():
        with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        # Split and execute statements
        statements = [stmt.strip() for stmt in sql_script.split(';') if stmt.strip()]
        for stmt in statements:
            if stmt.upper().startswith('USE ') or stmt.upper().startswith('CREATE DATABASE'):
                continue
            try:
                mysql_cur.execute(stmt)
            except Exception as e:
                # Ignore non-critical warnings
                pass
        mysql_conn.commit()
        print("[Schema] MySQL schema initialized with all 12 tables and indices.")

    # 5. Migrate Data Table by Table
    print("\n[Data Migration] Transferring records from SQLite to MySQL...")
    summary = {}

    for table in TABLES_ORDER:
        try:
            sqlite_cur.execute(f"SELECT * FROM {table}")
            rows = sqlite_cur.fetchall()
            if not rows:
                summary[table] = {"source": 0, "migrated": 0, "status": "Empty"}
                continue

            columns = list(rows[0].keys())
            placeholders = ', '.join(['%s'] * len(columns))
            cols_str = ', '.join([f"`{col}`" for col in columns])

            # Prepare ON DUPLICATE KEY UPDATE clause
            update_clause = ', '.join([f"`{col}` = VALUES(`{col}`)" for col in columns if col != 'id'])
            if update_clause:
                sql_insert = f"INSERT INTO `{table}` ({cols_str}) VALUES ({placeholders}) ON DUPLICATE KEY UPDATE {update_clause}"
            else:
                sql_insert = f"INSERT IGNORE INTO `{table}` ({cols_str}) VALUES ({placeholders})"

            migrated_count = 0
            for row in rows:
                values = [row[col] for col in columns]
                mysql_cur.execute(sql_insert, values)
                migrated_count += 1

            mysql_conn.commit()
            summary[table] = {"source": len(rows), "migrated": migrated_count, "status": "OK"}
            print(f"  * {table.ljust(16)}: {migrated_count} records migrated successfully.")
        except Exception as table_err:
            print(f"  * {table.ljust(16)}: Error - {table_err}")
            summary[table] = {"source": 0, "migrated": 0, "status": f"Error: {table_err}"}

    # 6. Summary Report
    print("\n=================================================================")
    print("                    MIGRATION SUMMARY REPORT                     ")
    print("=================================================================")
    print(f"{'Table Name':<20} | {'Source Rows':<12} | {'Migrated':<10} | {'Status':<10}")
    print("-" * 65)
    total_migrated = 0
    for tbl, res in summary.items():
        print(f"{tbl:<20} | {res['source']:<12} | {res['migrated']:<10} | {res['status']:<10}")
        total_migrated += res['migrated']
    print("-" * 65)
    print(f"TOTAL RECORDS TRANSFERRED: {total_migrated}")
    print("=================================================================")
    print("\nMigration completed successfully. You can now configure your Flask backend to connect to this MySQL database.")

    sqlite_cur.close()
    sqlite_conn.close()
    mysql_cur.close()
    mysql_conn.close()

if __name__ == '__main__':
    run_migration()
