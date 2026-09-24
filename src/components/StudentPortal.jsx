import React, { useState, useEffect } from "react";
import ReceiptModal from "./ReceiptModal";

const API_BASE = "http://localhost:5001/api";

function StudentPortal({ user, initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab || "profile");
  const regNo = user?.register_no || user?.userId || "";

  // Data States
  const [feeData, setFeeData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [marksData, setMarksData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Online Payment Checkout Modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardHolder: user?.name || "",
    expiry: "",
    cvv: ""
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [successToast, setSuccessToast] = useState("");

  // UPI QR Payment States
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const UPI_PAYEE_NAME = "Dhamanithi N S";
  const UPI_ID = "dhamanithins433-1@okicici";

  // Academic Marksheet Assessment Filter State
  const [selectedAssessment, setSelectedAssessment] = useState("All");

  // Attendance Record Date and View Mode Filter States
  const [attendanceDateFilter, setAttendanceDateFilter] = useState("");
  const [attendanceViewMode, setAttendanceViewMode] = useState("date"); // "date" | "subject"

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    fetchAllStudentData();
  }, [regNo]);

  const fetchAllStudentData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("svcet_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [feeRes, attRes, marksRes, profRes] = await Promise.all([
        fetch(`${API_BASE}/student/fees`, { headers }).then((r) => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/student/attendance`, { headers }).then((r) => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/student/marks`, { headers }).then((r) => r.json()).catch(() => ({})),
        fetch(`${API_BASE}/student/profile`, { headers }).then((r) => r.json()).catch(() => ({}))
      ]);

      setFeeData(feeRes);
      setAttendanceData(attRes);
      setMarksData(marksRes);
      if (profRes && profRes.profile) {
        setProfileData(profRes.profile);
      }

      if (feeRes?.fee && Number(feeRes.fee.balance) > 0) {
        setPaymentAmount(feeRes.fee.balance);
      }
    } catch (err) {
      console.error("Error loading student data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const handlePayOnline = async (e) => {
    e.preventDefault();
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid payment amount");
      return;
    }

    const isUpi = paymentMethod === "UPI";
    if (isUpi && !utrNumber.trim()) {
      alert("Please enter the 12-digit UPI / UTR Transaction Reference Number after completing payment on your UPI app.");
      return;
    }

    setProcessingPayment(true);

    try {
      const res = await fetch(`${API_BASE}/fees/online-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          register_no: regNo,
          amount: amt,
          payment_method: isUpi ? "UPI (Google Pay / QR)" : paymentMethod,
          card_holder_name: isUpi ? (profileData?.name || user?.name || "Student") : cardData.cardHolder,
          utr_reference: isUpi ? utrNumber.trim() : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setProcessingPayment(false);
        setShowCheckout(false);
        setUtrNumber("");
        const fullReceipt = {
          ...data.receipt,
          student_name: profileData?.name || user?.name || "Student",
          department: profileData?.department || user?.department || "Computer Science Engineering"
        };
        setActiveReceipt(fullReceipt);
        setSuccessToast(`Online fee payment of ₹${amt.toLocaleString("en-IN")} completed successfully!`);
        setTimeout(() => setSuccessToast(""), 5000);
        fetchAllStudentData();
      } else {
        setProcessingPayment(false);
        alert(data.message || "Payment processing failed");
      }
    } catch (err) {
      setProcessingPayment(false);
      console.error(err);
      alert("Payment gateway connection error");
    }
  };

  const fee = feeData?.fee;
  const transactions = feeData?.transactions || [];

  // Authentic stats from database (NO FAKE / DEFAULT NUMBERS)
  const hasAttendanceData = attendanceData && attendanceData.total_classes !== undefined && attendanceData.total_classes > 0;
  const attendancePct = hasAttendanceData ? attendanceData.percentage : null;
  const isAttendanceShortage = attendancePct !== null && attendancePct < 75;

  const hasMarksData = marksData && marksData.average_percentage !== undefined && marksData.average_percentage !== null && marksData.records && marksData.records.length > 0;
  const averageMarks = hasMarksData ? marksData.average_percentage : null;

  // Derived Marks Calculations for Internal Assessment 1 and 2
  const allMarksRecords = marksData?.records || [];
  const filteredMarks = selectedAssessment === "All"
    ? allMarksRecords
    : allMarksRecords.filter((m) => {
        const type = (m.exam_type || "").toLowerCase();
        if (selectedAssessment === "Internal Assessment 1") {
          return type.includes("internal") && (type.includes("1") || type.includes("i") || type.includes("one")) && !type.includes("2") && !type.includes("ii");
        }
        if (selectedAssessment === "Internal Assessment 2") {
          return type.includes("internal") && (type.includes("2") || type.includes("ii") || type.includes("two"));
        }
        return m.exam_type === selectedAssessment;
      });

  const selectedAssessmentObtained = filteredMarks.reduce((acc, m) => acc + Number(m.marks_obtained || 0), 0);
  const selectedAssessmentMax = filteredMarks.reduce((acc, m) => acc + Number(m.max_marks || 100), 0);
  const selectedAssessmentScore = selectedAssessmentMax > 0
    ? Math.round((selectedAssessmentObtained / selectedAssessmentMax) * 100)
    : null;

  // Derived Attendance Calculations (Date filter & Subject-wise aggregate)
  const allAttendanceRecords = attendanceData?.records || [];
  const filteredAttendance = attendanceDateFilter
    ? allAttendanceRecords.filter((a) => a.date === attendanceDateFilter)
    : allAttendanceRecords;

  // Subject-wise cumulative aggregate
  const subjectAttendanceMap = {};
  allAttendanceRecords.forEach((a) => {
    const code = a.subject_code || "GEN001";
    if (!subjectAttendanceMap[code]) {
      subjectAttendanceMap[code] = {
        subject_code: code,
        subject_name: a.subject_name || "Course Session",
        total: 0,
        present: 0,
        late: 0,
        absent: 0
      };
    }
    subjectAttendanceMap[code].total += 1;
    if (a.status === "Present") subjectAttendanceMap[code].present += 1;
    else if (a.status === "Late") subjectAttendanceMap[code].late += 1;
    else if (a.status === "Absent") subjectAttendanceMap[code].absent += 1;
  });

  const subjectAttendanceList = Object.values(subjectAttendanceMap).map((sub) => {
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
      {/* PORTAL HEADER */}
      <div className="portal-header">
        <div>
          <span className="portal-pill student">STUDENT PORTAL</span>
          <h2>Welcome, {profileData?.name || user?.name || "Student"}</h2>
          <p>
            Register No: <strong>{profileData?.register_no || regNo}</strong> • {profileData?.department || user?.department || "Engineering"} • Semester {profileData?.semester || user?.semester || 1} • SVCET Campus
          </p>
        </div>
        {fee && Number(fee.balance) > 0 && (
          <div className="portal-header-actions">
            <button className="btn-primary" onClick={() => setShowCheckout(true)}>
              💳 Pay College Fees (Due: ₹{Number(fee.balance).toLocaleString("en-IN")})
            </button>
          </div>
        )}
      </div>

      {successToast && (
        <div className="alert-banner success">
          ✓ {successToast}
        </div>
      )}

      {isAttendanceShortage && (
        <div className="alert-banner warning">
          ⚠ <strong>Attendance Warning:</strong> Your current attendance is {attendancePct}%, which is below the mandatory 75% institutional requirement. Please consult your faculty mentor.
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div>
            <span className="stat-label">My Attendance Percentage</span>
            {hasAttendanceData ? (
              <strong className={`stat-value ${isAttendanceShortage ? "text-red" : "text-green"}`}>
                {attendancePct}%
              </strong>
            ) : (
              <strong className="stat-value text-muted" style={{ fontSize: "15px" }}>
                No attendance data available.
              </strong>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div>
            <span className="stat-label">Academic Average / Grade</span>
            {hasMarksData ? (
              <strong className="stat-value text-blue">
                {averageMarks}%
              </strong>
            ) : (
              <strong className="stat-value text-muted" style={{ fontSize: "15px" }}>
                No marks available.
              </strong>
            )}
          </div>
        </div>

        <div className="stat-card primary">
          <div className="stat-icon">✅</div>
          <div>
            <span className="stat-label">Total Fee Paid</span>
            {fee ? (
              <strong className="stat-value text-green">
                ₹{Number(fee.paid_amount || 0).toLocaleString("en-IN")}
              </strong>
            ) : (
              <strong className="stat-value text-muted" style={{ fontSize: "15px" }}>
                No fee records available.
              </strong>
            )}
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">💳</div>
          <div>
            <span className="stat-label">Balance Outstanding</span>
            {fee ? (
              <strong className={`stat-value ${Number(fee.balance || 0) > 0 ? "text-red" : "text-green"}`}>
                ₹{Number(fee.balance || 0).toLocaleString("en-IN")}
              </strong>
            ) : (
              <strong className="stat-value text-muted" style={{ fontSize: "15px" }}>
                No fee records available.
              </strong>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="portal-tabs">
        <button
          className={activeTab === "profile" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("profile")}
        >
          👤 Student Profile
        </button>
        <button
          className={activeTab === "fees" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("fees")}
        >
          💳 Fees Schedule & History
        </button>
        <button
          className={activeTab === "marks" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("marks")}
        >
          📊 Academic Marksheet
        </button>
        <button
          className={activeTab === "attendance" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("attendance")}
        >
          📋 Attendance Records
        </button>
      </div>

      {/* ================= TAB: STUDENT PROFILE ================= */}
      {activeTab === "profile" && (
        <div className="portal-card">
          <div className="card-top-title">
            <div>
              <span className="badge-paid">OFFICIAL ACADEMIC PROFILE</span>
              <h3>Verified Student Particulars</h3>
              <p className="sub-note">Database Record from Sri Venkateswara College of Engineering and Technology</p>
            </div>
            <span className="cgpa-pill">Verified Active Student</span>
          </div>

          <div className="student-profile-display-grid">
            <div className="profile-detail-card">
              <span className="profile-field-label">🆔 Official Register Number</span>
              <strong className="profile-field-value highlight-reg">{profileData?.register_no || regNo}</strong>
            </div>

            <div className="profile-detail-card">
              <span className="profile-field-label">👤 Full Name</span>
              <strong className="profile-field-value">{profileData?.name || user?.name || "Student"}</strong>
            </div>

            <div className="profile-detail-card">
              <span className="profile-field-label">🏛️ Academic Department</span>
              <strong className="profile-field-value">{profileData?.department || user?.department || "-"}</strong>
            </div>

            <div className="profile-detail-card">
              <span className="profile-field-label">📅 Current Year & Semester</span>
              <strong className="profile-field-value">
                Year {profileData?.year || user?.year || 1} • Semester {profileData?.semester || user?.semester || 1}
              </strong>
            </div>

            <div className="profile-detail-card">
              <span className="profile-field-label">🏷️ Class Section</span>
              <strong className="profile-field-value">Section {profileData?.section || user?.section || "A"}</strong>
            </div>

            <div className="profile-detail-card">
              <span className="profile-field-label">🎓 Academic Batch</span>
              <strong className="profile-field-value">{profileData?.batch || user?.batch || "2024-2028"}</strong>
            </div>

            <div className="profile-detail-card">
              <span className="profile-field-label">✉️ Institutional Email</span>
              <strong className="profile-field-value">{profileData?.email || user?.email || "-"}</strong>
            </div>

            <div className="profile-detail-card">
              <span className="profile-field-label">📞 Contact Phone</span>
              <strong className="profile-field-value">{profileData?.phone || user?.phone || "-"}</strong>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 1: FEES SCHEDULE AND ORIGINAL FEES BILL ================= */}
      {activeTab === "fees" && (
        <div>
          {!fee ? (
            <div className="portal-card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>💳</div>
              <h3 style={{ marginBottom: "8px" }}>No fee records available.</h3>
              <p className="text-muted">No institutional fee schedule has been assigned to your register number yet.</p>
            </div>
          ) : (
            <div className="fees-bill-container">
              {/* BILL OFFICIAL HEADER */}
              <div className="fees-bill-header">
                <div className="fees-bill-college-info">
                  <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill mb-2 d-inline-block">
                    OFFICIAL INSTITUTIONAL FEES INVOICE & LEDGER
                  </span>
                  <h3>SRI VENKATESWARA COLLEGE OF ENGINEERING AND TECHNOLOGY</h3>
                  <p><strong>Autonomous Institution</strong> • Approved by AICTE, New Delhi • Affiliated to Anna University</p>
                  <p>Accredited by NAAC 'A+' • ISO 9001:2015 Certified • SVCET Campus, Thirupachur, Tiruvallur</p>
                </div>
                <div className="fees-bill-meta">
                  <div className="bill-no">INVOICE: <strong>SVCET-FEE-{profileData?.register_no || regNo}</strong></div>
                  <div className="bill-date">Bill Date: <strong>{new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</strong></div>
                  <div className="mt-2">
                    {Number(fee?.balance || 0) <= 0 ? (
                      <span className="badge-paid px-3 py-1">✓ ALL DUES CLEARED</span>
                    ) : (
                      <span className="badge-due px-3 py-1">⚠ OUTSTANDING PAYMENT DUE</span>
                    )}
                  </div>
                </div>
              </div>

              {/* STUDENT PARTICULARS STRIP */}
              <div className="fees-bill-student-grid">
                <div className="fees-bill-student-item">
                  <span>Register Number:</span>
                  <strong className="text-primary">{profileData?.register_no || regNo}</strong>
                </div>
                <div className="fees-bill-student-item">
                  <span>Student Name:</span>
                  <strong>{profileData?.name || user?.name || "Student"}</strong>
                </div>
                <div className="fees-bill-student-item">
                  <span>Department:</span>
                  <strong>{profileData?.department || user?.department || "Engineering"}</strong>
                </div>
                <div className="fees-bill-student-item">
                  <span>Year & Semester:</span>
                  <strong>Year {profileData?.year || user?.year || 1} • Sem {profileData?.semester || user?.semester || 1} (Sec {profileData?.section || user?.section || "A"})</strong>
                </div>
                <div className="fees-bill-student-item">
                  <span>Academic Batch:</span>
                  <strong>{profileData?.batch || user?.batch || "2024-2028"}</strong>
                </div>
              </div>

              {/* ITEMIZED FEE SCHEDULE BILL TABLE */}
              <div className="table-responsive">
                <table className="fees-bill-table table table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>#</th>
                      <th>Fee Category / Academic Particulars</th>
                      <th style={{ width: "160px" }}>Academic Period</th>
                      <th style={{ width: "140px" }} className="text-end">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>
                        <strong>Tuition & Laboratory Fee</strong>
                        <div className="text-muted small">Instructional curriculum, state-of-the-art laboratory access & computing resources</div>
                      </td>
                      <td>Annual</td>
                      <td className="text-end fw-semibold">₹{Number(fee?.tuition_fee || 0).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>
                        <strong>University Examination & Evaluation Fee</strong>
                        <div className="text-muted small">Autonomous semester examination fees, hall tickets & grade sheet administration</div>
                      </td>
                      <td>Semester</td>
                      <td className="text-end fw-semibold">₹{Number(fee?.exam_fee || 0).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>
                        <strong>College Bus / Transportation Charges</strong>
                        <div className="text-muted small">Official institution commuter transit facility</div>
                      </td>
                      <td>Annual</td>
                      <td className="text-end fw-semibold">₹{Number(fee?.transport_fee || 0).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td>
                        <strong>Hostel Residence & Dining Charges</strong>
                        <div className="text-muted small">Campus residential hall maintenance and nutritional mess facility</div>
                      </td>
                      <td>Annual</td>
                      <td className="text-end fw-semibold">₹{Number(fee?.hostel_fee || 0).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td>5</td>
                      <td>
                        <strong>Library, Sports & Institutional Amenities Fee</strong>
                        <div className="text-muted small">Central library digital journals access, sports facilities & campus amenities</div>
                      </td>
                      <td>Annual</td>
                      <td className="text-end fw-semibold">₹{Number(fee?.other_fee || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* BILL SUMMARY TOTALS BOX */}
              <div className="fees-bill-summary-bar">
                <div className="fees-bill-totals-box">
                  <div className="fees-bill-total-row">
                    <span>Total Assessed Fee:</span>
                    <strong>₹{Number(fee?.total_fee || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="fees-bill-total-row">
                    <span>Total Amount Paid to Date:</span>
                    <strong className="text-success">₹{Number(fee?.paid_amount || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="fees-bill-total-row highlight-due">
                    <span>Net Balance Payable:</span>
                    <strong className={Number(fee?.balance || 0) > 0 ? "text-danger" : "text-success"}>
                      ₹{Number(fee?.balance || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              </div>

              {/* BILL ACTIONS */}
              <div className="fees-bill-actions">
                <button className="btn-secondary" onClick={() => window.print()}>
                  🖨️ Print / Download Official Bill
                </button>
                {Number(fee?.balance || 0) > 0 && (
                  <button className="btn-primary" onClick={() => setShowCheckout(true)}>
                    💳 Pay College Fees Online
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PAYMENT TRANSACTION HISTORY */}
          <div className="portal-card">
            <div className="card-top-title">
              <h3>Verified Payment Transactions & Official Receipts</h3>
              <span className="text-muted small">Recorded in institutional ledger</span>
            </div>
            {transactions.length === 0 ? (
              <p className="empty-notice" style={{ padding: "20px 0" }}>No past payment transactions recorded.</p>
            ) : (
              <div className="table-responsive">
                <table className="portal-table table table-hover">
                  <thead>
                    <tr>
                      <th>Receipt No</th>
                      <th>Transaction / UTR Ref</th>
                      <th>Payment Mode</th>
                      <th>Amount Paid</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Receipt Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id || t.receipt_no}>
                        <td><strong>{t.receipt_no}</strong></td>
                        <td><code style={{ fontSize: "12px" }}>{t.transaction_id || "-"}</code></td>
                        <td>{t.payment_method}</td>
                        <td><strong className="text-success">₹{Number(t.amount).toLocaleString("en-IN")}</strong></td>
                        <td><small>{t.paid_at}</small></td>
                        <td><span className="badge-paid">Success</span></td>
                        <td>
                          <button
                            className="btn-sm btn-outline"
                            onClick={() =>
                              setActiveReceipt({
                                ...t,
                                student_name: profileData?.name || user?.name,
                                department: profileData?.department || user?.department,
                                remaining_balance: fee?.balance
                              })
                            }
                          >
                            📄 View & Print Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: ACADEMIC MARKS ================= */}
      {activeTab === "marks" && (
        <div className="portal-card">
          <div className="card-top-title">
            <div>
              <h3>Academic Marksheet & Continuous Internal Assessment</h3>
              <p className="sub-note">Verified Examination Results from Controller of Examinations</p>
            </div>
            <span className="cgpa-pill">
              {selectedAssessmentScore !== null
                ? `${selectedAssessment === "All" ? "Overall Average" : selectedAssessment}: ${selectedAssessmentScore}%`
                : "No marks available"}
            </span>
          </div>

          {/* ASSESSMENT SELECTOR TABS */}
          <div className="assessment-filter-tabs">
            <button
              type="button"
              className={`btn-assessment-filter ${selectedAssessment === "All" ? "active" : ""}`}
              onClick={() => setSelectedAssessment("All")}
            >
              📑 All Assessments ({allMarksRecords.length})
            </button>
            <button
              type="button"
              className={`btn-assessment-filter ${selectedAssessment === "Internal Assessment 1" ? "active" : ""}`}
              onClick={() => setSelectedAssessment("Internal Assessment 1")}
            >
              📝 Internal Assessment 1 (IA-1)
            </button>
            <button
              type="button"
              className={`btn-assessment-filter ${selectedAssessment === "Internal Assessment 2" ? "active" : ""}`}
              onClick={() => setSelectedAssessment("Internal Assessment 2")}
            >
              📝 Internal Assessment 2 (IA-2)
            </button>
          </div>

          {/* ASSESSMENT PERFORMANCE SUMMARY KPI */}
          {filteredMarks.length > 0 && (
            <div className="assessment-kpi-banner">
              <div className="assessment-kpi-item">
                <span>Selected Assessment:</span>
                <strong>{selectedAssessment}</strong>
              </div>
              <div className="assessment-kpi-item">
                <span>Average Score:</span>
                <strong className={selectedAssessmentScore >= 50 ? "text-success" : "text-danger"}>
                  {selectedAssessmentScore}%
                </strong>
              </div>
              <div className="assessment-kpi-item">
                <span>Total Subjects Evaluated:</span>
                <strong>{filteredMarks.length} Course(s)</strong>
              </div>
              <div className="assessment-kpi-item">
                <span>Pass Status:</span>
                <strong>
                  {filteredMarks.filter((m) => Number(m.marks_obtained) >= (Number(m.max_marks || 100) * 0.5)).length} Passed / {filteredMarks.length} Total
                </strong>
              </div>
            </div>
          )}

          <div className="table-responsive">
            <table className="portal-table table table-hover">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Course Title</th>
                  <th>Assessment Name</th>
                  <th>Marks Obtained</th>
                  <th>Max Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Result Status</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                      No examination marks published yet for {selectedAssessment}.
                    </td>
                  </tr>
                ) : (
                  filteredMarks.map((m) => {
                    const score = Number(m.marks_obtained);
                    const max = Number(m.max_marks || 100);
                    const pct = Math.round((score / max) * 100);
                    const isPass = score >= (max * 0.5);

                    return (
                      <tr key={m.id || m.subject_code + m.exam_type}>
                        <td><strong className="text-primary">{m.subject_code}</strong></td>
                        <td><strong>{m.subject_name || "Engineering Course"}</strong></td>
                        <td>
                          <span className="badge bg-light text-dark border px-2 py-1">
                            {m.exam_type}
                          </span>
                        </td>
                        <td><strong style={{ fontSize: "16px" }}>{score}</strong></td>
                        <td>/ {max}</td>
                        <td><strong>{pct}%</strong></td>
                        <td>
                          <span className={`grade-badge grade-${m.grade || "A"}`}>
                            {m.grade || "A"}
                          </span>
                        </td>
                        <td>
                          {isPass ? (
                            <span className="badge-paid">PASS</span>
                          ) : (
                            <span className="badge-due">REAPPEAR</span>
                          )}
                        </td>
                        <td>Sem {profileData?.semester || user?.semester || 1}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ATTENDANCE RECORD ================= */}
      {activeTab === "attendance" && (
        <div className="portal-card">
          <div className="card-top-title">
            <div>
              <h3>Attendance Record & Academic Eligibility</h3>
              <p className="sub-note">Anna University 75% Institutional Attendance Threshold Compliance</p>
            </div>
            <span className={attendancePct !== null && attendancePct >= 75 ? "badge-paid" : "badge-due"}>
              Eligibility: {attendancePct !== null && attendancePct >= 75 ? "Eligible for Examinations" : "Attendance Shortage (<75%)"}
            </span>
          </div>

          {/* ATTENDANCE KPI METRICS STRIP */}
          <div className="attendance-summary-bar" style={{ marginBottom: "20px" }}>
            <div>
              <span>Total Classes Conducted:</span> <strong>{attendanceData?.total_classes || 0}</strong>
            </div>
            <div>
              <span>Present:</span> <strong className="text-green">{attendanceData?.present || 0}</strong>
            </div>
            <div>
              <span>Late:</span> <strong className="text-amber">{attendanceData?.late || 0}</strong>
            </div>
            <div>
              <span>Absent:</span> <strong className="text-red">{attendanceData?.absent || 0}</strong>
            </div>
            <div>
              <span>Overall Attendance:</span>
              <strong className={attendancePct !== null && attendancePct >= 75 ? "text-green" : "text-red"}>
                {attendancePct !== null ? `${attendancePct}%` : "No data"}
              </strong>
            </div>
          </div>

          {/* ATTENDANCE DATE FILTER & VIEW CONTROLS */}
          <div className="attendance-controls-bar">
            <div className="attendance-date-picker-wrap">
              <label>
                📅 Filter by Date:
              </label>
              <input
                type="date"
                value={attendanceDateFilter}
                onChange={(e) => setAttendanceDateFilter(e.target.value)}
                className="attendance-date-input"
              />
              {attendanceDateFilter && (
                <button
                  type="button"
                  className="btn-sm btn-outline"
                  onClick={() => setAttendanceDateFilter("")}
                >
                  ✕ Clear Date Filter
                </button>
              )}
              <button
                type="button"
                className="btn-sm btn-outline"
                onClick={() => setAttendanceDateFilter(new Date().toISOString().split("T")[0])}
              >
                Today
              </button>
            </div>

            <div className="attendance-view-toggle">
              <button
                type="button"
                className={`btn-view-toggle ${attendanceViewMode === "date" ? "active" : ""}`}
                onClick={() => setAttendanceViewMode("date")}
              >
                📅 Date-Wise Log ({filteredAttendance.length})
              </button>
              <button
                type="button"
                className={`btn-view-toggle ${attendanceViewMode === "subject" ? "active" : ""}`}
                onClick={() => setAttendanceViewMode("subject")}
              >
                📚 Subject-Wise Summary ({subjectAttendanceList.length})
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: DATE-WISE LOG */}
          {attendanceViewMode === "date" && (
            <div className="table-responsive">
              <table className="portal-table table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject Code</th>
                    <th>Course Title</th>
                    <th>Attendance Status</th>
                    <th>Faculty Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                        {attendanceDateFilter
                          ? `No attendance entries recorded for ${attendanceDateFilter}.`
                          : "No attendance data available."}
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((a) => (
                      <tr key={a.id || a.date + a.subject_code}>
                        <td><strong>{a.date}</strong></td>
                        <td><strong className="text-primary">{a.subject_code}</strong></td>
                        <td>{a.subject_name || "Course Lecture"}</td>
                        <td>
                          <span
                            className={
                              a.status === "Present"
                                ? "badge-paid"
                                : a.status === "Late"
                                ? "badge-partial"
                                : "badge-due"
                            }
                          >
                            {a.status === "Present" ? "✓ Present" : a.status === "Late" ? "⏱ Late" : "✕ Absent"}
                          </span>
                        </td>
                        <td>{a.remarks || "Regular academic session"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW MODE 2: SUBJECT-WISE CUMULATIVE AGGREGATE */}
          {attendanceViewMode === "subject" && (
            <div className="table-responsive">
              <table className="portal-table table table-hover">
                <thead>
                  <tr>
                    <th>Subject Code</th>
                    <th>Course Name</th>
                    <th>Total Sessions</th>
                    <th>Attended</th>
                    <th>Absent</th>
                    <th>Attendance %</th>
                    <th>Eligibility Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectAttendanceList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                        No subject-wise attendance recorded.
                      </td>
                    </tr>
                  ) : (
                    subjectAttendanceList.map((sub) => (
                      <tr key={sub.subject_code}>
                        <td><strong className="text-primary">{sub.subject_code}</strong></td>
                        <td><strong>{sub.subject_name}</strong></td>
                        <td>{sub.total} classes</td>
                        <td><strong className="text-success">{sub.present}</strong> {sub.late > 0 ? `(${sub.late} late)` : ""}</td>
                        <td><strong className="text-danger">{sub.absent}</strong></td>
                        <td>
                          <strong className={sub.percentage >= 75 ? "text-success" : "text-danger"}>
                            {sub.percentage}%
                          </strong>
                        </td>
                        <td>
                          {sub.percentage >= 75 ? (
                            <span className="badge-paid">Eligible</span>
                          ) : (
                            <span className="badge-due">Shortage (&lt;75%)</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= ONLINE PAYMENT MODAL ================= */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="portal-modal checkout-modal">
            <div className="modal-header">
              <h3>Secure Online Fee Payment Gateway</h3>
              <button className="modal-close-btn" onClick={() => setShowCheckout(false)}>✕</button>
            </div>

            <form onSubmit={handlePayOnline}>
              <div className="checkout-summary-strip">
                <div>
                  <span>Register Number:</span>
                  <strong>{regNo}</strong>
                </div>
                <div>
                  <span>Current Outstanding Balance:</span>
                  <strong className="text-red">₹{Number(fee?.balance || 0).toLocaleString("en-IN")}</strong>
                </div>
              </div>

              {/* PAYMENT AMOUNT */}
              <div className="form-group">
                <label>Amount to Pay (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={fee?.balance || 100000}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
              </div>

              {/* PAYMENT CHANNEL SELECTOR */}
              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-method-selector">
                  <button
                    type="button"
                    className={paymentMethod === "Credit Card" ? "method-btn active" : "method-btn"}
                    onClick={() => setPaymentMethod("Credit Card")}
                  >
                    💳 Credit Card
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === "Debit Card" ? "method-btn active" : "method-btn"}
                    onClick={() => setPaymentMethod("Debit Card")}
                  >
                    🏧 Debit Card
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === "UPI" ? "method-btn active" : "method-btn"}
                    onClick={() => setPaymentMethod("UPI")}
                  >
                    📱 UPI / QR
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === "Net Banking" ? "method-btn active" : "method-btn"}
                    onClick={() => setPaymentMethod("Net Banking")}
                  >
                    🏦 Net Banking
                  </button>
                </div>
              </div>

              {/* CARD DETAILS FORM */}
              {(paymentMethod === "Credit Card" || paymentMethod === "Debit Card") && (
                <div className="card-input-box">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      maxLength="19"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardData.cardNumber}
                      onChange={(e) =>
                        setCardData({ ...cardData, cardNumber: handleFormatCardNumber(e.target.value) })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Name as on card"
                      value={cardData.cardHolder}
                      onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        maxLength="5"
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV / CVC</label>
                      <input
                        type="password"
                        maxLength="4"
                        placeholder="•••"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "UPI" && (
                <div className="upi-checkout-section">
                  <div className="upi-modal-card-banner">
                    <div className="upi-qr-image-holder">
                      <img
                        src="/upi-qr.jpg"
                        alt="College UPI QR Code"
                        className="modal-upi-qr-img"
                      />
                      <span className="qr-badge-live">College UPI Payment QR</span>
                    </div>

                    <div className="upi-modal-details">
                      <div className="upi-detail-pill">
                        <span className="label">Verified Payee:</span>
                        <strong className="val">{UPI_PAYEE_NAME}</strong>
                      </div>
                      <div className="upi-detail-pill">
                        <span className="label">Institutional UPI ID:</span>
                        <div className="upi-code-copy-row">
                          <code>{UPI_ID}</code>
                          <button
                            type="button"
                            className="btn-copy-mini"
                            onClick={handleCopyUpi}
                            title="Copy UPI ID to clipboard"
                          >
                            {copiedUpi ? "✓ Copied!" : "📋 Copy"}
                          </button>
                        </div>
                      </div>
                      <div className="upi-detail-pill">
                        <span className="label">Amount Payable:</span>
                        <strong className="val text-blue">₹{Number(paymentAmount || 0).toLocaleString("en-IN")}</strong>
                      </div>

                      <a
                        href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${paymentAmount || 0}&cu=INR&tn=SVCET_Fee_${regNo}`}
                        className="btn-mobile-intent"
                        target="_blank"
                        rel="noreferrer"
                      >
                        📱 Open UPI App (GPay / PhonePe / Paytm)
                      </a>
                    </div>
                  </div>

                  <div className="form-group utr-field-box">
                    <label>Enter 12-Digit UPI Transaction Reference / UTR Number *</label>
                    <input
                      type="text"
                      maxLength="22"
                      placeholder="e.g. 427189218291 (from your UPI transaction receipt)"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      required
                    />
                    <small className="helper-note">
                      ℹ️ After completing payment in your UPI app, enter the 12-digit UTR reference number to generate your official fee receipt.
                    </small>
                  </div>
                </div>
              )}

              {paymentMethod === "Net Banking" && (
                <div className="form-group">
                  <label>Select Bank</label>
                  <select defaultValue="HDFC Bank">
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Canara Bank">Canara Bank</option>
                  </select>
                </div>
              )}

              <div className="security-notice">
                🔒 256-Bit SSL Encrypted Institutional Payment Gateway. Verified transaction confirmation & receipt.
              </div>

              <div className="modal-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCheckout(false)} disabled={processingPayment}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={processingPayment}>
                  {processingPayment ? "⏳ Processing Transaction..." : `Pay ₹${Number(paymentAmount || 0).toLocaleString("en-IN")} Securely →`}
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

export default StudentPortal;
