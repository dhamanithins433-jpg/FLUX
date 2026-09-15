import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:5001/api";

function TeacherPortal({ user }) {
  const [activeTab, setActiveTab] = useState("attendance");

  // Filter States
  const [selectedDept, setSelectedDept] = useState(user?.department || "Computer Science Engineering");
  const [selectedYear, setSelectedYear] = useState("3");
  const [selectedSubject, setSelectedSubject] = useState("CS3301");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedExam, setSelectedExam] = useState("Internal Assessment 1");

  // Data States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [marksRecords, setMarksRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load Subjects on mount
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

  // Load Attendance when filters change
  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    }
  }, [selectedDept, selectedYear, selectedDate, selectedSubject, activeTab]);

  // Load Marks when filters change
  useEffect(() => {
    if (activeTab === "marks") {
      fetchMarks();
    }
  }, [selectedDept, selectedYear, selectedSubject, selectedExam, activeTab]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/attendance?department=${encodeURIComponent(selectedDept)}&year=${selectedYear}&date=${selectedDate}&subject_code=${selectedSubject}`
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
      const res = await fetch(
        `${API_BASE}/marks?department=${encodeURIComponent(selectedDept)}&year=${selectedYear}&subject_code=${selectedSubject}&exam_type=${encodeURIComponent(selectedExam)}`
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

  const handleSaveAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE}/attendance/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          subject_code: selectedSubject,
          recorded_by: user?.userId || "FAC001",
          records: attendanceRecords.map((r) => ({
            register_no: r.register_no,
            status: r.status,
            remarks: r.remarks || ""
          }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Attendance saved successfully!");
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

  const handleMarkInputChange = (regNo, val) => {
    const num = Math.min(100, Math.max(0, Number(val) || 0));
    setMarksRecords((prev) =>
      prev.map((r) => {
        if (r.register_no === regNo) {
          return {
            ...r,
            marks_obtained: val === "" ? "" : num,
            grade: calculateGrade(val, r.max_marks || 100)
          };
        }
        return r;
      })
    );
  };

  const handleSaveMarks = async () => {
    try {
      const res = await fetch(`${API_BASE}/marks/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_code: selectedSubject,
          exam_type: selectedExam,
          recorded_by: user?.userId || "FAC001",
          records: marksRecords.map((r) => ({
            register_no: r.register_no,
            marks_obtained: Number(r.marks_obtained) || 0,
            max_marks: Number(r.max_marks) || 100
          }))
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Marks saved to database successfully!");
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
  const attendanceRate = totalStudents > 0
    ? Math.round(((presentCount + lateCount * 0.5) / totalStudents) * 100)
    : 100;

  const marksAverage = marksRecords.length > 0
    ? Math.round(
        marksRecords.reduce((acc, curr) => acc + (Number(curr.marks_obtained) || 0), 0) /
          marksRecords.length
      )
    : 0;
  const passCount = marksRecords.filter((r) => (Number(r.marks_obtained) || 0) >= 50).length;
  const passRate = marksRecords.length > 0 ? Math.round((passCount / marksRecords.length) * 100) : 100;

  return (
    <div className="portal-container">
      {/* HEADER */}
      <div className="portal-header">
        <div>
          <span className="portal-pill teacher">FACULTY PORTAL</span>
          <h2>Academic & Attendance Management</h2>
          <p>Logged in: <strong>{user?.name || "Faculty Member"}</strong> ({user?.userId || "FAC001"}) • {selectedDept}</p>
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
      </div>

      {/* ================= TAB 1: ATTENDANCE ================= */}
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
              <label>Year / Semester:</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="1">1st Year (Sem 1-2)</option>
                <option value="2">2nd Year (Sem 3-4)</option>
                <option value="3">3rd Year (Sem 5-6)</option>
                <option value="4">4th Year (Sem 7-8)</option>
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

            <div className="filter-item button-cell">
              <button className="btn-secondary" onClick={handleMarkAllPresent}>
                ✓ All Present
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
                      No student records found for the selected department and year.
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

      {/* ================= TAB 2: ACADEMIC MARKS ================= */}
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
              <label>Year / Semester:</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
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
                      No student records found.
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
                            max="100"
                            className="marks-input-cell"
                            placeholder="0-100"
                            value={val === "" ? "" : val}
                            onChange={(e) => handleMarkInputChange(r.register_no, e.target.value)}
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
            <p>Automated grading scale: O (90+), A+ (80-89), A (70-79), B+ (60-69), B (50-59), RA (&lt;50).</p>
            <button className="btn-primary btn-lg" onClick={handleSaveMarks}>
              💾 Save Academic Marks to Database
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherPortal;
