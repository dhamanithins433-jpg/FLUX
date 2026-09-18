import json
from app import app

def run_departments_tests():
    client = app.test_client()

    print("=======================================================")
    print("      MULTI-DEPARTMENT & HEALTH CHECK TEST SUITE       ")
    print("=======================================================")

    # 1. Health check
    print("\n--- TEST 1: GET /api/health ---")
    r_health = client.get('/api/health')
    assert r_health.status_code == 200, f"Health check failed: {r_health.data}"
    health_data = r_health.get_json()
    print(f"Health check status: {health_data['status']}, Database: {health_data['database']}")
    assert health_data['database'] in ['connected', 'fallback_sqlite'], "Database should be connected"

    # 2. Get All Courses
    print("\n--- TEST 2: GET /api/courses ---")
    r_courses = client.get('/api/courses')
    assert r_courses.status_code == 200
    courses = r_courses.get_json()['courses']
    codes = [c['code'] for c in courses]
    print(f"Found {len(courses)} departments: {codes}")
    for expected in ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS']:
        assert expected in codes, f"Expected {expected} in courses"

    # 3. Test Information Technology (IT)
    print("\n--- TEST 3: GET /api/courses/it ---")
    r_it = client.get('/api/courses/it')
    assert r_it.status_code == 200
    it_data = r_it.get_json()
    print(f"IT loaded: {it_data['course']['name']} with {len(it_data['regulations'])} regulations and {it_data['stats']['total_subjects']} subjects")
    assert len(it_data['regulations']) >= 2, "Expected R2021 and R2025"

    # 4. Test ECE Regulations & Semesters
    print("\n--- TEST 4: GET /api/courses/ece/regulations ---")
    r_ece_regs = client.get('/api/courses/ece/regulations')
    assert r_ece_regs.status_code == 200
    ece_regs = r_ece_regs.get_json()['regulations']
    r2021_ece = next(r for r in ece_regs if r['code'] == 'R2021')
    r_ece_sems = client.get(f"/api/regulations/{r2021_ece['id']}/semesters")
    assert r_ece_sems.status_code == 200
    ece_sems = r_ece_sems.get_json()['semesters']
    print(f"ECE R2021 has {len(ece_sems)} semesters")
    assert len(ece_sems) == 8

    # 5. Test AIDS Subjects & Materials
    print("\n--- TEST 5: AIDS Subjects & Materials ---")
    r_aids = client.get('/api/courses/aids')
    assert r_aids.status_code == 200
    aids_reg = next(r for r in r_aids.get_json()['regulations'] if r['code'] == 'R2021')
    r_aids_sems = client.get(f"/api/regulations/{aids_reg['id']}/semesters")
    sem4_aids = next(s for s in r_aids_sems.get_json()['semesters'] if s['semester_number'] == 4)
    r_aids_subs = client.get(f"/api/semesters/{sem4_aids['id']}/subjects")
    assert r_aids_subs.status_code == 200
    aids_subs = r_aids_subs.get_json()['subjects']
    print(f"AIDS Semester 4 subjects: {[s['subject_code'] for s in aids_subs]}")
    assert any(s['subject_code'] == 'AL3451' for s in aids_subs), "AL3451 Machine Learning should be present"

    # 6. Test Materials for AL3451
    ml_sub = next(s for s in aids_subs if s['subject_code'] == 'AL3451')
    r_ml_mat = client.get(f"/api/subjects/{ml_sub['id']}/materials")
    assert r_ml_mat.status_code == 200
    ml_mat_data = r_ml_mat.get_json()
    print(f"AL3451 has {ml_mat_data['total_materials']} materials across: {list(ml_mat_data['grouped_materials'].keys())}")
    assert ml_mat_data['total_materials'] > 0

    # 7. Test IT Department Search
    print("\n--- TEST 7: Department Search ---")
    r_search = client.get('/api/courses/it/search?q=Web')
    assert r_search.status_code == 200
    search_res = r_search.get_json()
    print(f"IT search 'Web': {len(search_res['subjects'])} subjects, {len(search_res['materials'])} materials")
    assert len(search_res['subjects']) > 0 or len(search_res['materials']) > 0

    # 8. Test Admin Subject CRUD
    print("\n--- TEST 8: Admin Subject CRUD ---")
    new_sub_payload = {
        "subject_code": "TEST9999",
        "subject_name": "Advanced Cloud Engineering Test",
        "department": "Information Technology",
        "semester": 7,
        "credits": 4
    }
    r_sub_create = client.post('/api/subjects', data=json.dumps(new_sub_payload), content_type='application/json')
    assert r_sub_create.status_code == 201, f"Create subject failed: {r_sub_create.data}"
    created_sub = r_sub_create.get_json()['subject']
    sub_id = created_sub['id']
    print(f"Created test subject: {created_sub['subject_code']} (ID: {sub_id})")

    # Update subject
    r_sub_update = client.put(f'/api/subjects/{sub_id}', data=json.dumps({
        "subject_name": "Advanced Cloud Engineering & Microservices (Updated)",
        "department": "Information Technology",
        "semester": 7,
        "credits": 4
    }), content_type='application/json')
    assert r_sub_update.status_code == 200
    print(f"Updated test subject: {r_sub_update.get_json()['subject']['subject_name']}")

    # Delete subject
    r_sub_del = client.delete(f'/api/subjects/{sub_id}')
    assert r_sub_del.status_code == 200
    print(f"Deleted test subject successfully")

    print("\n=======================================================")
    print("ALL MULTI-DEPARTMENT AND HEALTH REST APIS PASSED 100%!")
    print("=======================================================")

if __name__ == '__main__':
    run_departments_tests()
