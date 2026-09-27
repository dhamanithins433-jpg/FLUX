import React, { useState } from "react";

export default function AlumniSection() {
  const [formData, setFormData] = useState({
    name: "",
    batch: "2020-2024",
    department: "Computer Science Engineering",
    currentCompany: "",
    designation: "",
    email: "",
    phone: "",
    city: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill in Name, Email, and Contact Number.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  const testimonials = [
    {
      name: "S. Vigneshwaran",
      batch: "B.E. CSE (2018 - 2022)",
      company: "Senior Cloud Engineer @ Microsoft",
      quote: "The hands-on coding training, faculty mentorship, and competitive programming culture at SVCET built the foundation of my career in cloud architecture.",
      avatar: "👨‍💻"
    },
    {
      name: "K. Priyadharshini",
      batch: "B.Tech. IT (2019 - 2023)",
      company: "Data Scientist @ TCS Innovation Labs",
      quote: "SVCET’s CBCS curriculum gave me flexibility to master data analytics and AI algorithms, which directly led to my high-package placement offer.",
      avatar: "👩‍💼"
    },
    {
      name: "R. Aravind",
      batch: "B.E. ECE (2017 - 2021)",
      company: "VLSI Design Engineer @ Qualcomm",
      quote: "The specialized robotics and embedded systems laboratories in the ECE department provided state-of-the-art exposure to industrial chip design tools.",
      avatar: "🧑‍💻"
    }
  ];

  return (
    <section id="alumni" className="alumni-section py-4">
      <div className="container-fluid px-lg-4">
        {/* HEADER */}
        <div className="section-header text-center mb-4">
          <span className="section-tag text-uppercase fw-bold text-primary">Global Alumni Community</span>
          <h2 className="display-6 fw-bold mt-2 text-dark">
            SVCET Alumni Network &amp; Association
          </h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "800px" }}>
            Connecting over 6,500+ proud alumni excelling in Fortune 500 corporations, research institutes, 
            and successful entrepreneurial startups worldwide.
          </p>
        </div>

        {/* ALUMNI STATS */}
        <div className="row g-3 mb-4 text-center">
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-white rounded-4 border shadow-sm">
              <h3 className="fw-bold text-primary mb-1">6,500+</h3>
              <small className="text-muted">Global Alumni</small>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-white rounded-4 border shadow-sm">
              <h3 className="fw-bold text-success mb-1">25+</h3>
              <small className="text-muted">Countries Represented</small>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-white rounded-4 border shadow-sm">
              <h3 className="fw-bold text-info mb-1">45+</h3>
              <small className="text-muted">Alumni-Founded Startups</small>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="p-3 bg-white rounded-4 border shadow-sm">
              <h3 className="fw-bold text-warning mb-1">120+</h3>
              <small className="text-muted">Annual Student Mentorships</small>
            </div>
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="row g-4 mb-4">
          {testimonials.map((t, idx) => (
            <div key={idx} className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="fs-1 bg-light p-2 rounded-circle border">{t.avatar}</span>
                    <div>
                      <h5 className="fw-bold text-dark mb-0">{t.name}</h5>
                      <small className="text-primary fw-semibold d-block">{t.company}</small>
                      <small className="text-muted">{t.batch}</small>
                    </div>
                  </div>
                  <p className="text-secondary small fst-italic" style={{ lineHeight: "1.7" }}>
                    "{t.quote}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ALUMNI REGISTRATION FORM */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-light border-top border-4 border-primary">
          <div className="row align-items-center">
            <div className="col-lg-5">
              <div className="pe-lg-3">
                <span className="badge bg-primary text-white rounded-pill px-3 py-1 mb-2">RECONNECT</span>
                <h3 className="fw-bold text-dark mb-2">Join the SVCET Alumni Network</h3>
                <p className="text-secondary small" style={{ lineHeight: "1.7" }}>
                  Are you an alumnus of Sri Venkateswara College of Engineering and Technology? 
                  Register your current professional details to mentor current students, receive invitation 
                  to Annual Alumni Meets, and network with fellow graduates.
                </p>
                <div className="alert alert-white bg-white border rounded-3 p-3 mt-3">
                  <small className="text-muted d-block mb-1">Alumni Association Office:</small>
                  <strong className="text-dark">alumni@sriventech.ac.in | 044-27664444</strong>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="bg-white p-4 rounded-4 border shadow-xs">
                {submitted ? (
                  <div className="alert alert-success text-center py-4 rounded-3">
                    <div className="fs-1 mb-2">🎓</div>
                    <h5 className="fw-bold text-success">Registration Successful!</h5>
                    <p className="small text-muted mb-0">
                      Thank you for updating your alumni details, <strong>{formData.name}</strong>. 
                      The Alumni Association will reach out with upcoming community announcements.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">{error}</div>}

                    <div className="row g-2 mb-3">
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">Full Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">Batch / Graduation Year</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 2018 - 2022"
                          value={formData.batch}
                          onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">Current Employer / Company</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. TCS / Cognizant / Self-Employed"
                          value={formData.currentCompany}
                          onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">Designation</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Software Engineer"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">Email Address *</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="name@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-secondary mb-1">Mobile / WhatsApp *</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="10-digit number"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold rounded-3">
                      Submit Alumni Registration →
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
