import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:5001/api";

function TeacherPortal({ user, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "attendance");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("svcet_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Filter States
  const [selectedDept, setSelectedDept] = useState(user?.department || "Computer Science Engineering");
  const [selectedSemester, setSelectedSemester] = useState("4");
  const [selectedSection, setSelectedSection] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("CS3301");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedExam, setSelectedExam] = useState("Internal Assessment 1");

  // Data States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [marksRecords, setMarksRecords] = useState([]);
  const [departmentStudents, setDepartmentStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [profile, setProfile] = useState(null);

  // Fetch verified faculty profile from database
  useEffect(() => {
    fetch(`${API_BASE}/faculty/profile`, { headers: getAuthHeaders() })
      .then((r) => {
        if (r.ok) return r.json();
        return null;
      })
      .then((data) => {
        if (data && data.profile) {
          setProfile(data.profile);
          if (data.profile.department) {
            setSelectedDept(data.profile.department);
          }
        }
      })
      .catch((err) => console.error("Error fetching faculty profile:", err));
  }, []);

  // Load Subjects on mount / dept change
  useEffect(() => {
    fetch(`${API_BASE}/subjects?department=${encodeURIComponent(selectedDept)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.subjects && data.subjects.length > 0) {
          setSubjects(data.subjects);
          setSelectedSubject(data.subjects[0].subject_code);
        }
      })
      .catch((err) => console.error(err));
  }, [selectedDept]);

  // Load Department Students Roster
  useEffect(() => {
    fetchDepartmentStudents();
  }, [selectedDept, selectedSemester, selectedSection]);

  const fetchDepartmentStudents = async () => {
    try {
      let url = `${API_BASE}/faculty/students?department=${encodeURIComponent(selectedDept)}&semester=${selectedSemester}`;
      if (selectedSection !== "All") url += `&section=${selectedSection}`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDepartmentStudents(data.students || []);
      } else {
        const fallbackRes = await fetch(`${API_BASE}/students?department=${encodeURIComponent(selectedDept)}`);
        const fallbackData = await fallbackRes.json();
        setDepartmentStudents(fallbackData.students || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Attendance when filters change
  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    }
  }, [selectedDept, selectedSemester, selectedSection, selectedDate, selectedSubject, activeTab]);

  // Load Marks when filters change
  useEffect(() => {
    if (activeTab === "marks") {
      fetchMarks();
    }
  }, [selectedDept, selectedSemester, selectedSection, selectedSubject, selectedExam, activeTab]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const year = Math.ceil(Number(selectedSemester) / 2) || 2;
      const res = await fetch(
        `${API_BASE}/attendance?department=${encodeURIComponent(selectedDept)}&year=${year}&date=${selectedDate}&subject_code=${selectedSubject}`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      setAttendanceRecords(data.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const year = Math.ceil(Number(selectedSemester) / 2) || 2;
      const res = await fetch(
        `${API_BASE}/marks?department=${encodeURIComponent(selectedDept)}&year=${year}&subject_code=${selectedSubject}&exam_type=${encodeURIComponent(selectedExam)}`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      setMarksRecords(data.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ATTENDANCE HANDLERS
  const handleStatusChange = (regNo, newStatus) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.register_no === regNo ? { ...r, status: newStatus } : r))
    );
  };

  const handleRemarkChange = (regNo, text) => {
    setAttendanceRecords((prev) =>
      prev.map((r) => (r.register_no === regNo ? { ...r, remarks: text } : r))
    );
  };

  const handleMarkAllPresent = () => {
    setAttendanceRecords((prev) =>
      prev.map((r) => ({ ...r, status: "Present" }))
    );
    showToast("All students marked as Present!");
  };

  const handleMarkAllAbsent = () => {
    setAttendanceRecords((prev) =>
      prev.map((r) => ({ ...r, status: "Absent" }))
    );
    showToast("All students marked as Absent.");
  };

  const handleClearAllAttendance = () => {
    setAttendanceRecords((prev) =>
      prev.map((r) => ({ ...r, status: "Present", remarks: "" }))
    );
    showToast("Attendance status reset to default Present.");
  };

  const handleSaveAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          date: selectedDate,
          subject_code: selectedSubject,
          recorded_by: profile?.faculty_id || user?.faculty_id || user?.userId || user?.user_id || "FAC001",
          records: attendanceRecords.map((r) => ({
            register_no: r.register_no,
            status: r.status,
            remarks: r.remarks || ""
          }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Attendance saved to database successfully!");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving attendance");
    }
  };

  // MARKS HANDLERS
  const calculateGrade = (val, max = 100) => {
    const score = Number(val);
    if (isNaN(score)) return "RA";
    const pct = (score / max) * 100;
    if (pct >= 90) return "O";
    if (pct >= 80) return "A+";
    if (pct >= 70) return "A";
    if (pct >= 60) return "B+";
    if (pct >= 50) return "B";
    return "RA";
  };

  const handleMarkInputChange = (regNo, val, maxMarks = 100) => {
    let num = val === "" ? "" : Number(val);
    if (num !== "" && num > maxMarks) {
      alert(`Marks obtained cannot exceed Maximum Marks (${maxMarks})!`);
      num = maxMarks;
    }
    if (num !== "" && num < 0) num = 0;

    setMarksRecords((prev) =>
      prev.map((r) => {
        if (r.register_no === regNo) {
          return {
            ...r,
            marks_obtained: num,
            grade: num === "" ? "RA" : calculateGrade(num, r.max_marks || 100)
          };
        }
        return r;
      })
    );
  };

  const handleSaveMarks = async () => {
    try {
      // Validate no marks exceed max
      for (const r of marksRecords) {
        const score = Number(r.marks_obtained);
        const max = Number(r.max_marks || 100);
        if (score > max) {
          alert(`Error on student ${r.register_no}: Marks (${score}) cannot exceed max marks (${max}).`);
          return;
        }
      }

      const res = await fetch(`${API_BASE}/marks/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          subject_code: selectedSubject,
          exam_type: selectedExam,
          recorded_by: profile?.faculty_id || user?.faculty_id || user?.userId || user?.user_id || "FAC001",
          records: marksRecords.map((r) => ({
            register_no: r.register_no,
            marks_obtained: Number(r.marks_obtained) || 0,
            max_marks: Number(r.max_marks) || 100
          }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Academic marks saved to database successfully!");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving marks");
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Summary Metrics
  const totalStudents = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((r) => r.status === "Present").length;
  const lateCount = attendanceRecords.filter((r) => r.status === "Late").length;
  const absentCount = attendanceRecords.filter((r) => r.status === "Absent").length;
  const attendanceRate =
    totalStudents > 0
      ? Math.round(((presentCount + lateCount * 0.5) / totalStudents) * 100)
      : 100;

  const marksAverage =
    marksRecords.length > 0
      ? Math.round(
          marksRecords.reduce((acc, curr) => acc + (Number(curr.marks_obtained) || 0), 0) /
            marksRecords.length
        )
      : 0;
  const passCount = marksRecords.filter((r) => (Number(r.marks_obtained) || 0) >= 50).length;
  const passRate = marksRecords.length > 0 ? Math.round((passCount / marksRecords.length) * 100) : 100;

  // Filter department students
  const filteredDeptStudents = departmentStudents.filter((s) => {
    const q = studentSearch.toLowerCase();
    return !studentSearch || s.name?.toLowerCase().includes(q) || s.register_no?.toLowerCase().includes(q);
  });

  return (
    <div className="portal-container">
      {/* HEADER */}
      <div className="portal-header">
        <div>
          <span className="portal-pill teacher">FACULTY PORTAL</span>
          <h2>Faculty Academic & Attendance Management</h2>
          <p>
            Logged in: <strong>{profile?.name || user?.name || "Faculty Member"}</strong> ({profile?.faculty_id || user?.faculty_id || user?.userId || user?.user_id || "FAC001"}) • {profile?.designation ? `${profile.designation} • ` : ""}{profile?.department || selectedDept} • SVCET Campus
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="alert-banner success">
          ✓ {toastMessage}
        </div>
      )}

      {/* TABS */}
      <div className="portal-tabs">
        <button
          className={activeTab === "students" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("students")}
        >
          👥 Department Students ({departmentStudents.length})
        </button>
        <button
          className={activeTab === "attendance" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("attendance")}
        >
          📋 Daily Attendance Marker
        </button>
        <button
          className={activeTab === "marks" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("marks")}
        >
          📊 Academic Marks Entry & Grading
        </button>
        <button
          className={activeTab === "profile" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("profile")}
        >
          👤 Faculty Profile
        </button>
      </div>

      {/* ================= TAB 1: STUDENTS ROSTER ================= */}
      {activeTab === "students" && (
        <div className="portal-card">
          <div className="card-toolbar" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
              <div className="search-box" style={{ minWidth: "260px" }}>
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search students by Name or Register No..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Department:</label>
                <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                  <option value="Computer Science Engineering">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Comm.</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engg.</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Semester:</label>
                <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Section:</label>
                <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                  <option value="All">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Register No</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Section</th>
                  <th>Batch</th>
                  <th>Institutional Email</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeptStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "28px", color: "#64748b" }}>
                      No student records found for the selected department and semester.
                    </td>
                  </tr>
                ) : (
                  filteredDeptStudents.map((s) => (
                    <tr key={s.register_no}>
                      <td><strong>{s.register_no}</strong></td>
                      <td>{s.name}</td>
                      <td><span className="dept-tag">{s.department}</span></td>
                      <td>Sem {s.semester || selectedSemester}</td>
                      <td><span className="grade-badge grade-A">{s.section || "A"}</span></td>
                      <td>{s.batch || "2024-2028"}</td>
                      <td>{s.email}</td>
                      <td>{s.phone || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ATTENDANCE ================= */}
      {activeTab === "attendance" && (
        <div className="portal-card">
          {/* FILTER BAR */}
          <div className="class-filter-bar">
            <div className="filter-item">
              <label>Department:</label>
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                <option value="Computer Science Engineering">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Comm.</option>
                <option value="Mechanical Engineering">Mechanical Engg.</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Semester:</label>
              <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Subject / Course:</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                {subjects.length > 0 ? (
                  subjects.map((s) => (
                    <option key={s.subject_code} value={s.subject_code}>
                      {s.subject_code} - {s.subject_name}
                    </option>
                  ))
                ) : (
                  <option value="CS3301">CS3301 - Data Structures</option>
                )}
              </select>
            </div>

            <div className="filter-item">
              <label>Attendance Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="filter-item button-cell" style={{ display: "flex", gap: "6px" }}>
              <button className="btn-secondary" onClick={handleMarkAllPresent} title="Mark all Present">
                ✓ All Present
              </button>
              <button className="btn-outline" onClick={handleMarkAllAbsent} title="Mark all Absent" style={{ color: "#dc2626", borderColor: "#fca5a5" }}>
                ✕ All Absent
              </button>
              <button className="btn-outline" onClick={handleClearAllAttendance} title="Reset Status">
                ↺ Reset
              </button>
            </div>
          </div>

          {/* REAL-TIME STATS STRIP */}
          <div className="attendance-summary-bar">
            <div>
              <span>Class Strength:</span> <strong>{totalStudents}</strong>
            </div>
            <div>
              <span>Present:</span> <strong className="text-green">{presentCount}</strong>
            </div>
            <div>
              <span>Late:</span> <strong className="text-amber">{lateCount}</strong>
            </div>
            <div>
              <span>Absent:</span> <strong className="text-red">{absentCount}</strong>
            </div>
            <div>
              <span>Attendance Rate:</span>
              <strong className={attendanceRate >= 75 ? "text-green" : "text-red"}>
                {attendanceRate}%
              </strong>
            </div>
          </div>

          {/* ROSTER TABLE */}
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Reg Number</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Attendance Status</th>
                  <th>Remarks / Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "24px" }}>
                      No student records found for the selected department and semester.
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((r) => (
                    <tr key={r.register_no}>
                      <td><strong>{r.register_no}</strong></td>
                      <td>{r.name}</td>
                      <td><span className="dept-tag">{r.department}</span></td>
                      <td>
                        <div className="attendance-toggle-group">
                          <button
                            type="button"
                            className={r.status === "Present" ? "btn-status present active" : "btn-status present"}
                            onClick={() => handleStatusChange(r.register_no, "Present")}
                          >
                            ✓ Present
                          </button>
                          <button
                            type="button"
                            className={r.status === "Late" ? "btn-status late active" : "btn-status late"}
                            onClick={() => handleStatusChange(r.register_no, "Late")}
                          >
                            ⏱ Late
                          </button>
                          <button
                            type="button"
                            className={r.status === "Absent" ? "btn-status absent active" : "btn-status absent"}
                            onClick={() => handleStatusChange(r.register_no, "Absent")}
                          >
                            ✕ Absent
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="remarks-input"
                          placeholder="Optional remarks..."
                          value={r.remarks || ""}
                          onChange={(e) => handleRemarkChange(r.register_no, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SAVE ACTION BAR */}
          <div className="table-action-footer">
            <p>Make sure to submit attendance before 4:30 PM for official Anna University ERP sync.</p>
            <button className="btn-primary btn-lg" onClick={handleSaveAttendance}>
              💾 Save Daily Attendance to MySQL
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ACADEMIC MARKS ================= */}
      {activeTab === "marks" && (
        <div className="portal-card">
          {/* MARKS FILTER BAR */}
          <div className="class-filter-bar">
            <div className="filter-item">
              <label>Department:</label>
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                <option value="Computer Science Engineering">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Comm.</option>
                <option value="Mechanical Engineering">Mechanical Engg.</option>
              </select>
            </div>

            <div className="filter-item">
              <label>Semester:</label>
              <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Subject / Course:</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                {subjects.length > 0 ? (
                  subjects.map((s) => (
                    <option key={s.subject_code} value={s.subject_code}>
                      {s.subject_code} - {s.subject_name}
                    </option>
                  ))
                ) : (
                  <option value="CS3301">CS3301 - Data Structures</option>
                )}
              </select>
            </div>

            <div className="filter-item">
              <label>Examination Type:</label>
              <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                <option value="Internal Assessment 1">Internal Assessment 1</option>
                <option value="Internal Assessment 2">Internal Assessment 2</option>
                <option value="Model Examination">Model Examination</option>
                <option value="Semester End Exam">Semester End Exam</option>
              </select>
            </div>
          </div>

          {/* MARKS STATS STRIP */}
          <div className="attendance-summary-bar">
            <div>
              <span>Evaluated Students:</span> <strong>{marksRecords.length}</strong>
            </div>
            <div>
              <span>Class Average:</span> <strong className="text-green">{marksAverage} / 100</strong>
            </div>
            <div>
              <span>Pass Count:</span> <strong>{passCount} / {marksRecords.length}</strong>
            </div>
            <div>
              <span>Pass Percentage:</span> <strong className="text-green">{passRate}%</strong>
            </div>
          </div>

          {/* MARKS ENTRY SPREADSHEET */}
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Reg Number</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Marks Obtained</th>
                  <th>Max Marks</th>
                  <th>Grade</th>
                  <th>Evaluation Status</th>
                </tr>
              </thead>
              <tbody>
                {marksRecords.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "24px" }}>
                      No student records found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  marksRecords.map((r) => {
                    const val = r.marks_obtained;
                    const grade = r.grade || calculateGrade(val, r.max_marks || 100);
                    const isPass = Number(val) >= 50;

                    return (
                      <tr key={r.register_no}>
                        <td><strong>{r.register_no}</strong></td>
                        <td>{r.name}</td>
                        <td><span className="dept-tag">{r.department}</span></td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={r.max_marks || 100}
                            className="marks-input-cell"
                            placeholder="0-100"
                            value={val === "" ? "" : val}
                            onChange={(e) => handleMarkInputChange(r.register_no, e.target.value, r.max_marks || 100)}
                          />
                        </td>
                        <td>/ {r.max_marks || 100}</td>
                        <td>
                          <span className={`grade-badge grade-${grade}`}>
                            {grade}
                          </span>
                        </td>
                        <td>
                          {isPass ? (
                            <span className="badge-paid">PASS</span>
                          ) : (
                            <span className="badge-due">REAPPEAR</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* SAVE MARKS BAR */}
          <div className="table-action-footer">
            <p>Automated grading scale: O (90+), A+ (80-89), A (70-79), B+ (60-69), B (50-59), RA (&lt;50). Marks cannot exceed maximum marks.</p>
            <button className="btn-primary btn-lg" onClick={handleSaveMarks}>
              💾 Save Academic Marks to Database
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 4: FACULTY PROFILE ================= */}
      {activeTab === "profile" && (
        <div className="portal-card">
          <div className="card-top-title">
            <h3>Faculty Member Profile</h3>
            <span className="badge-paid">Verified Instructor</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "12px" }}>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Full Name:</span>
              <h4 style={{ margin: "4px 0 0", color: "#1e293b" }}>{profile?.name || user?.name || "Faculty Member"}</h4>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Faculty ID:</span>
              <h4 style={{ margin: "4px 0 0", color: "#1e293b" }}>{profile?.faculty_id || user?.faculty_id || user?.userId || user?.user_id || "FAC001"}</h4>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Department:</span>
              <h4 style={{ margin: "4px 0 0", color: "#1e293b" }}>{profile?.department || user?.department || selectedDept}</h4>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Designation:</span>
              <h4 style={{ margin: "4px 0 0", color: "#1e293b" }}>{profile?.designation || user?.designation || "Assistant Professor"}</h4>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Official Email:</span>
              <h4 style={{ margin: "4px 0 0", color: "#1e293b" }}>{profile?.email || user?.email || "-"}</h4>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Contact Phone:</span>
              <h4 style={{ margin: "4px 0 0", color: "#1e293b" }}>{profile?.phone || user?.phone || "-"}</h4>
            </div>
          </div>

          <div style={{ marginTop: "24px", padding: "16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
            <h4 style={{ color: "#15803d", marginBottom: "8px" }}>📚 Academic Courses Handled (Current Academic Year)</h4>
            <ul style={{ listStyle: "disc", paddingLeft: "20px", color: "#166534", fontSize: "13px", lineHeight: "1.8" }}>
              {profile?.subjects_handled && profile.subjects_handled.length > 0 ? (
                profile.subjects_handled.map((sub, idx) => (
                  <li key={idx}>
                    <strong>{sub.subject_code}</strong>: {sub.subject_name} ({sub.department || profile.department})
                  </li>
                ))
              ) : subjects && subjects.length > 0 ? (
                subjects.slice(0, 4).map((sub) => (
                  <li key={sub.subject_code}>
                    <strong>{sub.subject_code}</strong>: {sub.subject_name} ({sub.department || profile?.department || selectedDept})
                  </li>
                ))
              ) : (
                <li>General Departmental Curriculum Handled</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherPortal;
