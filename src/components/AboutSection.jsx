import React, { useState } from "react";

export default function AboutSection({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section id="about" className="about-section py-4">
      <div className="container-fluid px-lg-4">
        {/* SECTION HEADER */}
        <div className="section-header text-center mb-4">
          <span className="section-tag text-uppercase fw-bold text-primary">About Our Institution</span>
          <h2 className="display-6 fw-bold mt-2 text-dark">
            Sri Venkateswara College of Engineering &amp; Technology
          </h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "800px" }}>
            An Autonomous Institution Approved by AICTE, Affiliated to Anna University, Chennai, 
            and Accredited with Premier NAAC 'A+' Grade &amp; NBA Tier-1.
          </p>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
          {[
            { id: "overview", label: "Overview & Legacy", icon: "🏛️" },
            { id: "vision", label: "Vision & Mission", icon: "🎯" },
            { id: "leadership", label: "Leadership & Administration", icon: "👥" },
            { id: "governing", label: "Governing Council", icon: "⚖️" }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`btn btn-sm px-4 py-2 rounded-pill fw-semibold ${
                activeTab === tab.id ? "btn-primary shadow-sm" : "btn-outline-secondary"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="me-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="pe-lg-3">
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill mb-3">
                  ESTABLISHED EXCELLENCE
                </span>
                <h3 className="fw-bold text-dark mb-3">
                  Pioneering Technical Education under Sri Venkateswara Educational &amp; Cultural Trust
                </h3>
                <p className="text-secondary" style={{ lineHeight: "1.7" }}>
                  Sri Venkateswara College of Engineering and Technology (SVCET), located at Thirupachur, 
                  Thiruvallur, was established with a singular noble vision: to deliver world-class engineering, 
                  technological, and management education to students from diverse socio-economic backgrounds.
                </p>
                <p className="text-secondary" style={{ lineHeight: "1.7" }}>
                  Conferred with prestigious <strong>Autonomous status by the UGC and Anna University</strong>, 
                  and recognized with <strong>NAAC 'A+' Grade Accreditation</strong>, the college fosters an 
                  ecosystem combining rigorous academic curriculum, modern industry partnerships, cutting-edge 
                  laboratories, and student-centered holistic development.
                </p>

                <div className="row g-3 mt-2">
                  <div className="col-sm-6">
                    <div className="p-3 border rounded-3 bg-light">
                      <h4 className="fw-bold text-primary mb-1">TNEA 1116</h4>
                      <small className="text-muted">Anna University Counselling Code</small>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 border rounded-3 bg-light">
                      <h4 className="fw-bold text-success mb-1">NAAC 'A+'</h4>
                      <small className="text-muted">Premier National Grade</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="position-relative rounded-4 overflow-hidden shadow-lg border">
                <img
                  src="/campus-library.jpg"
                  alt="SVCET Campus Architecture"
                  className="img-fluid w-100 object-fit-cover"
                  style={{ minHeight: "360px", maxHeight: "420px" }}
                />
                <div
                  className="position-absolute bottom-0 start-0 end-0 p-3 text-white"
                  style={{ background: "linear-gradient(transparent, rgba(12, 35, 64, 0.9))" }}
                >
                  <h5 className="fw-bold mb-0">Thirupachur Campus, Thiruvallur</h5>
                  <small className="opacity-75">Sprawling 25+ Acre Green Smart Campus</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VISION & MISSION */}
        {activeTab === "vision" && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-light">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="fs-1 bg-white p-3 rounded-circle shadow-sm">🔭</div>
                  <div>
                    <span className="badge bg-primary text-white rounded-pill px-3 py-1">OUR ASPIRATION</span>
                    <h3 className="fw-bold text-dark mt-1 mb-0">Institutional Vision</h3>
                  </div>
                </div>
                <blockquote className="blockquote text-primary fst-italic p-3 bg-white rounded-3 border-start border-4 border-primary">
                  "Lead the transformation of engineering and technology education into creating innovators 
                  and entrepreneurs to serve the betterment of the society."
                </blockquote>
                <p className="text-secondary small mt-3">
                  SVCET continuously shapes curricula aligned with Industry 4.0, Artificial Intelligence, 
                  and sustainable global engineering requirements to empower graduates with lifelong problem-solving abilities.
                </p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-light">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="fs-1 bg-white p-3 rounded-circle shadow-sm">🎯</div>
                  <div>
                    <span className="badge bg-success text-white rounded-pill px-3 py-1">OUR COMMITMENT</span>
                    <h3 className="fw-bold text-dark mt-1 mb-0">Institutional Mission</h3>
                  </div>
                </div>
                <div className="d-flex flex-column gap-2">
                  {[
                    "To provide requisite infrastructure and a stimulating environment for the most conducive learning.",
                    "To develop the next generation of leaders through excellence in teaching and learning, inspiring scientific curiosity to meet global challenges.",
                    "To instill ethics, values, and life skills to meet societal demands with social responsibility.",
                    "To produce competent professionals with practical engineering skills necessary to excel as innovative professionals and entrepreneurs.",
                    "To establish fruitful collaboration between the institute and industry in emerging disciplines for research and employment."
                  ].map((m, idx) => (
                    <div key={idx} className="d-flex align-items-start gap-2 p-2 bg-white rounded-2 border">
                      <span className="badge bg-primary rounded-circle">{idx + 1}</span>
                      <small className="text-dark fw-medium">{m}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CORE VALUES */}
            <div className="col-12 mt-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                <h4 className="fw-bold text-dark mb-3">Core Institutional Values</h4>
                <div className="row g-3">
                  {[
                    { title: "Academic Integrity", desc: "Honesty and transparency in pedagogy, examination, and research.", icon: "💎" },
                    { title: "Innovation & Curiosity", desc: "Encouraging original thinking, patents, and entrepreneurial ventures.", icon: "💡" },
                    { title: "Social Responsibility", desc: "Dedication to environmental sustainability, community service, and nation building.", icon: "🌱" },
                    { title: "Inclusivity & Diversity", desc: "Equal educational opportunity empowering every rural and urban talent.", icon: "🤝" }
                  ].map((val, i) => (
                    <div key={i} className="col-md-3 col-sm-6">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <div className="fs-2 mb-2">{val.icon}</div>
                        <h6 className="fw-bold text-dark">{val.title}</h6>
                        <small className="text-muted">{val.desc}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LEADERSHIP & ADMINISTRATION */}
        {activeTab === "leadership" && (
          <div className="row g-4">
            {[
              {
                role: "CHAIRMAN",
                name: "Dr. R. Venkataswamy",
                qual: "Chairman, Sri Venkateswara Educational & Cultural Trust",
                message:
                  "Our vision is to empower young minds with knowledge, character, and professional competence. We provide an environment where every student discovers their boundless potential to excel globally.",
                icon: "🏛️"
              },
              {
                role: "MANAGING TRUSTEE / SECRETARY",
                name: "Sri R.V. Srinivas",
                qual: "Vice Chairman & Managing Trustee",
                message:
                  "At SVCET, we invest consistently in modern laboratory infrastructure, faculty excellence, and student amenities to ensure transformative academic experiences.",
                icon: "📜"
              },
              {
                role: "PRINCIPAL",
                name: "Dr. S. Devi / Dr. S. Palani",
                qual: "M.E., Ph.D. - Principal",
                message:
                  "Welcome to SVCET. With academic autonomy and Anna University affiliation, we bridge classroom fundamentals with real-world industry application, nurturing successful engineers and leaders.",
                icon: "🎓"
              }
            ].map((lead, i) => (
              <div key={i} className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-white border-top border-4 border-primary">
                  <div className="mx-auto fs-1 bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "70px", height: "70px" }}>
                    {lead.icon}
                  </div>
                  <span className="badge bg-primary text-white rounded-pill px-3 py-1 mb-2 align-self-center">
                    {lead.role}
                  </span>
                  <h5 className="fw-bold text-dark mb-1">{lead.name}</h5>
                  <p className="small text-muted mb-3">{lead.qual}</p>
                  <p className="text-secondary small fst-italic" style={{ lineHeight: "1.6" }}>
                    "{lead.message}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: GOVERNING COUNCIL */}
        {activeTab === "governing" && (
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h4 className="fw-bold text-dark mb-2">Governing Council &amp; Academic Hierarchy</h4>
            <p className="text-muted small mb-4">
              The Governing Council functions under UGC Autonomous Guidelines to direct academic policies, 
              budgetary allocations, and strategic institutional growth.
            </p>

            <div className="table-responsive">
              <table className="table table-hover align-middle border">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: "80px" }}>S.No</th>
                    <th scope="col">Designation / Role in Council</th>
                    <th scope="col">Representative Category</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="fw-bold">01</td>
                    <td className="fw-bold text-primary">Chairman of the Trust</td>
                    <td>Management Representative (Trustee)</td>
                    <td><span className="badge bg-success">Active Member</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold">02</td>
                    <td className="fw-bold text-primary">Managing Trustee &amp; Vice-Chairman</td>
                    <td>Management Representative</td>
                    <td><span className="badge bg-success">Active Member</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold">03</td>
                    <td className="fw-bold">Principal of the College</td>
                    <td>Ex-Officio Member Secretary</td>
                    <td><span className="badge bg-success">Active Member</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold">04</td>
                    <td className="fw-bold">University Nominee</td>
                    <td>Anna University, Chennai Academician</td>
                    <td><span className="badge bg-primary">State Nominee</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold">05</td>
                    <td className="fw-bold">State Government Nominee</td>
                    <td>Directorate of Technical Education (DOTE)</td>
                    <td><span className="badge bg-primary">State Nominee</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold">06</td>
                    <td className="fw-bold">UGC Nominee</td>
                    <td>University Grants Commission Educationalist</td>
                    <td><span className="badge bg-info text-dark">Central Nominee</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold">07</td>
                    <td className="fw-bold">Senior Faculty Representatives (HODs)</td>
                    <td>Internal Academic Stakeholders</td>
                    <td><span className="badge bg-success">Active Members</span></td>
                  </tr>
                  <tr>
                    <td className="fw-bold">08</td>
                    <td className="fw-bold">Distinguished Industry Leader</td>
                    <td>Corporate / Industrial Collaboration</td>
                    <td><span className="badge bg-secondary">Industry Expert</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
