import React, { useState } from "react";

export default function AdmissionsSection({ onNavigate }) {
  const [formData, setFormData] = useState({
    candidateName: "",
    phone: "",
    email: "",
    programme: "B.E. Computer Science and Engineering",
    qualification: "HSC (+2) Academic",
    marksPercentage: "",
    city: "",
    message: ""
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const programmesList = [
    "B.E. Computer Science and Engineering (CSE)",
    "B.Tech. Artificial Intelligence & Data Science (AI&DS)",
    "B.Tech. Information Technology (IT)",
    "B.E. AI & Machine Learning / CSBS",
    "B.E. Cyber Security",
    "B.E. Electronics & Communication Engineering (ECE)",
    "B.E. Electrical & Electronics Engineering (EEE)",
    "B.E. Mechanical Engineering (MECH)",
    "B.E. Civil Engineering (CIVIL)",
    "M.E. Computer Science and Engineering",
    "M.E. Power Electronics & Drives",
    "M.E. VLSI Design",
    "Master of Business Administration (MBA)",
    "Master of Computer Applications (MCA)"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.candidateName.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setFormError("Please fill in all mandatory fields (Name, Phone number, and Email).");
      return;
    }

    if (formData.phone.replace(/\D/g, "").length < 10) {
      setFormError("Please provide a valid 10-digit mobile contact number.");
      return;
    }

    setIsSubmitting(true);
    // Simulate real submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 800);
  };

  return (
    <section id="admissions" className="admissions-section py-4">
      <div className="container-fluid px-lg-4">
        {/* HEADER */}
        <div className="section-header text-center mb-4">
          <span className="section-tag text-uppercase fw-bold text-primary">Admissions 2026 - 2027</span>
          <h2 className="display-6 fw-bold mt-2 text-dark">
            Begin Your Engineering Journey at SVCET
          </h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "800px" }}>
            TNEA Counselling Code: <strong className="text-primary fs-5">1116</strong> • AICTE Approved • 
            Anna University Affiliated • Autonomous Institution
          </p>
        </div>

        {/* TOP COUNSELLING & ELIGIBILITY BADGES */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="p-3 rounded-4 bg-primary text-white h-100 shadow-sm d-flex align-items-center gap-3">
              <div className="fs-1 bg-white bg-opacity-25 p-3 rounded-circle">🏛️</div>
              <div>
                <small className="text-white-50 text-uppercase fw-bold">Anna University TNEA Code</small>
                <h3 className="fw-bold mb-0">1116</h3>
                <small className="text-white-50">Select SVCET in Tamil Nadu Single Window Counselling</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 rounded-4 bg-success text-white h-100 shadow-sm d-flex align-items-center gap-3">
              <div className="fs-1 bg-white bg-opacity-25 p-3 rounded-circle">🎓</div>
              <div>
                <small className="text-white-50 text-uppercase fw-bold">Govt. First Graduate Scheme</small>
                <h3 className="fw-bold mb-0">Fee Concession</h3>
                <small className="text-white-50">Eligible for Tamil Nadu Govt. First Graduate Tuition Waiver</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 rounded-4 bg-dark text-white h-100 shadow-sm d-flex align-items-center gap-3">
              <div className="fs-1 bg-white bg-opacity-25 p-3 rounded-circle">📞</div>
              <div>
                <small className="text-white-50 text-uppercase fw-bold">Admission Help Desk</small>
                <h4 className="fw-bold mb-0">044-27664444</h4>
                <small className="text-white-50">+91 9176745678 / +91 8200740862</small>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN ADMISSIONS CONTENT GRID */}
        <div className="row g-4">
          {/* LEFT: ELIGIBILITY & SCHOLARSHIPS */}
          <div className="col-lg-7">
            {/* ELIGIBILITY CRITERIA */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h4 className="fw-bold text-dark mb-3">Eligibility Criteria</h4>

              <div className="accordion" id="eligibilityAccordion">
                {/* UG ADMISSION */}
                <div className="border rounded-3 mb-2 p-3 bg-light">
                  <h6 className="fw-bold text-primary mb-2">1. B.E. / B.Tech. Programmes (4 Years)</h6>
                  <ul className="mb-0 text-secondary small" style={{ lineHeight: "1.7" }}>
                    <li>
                      <strong>HSC / +2 Candidates:</strong> Minimum average marks in Mathematics, Physics, and Chemistry:
                      General Category: 45% | BC/BCM: 40% | MBC/DNC: 40% | SC/SCA/ST: 40%.
                    </li>
                    <li>
                      <strong>Lateral Entry (Direct 2nd Year):</strong> Passed Diploma in Engineering &amp; Technology or B.Sc. with Mathematics as a subject with at least 45% marks (40% for reserved categories).
                    </li>
                  </ul>
                </div>

                {/* PG ADMISSION */}
                <div className="border rounded-3 mb-2 p-3 bg-light">
                  <h6 className="fw-bold text-primary mb-2">2. Postgraduate Programmes (M.E. / MBA / MCA - 2 Years)</h6>
                  <ul className="mb-0 text-secondary small" style={{ lineHeight: "1.7" }}>
                    <li>
                      <strong>M.E. Programmes:</strong> Relevant B.E. / B.Tech. degree with TANCET / GATE score or consortium quota.
                    </li>
                    <li>
                      <strong>MBA:</strong> Any recognized undergraduate bachelor degree (10+2+3/4 pattern) with at least 50% marks (45% for reserved category).
                    </li>
                    <li>
                      <strong>MCA:</strong> BCA / B.Sc. in Computer Science or Mathematics with at least 50% marks (45% for reserved category).
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* SCHOLARSHIPS & FINANCIAL ASSISTANCE */}
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h4 className="fw-bold text-dark mb-2">Scholarships &amp; Fee Concessions</h4>
              <p className="text-muted small mb-3">
                SVCET facilitates all Tamil Nadu and Central Government scholarships along with institutional merit awards.
              </p>

              <div className="row g-3">
                {[
                  {
                    title: "First Graduate Scholarship",
                    desc: "Tuition fee waiver granted by Government of Tamil Nadu for eligible first-generation graduates."
                  },
                  {
                    title: "BC / MBC / DNC Welfare Scholarship",
                    desc: "State Government post-matric financial grants for eligible community students."
                  },
                  {
                    title: "SC / ST / SCA Post-Matric Scholarship",
                    desc: "Full tuition fee and special fees assistance under Adi Dravidar and Tribal Welfare Dept."
                  },
                  {
                    title: "SVCET Merit & Sports Scholarships",
                    desc: "Special fee discounts for district/state sports achievers and high HSC cut-off scorers."
                  }
                ].map((sch, i) => (
                  <div key={i} className="col-sm-6">
                    <div className="p-3 border rounded-3 bg-white h-100">
                      <div className="fw-bold text-dark small mb-1">{sch.title}</div>
                      <div className="text-muted small">{sch.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE ADMISSION ENQUIRY FORM */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-top border-4 border-primary">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="fs-3">📝</span>
                <h4 className="fw-bold text-dark mb-0">Admission Enquiry Form</h4>
              </div>
              <p className="text-muted small mb-3">
                Submit your details and our admission counseling officers will connect with you immediately.
              </p>

              {formSubmitted ? (
                <div className="alert alert-success rounded-4 p-4 text-center my-3">
                  <div className="fs-1 mb-2">✅</div>
                  <h5 className="fw-bold text-success">Enquiry Received Successfully!</h5>
                  <p className="small text-secondary mb-3">
                    Thank you, <strong>{formData.candidateName}</strong>. Our Admissions Counselor will contact 
                    you shortly at <strong>{formData.phone}</strong> with programme details and fee structures.
                  </p>
                  <button
                    className="btn btn-sm btn-outline-success rounded-pill px-4"
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({
                        candidateName: "",
                        phone: "",
                        email: "",
                        programme: "B.E. Computer Science and Engineering",
                        qualification: "HSC (+2) Academic",
                        marksPercentage: "",
                        city: "",
                        message: ""
                      });
                    }}
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit}>
                  {formError && (
                    <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
                      {formError}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Candidate Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="candidateName"
                      placeholder="e.g. Arun Kumar S"
                      value={formData.candidateName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Mobile Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="e.g. arun@gmail.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Programme Interested <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="programme"
                      value={formData.programme}
                      onChange={handleInputChange}
                    >
                      {programmesList.map((p, idx) => (
                        <option key={idx} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Current Qualification
                      </label>
                      <select
                        className="form-select"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                      >
                        <option value="HSC (+2) Academic">HSC (+2) Academic</option>
                        <option value="HSC (+2) Vocational">HSC (+2) Vocational</option>
                        <option value="Diploma Engineering">Diploma Engineering (Lateral)</option>
                        <option value="UG Degree Graduate">UG Degree Graduate (For PG)</option>
                      </select>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Marks / Cut-Off %
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="marksPercentage"
                        placeholder="e.g. 85% or 172 Cut-off"
                        value={formData.marksPercentage}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      City / District
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      placeholder="e.g. Thiruvallur / Chennai / Kanchipuram"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Admission Enquiry →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
