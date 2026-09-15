import React, { useState, useEffect } from "react";
import ReceiptModal from "./ReceiptModal";

const API_BASE = "http://localhost:5001/api";

function StudentPortal({ user }) {
  const [activeTab, setActiveTab] = useState("qr-pay");
  const regNo = user?.userId || "SVCET001";

  // Data States
  const [feeData, setFeeData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [marksData, setMarksData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Online Payment Checkout Modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [cardData, setCardData] = useState({
    cardNumber: "4532 8912 3456 7890",
    cardHolder: user?.name || "Kishore Student",
    expiry: "08/29",
    cvv: "892"
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [successToast, setSuccessToast] = useState("");

  // UPI QR Payment States
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const UPI_PAYEE_NAME = "Dhamanithi N S";
  const UPI_ID = "dhamanithins433-1@okicici";

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  useEffect(() => {
    fetchAllStudentData();
  }, [regNo]);

  const fetchAllStudentData = async () => {
    setLoading(true);
    try {
      const [feeRes, attRes, marksRes] = await Promise.all([
        fetch(`${API_BASE}/fees/student/${regNo}`).then((r) => r.json()),
        fetch(`${API_BASE}/attendance/student/${regNo}`).then((r) => r.json()),
        fetch(`${API_BASE}/marks/student/${regNo}`).then((r) => r.json())
      ]);

      setFeeData(feeRes);
      setAttendanceData(attRes);
      setMarksData(marksRes);

      if (feeRes.fee && feeRes.fee.balance > 0) {
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

    const isUpi = activeTab === "qr-pay" || paymentMethod === "UPI";
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
          card_holder_name: isUpi ? user?.name || "Student" : cardData.cardHolder,
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
          student_name: user?.name || "Student",
          department: user?.department || "Computer Science Engineering"
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
  const attendancePct = attendanceData?.percentage !== undefined ? attendanceData.percentage : 90;
  const isAttendanceShortage = attendancePct < 75;

  return (
    <div className="portal-container">
      {/* PORTAL HEADER */}
      <div className="portal-header">
        <div>
          <span className="portal-pill student">STUDENT PORTAL</span>
          <h2>Welcome, {user?.name || "Student"}</h2>
          <p>Register No: <strong>{regNo}</strong> • {user?.department || "Engineering"} • SVCET Campus</p>
        </div>
        {fee && Number(fee.balance) > 0 && (
          <div className="portal-header-actions">
            <button className="btn-primary btn-qr-header-action" onClick={() => setActiveTab("qr-pay")}>
              📱 Instant Google Pay QR (Due: ₹{Number(fee.balance).toLocaleString("en-IN")})
            </button>
          </div>
        )}
      </div>

      {fee && Number(fee.balance) > 0 && (
        <div className="portal-quick-qr-alert">
          <div className="qr-alert-content">
            <span className="qr-alert-fire">⚡</span>
            <div>
              <strong>Instant Google Pay UPI Fee Payment Active:</strong>
              <p>Scan the verified QR code to clear your balance of <strong>₹{Number(fee.balance).toLocaleString("en-IN")}</strong> with instant clearance and official receipt.</p>
            </div>
          </div>
          <button className="btn-qr-alert-go" onClick={() => setActiveTab("qr-pay")}>
            Scan QR & Pay Now →
          </button>
        </div>
      )}

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
            <strong className={`stat-value ${isAttendanceShortage ? "text-red" : "text-green"}`}>
              {attendancePct}%
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div>
            <span className="stat-label">Academic Average / Grade</span>
            <strong className="stat-value text-blue">
              {marksData?.average_percentage || 86}% (Grade A+)
            </strong>
          </div>
        </div>

        <div className="stat-card primary">
          <div className="stat-icon">✅</div>
          <div>
            <span className="stat-label">Total Fee Paid</span>
            <strong className="stat-value text-green">
              ₹{Number(fee?.paid_amount || 0).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">💳</div>
          <div>
            <span className="stat-label">Balance Outstanding</span>
            <strong className={`stat-value ${Number(fee?.balance || 0) > 0 ? "text-red" : "text-green"}`}>
              ₹{Number(fee?.balance || 0).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="portal-tabs">
        <button
          className={activeTab === "qr-pay" ? "tab-btn active qr-tab-btn" : "tab-btn qr-tab-btn"}
          onClick={() => setActiveTab("qr-pay")}
        >
          ⚡ Scan Google Pay UPI QR to Pay
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

      {/* ================= TAB 0: INSTANT GOOGLE PAY UPI QR PAYMENT ================= */}
      {activeTab === "qr-pay" && (
        <div className="portal-card qr-main-console-card">
          <div className="card-top-title">
            <div>
              <span className="badge-paid">OFFICIAL GOOGLE PAY GATEWAY</span>
              <h3>Instant Student Fee Clearance via UPI QR</h3>
              <p className="sub-note">
                Scan using Google Pay, PhonePe, Paytm or BHIM. Enter your 12-digit UTR reference to verify and download your signed fee receipt instantly.
              </p>
            </div>
            {Number(fee?.balance || 0) <= 0 ? (
              <span className="badge-paid">✓ All Semester Dues Cleared</span>
            ) : (
              <span className="badge-due">Outstanding: ₹{Number(fee?.balance || 0).toLocaleString("en-IN")}</span>
            )}
          </div>

          <div className="qr-pay-split-layout">
            {/* LEFT: QR CODE & PAYEE DETAILS */}
            <div className="qr-code-showcase-box">
              <div className="qr-frame-wrapper">
                <img
                  src="/upi-qr.jpg"
                  alt="Google Pay UPI QR Code - Dhamanithi N S"
                  className="showcase-qr-img"
                />
                <div className="qr-live-pulse-badge">
                  <span className="pulse-dot-green"></span>
                  <strong>GPay • PhonePe • Paytm • BHIM</strong>
                </div>
              </div>

              <div className="qr-metadata-card">
                <div className="meta-item">
                  <span className="lbl">Verified Merchant / Payee:</span>
                  <strong className="val">{UPI_PAYEE_NAME}</strong>
                </div>
                <div className="meta-item">
                  <span className="lbl">Institutional UPI ID:</span>
                  <div className="copy-row">
                    <code>{UPI_ID}</code>
                    <button
                      type="button"
                      className="btn-copy-action"
                      onClick={handleCopyUpi}
                    >
                      {copiedUpi ? "✓ Copied!" : "📋 Copy ID"}
                    </button>
                  </div>
                </div>
                <a
                  href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${fee?.balance || 10000}&cu=INR&tn=SVCET_${regNo}`}
                  className="btn-open-upi-app"
                  target="_blank"
                  rel="noreferrer"
                >
                  🚀 Tap to Open UPI App on Mobile
                </a>
              </div>
            </div>

            {/* RIGHT: REAL-TIME LEDGER & UTR CONFIRMATION FORM */}
            <div className="qr-confirmation-box">
              <div className="student-summary-strip">
                <div className="strip-item">
                  <span>Student Name:</span>
                  <strong>{user?.name || "Student"}</strong>
                </div>
                <div className="strip-item">
                  <span>Register Number:</span>
                  <strong>{regNo}</strong>
                </div>
                <div className="strip-item">
                  <span>Department:</span>
                  <strong>{user?.department || "Computer Science"}</strong>
                </div>
                <div className="strip-item highlight-due">
                  <span>Net Outstanding Balance:</span>
                  <strong className={Number(fee?.balance || 0) > 0 ? "text-red" : "text-green"}>
                    ₹{Number(fee?.balance || 0).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <form onSubmit={handlePayOnline} className="inline-upi-payment-form">
                <h4>Confirm Your UPI Transaction</h4>
                <p className="form-helper">
                  1. Scan the QR code on the left with Google Pay or any UPI app.<br />
                  2. Transfer the fee amount.<br />
                  3. Enter the 12-digit UTR reference below to generate your official verified receipt.
                </p>

                <div className="form-group">
                  <label>Amount to Pay (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>12-Digit UPI Transaction ID / UTR Reference Number *</label>
                  <input
                    type="text"
                    maxLength="22"
                    placeholder="e.g. 427189218291 (found in your UPI payment receipt)"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    required
                  />
                  <small className="field-hint">
                    Check your GPay / PhonePe / Bank SMS notification for the 12-digit UPI Ref / UTR number.
                  </small>
                </div>

                <div className="form-action-row">
                  <button
                    type="submit"
                    className="btn-primary btn-lg btn-block"
                    disabled={processingPayment}
                  >
                    {processingPayment
                      ? "⏳ Verifying Payment with Bank..."
                      : `✓ Verify & Confirm Payment (₹${Number(paymentAmount || 0).toLocaleString("en-IN")}) →`}
                  </button>
                </div>

                <div className="secure-badge-note">
                  🔒 Instant clearance & verified institutional fee receipt with 1-click PDF download / print.
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 1: FEES & PAYMENT ================= */}
      {activeTab === "fees" && (
        <div className="portal-cards-row">
          {/* FEE BREAKDOWN CARD */}
          <div className="portal-card flex-2">
            <div className="card-top-title">
              <h3>Academic Year Institutional Fee Schedule</h3>
              {Number(fee?.balance || 0) <= 0 ? (
                <span className="badge-paid">All Dues Cleared</span>
              ) : (
                <span className="badge-due">Payment Due</span>
              )}
            </div>

            <div className="fee-breakdown-grid">
              <div className="fee-item">
                <span>Tuition & Laboratory Fee</span>
                <strong>₹{Number(fee?.tuition_fee || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="fee-item">
                <span>University Examination Fee</span>
                <strong>₹{Number(fee?.exam_fee || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="fee-item">
                <span>College Bus / Transport Fee</span>
                <strong>₹{Number(fee?.transport_fee || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="fee-item">
                <span>Hostel & Dining Charges</span>
                <strong>₹{Number(fee?.hostel_fee || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="fee-item">
                <span>Library, Sports & Special Amenities</span>
                <strong>₹{Number(fee?.other_fee || 0).toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <div className="fee-total-summary">
              <div className="summary-row">
                <span>Total Annual Institutional Fee:</span>
                <strong>₹{Number(fee?.total_fee || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="summary-row">
                <span>Amount Paid Till Date:</span>
                <strong className="text-green">₹{Number(fee?.paid_amount || 0).toLocaleString("en-IN")}</strong>
              </div>
              <div className="summary-row highlight">
                <span>Outstanding Dues / Net Payable:</span>
                <strong className={Number(fee?.balance || 0) > 0 ? "text-red" : "text-green"}>
                  ₹{Number(fee?.balance || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            {Number(fee?.balance || 0) > 0 ? (
              <div className="card-bottom-action">
                <button className="btn-primary btn-lg btn-block" onClick={() => setShowCheckout(true)}>
                  🔒 Pay Outstanding Fees Securely Online
                </button>
              </div>
            ) : (
              <div className="card-bottom-action">
                <p className="text-green font-semibold" style={{ textAlign: "center" }}>
                  🎉 All academic and institutional fees for the current semester have been cleared.
                </p>
              </div>
            )}
          </div>

          {/* PAYMENT HISTORY & RECEIPTS */}
          <div className="portal-card flex-1">
            <div className="card-top-title">
              <h3>Payment History</h3>
            </div>
            {transactions.length === 0 ? (
              <p className="empty-notice">No past payment transactions recorded.</p>
            ) : (
              <div className="payment-history-list">
                {transactions.map((t) => (
                  <div key={t.id || t.receipt_no} className="payment-history-card">
                    <div className="history-top">
                      <strong>{t.receipt_no}</strong>
                      <span className="badge-paid">Success</span>
                    </div>
                    <div className="history-details">
                      <div>
                        <span>Amount:</span> <strong>₹{Number(t.amount).toLocaleString("en-IN")}</strong>
                      </div>
                      <div>
                        <span>Mode:</span> {t.payment_method}
                      </div>
                      <div>
                        <span>Date:</span> <small>{t.paid_at}</small>
                      </div>
                    </div>
                    <button
                      className="btn-sm btn-outline"
                      onClick={() =>
                        setActiveReceipt({
                          ...t,
                          student_name: user?.name,
                          department: user?.department,
                          remaining_balance: fee?.balance
                        })
                      }
                    >
                      📄 View & Print Receipt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INSTANT UPI QR CARD */}
          <div className="portal-card upi-highlight-card">
            <div className="card-top-title">
              <h3>⚡ Fast Instant Student Fee Payment (Google Pay UPI QR)</h3>
              <span className="badge-paid">Zero Processing Fee</span>
            </div>
            <div className="upi-quick-body">
              <div className="upi-qr-wrapper">
                <img
                  src="/upi-qr.jpg"
                  alt="Student Fee Google Pay UPI QR Code"
                  className="student-upi-qr-img"
                />
                <div className="qr-scan-badge">Scan with GPay / PhonePe / Paytm</div>
              </div>
              <div className="upi-quick-info">
                <div className="upi-info-item">
                  <span className="upi-label">Payee Account:</span>
                  <strong className="upi-val">{UPI_PAYEE_NAME}</strong>
                </div>
                <div className="upi-info-item">
                  <span className="upi-label">Official College UPI ID:</span>
                  <div className="upi-id-pill">
                    <code>{UPI_ID}</code>
                    <button
                      type="button"
                      className="copy-upi-btn"
                      onClick={handleCopyUpi}
                    >
                      {copiedUpi ? "✓ Copied!" : "📋 Copy ID"}
                    </button>
                  </div>
                </div>
                <div className="upi-info-item">
                  <span className="upi-label">Student Reg No:</span>
                  <strong className="upi-val">{regNo} ({user?.name || "Student"})</strong>
                </div>
                <div className="upi-info-item">
                  <span className="upi-label">Current Outstanding Dues:</span>
                  <strong className="upi-val text-red">₹{Number(fee?.balance || 0).toLocaleString("en-IN")}</strong>
                </div>

                <div className="upi-action-btns">
                  <a
                    href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${fee?.balance || 10000}&cu=INR&tn=SVCET_Fee_${regNo}`}
                    className="btn-upi-intent"
                  >
                    📲 Open GPay / UPI App Directly
                  </a>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setPaymentMethod("UPI");
                      setShowCheckout(true);
                    }}
                  >
                    ✍️ Enter UTR / Verify Payment →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ACADEMIC MARKS ================= */}
      {activeTab === "marks" && (
        <div className="portal-card">
          <div className="card-top-title">
            <h3>Academic Marksheet & Continuous Assessment</h3>
            <span className="cgpa-pill">Average Score: {marksData?.average_percentage || 85}%</span>
          </div>

          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Course Title</th>
                  <th>Assessment Type</th>
                  <th>Marks Obtained</th>
                  <th>Max Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {!marksData?.records || marksData.records.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "24px" }}>
                      No examination marks published yet for your register number.
                    </td>
                  </tr>
                ) : (
                  marksData.records.map((m) => {
                    const score = Number(m.marks_obtained);
                    const max = Number(m.max_marks || 100);
                    const pct = Math.round((score / max) * 100);
                    const isPass = score >= 50;

                    return (
                      <tr key={m.id || m.subject_code + m.exam_type}>
                        <td><strong>{m.subject_code}</strong></td>
                        <td>{m.subject_name || "Engineering Course"}</td>
                        <td>{m.exam_type}</td>
                        <td><strong>{score}</strong></td>
                        <td>/ {max}</td>
                        <td>{pct}%</td>
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
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ATTENDANCE ================= */}
      {activeTab === "attendance" && (
        <div className="portal-card">
          <div className="card-top-title">
            <h3>Attendance Log & University Eligibility</h3>
            <span className={attendancePct >= 75 ? "badge-paid" : "badge-due"}>
              Eligibility: {attendancePct >= 75 ? "Eligible for Exams" : "Attendance Shortage (<75%)"}
            </span>
          </div>

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
              <strong className={attendancePct >= 75 ? "text-green" : "text-red"}>
                {attendancePct}%
              </strong>
            </div>
          </div>

          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject Code</th>
                  <th>Course Name</th>
                  <th>Status</th>
                  <th>Faculty Remarks</th>
                </tr>
              </thead>
              <tbody>
                {!attendanceData?.records || attendanceData.records.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "24px" }}>
                      No attendance entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  attendanceData.records.map((a) => (
                    <tr key={a.id || a.date + a.subject_code}>
                      <td><strong>{a.date}</strong></td>
                      <td>{a.subject_code}</td>
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
                          {a.status}
                        </span>
                      </td>
                      <td>{a.remarks || "Regular session"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                        alt="Google Pay UPI QR Code - Dhamanithi N S"
                        className="modal-upi-qr-img"
                      />
                      <span className="qr-badge-live">Official Google Pay QR</span>
                    </div>

                    <div className="upi-modal-details">
                      <div className="upi-detail-pill">
                        <span className="label">Verified Payee:</span>
                        <strong className="val">{UPI_PAYEE_NAME}</strong>
                      </div>
                      <div className="upi-detail-pill">
                        <span className="label">Official UPI ID:</span>
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
                        🚀 Open UPI App (GPay / PhonePe / Paytm)
                      </a>
                    </div>
                  </div>

                  <div className="form-group utr-field-box">
                    <label>Enter 12-Digit UPI Transaction Reference / UTR Number *</label>
                    <input
                      type="text"
                      maxLength="22"
                      placeholder="e.g. 427189218291 (from GPay / PhonePe receipt)"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      required
                    />
                    <small className="helper-note">
                      ℹ️ Once you complete the payment on your UPI app, paste the 12-digit UTR reference here to instantly generate your official computer-verified fee receipt.
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
                🔒 256-Bit SSL Encrypted Institutional Payment Gateway. Instant confirmation & receipt.
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
