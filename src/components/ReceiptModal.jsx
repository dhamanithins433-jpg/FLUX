import React from "react";

function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="receipt-modal printable-area">
        {/* RECEIPT HEADER */}
        <div className="receipt-header">
          <div className="receipt-logo-wrap">
            <img src="/college-logo.png" alt="SVCET Logo" className="receipt-logo" />
            <div>
              <h2>SRI VENKATESWARA</h2>
              <h3>COLLEGE OF ENGINEERING AND TECHNOLOGY</h3>
              <p className="receipt-sub">Approved by AICTE | Affiliated to Anna University | Autonomous Institution</p>
              <p className="receipt-address">Thirupachur, Thiruvallur, Tamil Nadu - 631203</p>
            </div>
          </div>
          <div className="receipt-badge-wrap">
            <span className="official-receipt-badge">OFFICIAL FEE RECEIPT</span>
            <span className="payment-status-pill success">PAID</span>
          </div>
        </div>

        <div className="receipt-divider"></div>

        {/* RECEIPT META */}
        <div className="receipt-meta-grid">
          <div>
            <span className="meta-label">Receipt Number:</span>
            <strong>{receipt.receipt_no}</strong>
          </div>
          <div>
            <span className="meta-label">Transaction ID:</span>
            <strong>{receipt.transaction_id}</strong>
          </div>
          <div>
            <span className="meta-label">Date & Time:</span>
            <strong>{receipt.paid_at || new Date().toLocaleString()}</strong>
          </div>
          <div>
            <span className="meta-label">Payment Mode:</span>
            <strong>{receipt.payment_method} ({receipt.payment_type?.toUpperCase() || "ONLINE"})</strong>
          </div>
        </div>

        {/* STUDENT INFO */}
        <div className="receipt-student-box">
          <h4>Student Particulars</h4>
          <div className="student-info-row">
            <div>
              <span className="meta-label">Register Number:</span>
              <strong>{receipt.register_no}</strong>
            </div>
            <div>
              <span className="meta-label">Student Name:</span>
              <strong>{receipt.student_name || receipt.name || "Student"}</strong>
            </div>
            <div>
              <span className="meta-label">Department:</span>
              <strong>{receipt.department || "Engineering & Technology"}</strong>
            </div>
            <div>
              <span className="meta-label">Processed By:</span>
              <strong>{receipt.collected_by || "Online Payment Gateway"}</strong>
            </div>
          </div>
        </div>

        {/* AMOUNT TABLE */}
        <table className="receipt-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Mode / Channel</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>College Institutional Fee Payment ({receipt.notes || "Tuition / Academic Fees"})</td>
              <td>{receipt.payment_method}</td>
              <td><span className="badge-paid">Success</span></td>
              <td style={{ textAlign: "right", fontWeight: "700" }}>
                ₹{Number(receipt.amount).toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
          <tfoot>
            {receipt.total_fee !== undefined && (
              <tr>
                <td colSpan="3" style={{ textAlign: "right" }}>Total Fee Assessed:</td>
                <td style={{ textAlign: "right" }}>₹{Number(receipt.total_fee).toLocaleString("en-IN")}</td>
              </tr>
            )}
            {receipt.paid_amount !== undefined && (
              <tr>
                <td colSpan="3" style={{ textAlign: "right" }}>Cumulative Amount Paid:</td>
                <td style={{ textAlign: "right" }}>₹{Number(receipt.paid_amount).toLocaleString("en-IN")}</td>
              </tr>
            )}
            {receipt.remaining_balance !== undefined && (
              <tr className="receipt-balance-row">
                <td colSpan="3" style={{ textAlign: "right", fontWeight: "700" }}>Remaining Balance Outstanding:</td>
                <td style={{ textAlign: "right", fontWeight: "700", color: receipt.remaining_balance > 0 ? "#dc2626" : "#16a34a" }}>
                  ₹{Number(receipt.remaining_balance).toLocaleString("en-IN")}
                </td>
              </tr>
            )}
            <tr className="receipt-total-row">
              <td colSpan="3" style={{ textAlign: "right", fontWeight: "800", fontSize: "1.1rem" }}>Amount Received in this Transaction:</td>
              <td style={{ textAlign: "right", fontWeight: "800", fontSize: "1.1rem", color: "#092b5c" }}>
                ₹{Number(receipt.amount).toLocaleString("en-IN")}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* SIGNATURE AND NOTICE */}
        <div className="receipt-footer-box">
          <div className="receipt-terms">
            <p>• This is a computer-generated institutional receipt valid for all university and academic verifications.</p>
            <p>• Fees once paid will be credited to the student's institutional ledger immediately.</p>
          </div>
          <div className="receipt-seal">
            <div className="seal-circle">
              <span>SVCET</span>
              <small>ACCOUNTS</small>
              <strong>VERIFIED</strong>
            </div>
            <p>Accounts Officer</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="modal-actions non-printable">
          <button className="btn-print" onClick={handlePrint}>
            🖨️ Print / Save as PDF
          </button>
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiptModal;
