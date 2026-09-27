import React from "react";

export default function IQACSection() {
  const complianceDocs = [
    {
      title: "AICTE Mandatory Disclosure",
      authority: "All India Council for Technical Education (AICTE)",
      validity: "Academic Year 2025 - 2026",
      status: "Compliant & Verified",
      icon: "📜"
    },
    {
      title: "NAAC 'A+' Grade Accreditation Certificate",
      authority: "National Assessment and Accreditation Council (NAAC)",
      validity: "Cycle-1 Accredited with 'A+' Grade",
      status: "Active Institutional Grade",
      icon: "🎖️"
    },
    {
      title: "UGC Autonomous Conferment Order",
      authority: "University Grants Commission (UGC) & Anna University",
      validity: "Autonomous Status Granted",
      status: "Autonomous Degree Granting",
      icon: "🏛️"
    },
    {
      title: "Anna University Permanent Affiliation Orders",
      authority: "Anna University, Chennai",
      validity: "All 13 UG & PG Engineering Programs",
      status: "Affiliated State University",
      icon: "🎓"
    },
    {
      title: "ISO 9001:2015 Quality Management System",
      authority: "International Organization for Standardization",
      validity: "Certified Quality Institutional Processes",
      status: "Certified",
      icon: "🌐"
    },
    {
      title: "Right to Information (RTI) Statutory Cell",
      authority: "Government of India RTI Act, 2005",
      validity: "Public Information Officer Designated",
      status: "Statutory Compliance",
      icon: "⚖️"
    }
  ];

  return (
    <section id="iqac" className="iqac-section py-4">
      <div className="container-fluid px-lg-4">
        {/* HEADER */}
        <div className="section-header text-center mb-4">
          <span className="section-tag text-uppercase fw-bold text-primary">Accreditation &amp; Quality Benchmark</span>
          <h2 className="display-6 fw-bold mt-2 text-dark">
            Internal Quality Assurance Cell (IQAC)
          </h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "800px" }}>
            Fostering continuous quality enhancement across teaching-learning, academic research, 
            governance, and institutional standards at SVCET.
          </p>
        </div>

        {/* TOP ACCREDITATION BADGES ROW */}
        <div className="row g-3 mb-4">
          <div className="col-lg-3 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white border-top border-4 border-primary h-100">
              <div className="fs-1 text-primary mb-1">🎖️</div>
              <h5 className="fw-bold text-dark mb-0">NAAC 'A+' Grade</h5>
              <small className="text-muted">High National Academic Distinction</small>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white border-top border-4 border-success h-100">
              <div className="fs-1 text-success mb-1">🏛️</div>
              <h5 className="fw-bold text-dark mb-0">UGC Autonomous</h5>
              <small className="text-muted">Curriculum &amp; Exam Autonomy</small>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white border-top border-4 border-info h-100">
              <div className="fs-1 text-info mb-1">🌐</div>
              <h5 className="fw-bold text-dark mb-0">NBA Tier-1</h5>
              <small className="text-muted">Washington Accord Global Recognition</small>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white border-top border-4 border-warning h-100">
              <div className="fs-1 text-warning mb-1">📜</div>
              <h5 className="fw-bold text-dark mb-0">AICTE &amp; AU</h5>
              <small className="text-muted">Govt. of India Approved</small>
            </div>
          </div>
        </div>

        {/* IQAC OBJECTIVES & QUALITY POLICY */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
              <h4 className="fw-bold text-dark mb-3">IQAC Core Objectives</h4>
              <p className="text-secondary small" style={{ lineHeight: "1.7" }}>
                Established in accordance with National Assessment and Accreditation Council guidelines, 
                the IQAC acts as a catalyst for systematic institutional introspection, continuous pedagogical improvement, 
                and outcome-based education (OBE).
              </p>
              <div className="d-flex flex-column gap-2 mt-2">
                {[
                  "Systematic development and application of quality benchmarks in curriculum delivery.",
                  "Facilitating the creation of a learner-centric environment conducive to high-quality education.",
                  "Arranging for feedback responses from students, parents, and alumni on quality-related institutional processes.",
                  "Organization of inter and intra-institutional workshops, faculty development seminars, and research symposiums.",
                  "Documentation of all academic programs, research grants, and extension activities leading to quality improvement."
                ].map((obj, idx) => (
                  <div key={idx} className="d-flex align-items-start gap-2 p-2 bg-light rounded-2 border">
                    <span className="badge bg-primary rounded-circle">{idx + 1}</span>
                    <small className="text-dark fw-medium">{obj}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
              <h4 className="fw-bold text-dark mb-3">Institutional Quality Policy</h4>
              <blockquote className="blockquote text-primary fst-italic p-3 bg-light rounded-3 border-start border-4 border-primary">
                "SVCET is committed to imparting world-class technical education through learner-centric 
                teaching methodologies, continuous enhancement of faculty competence, state-of-the-art laboratory 
                infrastructure, and active industry-institute partnerships."
              </blockquote>

              <h6 className="fw-bold text-dark mt-3 mb-2">Key Quality Initiatives:</h6>
              <div className="row g-2">
                {[
                  { title: "Bloom's Taxonomy", desc: "Outcome-Based Education (OBE) course outcome mapping." },
                  { title: "Faculty Up-skilling", desc: "Mandatory NPTEL certifications and research journal publications." },
                  { title: "Academic Audit", desc: "Comprehensive semester-wise internal and external academic peer reviews." },
                  { title: "Student Mentorship", desc: "1:15 faculty-student counseling ratio for personalized academic guidance." }
                ].map((init, i) => (
                  <div key={i} className="col-sm-6">
                    <div className="p-2 border rounded-2 bg-light h-100">
                      <div className="fw-bold text-dark small">{init.title}</div>
                      <small className="text-muted">{init.desc}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COMPLIANCE & STATUTORY DISCLOSURES */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mt-4 bg-light">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <h4 className="fw-bold text-dark mb-1">Statutory Approvals &amp; Compliance Documents</h4>
              <small className="text-muted">Verified official compliance orders from statutory regulatory bodies.</small>
            </div>
            <span className="badge bg-primary px-3 py-2 rounded-pill">Verified Institutional Records</span>
          </div>

          <div className="row g-3">
            {complianceDocs.map((doc, idx) => (
              <div key={idx} className="col-lg-4 col-md-6">
                <div className="p-3 bg-white border rounded-3 h-100 d-flex flex-column justify-content-between shadow-xs">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="fs-3">{doc.icon}</span>
                      <h6 className="fw-bold text-dark mb-0">{doc.title}</h6>
                    </div>
                    <small className="text-muted d-block mb-1">{doc.authority}</small>
                    <span className="badge bg-light text-primary border mb-2">{doc.validity}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
                    <small className="text-success fw-bold">✓ {doc.status}</small>
                    <button
                      className="btn btn-sm btn-outline-primary fw-semibold"
                      onClick={() => alert(`Viewing verified institutional document: ${doc.title}`)}
                    >
                      View Document ↗
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
