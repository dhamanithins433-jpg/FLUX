import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:5001/api";

const CONFIGURED_DEPARTMENTS = [
  { value: "Computer Science Engineering", label: "Computer Science and Engineering (CSE)" },
  { value: "Information Technology", label: "Information Technology (IT)" },
  { value: "Electronics & Communication", label: "Electronics & Communication Engineering (ECE)" },
  { value: "Electrical & Electronics", label: "Electrical & Electronics Engineering (EEE)" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering (MECH)" },
  { value: "Civil Engineering", label: "Civil Engineering (CIVIL)" },
  { value: "AI & Data Science", label: "Artificial Intelligence & Data Science (AIDS)" },
  { value: "AI & machine learning", label: "Artificial Intelligence & Machine Learning (AIML / CSBS)" },
  { value: "Cyber Security", label: "Cyber Security & Forensics (CYBER)" },
  { value: "M.E. Power Electronics & Drives", label: "M.E. Power Electronics & Drives (BME)" },
  { value: "M.E. Computer Science and Engineering", label: "M.E. Computer Science and Engineering (ME-CSE)" },
  { value: "Master of Business Administration (MBA)", label: "Master of Business Administration (MBA)" },
  { value: "Master of Computer Applications (MCA)", label: "Master of Computer Applications (MCA)" },
  { value: "M.E.VLSI Design", label: "M.E. VLSI Design" }
];

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

  // Student Attendance & Academics Detailed Inspection States
  const [selectedStudentRegNo, setSelectedStudentRegNo] = useState("");
  const [directSearchRegNo, setDirectSearchRegNo] = useState("");
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [selectedStudentAttendance, setSelectedStudentAttendance] = useState(null);
  const [selectedStudentMarks, setSelectedStudentMarks] = useState(null);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  const [studentAttDateFilter, setStudentAttDateFilter] = useState("");

  // Single Student Attendance Add / Update States
  const [newAttDate, setNewAttDate] = useState(new Date().toISOString().split("T")[0]);
  const [newAttSubject, setNewAttSubject] = useState("CS3301");
  const [newAttStatus, setNewAttStatus] = useState("Present");
  const [newAttRemarks, setNewAttRemarks] = useState("");
  const [isSavingStudentAtt, setIsSavingStudentAtt] = useState(false);

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

  // Load Subjects on mount / dept change / semester change
  useEffect(() => {
    let url = `${API_BASE}/subjects?department=${encodeURIComponent(selectedDept)}`;
    if (selectedSemester && selectedSemester !== "All") {
      url += `&semester=${selectedSemester}`;
    }
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.subjects && data.subjects.length > 0) {
          setSubjects(data.subjects);
          setSelectedSubject(data.subjects[0].subject_code);
        } else {
          // Fallback to all subjects for this department if semester-filtered query is empty
          fetch(`${API_BASE}/subjects?department=${encodeURIComponent(selectedDept)}`)
            .then((r2) => r2.json())
            .then((data2) => {
              if (data2.subjects && data2.subjects.length > 0) {
                setSubjects(data2.subjects);
                setSelectedSubject(data2.subjects[0].subject_code);
              } else {
                setSubjects([]);
              }
            })
            .catch(() => setSubjects([]));
        }
      })
      .catch((err) => console.error(err));
  }, [selectedDept, selectedSemester]);

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

  // INDIVIDUAL STUDENT ATTENDANCE & ACADEMIC INSPECTION
  const fetchStudentFullDetails = async (regNo) => {
    if (!regNo) return;
    const cleanReg = regNo.trim().toUpperCase();
    setStudentDetailsLoading(true);
    setSelectedStudentRegNo(cleanReg);
    try {
      const headers = getAuthHeaders();
      const [profileRes, attRes, marksRes] = await Promise.all([
        fetch(`${API_BASE}/student/profile?register_no=${encodeURIComponent(cleanReg)}`, { headers })
          .then((r) => (r.ok ? r.json() : {}))
          .catch(() => ({})),
        fetch(`${API_BASE}/attendance/student/${encodeURIComponent(cleanReg)}`, { headers })
          .then((r) => (r.ok ? r.json() : {}))
          .catch(() => ({})),
        fetch(`${API_BASE}/marks/student/${encodeURIComponent(cleanReg)}`, { headers })
          .then((r) => (r.ok ? r.json() : {}))
          .catch(() => ({}))
      ]);

      if (profileRes && profileRes.profile) {
        setSelectedStudentProfile(profileRes.profile);
      } else {
        const found = departmentStudents.find((s) => s.register_no?.toUpperCase() === cleanReg);
        setSelectedStudentProfile(found || { register_no: cleanReg, name: "Student", department: selectedDept });
      }

      setSelectedStudentAttendance(attRes || null);
      setSelectedStudentMarks(marksRes || null);
    } catch (err) {
      console.error("Error loading student details:", err);
      showToast("Error loading student records from database");
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  const handleUpdateStudentAttendance = async (e) => {
    e.preventDefault();
    if (!selectedStudentRegNo) return;
    setIsSavingStudentAtt(true);
    try {
      const res = await fetch(`${API_BASE}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          register_no: selectedStudentRegNo,
          date: newAttDate,
          subject_code: newAttSubject,
          status: newAttStatus,
          remarks: newAttRemarks,
          recorded_by: profile?.faculty_id || user?.faculty_id || user?.userId || "FAC001"
        })
      });
      const data = await res.json();
      setIsSavingStudentAtt(false);
      if (res.ok) {
        showToast(data.message || `Attendance for ${selectedStudentRegNo} saved to MySQL successfully!`);
        // Refresh attendance records from MySQL
        const updatedAtt = await fetch(`${API_BASE}/attendance/student/${encodeURIComponent(selectedStudentRegNo)}`, {
          headers: getAuthHeaders()
        }).then((r) => r.json());
        setSelectedStudentAttendance(updatedAtt);
        setNewAttRemarks("");
      } else {
        alert(data.message || "Failed to save attendance record");
      }
    } catch (err) {
      setIsSavingStudentAtt(false);
      console.error(err);
      alert("Error saving attendance record to database");
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

  // Calculate subject-wise attendance breakdown for selected student
  const studentAttRecords = selectedStudentAttendance?.records || [];
  const filteredStudentAtt = studentAttDateFilter
    ? studentAttRecords.filter((a) => a.date === studentAttDateFilter)
    : studentAttRecords;

  const studentSubMap = {};
  studentAttRecords.forEach((a) => {
    const code = a.subject_code || "GEN001";
    if (!studentSubMap[code]) {
      studentSubMap[code] = {
        subject_code: code,
        subject_name: a.subject_name || code,
        total: 0,
        present: 0,
        late: 0,
        absent: 0
      };
    }
    studentSubMap[code].total += 1;
    if (a.status === "Present") studentSubMap[code].present += 1;
    else if (a.status === "Late") studentSubMap[code].late += 1;
    else if (a.status === "Absent") studentSubMap[code].absent += 1;
  });

  const subjectAttList = Object.values(studentSubMap).map((sub) => {
    const effectivePresent = sub.present + (sub.late * 0.5);
    const pct = sub.total > 0 ? Math.round((effectivePresent / sub.total) * 100) : 0;
    return {
      ...sub,
      percentage: pct,
      isShortage: pct < 75
    };
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

      {/* ================= TAB 1: STUDENTS ROSTER & ATTENDANCE INSPECTION ================= */}
      {activeTab === "students" && (
        selectedStudentRegNo ? (
          <div className="portal-card">
            {/* BACK BUTTON & TOP TITLE */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSelectedStudentRegNo("");
                  setSelectedStudentProfile(null);
                  setSelectedStudentAttendance(null);
                  setSelectedStudentMarks(null);
                }}
              >
                ← Back to Students Roster
              </button>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className="badge-paid">Live MySQL Records</span>
              </div>
            </div>

            {studentDetailsLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Loading student attendance and academic records from database...</p>
              </div>
            ) : (
              <div>
                {/* STUDENT PROFILE HEADER BANNER */}
                <div className="faculty-student-header-banner">
                  <div>
                    <span className="portal-pill student">STUDENT PROFILE & ACADEMIC DATA</span>
                    <h2 style={{ margin: "6px 0 2px" }}>{selectedStudentProfile?.name || "Student"}</h2>
                    <p className="text-muted" style={{ margin: 0 }}>
                      Register No: <strong>{selectedStudentProfile?.register_no || selectedStudentRegNo}</strong> • {selectedStudentProfile?.department || selectedDept}
                    </p>
                  </div>
                  <div className="faculty-student-meta-grid">
                    <div className="faculty-student-meta-item">
                      <span>Academic Year</span>
                      <strong>Year {selectedStudentProfile?.year || 1} • Sem {selectedStudentProfile?.semester || 1}</strong>
                    </div>
                    <div className="faculty-student-meta-item">
                      <span>Section & Batch</span>
                      <strong>Section {selectedStudentProfile?.section || "A"} • {selectedStudentProfile?.batch || "2024-2028"}</strong>
                    </div>
                    <div className="faculty-student-meta-item">
                      <span>Institutional Email</span>
                      <strong>{selectedStudentProfile?.email || "-"}</strong>
                    </div>
                    <div className="faculty-student-meta-item">
                      <span>Contact Phone</span>
                      <strong>{selectedStudentProfile?.phone || "-"}</strong>
                    </div>
                  </div>
                </div>

                {/* ATTENDANCE WARNING IF SHORTAGE */}
                {selectedStudentAttendance?.percentage !== null && selectedStudentAttendance?.percentage < 75 && (
                  <div className="alert-banner warning" style={{ marginBottom: "18px" }}>
                    ⚠ <strong>Attendance Shortage Alert:</strong> Current attendance is {selectedStudentAttendance?.percentage}%, which is below the mandatory 75% institutional requirement.
                  </div>
                )}

                {/* ATTENDANCE STAT METRIC CARDS */}
                <div className="stats-grid" style={{ marginBottom: "24px" }}>
                  <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div>
                      <span className="stat-label">Total Classes Conducted</span>
                      <strong className="stat-value text-blue">{selectedStudentAttendance?.total_classes || 0}</strong>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div>
                      <span className="stat-label">Classes Present</span>
                      <strong className="stat-value text-green">{selectedStudentAttendance?.present || 0}</strong>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div>
                      <span className="stat-label">Late / Absent</span>
                      <strong className="stat-value text-red">
                        {selectedStudentAttendance?.late || 0} Late • {selectedStudentAttendance?.absent || 0} Absent
                      </strong>
                    </div>
                  </div>

                  <div className="stat-card primary">
                    <div className="stat-icon">📈</div>
                    <div>
                      <span className="stat-label">Attendance Percentage</span>
                      <strong className={`stat-value ${(selectedStudentAttendance?.percentage || 0) >= 75 ? "text-green" : "text-red"}`}>
                        {selectedStudentAttendance?.percentage !== null && selectedStudentAttendance?.percentage !== undefined
                          ? `${selectedStudentAttendance.percentage}%`
                          : "No Data"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ADD / UPDATE ATTENDANCE FOR THIS STUDENT IN MYSQL */}
                <div className="faculty-attendance-action-panel">
                  <h4>📝 Add or Update Attendance for {selectedStudentProfile?.name || selectedStudentRegNo}</h4>
                  <p className="text-muted" style={{ fontSize: "12.5px", marginTop: "2px", marginBottom: "16px" }}>
                    Select date, subject, and status to record or update attendance directly in the MySQL database.
                  </p>
                  <form onSubmit={handleUpdateStudentAttendance}>
                    <div className="attendance-form-row">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Attendance Date:</label>
                        <input
                          type="date"
                          value={newAttDate}
                          onChange={(e) => setNewAttDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Course / Subject:</label>
                        <select
                          value={newAttSubject}
                          onChange={(e) => setNewAttSubject(e.target.value)}
                          required
                        >
                          {subjects.length > 0 ? (
                            subjects.map((sub) => (
                              <option key={sub.subject_code} value={sub.subject_code}>
                                {sub.subject_code} - {sub.subject_name}
                              </option>
                            ))
                          ) : (
                            <option value="CS3301">CS3301 - Data Structures</option>
                          )}
                        </select>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Attendance Status:</label>
                        <select
                          value={newAttStatus}
                          onChange={(e) => setNewAttStatus(e.target.value)}
                          required
                        >
                          <option value="Present">✓ Present</option>
                          <option value="Late">⏱ Late</option>
                          <option value="Absent">✕ Absent</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Remarks (Optional):</label>
                        <input
                          type="text"
                          placeholder="e.g. Lab experiment / Lecture"
                          value={newAttRemarks}
                          onChange={(e) => setNewAttRemarks(e.target.value)}
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={isSavingStudentAtt}
                          style={{ width: "100%", height: "42px" }}
                        >
                          {isSavingStudentAtt ? "Saving to MySQL..." : "💾 Save to MySQL"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* SUBJECT-WISE ATTENDANCE BREAKDOWN */}
                <div style={{ marginTop: "28px" }}>
                  <div className="card-top-title">
                    <h3>📚 Subject-Wise Attendance Breakdown</h3>
                    <span className="text-muted small">Aggregated from attendance records</span>
                  </div>

                  {subjectAttList.length === 0 ? (
                    <p className="empty-notice" style={{ padding: "16px 0" }}>No subject attendance recorded yet for this student.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="faculty-sub-table">
                        <thead>
                          <tr>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Classes Conducted</th>
                            <th>Present</th>
                            <th>Late</th>
                            <th>Absent</th>
                            <th>Attendance %</th>
                            <th>Eligibility Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjectAttList.map((sub) => (
                            <tr key={sub.subject_code}>
                              <td><strong>{sub.subject_code}</strong></td>
                              <td>{sub.subject_name}</td>
                              <td>{sub.total}</td>
                              <td className="text-green fw-bold">{sub.present}</td>
                              <td className="text-amber">{sub.late}</td>
                              <td className="text-red">{sub.absent}</td>
                              <td>
                                <strong className={sub.isShortage ? "text-red" : "text-green"}>
                                  {sub.percentage}%
                                </strong>
                              </td>
                              <td>
                                {sub.isShortage ? (
                                  <span className="badge-due">Shortage (&lt;75%)</span>
                                ) : (
                                  <span className="badge-paid">Eligible</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* DETAILED ATTENDANCE HISTORY LIST */}
                <div style={{ marginTop: "28px" }}>
                  <div className="card-top-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <h3>📅 Attendance Log & History Records</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <label style={{ fontSize: "12px", color: "#64748b" }}>Filter Date:</label>
                      <input
                        type="date"
                        value={studentAttDateFilter}
                        onChange={(e) => setStudentAttDateFilter(e.target.value)}
                        style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                      {studentAttDateFilter && (
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => setStudentAttDateFilter("")}
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {filteredStudentAtt.length === 0 ? (
                    <p className="empty-notice" style={{ padding: "16px 0" }}>No attendance log records found for this student.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="portal-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Status</th>
                            <th>Recorded By</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudentAtt.map((att, idx) => (
                            <tr key={att.id || idx}>
                              <td><strong>{att.date}</strong></td>
                              <td><code>{att.subject_code}</code></td>
                              <td>{att.subject_name || "-"}</td>
                              <td>
                                <span className={`grade-badge ${att.status === "Present" ? "grade-A" : att.status === "Late" ? "grade-B" : "grade-RA"}`}>
                                  {att.status}
                                </span>
                              </td>
                              <td>{att.recorded_by || "-"}</td>
                              <td className="text-muted">{att.remarks || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* STUDENT ACADEMIC MARKS */}
                <div style={{ marginTop: "28px" }}>
                  <div className="card-top-title">
                    <h3>📊 Academic Examination Marks & Evaluation</h3>
                    {selectedStudentMarks?.average_percentage && (
                      <span className="badge-paid">Overall Average: {selectedStudentMarks.average_percentage}%</span>
                    )}
                  </div>

                  {(!selectedStudentMarks?.records || selectedStudentMarks.records.length === 0) ? (
                    <p className="empty-notice" style={{ padding: "16px 0" }}>No examination marks recorded yet for this student.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="portal-table">
                        <thead>
                          <tr>
                            <th>Subject Code</th>
                            <th>Subject Name</th>
                            <th>Exam / Assessment</th>
                            <th>Marks Obtained</th>
                            <th>Max Marks</th>
                            <th>Grade</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudentMarks.records.map((m, idx) => {
                            const isPass = Number(m.marks_obtained) >= (Number(m.max_marks) * 0.5);
                            return (
                              <tr key={m.id || idx}>
                                <td><strong>{m.subject_code}</strong></td>
                                <td>{m.subject_name || "-"}</td>
                                <td>{m.exam_type}</td>
                                <td className="fw-bold">{m.marks_obtained}</td>
                                <td>/ {m.max_marks || 100}</td>
                                <td>
                                  <span className={`grade-badge grade-${m.grade || "B"}`}>
                                    {m.grade || "-"}
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
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="portal-card">
            {/* DIRECT SEARCH BY REGISTER NUMBER */}
            <div style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
              <div>
                <strong style={{ fontSize: "14px", color: "#092b5c" }}>🔍 Search Student by Register Number:</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>Quickly inspect individual student attendance, subject breakdown, and academic marks.</p>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="e.g. SVCET001 or SVCET002"
                  value={directSearchRegNo}
                  onChange={(e) => setDirectSearchRegNo(e.target.value)}
                  style={{ padding: "8px 12px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", minWidth: "220px", background: "#ffffff" }}
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    if (!directSearchRegNo.trim()) {
                      alert("Please enter a Register Number to search.");
                      return;
                    }
                    fetchStudentFullDetails(directSearchRegNo);
                  }}
                >
                  Inspect Records →
                </button>
              </div>
            </div>

            <div className="card-toolbar" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
                <div className="search-box" style={{ minWidth: "260px" }}>
                  <span>🔍</span>
                  <input
                    type="text"
                    placeholder="Filter students by Name or Register No..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Department:</label>
                  <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                    {CONFIGURED_DEPARTMENTS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
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
                    <th>Attendance & Academics</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeptStudents.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center", padding: "28px", color: "#64748b" }}>
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
                        <td>
                          <button
                            type="button"
                            className="btn-view-student-records"
                            onClick={() => fetchStudentFullDetails(s.register_no)}
                          >
                            📊 View Records →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ================= TAB 2: ATTENDANCE ================= */}
      {activeTab === "attendance" && (
        <div className="portal-card">
          {/* FILTER BAR */}
          <div className="class-filter-bar">
            <div className="filter-item">
              <label>Department:</label>
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                {CONFIGURED_DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
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
                {CONFIGURED_DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
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
