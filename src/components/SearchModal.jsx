import React, { useState, useEffect, useRef } from "react";

export default function SearchModal({ isOpen, onClose, onSelectResult }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Search Knowledge Database
  const searchableIndex = [
    // Pages / Sections
    { title: "Home Page", category: "Navigation", target: "home", desc: "Institutional landing page, welcome overview, and quick links." },
    { title: "About Institution & Leadership", category: "About", target: "about", desc: "Vision, mission, core values, Chairman and Principal messages, Governing Council." },
    { title: "Academic Departments & Programmes", category: "Academics", target: "courses", desc: "Explore all 13 undergraduate and postgraduate engineering programs." },
    { title: "Admissions 2026 & TNEA 1116", category: "Admissions", target: "admissions", desc: "Admission process, eligibility criteria, scholarships, and online enquiry form." },
    { title: "Campus Life & Infrastructure", category: "Campus", target: "campus", desc: "Smart classrooms, central digital library, high-tech labs, hostels, and sports." },
    { title: "Placements & Career Training", category: "Placements", target: "placement", desc: "174+ offers, 42+ visiting recruiters, 4-year training module, and TPO contacts." },
    { title: "Student Services & Statutory Committees", category: "Support", target: "student-services", desc: "Anti-Ragging, Student Grievance (SGRC), ICC, Women's Empowerment, and Exam Cell." },
    { title: "IQAC & NAAC 'A+' Accreditation", category: "Quality", target: "iqac", desc: "Internal Quality Assurance Cell, NAAC 'A+' certificate, UGC autonomy, and RTI." },
    { title: "Campus Photo Gallery", category: "Gallery", target: "gallery", desc: "Visual tour of campus infrastructure, research labs, athletics, and cultural events." },
    { title: "Institutional Achievements & Patents", category: "Achievements", target: "achievements", desc: "NAAC A+, NBA Tier-1, 50+ research patents, and Smart India Hackathon honors." },
    { title: "Alumni Network & Registration", category: "Alumni", target: "alumni", desc: "6,500+ global alumni community, distinguished testimonials, and alumni form." },
    { title: "Contact Us & Campus Map", category: "Contact", target: "contact", desc: "044-27664444, principal@sriventech.ac.in, Thirupachur campus directions." },

    // Departments & Curricula
    { title: "Computer Science and Engineering (CSE)", category: "Curriculum", target: "cse-course", desc: "Curriculum Hub, R2021 CBCS, Autonomous R2025, Semester 1-8 syllabi & notes." },
    { title: "Information Technology (IT)", category: "Department", target: "courses", deptCode: "IT", desc: "Full-stack software engineering, web architectures, cloud and DevOps." },
    { title: "Artificial Intelligence & Data Science (AI&DS)", category: "Department", target: "courses", deptCode: "AIDS", desc: "Machine learning, neural networks, computer vision, and big data." },
    { title: "Electronics & Communication Engineering (ECE)", category: "Department", target: "courses", deptCode: "ECE", desc: "VLSI chip design, embedded microcontrollers, satellite communications." },
    { title: "Electrical & Electronics Engineering (EEE)", category: "Department", target: "courses", deptCode: "EEE", desc: "Smart electric grid, power electronics, renewable energy, and EV powertrains." },
    { title: "Mechanical Engineering (MECH)", category: "Department", target: "courses", deptCode: "MECH", desc: "Robotics, automation, mechatronics, CAD/CAM modeling, Industry 4.0." },
    { title: "Civil Engineering (CIVIL)", category: "Department", target: "courses", deptCode: "CIVIL", desc: "Smart infrastructure design, structural analysis, green building architecture." },
    { title: "Master of Business Administration (MBA)", category: "Department", target: "courses", deptCode: "MBA", desc: "Finance, Human Resources, Digital Marketing, and Operations." },
    { title: "Master of Computer Applications (MCA)", category: "Department", target: "courses", deptCode: "MCA", desc: "Advanced cloud applications, full stack mobile and enterprise development." },

    // Facilities & Services
    { title: "Central Digital Library (50,000+ Volumes)", category: "Facility", target: "campus", desc: "DELNET, IEEE e-journals, NPTEL multimedia terminals, reading halls." },
    { title: "Student Hostels & Hygienic Mess", category: "Facility", target: "campus", desc: "Separate boys and girls hostels, 24/7 security, Wi-Fi, nutritious dining." },
    { title: "College Transport Fleet (30+ Buses)", category: "Facility", target: "campus", desc: "Daily transport covering Chennai, Thiruvallur, Arakkonam, Kanchipuram." },
    { title: "Sports Complex & Athletic Stadium", category: "Facility", target: "campus", desc: "Cricket turf, football ground, 400m track, basketball, indoor gym." },
    { title: "Anti-Ragging Helpline (Toll-Free)", category: "Statutory", target: "student-services", desc: "1800-180-5522 zero-tolerance anti-ragging squad coverage." },
    { title: "Autonomous Controller of Examinations (CoE)", category: "Examination", target: "student-services", desc: "Internal assessments (IA-1, IA-2), end-semester exams, marksheet issuance." },
    { title: "First Graduate Fee Concession", category: "Scholarship", target: "admissions", desc: "Government of Tamil Nadu first generation graduate tuition waiver." },
    { title: "AICTE Mandatory Disclosure Document", category: "Compliance", target: "iqac", desc: "Official AICTE approval records and regulatory disclosures." }
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = query.trim() === ""
    ? searchableIndex.slice(0, 6)
    : searchableIndex.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-center pt-5 px-3"
      style={{
        backgroundColor: "rgba(12, 24, 48, 0.8)",
        backdropFilter: "blur(6px)",
        zIndex: 999999
      }}
      onClick={onClose}
    >
      <div
        className="card border-0 shadow-lg rounded-4 overflow-hidden w-100 bg-white"
        style={{ maxWidth: "680px", maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* SEARCH INPUT BAR */}
        <div className="p-3 border-bottom d-flex align-items-center gap-3 bg-light">
          <span className="fs-4 text-muted">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="form-control border-0 bg-transparent shadow-none fs-5"
            placeholder="Search departments, courses, admissions, facilities, documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
              onClick={() => setQuery("")}
            >
              Clear
            </button>
          )}
          <button
            className="btn btn-sm btn-light border rounded-pill px-3 fw-bold text-muted"
            onClick={onClose}
          >
            ESC
          </button>
        </div>

        {/* SEARCH RESULTS LIST */}
        <div className="p-3 overflow-auto" style={{ maxHeight: "60vh" }}>
          <div className="d-flex justify-content-between align-items-center mb-2 px-2">
            <small className="text-muted fw-bold text-uppercase">
              {query ? `Search Results (${results.length})` : "Recommended Quick Access"}
            </small>
            <small className="text-muted">Press result to navigate</small>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <span className="fs-1 d-block mb-2">🔎</span>
              <h6 className="fw-bold">No matching results found for "{query}"</h6>
              <small>Try searching for CSE, Admissions, Library, Placement, Fees, or Anti-Ragging.</small>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {results.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-3 border d-flex align-items-start justify-content-between gap-3 bg-white hover-search-item"
                  style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                  onClick={() => {
                    onSelectResult(item.target, item.deptCode);
                    onClose();
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5 small">
                        {item.category}
                      </span>
                      <h6 className="fw-bold text-dark mb-0">{item.title}</h6>
                    </div>
                    <small className="text-secondary" style={{ lineHeight: "1.5" }}>
                      {item.desc}
                    </small>
                  </div>
                  <span className="text-primary fw-bold fs-5 mt-1">→</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-2 border-top bg-light text-center small text-muted">
          Sri Venkateswara College of Engineering &amp; Technology • TNEA Code 1116
        </div>
      </div>
    </div>
  );
}
