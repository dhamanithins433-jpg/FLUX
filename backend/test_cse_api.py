import json
from app import app

def run_tests():
    client = app.test_client()

    print("--- TEST 1: GET /api/courses ---")
    r1 = client.get('/api/courses')
    assert r1.status_code == 200
    courses = r1.get_json()['courses']
    print(f"Success: {len(courses)} courses found -> {[c['code'] for c in courses]}")

    print("\n--- TEST 2: GET /api/courses/cse ---")
    r2 = client.get('/api/courses/cse')
    assert r2.status_code == 200
    cse = r2.get_json()
    print(f"Success: Course {cse['course']['name']} loaded with {cse['stats']['total_regulations']} regulations")

    print("\n--- TEST 3: GET /api/courses/cse/regulations ---")
    r3 = client.get('/api/courses/cse/regulations')
    assert r3.status_code == 200
    regs = r3.get_json()['regulations']
    print(f"Success: Regulations -> {[r['name'] for r in regs]}")

    print("\n--- TEST 4: GET /api/regulations/2021/semesters ---")
    r4 = client.get('/api/regulations/2021/semesters')
    assert r4.status_code == 200
    sems = r4.get_json()['semesters']
    print(f"Success: {len(sems)} semesters found for Regulation 2021")
    assert len(sems) == 8, "Expected 8 semesters"

    print("\n--- TEST 5: GET /api/semesters/<sem_id>/subjects (Semester 4) ---")
    sem4 = next(s for s in sems if s['semester_number'] == 4)
    r5 = client.get(f"/api/semesters/{sem4['id']}/subjects")
    assert r5.status_code == 200
    subs = r5.get_json()['subjects']
    print(f"Success: Semester 4 subjects -> {[s['subject_code'] + ' - ' + s['subject_name'] for s in subs]}")
    assert any(s['subject_code'] == 'CS3452' for s in subs), "CS3452 should be in semester 4"

    print("\n--- TEST 6: GET /api/subjects/<id>/materials (CS3452 Theory of Computation) ---")
    toc = next(s for s in subs if s['subject_code'] == 'CS3452')
    r6 = client.get(f"/api/subjects/{toc['id']}/materials")
    assert r6.status_code == 200
    mat_res = r6.get_json()
    print(f"Success: CS3452 has {mat_res['total_materials']} materials across categories:")
    for cat, items in mat_res['grouped_materials'].items():
        print(f"   * {cat}: {len(items)} items")

    print("\n--- TEST 7: SEARCH /api/courses/cse/search ---")
    r7 = client.get('/api/courses/cse/search?q=CS3401')
    res7 = r7.get_json()
    print(f"Search 'CS3401' -> {len(res7['subjects'])} subjects, {len(res7['materials'])} materials")

    r8 = client.get('/api/courses/cse/search?q=DBMS')
    res8 = r8.get_json()
    print(f"Search 'DBMS' -> {len(res8['subjects'])} subjects, {len(res8['materials'])} materials")

    print("\n--- TEST 8: ADMIN STUDY MATERIAL MANAGEMENT (POST, PUT, DELETE) ---")
    # 8a: Create
    create_payload = {
        "subject_id": toc['id'],
        "title": "Automata & DFA Conversion Test Practice Sheet",
        "material_type": "Important Questions",
        "unit": "Unit 1",
        "url": "https://www.brainkart.com/subject/Theory-of-Computation_410/",
        "source": "Faculty Reviewer",
        "academic_year": "2024"
    }
    r_create = client.post('/api/study-materials', data=json.dumps(create_payload), content_type='application/json')
    assert r_create.status_code == 201, f"Failed create: {r_create.data}"
    created_item = r_create.get_json()['material']
    mat_id = created_item['id']
    print(f"Created material with ID {mat_id}: {created_item['title']}")

    # 8b: Update
    update_payload = {
        "title": "Automata & DFA Conversion Practice Sheet (Updated)",
        "material_type": "Important Questions",
        "unit": "Unit 1",
        "url": "https://www.brainkart.com/subject/Theory-of-Computation_410/",
        "source": "Senior Faculty Reviewer",
        "academic_year": "2024-2025"
    }
    r_update = client.put(f'/api/study-materials/{mat_id}', data=json.dumps(update_payload), content_type='application/json')
    assert r_update.status_code == 200, f"Failed update: {r_update.data}"
    print(f"Updated material ID {mat_id}: {r_update.get_json()['material']['title']}")

    # 8c: Delete
    r_delete = client.delete(f'/api/study-materials/{mat_id}')
    assert r_delete.status_code == 200, f"Failed delete: {r_delete.data}"
    print(f"Deleted material ID {mat_id} successfully")

    print("\n=======================================================")
    print("ALL CSE COURSES, CURRICULUM, AND REST APIS PASSED 100%!")
    print("=======================================================")

if __name__ == '__main__':
    run_tests()
