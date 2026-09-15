import React, { useState, useEffect } from "react";
import ReceiptModal from "./ReceiptModal";

const API_BASE = "http://localhost:5001/api";

function AdminPortal({ user }) {
  const [activeTab, setActiveTab] = useState("fees");
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, feesRes, studentsRes, teachersRes, matsRes, regsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`).then((r) => r.json()),
        fetch(`${API_BASE}/fees`).then((r) => r.json()),
        fetch(`${API_BASE}/students`).then((r) => r.json()),
        fetch(`${API_BASE}/teachers`).then((r) => r.json()),
        fetch(`${API_BASE}/study-materials`).then((r) => r.json()),
        fetch(`${API_BASE}/courses/cse/regulations`).then((r) => r.json())
      ]);

      setStats(statsRes);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          register_no: paymentForm.register_no,
          amount: Number(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          notes: paymentForm.notes,
          collected_by: user?.userId || "ADM001"
        })
      });

      const data = await response.json();
      if (response.ok) {
        setShowPaymentModal(false);
        // Attach student details for receipt
        const s = feesList.find((f) => f.register_no === paymentForm.register_no);
        const fullReceipt = {
          ...data.receipt,
          student_name: s?.name || "Student",
          department: s?.department || "Engineering"
        };
        setActiveReceipt(fullReceipt);
        setActionMessage(`Offline payment of ₹${paymentForm.amount} logged successfully for ${paymentForm.register_no}!`);
        setTimeout(() => setActionMessage(""), 5000);
        fetchDashboardData();
      } else {
        alert(data.message || "Payment logging failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server communication error");
    }
  };

  // Study Material Management Handlers
  const handleRegulationChangeInForm = async (regId) => {
    setMaterialForm((prev) => ({ ...prev, regulation_id: regId, semester_id: "", subject_id: "" }));
    setAdminSemesters([]);
    setAdminSubjects([]);
    if (!regId) return;
    try {
      const res = await fetch(`${API_BASE}/regulations/${regId}/semesters`);
      const data = await res.json();
      setAdminSemesters(data.semesters || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSemesterChangeInForm = async (semId) => {
    setMaterialForm((prev) => ({ ...prev, semester_id: semId, subject_id: "" }));
    setAdminSubjects([]);
    if (!semId) return;
    try {
      const res = await fetch(`${API_BASE}/semesters/${semId}/subjects`);
      const data = await res.json();
      setAdminSubjects(data.subjects || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddMaterial = async () => {
    setEditingMaterial(null);
    const defaultReg = adminRegulations[0]?.id || "";
    setMaterialForm({
      regulation_id: defaultReg,
      semester_id: "",
      subject_id: "",
      material_type: "Lecture Notes",
      unit: "Unit 1",
      title: "",
      url: "",
      source: "",
      academic_year: "2024"
    });
    if (defaultReg) {
      try {
        const res = await fetch(`${API_BASE}/regulations/${defaultReg}/semesters`);
        const data = await res.json();
        setAdminSemesters(data.semesters || []);
      } catch (err) {
        console.error(err);
      }
    }
    setShowMaterialModal(true);
  };

  const handleOpenEditMaterial = async (item) => {
    setEditingMaterial(item);
    setMaterialForm({
      regulation_id: "",
      semester_id: item.semester_id || "",
      subject_id: item.subject_id,
      material_type: item.material_type,
      unit: item.unit || "All Units",
      title: item.title,
      url: item.url,
      source: item.source || "",
      academic_year: item.academic_year || "2024"
    });
    setShowMaterialModal(true);
  };

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.title.trim() || !materialForm.url.trim()) {
      alert("Title and URL are required.");
      return;
    }
    if (!materialForm.url.startsWith("http://") && !materialForm.url.startsWith("https://")) {
      alert("URL must start with http:// or https://");
      return;
    }

    try {
      let response;
      if (editingMaterial) {
        response = await fetch(`${API_BASE}/study-materials/${editingMaterial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(materialForm)
        });
      } else {
        if (!materialForm.subject_id) {
          alert("Please select a subject.");
          return;
        }
        response = await fetch(`${API_BASE}/study-materials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      const response = await fetch(`${API_BASE}/study-materials/${item.id}`, { method: "DELETE" });
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
          <h2>Campus Financials & Records Hub</h2>
          <p>Logged in as: <strong>{user?.name || "Administrator"}</strong> ({user?.userId})</p>
        </div>
        <div className="portal-header-actions">
          <button className="btn-primary" onClick={() => handleOpenOfflinePayment()}>
            ➕ Log Offline Fee Payment (Cash/Cheque)
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
            <strong className="stat-value">{stats.total_students}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div>
            <span className="stat-label">Faculty Roster</span>
            <strong className="stat-value">{stats.total_faculty}</strong>
          </div>
        </div>
        <div className="stat-card primary">
          <div className="stat-icon">💰</div>
          <div>
            <span className="stat-label">Total Fees Collected</span>
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
          className={activeTab === "fees" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("fees")}
        >
          💳 Fees & Financial Ledger
        </button>
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
          className={activeTab === "materials" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("materials")}
        >
          📚 Study Materials Manager ({materialsList.length})
        </button>
      </div>

      {/* TAB 1: FEES LEDGER */}
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
          </div>

          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Tuition (₹)</th>
                  <th>Exam / Transport (₹)</th>
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
                      <td>₹{(Number(f.exam_fee || 0) + Number(f.transport_fee || 0)).toLocaleString("en-IN")}</td>
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

      {/* TAB 2: STUDENTS DIRECTORY */}
      {activeTab === "students" && (
        <div className="portal-card">
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Register No</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Institutional Email</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.register_no}>
                    <td><strong>{s.register_no}</strong></td>
                    <td>{s.name}</td>
                    <td><span className="dept-tag">{s.department}</span></td>
                    <td>Year {s.year}</td>
                    <td>{s.email}</td>
                    <td>{s.phone || "+91 98765 43210"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FACULTY DIRECTORY */}
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

      {/* TAB 4: STUDY MATERIALS MANAGER */}
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

      {/* OFFLINE FEE PAYMENT MODAL */}
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

      {/* ADD / EDIT STUDY MATERIAL MODAL */}
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
