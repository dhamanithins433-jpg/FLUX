import React, { useState, useEffect } from "react";
import ReceiptModal from "./ReceiptModal";

const API_BASE = "http://localhost:5001/api";

function AdminPortal({ user, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "students");

  useEffect(() => {
    if (initialTab) {
      if (initialTab === "courses") setActiveTab("materials");
      else if (initialTab === "faculty") setActiveTab("teachers");
      else setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [stats, setStats] = useState({
    total_students: 0,
    total_faculty: 0,
    total_revenue: 0,
    total_collected: 0,
    total_outstanding: 0,
    attendance_rate: 0
  });

  const [feesList, setFeesList] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  // Student Management State
  const [studentSearch, setStudentSearch] = useState("");
  const [studentDept, setStudentDept] = useState("All");
  const [studentSem, setStudentSem] = useState("All");
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [studentForm, setStudentForm] = useState({
    register_no: "",
    name: "",
    email: "",
    phone: "",
    department: "Computer Science Engineering",
    year: 1,
    semester: 1,
    section: "A",
    batch: "2024-2028",
    password: "Student@123",
    tuition_fee: 50000,
    exam_fee: 2500
  });

  const [resetPasswordForm, setResetPasswordForm] = useState({
    register_no: "",
    name: "",
    new_password: "Student@123"
  });

  const [csvUploadState, setCsvUploadState] = useState({
    mode: "file",
    text: "",
    file: null,
    loading: false,
    summary: null
  });

  // Offline Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    register_no: "",
    amount: "",
    payment_method: "Cash",
    notes: ""
  });
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  // Study Materials Management State
  const [materialsList, setMaterialsList] = useState([]);
  const [adminRegulations, setAdminRegulations] = useState([]);
  const [adminSemesters, setAdminSemesters] = useState([]);
  const [adminSubjects, setAdminSubjects] = useState([]);
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");
  const [materialTypeFilter, setMaterialTypeFilter] = useState("All");

  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    regulation_id: "",
    semester_id: "",
    subject_id: "",
    material_type: "Lecture Notes",
    unit: "Unit 1",
    title: "",
    url: "",
    source: "",
    academic_year: "2024"
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("svcet_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [statsRes, feesRes, studentsRes, teachersRes, matsRes, regsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`, { headers }).then((r) => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/fees`, { headers }).then((r) => r.json()).catch(() => ({ fees: [] })),
        fetch(`${API_BASE}/admin/students`, { headers }).then(async (r) => {
          if (r.ok) return r.json();
          return fetch(`${API_BASE}/students`).then((res) => res.json());
        }).catch(() => ({ students: [] })),
        fetch(`${API_BASE}/teachers`, { headers }).then((r) => r.json()).catch(() => ({ teachers: [] })),
        fetch(`${API_BASE}/study-materials`, { headers }).then((r) => r.json()).catch(() => ({ materials: [] })),
        fetch(`${API_BASE}/courses/cse/regulations`, { headers }).then((r) => r.json()).catch(() => ({ regulations: [] }))
      ]);

      setStats(statsRes || {});
      setFeesList(feesRes.fees || []);
      setStudents(studentsRes.students || []);
      setTeachers(teachersRes.teachers || []);
      setMaterialsList(matsRes.materials || []);
      setAdminRegulations(regsRes.regulations || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------- STUDENT CRUD HANDLERS -----------------
  const handleOpenAddStudent = () => {
    setStudentForm({
      register_no: "",
      name: "",
      email: "",
      phone: "",
      department: "Computer Science Engineering",
      year: 1,
      semester: 1,
      section: "A",
      batch: "2024-2028",
      password: "Student@123",
      tuition_fee: 50000,
      exam_fee: 2500
    });
    setShowAddStudentModal(true);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.register_no || !studentForm.name || !studentForm.email) {
      alert("Please enter Register Number, Name, and Email.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddStudentModal(false);
        setActionMessage(data.message || `Student ${studentForm.name} enrolled successfully!`);
        setTimeout(() => setActionMessage(""), 5000);
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to enroll student.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding student to database.");
    }
  };

  const handleOpenEditStudent = (s) => {
    setEditingStudent(s);
    setStudentForm({
      register_no: s.register_no,
      name: s.name,
      email: s.email || "",
      phone: s.phone || "",
      department: s.department,
      year: s.year || 1,
      semester: s.semester || 1,
      section: s.section || "A",
      batch: s.batch || "2024-2028"
    });
    setShowEditStudentModal(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/students/${studentForm.register_no}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (res.ok) {
        setShowEditStudentModal(false);
        setActionMessage(data.message || `Student ${studentForm.register_no} updated successfully!`);
        setTimeout(() => setActionMessage(""), 5000);
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to update student.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating student profile.");
    }
  };

  const handleDeleteStudent = async (s) => {
    if (!window.confirm(`Are you sure you want to permanently delete student "${s.name}" (${s.register_no})?\n\nThis will remove their login account, student profile, attendance logs, marks, and fee records.`)) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/students/${s.register_no}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || `Student ${s.register_no} permanently removed.`);
        setTimeout(() => setActionMessage(""), 5000);
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to delete student.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting student.");
    }
  };

  const handleOpenResetPassword = (s) => {
    setResetPasswordForm({
      register_no: s.register_no,
      name: s.name,
      new_password: ""
    });
    setShowResetPasswordModal(true);
  };

  const handleSaveResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordForm.new_password.trim()) {
      alert("Please enter a new password");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/students/${resetPasswordForm.register_no}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ new_password: resetPasswordForm.new_password.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setShowResetPasswordModal(false);
        setActionMessage(data.message || `Password for ${resetPasswordForm.register_no} reset successfully!`);
        setTimeout(() => setActionMessage(""), 5000);
      } else {
        alert(data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      alert("Error resetting password.");
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "register_no,name,email,phone,department,year,semester,section,batch,password,tuition_fee,exam_fee,paid_amount\n" +
      "SVCET010,Kavitha S,kavitha@svcet.edu,9876543210,Computer Science Engineering,2,4,A,2024-2028,Student@123,50000,2500,25000\n" +
      "SVCET011,Manoj K,manoj@svcet.edu,9876543211,Information Technology,2,4,B,2024-2028,Student@123,50000,2500,0\n" +
      "SVCET012,Ananya Rao,ananya@svcet.edu,9876543212,Electronics & Communication,1,2,A,2025-2029,Student@123,55000,2500,55000\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "students_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvImport = async (e) => {
    e.preventDefault();
    setCsvUploadState((prev) => ({ ...prev, loading: true, summary: null }));
    try {
      let res;
      if (csvUploadState.mode === "file") {
        if (!csvUploadState.file) {
          alert("Please select a .csv file from your computer");
          setCsvUploadState((prev) => ({ ...prev, loading: false }));
          return;
        }
        const formData = new FormData();
        formData.append("file", csvUploadState.file);
        res = await fetch(`${API_BASE}/admin/students/import-csv`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData
        });
      } else {
        if (!csvUploadState.text.trim()) {
          alert("Please paste valid CSV rows into the text area");
          setCsvUploadState((prev) => ({ ...prev, loading: false }));
          return;
        }
        res = await fetch(`${API_BASE}/admin/students/import-csv`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ csv_content: csvUploadState.text })
        });
      }
      const data = await res.json();
      setCsvUploadState((prev) => ({ ...prev, loading: false, summary: data }));
      if (res.ok && data.imported_count > 0) {
        setActionMessage(`Bulk Import: Successfully enrolled ${data.imported_count} students!`);
        setTimeout(() => setActionMessage(""), 6000);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      setCsvUploadState((prev) => ({ ...prev, loading: false }));
      alert("Failed to process CSV import.");
    }
  };

  // ----------------- OFFLINE PAYMENT HANDLERS -----------------
  const handleOpenOfflinePayment = (studentFee = null) => {
    if (studentFee) {
      setSelectedStudent(studentFee);
      setPaymentForm({
        register_no: studentFee.register_no,
        amount: studentFee.balance > 0 ? studentFee.balance : "",
        payment_method: "Cash",
        notes: `Semester fee payment for ${studentFee.register_no}`
      });
    } else {
      setSelectedStudent(feesList[0] || null);
      setPaymentForm({
        register_no: feesList[0]?.register_no || "",
        amount: "",
        payment_method: "Cash",
        notes: "Offline institutional fee payment"
      });
    }
    setShowPaymentModal(true);
  };

  const handleStudentSelectChange = (regNo) => {
    const s = feesList.find((item) => item.register_no === regNo);
    setSelectedStudent(s || null);
    setPaymentForm({
      ...paymentForm,
      register_no: regNo,
      amount: s && s.balance > 0 ? s.balance : ""
    });
  };

  const handleRecordOfflinePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/fees/offline-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          ...paymentForm,
          amount: Number(paymentForm.amount),
          collected_by: user?.name || "College Administrator"
        })
      });

      const data = await response.json();
      if (response.ok) {
        setShowPaymentModal(false);
        const fullReceipt = {
          ...data.receipt,
          student_name: selectedStudent?.name || "Student",
          department: selectedStudent?.department || "Engineering"
        };
        setActiveReceipt(fullReceipt);
        setActionMessage(`Fee payment of ₹${Number(paymentForm.amount).toLocaleString("en-IN")} logged successfully!`);
        setTimeout(() => setActionMessage(""), 5000);
        fetchDashboardData();
      } else {
        alert(data.message || "Payment logging failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error recording offline payment.");
    }
  };

  // ----------------- STUDY MATERIAL HANDLERS -----------------
  const handleOpenAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialForm({
      regulation_id: adminRegulations[0]?.id || "",
      semester_id: "",
      subject_id: "",
      material_type: "Lecture Notes",
      unit: "Unit 1",
      title: "",
      url: "",
      source: "",
      academic_year: "2024"
    });
    setAdminSemesters([]);
    setAdminSubjects([]);
    if (adminRegulations.length > 0) {
      handleRegulationChangeInForm(adminRegulations[0].id);
    }
    setShowMaterialModal(true);
  };

  const handleOpenEditMaterial = (item) => {
    setEditingMaterial(item);
    setMaterialForm({
      regulation_id: "",
      semester_id: "",
      subject_id: item.subject_id,
      material_type: item.material_type || "Lecture Notes",
      unit: item.unit || "Unit 1",
      title: item.title || "",
      url: item.url || "",
      source: item.source || "",
      academic_year: item.academic_year || "2024"
    });
    setShowMaterialModal(true);
  };

  const handleRegulationChangeInForm = async (regId) => {
    setMaterialForm((prev) => ({ ...prev, regulation_id: regId, semester_id: "", subject_id: "" }));
    setAdminSubjects([]);
    if (!regId) {
      setAdminSemesters([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/courses/cse/regulations/${regId}/semesters`).then((r) => r.json());
      setAdminSemesters(res.semesters || []);
      if (res.semesters && res.semesters.length > 0) {
        handleSemesterChangeInForm(res.semesters[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSemesterChangeInForm = async (semId) => {
    setMaterialForm((prev) => ({ ...prev, semester_id: semId, subject_id: "" }));
    if (!semId) {
      setAdminSubjects([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/courses/cse/semesters/${semId}/subjects`).then((r) => r.json());
      setAdminSubjects(res.subjects || []);
      if (res.subjects && res.subjects.length > 0) {
        setMaterialForm((prev) => ({ ...prev, semester_id: semId, subject_id: res.subjects[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.title.trim() || !materialForm.url.trim()) {
      alert("Please fill in Title and URL");
      return;
    }

    try {
      let response;
      if (editingMaterial) {
        response = await fetch(`${API_BASE}/study-materials/${editingMaterial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(materialForm)
        });
      } else {
        if (!materialForm.subject_id) {
          alert("Please select a subject.");
          return;
        }
        response = await fetch(`${API_BASE}/study-materials`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(materialForm)
        });
      }

      const data = await response.json();
      if (response.ok) {
        setShowMaterialModal(false);
        setActionMessage(editingMaterial ? "Study material updated successfully!" : "Study material added successfully!");
        setTimeout(() => setActionMessage(""), 5000);
        const refetch = await fetch(`${API_BASE}/study-materials`).then((r) => r.json());
        setMaterialsList(refetch.materials || []);
      } else {
        alert(data.message || "Failed to save study material.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving study material.");
    }
  };

  const handleDeleteMaterial = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;
    try {
      const response = await fetch(`${API_BASE}/study-materials/${item.id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setActionMessage("Study material deleted successfully.");
        setTimeout(() => setActionMessage(""), 5000);
        const refetch = await fetch(`${API_BASE}/study-materials`).then((r) => r.json());
        setMaterialsList(refetch.materials || []);
      } else {
        alert("Failed to delete study material.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting study material.");
    }
  };

  // ----------------- FILTER LOGIC -----------------
  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    const matchesSearch =
      !studentSearch ||
      s.name?.toLowerCase().includes(q) ||
      s.register_no?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q);
    const matchesDept = studentDept === "All" || s.department === studentDept;
    const matchesSem = studentSem === "All" || String(s.semester) === String(studentSem);
    return matchesSearch && matchesDept && matchesSem;
  });

  const filteredMaterials = materialsList.filter((m) => {
    const matchesSearch =
      m.title?.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
      m.subject_code?.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
      m.subject_name?.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
      m.source?.toLowerCase().includes(materialSearchQuery.toLowerCase());
    const matchesType = materialTypeFilter === "All" || m.material_type === materialTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredFees = feesList.filter((f) => {
    const matchesSearch =
      f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.register_no?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || f.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="portal-container">
      {/* PORTAL TOP HEADER */}
      <div className="portal-header">
        <div>
          <span className="portal-pill admin">ADMINISTRATOR PORTAL</span>
          <h2>Campus Governance & Academic Administration</h2>
          <p>
            Logged in as: <strong>{user?.name || "Administrator"}</strong> ({user?.userId || user?.user_id || "ADM001"}) • Sri Venkateswara College of Engineering and Technology
          </p>
        </div>
        <div className="portal-header-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={handleOpenAddStudent}>
            ➕ Add Student
          </button>
          <button className="btn-secondary" onClick={() => setShowCsvModal(true)}>
            📁 Bulk Import CSV
          </button>
          <button className="btn-outline" onClick={() => handleOpenOfflinePayment()}>
            💵 Collect Fee
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="alert-banner success">
          ✓ {actionMessage}
        </div>
      )}

      {/* KPI STATS BAR */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div>
            <span className="stat-label">Total Enrolled Students</span>
            <strong className="stat-value">{stats.total_students || students.length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div>
            <span className="stat-label">Faculty Members</span>
            <strong className="stat-value">{stats.total_faculty || teachers.length}</strong>
          </div>
        </div>
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div>
            <span className="stat-label">Institutional Fees Collected</span>
            <strong className="stat-value text-green">
              ₹{Number(stats.total_collected || 0).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div>
            <span className="stat-label">Outstanding Balance Dues</span>
            <strong className="stat-value text-red">
              ₹{Number(stats.total_outstanding || 0).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </div>

      {/* SUB NAVIGATION TABS */}
      <div className="portal-tabs">
        <button
          className={activeTab === "students" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("students")}
        >
          👥 Student Records ({students.length})
        </button>
        <button
          className={activeTab === "teachers" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("teachers")}
        >
          🏛️ Faculty Directory ({teachers.length})
        </button>
        <button
          className={activeTab === "fees" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("fees")}
        >
          💳 Fees & Accounts Ledger
        </button>
        <button
          className={activeTab === "reports" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("reports")}
        >
          📊 Reports & Analytics
        </button>
        <button
          className={activeTab === "materials" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("materials")}
        >
          📚 Study Materials & Courses ({materialsList.length})
        </button>
        <button
          className={activeTab === "profile" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("profile")}
        >
          👤 Admin Profile
        </button>
      </div>

      {/* ================= TAB: STUDENTS DIRECTORY & MANAGEMENT ================= */}
      {activeTab === "students" && (
        <div className="portal-card">
          <div className="card-toolbar" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
              <div className="search-box" style={{ minWidth: "260px" }}>
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search by Register No, Name, or Email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Department:</label>
                <select value={studentDept} onChange={(e) => setStudentDept(e.target.value)}>
                  <option value="All">All Departments</option>
                  <option value="Computer Science Engineering">CSE</option>
                  <option value="Information Technology">IT</option>
                  <option value="Electronics & Communication">ECE</option>
                  <option value="Electrical & Electronics">EEE</option>
                  <option value="Mechanical Engineering">MECH</option>
                  <option value="Civil Engineering">CIVIL</option>
                  <option value="AI & Data Science">AI & DS</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Semester:</label>
                <select value={studentSem} onChange={(e) => setStudentSem(e.target.value)}>
                  <option value="All">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={handleOpenAddStudent}>
                ➕ Add Student
              </button>
              <button className="btn-secondary" onClick={() => setShowCsvModal(true)}>
                📁 Bulk Import CSV
              </button>
              <button className="btn-outline" onClick={handleDownloadTemplate} title="Download CSV Template">
                📥 Sample CSV
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Register No</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Year / Semester</th>
                  <th>Section</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      No student records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.register_no}>
                      <td><strong>{s.register_no}</strong></td>
                      <td>
                        <strong>{s.name}</strong>
                        {s.batch && <div style={{ fontSize: "11px", color: "#64748b" }}>Batch: {s.batch}</div>}
                      </td>
                      <td><span className="dept-tag">{s.department}</span></td>
                      <td>Year {s.year || 1} • Sem {s.semester || 1}</td>
                      <td><span className="grade-badge grade-A">{s.section || "A"}</span></td>
                      <td>{s.email}</td>
                      <td>{s.phone || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="btn-sm btn-edit"
                            onClick={() => handleOpenEditStudent(s)}
                            title="Edit Student Profile"
                            style={{ background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-sm btn-reset"
                            onClick={() => handleOpenResetPassword(s)}
                            title="Reset Login Password"
                            style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                          >
                            🔑 Pass
                          </button>
                          <button
                            className="btn-sm btn-delete"
                            onClick={() => handleDeleteStudent(s)}
                            title="Delete Student Record"
                            style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB: FEES LEDGER ================= */}
      {activeTab === "fees" && (
        <div className="portal-card">
          <div className="card-toolbar">
            <div className="search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search by student name or register number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Department:</label>
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <option value="All">All Departments</option>
                <option value="Computer Science Engineering">CSE</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Communication">ECE</option>
                <option value="Mechanical Engineering">MECH</option>
              </select>
            </div>
            <button className="btn-primary" onClick={() => handleOpenOfflinePayment()} style={{ marginLeft: "auto" }}>
              💵 Log Offline Fee Payment
            </button>
          </div>

          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Tuition (₹)</th>
                  <th>Exam / Other (₹)</th>
                  <th>Total Fee (₹)</th>
                  <th>Paid Amount (₹)</th>
                  <th>Balance Due (₹)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.map((f) => {
                  const isPaid = Number(f.balance) <= 0;
                  const isPartial = Number(f.paid_amount) > 0 && Number(f.balance) > 0;
                  return (
                    <tr key={f.register_no}>
                      <td><strong>{f.register_no}</strong></td>
                      <td>{f.name}</td>
                      <td><span className="dept-tag">{f.department}</span></td>
                      <td>₹{Number(f.tuition_fee || 0).toLocaleString("en-IN")}</td>
                      <td>₹{(Number(f.exam_fee || 0) + Number(f.transport_fee || 0) + Number(f.other_fee || 0)).toLocaleString("en-IN")}</td>
                      <td><strong>₹{Number(f.total_fee || 0).toLocaleString("en-IN")}</strong></td>
                      <td className="text-green font-semibold">₹{Number(f.paid_amount || 0).toLocaleString("en-IN")}</td>
                      <td className={isPaid ? "text-green" : "text-red font-semibold"}>
                        ₹{Number(f.balance || 0).toLocaleString("en-IN")}
                      </td>
                      <td>
                        {isPaid ? (
                          <span className="badge-paid">Paid Full</span>
                        ) : isPartial ? (
                          <span className="badge-partial">Partial</span>
                        ) : (
                          <span className="badge-due">Overdue</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-collect"
                          onClick={() => handleOpenOfflinePayment(f)}
                          title="Record offline payment for student"
                        >
                          💵 Collect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB: FACULTY DIRECTORY ================= */}
      {activeTab === "teachers" && (
        <div className="portal-card">
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Faculty ID</th>
                  <th>Faculty Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Official Email</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.faculty_id}>
                    <td><strong>{t.faculty_id}</strong></td>
                    <td>{t.name}</td>
                    <td><span className="dept-tag">{t.department}</span></td>
                    <td>{t.designation}</td>
                    <td>{t.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB: REPORTS & ANALYTICS ================= */}
      {activeTab === "reports" && (
        <div className="portal-card">
          <div className="card-top-title">
            <h3>Institutional Governance & Financial Performance Report</h3>
            <span className="badge-paid">Academic Year 2024–2025</span>
          </div>

          <div className="attendance-summary-bar" style={{ marginBottom: "24px" }}>
            <div>
              <span>Total Enrolled Students:</span> <strong>{stats.total_students || students.length}</strong>
            </div>
            <div>
              <span>Active Faculty:</span> <strong>{stats.total_faculty || teachers.length}</strong>
            </div>
            <div>
              <span>Total Fee Assessment:</span> <strong className="text-blue">₹{Number(stats.total_revenue || 0).toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span>Total Collections:</span> <strong className="text-green">₹{Number(stats.total_collected || 0).toLocaleString("en-IN")}</strong>
            </div>
            <div>
              <span>Outstanding Arrears:</span> <strong className="text-red">₹{Number(stats.total_outstanding || 0).toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ marginBottom: "12px", color: "#1e293b" }}>📈 Fee Collection Efficiency</h4>
              <p style={{ fontSize: "14px", color: "#475569", marginBottom: "12px" }}>
                Institutional collection rate calculated against all enrolled student fee ledgers.
              </p>
              <div style={{ background: "#e2e8f0", height: "16px", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
                <div
                  style={{
                    background: "#16a34a",
                    height: "100%",
                    width: `${stats.total_revenue ? Math.min(100, Math.round((stats.total_collected / stats.total_revenue) * 100)) : 0}%`,
                    transition: "width 0.5s ease"
                  }}
                ></div>
              </div>
              <strong>
                {stats.total_revenue
                  ? Math.round((stats.total_collected / stats.total_revenue) * 100)
                  : 0}
                % Cleared
              </strong>
            </div>

            <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ marginBottom: "12px", color: "#1e293b" }}>🏛️ Department Overview</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "13px", lineHeight: "2" }}>
                <li>💻 Computer Science & Engineering: <strong>{students.filter((s) => s.department?.includes("Computer")).length} Enrolled</strong></li>
                <li>🖥️ Information Technology: <strong>{students.filter((s) => s.department?.includes("Information")).length} Enrolled</strong></li>
                <li>📡 Electronics & Communication: <strong>{students.filter((s) => s.department?.includes("Electronics")).length} Enrolled</strong></li>
                <li>⚙️ Mechanical & Civil Engineering: <strong>{students.filter((s) => s.department?.includes("Mechanical") || s.department?.includes("Civil")).length} Enrolled</strong></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: STUDY MATERIALS MANAGER ================= */}
      {activeTab === "materials" && (
        <div className="portal-card">
          <div className="card-toolbar" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}>
              <div className="search-box" style={{ minWidth: "260px" }}>
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search materials by title, subject code, source..."
                  value={materialSearchQuery}
                  onChange={(e) => setMaterialSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Resource Type:</label>
                <select value={materialTypeFilter} onChange={(e) => setMaterialTypeFilter(e.target.value)}>
                  <option value="All">All Resource Types</option>
                  <option value="Lecture Notes">Lecture Notes</option>
                  <option value="Important Questions">Important Questions</option>
                  <option value="Normal Notes">Normal Notes</option>
                  <option value="Question Paper">Question Paper</option>
                  <option value="Video Lecture">Video Lecture</option>
                  <option value="Syllabus">Syllabus</option>
                  <option value="Useful Resources">Useful Resources</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" onClick={handleOpenAddMaterial}>
              ➕ Add Study Material
            </button>
          </div>

          <div className="table-responsive" style={{ marginTop: "16px" }}>
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Unit</th>
                  <th>Source</th>
                  <th>URL / Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      No study materials found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.subject_code}</strong>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{m.subject_name}</div>
                      </td>
                      <td>{m.title}</td>
                      <td>
                        <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                          {m.material_type}
                        </span>
                      </td>
                      <td>{m.unit || "All Units"}</td>
                      <td>{m.source || "Academic Platform"}</td>
                      <td>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#2563eb", textDecoration: "underline", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          🔗 Open Link
                        </a>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "12px" }}
                            onClick={() => handleOpenEditMaterial(m)}
                            title="Edit Material"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "12px" }}
                            onClick={() => handleDeleteMaterial(m)}
                            title="Delete Material"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB: ADMIN PROFILE ================= */}
      {activeTab === "profile" && (
        <div className="portal-card">
          <div className="card-top-title">
            <h3>Administrator Account Profile</h3>
            <span className="badge-paid">System Administrator</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "12px" }}>
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Admin Name:</span>
              <h4 style={{ margin: "4px 0 0", color: "#1e293b" }}>{user?.name || "College Administrator"}</h4>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Administrator ID:</span>
              <h4 style={{ margin: "4px 0 0", color: "#1e293b" }}>{user?.userId || user?.user_id || "ADM001"}</h4>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Assigned Role:</span>
              <h4 style={{ margin: "4px 0 0", color: "#1e293b" }}>Institutional College Admin (Level 1)</h4>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Campus Institution:</span>
              <h4 style={{ margin: "4px 0 0", color: "#1e293b" }}>SVCET Autonomous Campus</h4>
            </div>
          </div>

          <div style={{ marginTop: "24px", padding: "16px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px" }}>
            <h4 style={{ color: "#065f46", marginBottom: "8px" }}>🔐 Administrative Privileges & Authorizations</h4>
            <p style={{ fontSize: "13px", color: "#047857", lineHeight: "1.6" }}>
              ✓ Student Records: Create, Update, Password Reset, and Permanent Deletion.<br />
              ✓ Bulk Admissions: CSV Upload and Roster Synchronization.<br />
              ✓ Financial Ledger: Offline Payment Collection, Official Institutional Receipting.<br />
              ✓ Academic Curricula: CSE Regulations, Syllabus and Study Materials Management.
            </p>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD STUDENT ================= */}
      {showAddStudentModal && (
        <div className="modal-overlay">
          <div className="portal-modal" style={{ maxWidth: "640px" }}>
            <div className="modal-header">
              <h3>➕ Enroll New Student</h3>
              <button className="modal-close-btn" onClick={() => setShowAddStudentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label>Register Number * (Unique)</label>
                  <input
                    type="text"
                    placeholder="e.g., SVCET025"
                    value={studentForm.register_no}
                    onChange={(e) => setStudentForm({ ...studentForm, register_no: e.target.value.toUpperCase().trim() })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Student Full Name"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label>Institutional Email *</label>
                  <input
                    type="email"
                    placeholder="student@svcet.edu.in"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value.trim() })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g., 9876543210"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    required
                  >
                    <option value="Computer Science Engineering">Computer Science Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Electrical & Electronics">Electrical & Electronics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Initial Login Password *</label>
                  <input
                    type="text"
                    placeholder="Default password"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
                <div className="form-group">
                  <label>Year *</label>
                  <select
                    value={studentForm.year}
                    onChange={(e) => setStudentForm({ ...studentForm, year: Number(e.target.value) })}
                    required
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Semester *</label>
                  <select
                    value={studentForm.semester}
                    onChange={(e) => setStudentForm({ ...studentForm, semester: Number(e.target.value) })}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Sem {sem}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <input
                    type="text"
                    placeholder="A / B / C"
                    maxLength={2}
                    value={studentForm.section}
                    onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label>Batch</label>
                  <input
                    type="text"
                    placeholder="2024-2028"
                    value={studentForm.batch}
                    onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "6px" }}>
                <div className="form-group">
                  <label>Annual Tuition Fee (₹)</label>
                  <input
                    type="number"
                    value={studentForm.tuition_fee}
                    onChange={(e) => setStudentForm({ ...studentForm, tuition_fee: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Exam Fee (₹)</label>
                  <input
                    type="number"
                    value={studentForm.exam_fee}
                    onChange={(e) => setStudentForm({ ...studentForm, exam_fee: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddStudentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  ✓ Enroll Student & Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT STUDENT ================= */}
      {showEditStudentModal && (
        <div className="modal-overlay">
          <div className="portal-modal" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>✏️ Edit Student Profile ({studentForm.register_no})</h3>
              <button className="modal-close-btn" onClick={() => setShowEditStudentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateStudent}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label>Institutional Email</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  value={studentForm.department}
                  onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                >
                  <option value="Computer Science Engineering">Computer Science Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
                <div className="form-group">
                  <label>Year</label>
                  <select
                    value={studentForm.year}
                    onChange={(e) => setStudentForm({ ...studentForm, year: Number(e.target.value) })}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select
                    value={studentForm.semester}
                    onChange={(e) => setStudentForm({ ...studentForm, semester: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Section</label>
                  <input
                    type="text"
                    value={studentForm.section}
                    onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="form-group">
                  <label>Batch</label>
                  <input
                    type="text"
                    value={studentForm.batch}
                    onChange={(e) => setStudentForm({ ...studentForm, batch: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditStudentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  ✓ Update Student Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESET PASSWORD ================= */}
      {showResetPasswordModal && (
        <div className="modal-overlay">
          <div className="portal-modal" style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h3>🔑 Reset Student Password</h3>
              <button className="modal-close-btn" onClick={() => setShowResetPasswordModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveResetPassword}>
              <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px" }}>
                Resetting password for: <strong>{resetPasswordForm.name}</strong> ({resetPasswordForm.register_no})
              </p>

              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="text"
                  placeholder="Enter new password"
                  value={resetPasswordForm.new_password}
                  onChange={(e) => setResetPasswordForm({ ...resetPasswordForm, new_password: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowResetPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  ✓ Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CSV BULK IMPORT ================= */}
      {showCsvModal && (
        <div className="modal-overlay">
          <div className="portal-modal" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3>📁 Bulk Import Students via CSV</h3>
              <button className="modal-close-btn" onClick={() => setShowCsvModal(false)}>✕</button>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
              <button
                type="button"
                className={csvUploadState.mode === "file" ? "btn-sm btn-primary" : "btn-sm btn-secondary"}
                onClick={() => setCsvUploadState({ ...csvUploadState, mode: "file" })}
              >
                📎 Upload CSV File
              </button>
              <button
                type="button"
                className={csvUploadState.mode === "text" ? "btn-sm btn-primary" : "btn-sm btn-secondary"}
                onClick={() => setCsvUploadState({ ...csvUploadState, mode: "text" })}
              >
                ✍️ Paste CSV Text
              </button>
              <button
                type="button"
                className="btn-sm btn-outline"
                style={{ marginLeft: "auto" }}
                onClick={handleDownloadTemplate}
              >
                📥 Download Template CSV
              </button>
            </div>

            <form onSubmit={handleCsvImport}>
              {csvUploadState.mode === "file" ? (
                <div className="form-group">
                  <label>Select .CSV File to Upload *</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvUploadState({ ...csvUploadState, file: e.target.files[0] })}
                    required
                  />
                  <small style={{ color: "#64748b", marginTop: "6px", display: "block" }}>
                    Standard CSV Columns: <code>register_no,name,email,phone,department,year,semester,section,batch,password,tuition_fee,exam_fee,paid_amount</code>
                  </small>
                </div>
              ) : (
                <div className="form-group">
                  <label>Paste CSV Data with Header *</label>
                  <textarea
                    rows={8}
                    placeholder={"register_no,name,email,phone,department,year,semester,section,batch,password,tuition_fee,exam_fee,paid_amount\nSVCET010,Kavitha S,kavitha@svcet.edu,9876543210,Computer Science Engineering,2,4,A,2024-2028,Student@123,50000,2500,25000"}
                    value={csvUploadState.text}
                    onChange={(e) => setCsvUploadState({ ...csvUploadState, text: e.target.value })}
                    style={{ fontFamily: "monospace", fontSize: "12px" }}
                    required
                  />
                </div>
              )}

              {csvUploadState.summary && (
                <div style={{ marginTop: "16px", padding: "14px", borderRadius: "8px", background: csvUploadState.summary.imported_count > 0 ? "#ecfdf5" : "#fef2f2", border: `1px solid ${csvUploadState.summary.imported_count > 0 ? "#a7f3d0" : "#fca5a5"}` }}>
                  <h4 style={{ color: csvUploadState.summary.imported_count > 0 ? "#065f46" : "#991b1b", marginBottom: "8px" }}>
                    Import Results Summary
                  </h4>
                  <p style={{ fontSize: "13px", margin: "4px 0" }}>
                    ✓ <strong>{csvUploadState.summary.imported_count || 0}</strong> students successfully added and accounts created.
                  </p>
                  {csvUploadState.summary.failed_count > 0 && (
                    <div>
                      <p style={{ fontSize: "13px", color: "#b91c1c", margin: "4px 0" }}>
                        ⚠ <strong>{csvUploadState.summary.failed_count}</strong> rows skipped or failed:
                      </p>
                      <ul style={{ maxHeight: "120px", overflowY: "auto", fontSize: "12px", color: "#b91c1c", paddingLeft: "20px" }}>
                        {csvUploadState.summary.errors?.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCsvModal(false)}>
                  Close
                </button>
                <button type="submit" className="btn-primary" disabled={csvUploadState.loading}>
                  {csvUploadState.loading ? "Processing..." : "🚀 Process & Enroll Students"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: OFFLINE FEE PAYMENT ================= */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="portal-modal">
            <div className="modal-header">
              <h3>Log Offline Fee Payment</h3>
              <button className="modal-close-btn" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRecordOfflinePayment}>
              <div className="form-group">
                <label>Select Student</label>
                <select
                  value={paymentForm.register_no}
                  onChange={(e) => handleStudentSelectChange(e.target.value)}
                  required
                >
                  {feesList.map((f) => (
                    <option key={f.register_no} value={f.register_no}>
                      {f.register_no} - {f.name} ({f.department}) - Balance: ₹{Number(f.balance).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="student-fee-mini-summary">
                  <div><span>Total Assessed:</span> <strong>₹{Number(selectedStudent.total_fee).toLocaleString("en-IN")}</strong></div>
                  <div><span>Already Paid:</span> <strong className="text-green">₹{Number(selectedStudent.paid_amount).toLocaleString("en-IN")}</strong></div>
                  <div><span>Balance Remaining:</span> <strong className="text-red">₹{Number(selectedStudent.balance).toLocaleString("en-IN")}</strong></div>
                </div>
              )}

              <div className="form-group">
                <label>Payment Amount Received (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  placeholder="Enter payment amount"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Mode / Instrument</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                >
                  <option value="Cash">Cash (College Accounts Counter)</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Demand Draft">Demand Draft (DD)</option>
                  <option value="Bank Transfer">NEFT / RTGS Bank Transfer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Transaction Notes / Cheque No / Reference</label>
                <input
                  type="text"
                  placeholder="e.g., Cheque No. 40921, HDFC Bank"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  ✓ Record Payment & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT STUDY MATERIAL ================= */}
      {showMaterialModal && (
        <div className="modal-overlay">
          <div className="portal-modal" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3>{editingMaterial ? "✏️ Edit Study Material" : "➕ Add Study Material"}</h3>
              <button className="modal-close-btn" onClick={() => setShowMaterialModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveMaterial}>
              {!editingMaterial && (
                <>
                  <div className="form-group">
                    <label>Select Regulation *</label>
                    <select
                      value={materialForm.regulation_id}
                      onChange={(e) => handleRegulationChangeInForm(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Regulation --</option>
                      {adminRegulations.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Select Semester *</label>
                    <select
                      value={materialForm.semester_id}
                      onChange={(e) => handleSemesterChangeInForm(e.target.value)}
                      required
                      disabled={!materialForm.regulation_id}
                    >
                      <option value="">-- Choose Semester --</option>
                      {adminSemesters.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.academic_year})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Select Subject *</label>
                    <select
                      value={materialForm.subject_id}
                      onChange={(e) => setMaterialForm({ ...materialForm, subject_id: e.target.value })}
                      required
                      disabled={!materialForm.semester_id}
                    >
                      <option value="">-- Choose Subject --</option>
                      {adminSubjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.subject_code} – {sub.subject_name} ({sub.credits} Credits)
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label>Material Type *</label>
                  <select
                    value={materialForm.material_type}
                    onChange={(e) => setMaterialForm({ ...materialForm, material_type: e.target.value })}
                    required
                  >
                    <option value="Lecture Notes">Lecture Notes</option>
                    <option value="Important Questions">Important Questions</option>
                    <option value="Normal Notes">Normal Notes</option>
                    <option value="Question Paper">Question Paper</option>
                    <option value="Video Lecture">Video Lecture</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Useful Resources">Useful Resources</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Unit / Scope</label>
                  <select
                    value={materialForm.unit}
                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                  >
                    <option value="All Units">All Units</option>
                    <option value="Unit 1">Unit 1</option>
                    <option value="Unit 2">Unit 2</option>
                    <option value="Unit 3">Unit 3</option>
                    <option value="Unit 4">Unit 4</option>
                    <option value="Unit 5">Unit 5</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Material Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Unit 1 Automata Theory Handwritten Notes"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Resource URL (HTTP or HTTPS) *</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={materialForm.url}
                  onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label>Source / Platform</label>
                  <input
                    type="text"
                    placeholder="e.g., Anna University, BrainKart, NPTEL"
                    value={materialForm.source}
                    onChange={(e) => setMaterialForm({ ...materialForm, source: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Academic Year</label>
                  <input
                    type="text"
                    placeholder="e.g., 2024"
                    value={materialForm.academic_year}
                    onChange={(e) => setMaterialForm({ ...materialForm, academic_year: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowMaterialModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingMaterial ? "✓ Update Material" : "✓ Save & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {activeReceipt && (
        <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}
    </div>
  );
}

export default AdminPortal;
