import React, { useState } from "react";

export default function StudentServicesSection() {
  const [selectedCommittee, setSelectedCommittee] = useState("antiragging");

  const committees = [
    {
      id: "antiragging",
      name: "Anti-Ragging Committee & Squad",
      icon: "🛑",
      badge: "ZERO TOLERANCE",
      desc: "Constituted as per AICTE and UGC regulations to ensure a 100% ragging-free campus with active flying squads and immediate grievance redressal.",
      helpline: "National Anti-Ragging Toll Free: 1800-180-5522 | SVCET Squad: 044-27664444",
      points: [
        "Rigorous 24/7 surveillance across campus, hostels, canteen, and bus transit points.",
        "Undertaking mandatory affidavits from every student and parent at the time of admission.",
        "Zero tolerance policy: Immediate suspension and formal FIR registration for any violations.",
        "Anti-ragging squad conducting surprise inspections in residential hostels."
      ]
    },
    {
      id: "sgrc",
      name: "Student Grievance Redressal Committee (SGRC)",
      icon: "⚖️",
      badge: "STUDENT WELFARE",
      desc: "Transparent forum providing students with fair opportunities to register academic, administrative, or facility grievances for prompt and impartial resolution.",
      helpline: "Online Portal & Confidential Drop Boxes at Administrative Block",
      points: [
        "Regular periodic review meetings chaired by the Principal and Senior Faculty.",
        "Confidential handling of sensitive academic and personal concerns.",
        "Structured escalation mechanism ensuring resolution within 7 working days.",
        "Student representation to voice student community feedback and recommendations."
      ]
    },
    {
      id: "icc",
      name: "Internal Complaints Committee (ICC)",
      icon: "🛡️",
      badge: "SAFETY & DIGNITY",
      desc: "Formed under the Sexual Harassment of Women at Workplace (Prevention, Prohibition & Redressal) Act, 2013, ensuring a safe, respectful environment for all women students and staff.",
      helpline: "icc@sriventech.ac.in | Women Helpline: 1091",
      points: [
        "Promoting gender equality, respect, and zero tolerance for harassment.",
        "Strict confidentiality during inquiry and resolution processes.",
        "Regular awareness workshops and legal literacy seminars for all students.",
        "External NGO / Legal advocate presence to guarantee unbiased proceedings."
      ]
    },
    {
      id: "wec",
      name: "Women's Empowerment Cell (WEC)",
      icon: "🌸",
      badge: "LEADERSHIP & EMPOWERMENT",
      desc: "Dedicated to the holistic advancement, professional leadership, mental wellness, and self-defense skills of female engineering scholars.",
      helpline: "wec@sriventech.ac.in",
      points: [
        "Celebration of International Women's Day and distinguished women engineer colloquiums.",
        "Specialized health and wellness camps, yoga sessions, and personal counseling.",
        "Skill enhancement workshops in coding, entrepreneurship, and public speaking.",
        "Mentorship pairing female students with leading women industry alumni."
      ]
    },
    {
      id: "scst",
      name: "SC / ST Welfare Committee",
      icon: "🤝",
      badge: "EQUITY & INCLUSION",
      desc: "Ensures effective implementation of welfare schemes, scholarships, remedial academic assistance, and safeguards for students from Scheduled Castes and Scheduled Tribes.",
      helpline: "Special Welfare Cell, Ground Floor, Admin Block",
      points: [
        "Facilitating 100% disbursement of Government Post-Matric scholarships.",
        "Special remedial coaching classes and soft skills training programs.",
        "Monitoring non-discrimination policies across academic and extracurricular activities.",
        "Guidance for higher studies (GATE, GRE, CAT) and civil services examinations."
      ]
    },
    {
      id: "exam",
      name: "Autonomous Examination Cell (CoE)",
      icon: "📝",
      badge: "ACADEMIC AUTONOMY",
      desc: "Headed by the Controller of Examinations, managing continuous internal assessments, end-semester evaluations, question bank audits, and marksheet issuance under Anna University CBCS.",
      helpline: "coe@sriventech.ac.in | 044-27664444 (Ext: 105)",
      points: [
        "Autonomous evaluation system adhering strictly to Anna University standards.",
        "Digital marksheet publishing, tamper-proof certificates, and secure transcript issuance.",
        "Conduct of Internal Assessments (IA-1, IA-2) and practical model laboratory exams.",
        "Dedicated photocopy and revaluation grievance redressal mechanism."
      ]
    }
  ];

  const studentDownloads = [
    { title: "Bonafide Certificate Requisition Form", type: "PDF", size: "145 KB", category: "Academic" },
    { title: "Hostel Admission & Leave Permission Application", type: "PDF", size: "180 KB", category: "Hostel" },
    { title: "Anti-Ragging Mandatory Student Affidavit Form", type: "PDF", size: "210 KB", category: "Compliance" },
    { title: "Course Withdrawal / Revaluation Application Form", type: "PDF", size: "160 KB", category: "Examination" },
    { title: "College Bus Transport Pass Requisition Form", type: "PDF", size: "125 KB", category: "Transport" },
    { title: "No Due / Clearance Certificate for Final Year", type: "PDF", size: "135 KB", category: "General" }
  ];

  return (
    <section id="student-services" className="student-services-section py-4">
      <div className="container-fluid px-lg-4">
        {/* HEADER */}
        <div className="section-header text-center mb-4">
          <span className="section-tag text-uppercase fw-bold text-primary">Student Support &amp; Governance</span>
          <h2 className="display-6 fw-bold mt-2 text-dark">
            Statutory Committees &amp; Student Services
          </h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "800px" }}>
            Ensuring a safe, equitable, transparent, and empowering campus life in strict compliance 
            with AICTE, UGC, and Anna University regulations.
          </p>
        </div>

        {/* COMMITTEE TABS */}
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-2">
              {committees.map((comm) => (
                <button
                  key={comm.id}
                  className={`btn text-start p-3 rounded-3 border d-flex align-items-center gap-3 transition-all ${
                    selectedCommittee === comm.id
                      ? "btn-primary shadow-sm text-white border-primary"
                      : "btn-light bg-white text-dark"
                  }`}
                  onClick={() => setSelectedCommittee(comm.id)}
                >
                  <span className="fs-3">{comm.icon}</span>
                  <div>
                    <h6 className="mb-0 fw-bold">{comm.name}</h6>
                    <small className={selectedCommittee === comm.id ? "text-white-50" : "text-muted"}>
                      {comm.badge}
                    </small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE COMMITTEE DETAIL */}
          <div className="col-lg-8">
            {committees.map((comm) => {
              if (comm.id !== selectedCommittee) return null;
              return (
                <div key={comm.id} className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 border-start border-4 border-primary">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-2">{comm.icon}</span>
                      <h4 className="fw-bold text-dark mb-0">{comm.name}</h4>
                    </div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                      {comm.badge}
                    </span>
                  </div>

                  <p className="text-secondary" style={{ lineHeight: "1.7" }}>
                    {comm.desc}
                  </p>

                  <div className="alert alert-light border rounded-3 p-3 my-3">
                    <span className="fw-bold text-dark d-block mb-1">Emergency / Contact Helpline:</span>
                    <span className="text-primary fw-semibold">{comm.helpline}</span>
                  </div>

                  <h6 className="fw-bold text-dark mt-2 mb-2">Key Responsibilities &amp; Safeguards:</h6>
                  <ul className="list-unstyled mb-0">
                    {comm.points.map((pt, idx) => (
                      <li key={idx} className="small text-secondary d-flex align-items-start gap-2 mb-2">
                        <span className="text-primary fw-bold">✓</span>
                        <span style={{ lineHeight: "1.6" }}>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* DOWNLOADABLE FORMS & STUDENT RESOURCES */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mt-4 bg-light">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <h4 className="fw-bold text-dark mb-1">Downloadable Forms &amp; Student Resources</h4>
              <small className="text-muted">Access official requisition forms and application templates directly.</small>
            </div>
            <span className="badge bg-secondary px-3 py-2 rounded-pill">Official Documents</span>
          </div>

          <div className="row g-3">
            {studentDownloads.map((doc, idx) => (
              <div key={idx} className="col-md-4 col-sm-6">
                <div className="p-3 bg-white border rounded-3 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <span className="badge bg-light text-primary border mb-2">{doc.category}</span>
                    <h6 className="fw-bold text-dark small mb-1">{doc.title}</h6>
                    <small className="text-muted">{doc.type} • {doc.size}</small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-primary mt-3 w-100 fw-semibold"
                    onClick={() => {
                      alert(`Downloading ${doc.title}... Verified SVCET academic form template.`);
                    }}
                  >
                    Download Document 📥
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
