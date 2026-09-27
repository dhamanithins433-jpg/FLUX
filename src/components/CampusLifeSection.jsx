import React, { useState } from "react";

export default function CampusLifeSection() {
  const [selectedFacility, setSelectedFacility] = useState(null);

  const facilities = [
    {
      id: "library",
      title: "Central Digital Library & Knowledge Center",
      badge: "KNOWLEDGE HUB",
      image: "/campus-library.jpg",
      summary: "50,000+ volumes, international IEEE & DELNET journals, digital e-learning zone, and spacious air-conditioned reading halls.",
      details: [
        "Over 50,000 engineering, technology, and management textbooks & reference volumes.",
        "Subscription to premier online journal repositories including IEEE Xplore, DELNET, and ScienceDirect.",
        "Dedicated Digital Library with 60 high-speed internet terminals for NPTEL and Swayam courses.",
        "Barcode automated book circulation, OPAC search, and reprographic facilities."
      ]
    },
    {
      id: "classrooms",
      title: "Smart ICT-Enabled Classrooms",
      badge: "MODERN PEDAGOGY",
      image: "/campus-smart-classroom.jpg",
      summary: "Amphitheatre-style tiered lecture halls equipped with interactive smart displays, multimedia audio-visual aids, and high-speed Wi-Fi.",
      details: [
        "Interactive smart boards and high-resolution multimedia laser projection systems in every department.",
        "Ergonomically designed tiered seating ensuring optimal sightlines and acoustic clarity.",
        "Lecture capture system enabling recording and archiving of lectures for student revision.",
        "Seamless campus-wide Wi-Fi connectivity supporting digital laptop learning."
      ]
    },
    {
      id: "labs",
      title: "High-Tech Engineering Laboratories",
      badge: "PRACTICAL MASTERY",
      image: "/campus-computer-lab.jpg",
      summary: "Industry-standard computing labs, cloud workstations, AI & ML compute clusters, and specialized IoT hardware centers.",
      details: [
        "1,200+ high-end networked workstations equipped with latest development toolchains (Python, Java, CUDA, MATLAB, SolidWorks).",
        "Dedicated AI & Machine Learning Research Center with GPU hardware acceleration.",
        "Cisco Networking Academy lab and Cybersecurity vulnerability testing environment.",
        "Licensed software suites under Microsoft Campus Agreement and open-source Linux servers."
      ]
    },
    {
      id: "robotics",
      title: "Robotics & Innovation Maker Space",
      badge: "RESEARCH & PATENTS",
      image: "/campus-robotics-lab.jpg",
      summary: "Advanced fabrication laboratory with robotic arms, sensor testbeds, 3D printers, and embedded microcontroller stations.",
      details: [
        "Industrial 6-axis robotic arms for kinematics, pick-and-place, and computer vision experimentation.",
        "Oscilloscopes, spectrum analyzers, DSP kits, FPGA boards, and PCB prototyping machines.",
        "Supported by government grants from DST-FIST, AICTE, and MSME for student patent prototypes.",
        "Active incubation center guiding student startups from ideation to commercialization."
      ]
    },
    {
      id: "sports",
      title: "Sports, Athletics & Gymnasium",
      badge: "PHYSICAL WELLNESS",
      image: "/campus-sports.jpg",
      summary: "Expansive green athletic stadium, cricket ground, football turf, volleyball, basketball, and modern fitness gymnasium.",
      details: [
        "Standard 400m athletic track, turf cricket pitch, and full-size football field with floodlighting.",
        "Dedicated courts for Basketball, Volleyball, Throwball, and Badminton.",
        "Indoor sports complex for Table Tennis, Chess, and Carrom tournaments.",
        "Well-equipped fitness gymnasium with professional physical education directors."
      ]
    },
    {
      id: "hostel",
      title: "Student Residential Hostels",
      badge: "HOME AWAY FROM HOME",
      image: "/college-campus2.png",
      summary: "Separate secure residential hostels for boys and girls with RO purified water, hygienic dining, recreational halls, and 24/7 security.",
      details: [
        "Comfortable shared rooms with dedicated study tables, wardrobes, and ventilation.",
        "Spacious hygienic dining hall serving nutritious vegetarian and non-vegetarian cuisine.",
        "24/7 CCTV surveillance, biometric attendance, resident wardens, and medical support on call.",
        "Uninterrupted power backup with diesel generators and dedicated Wi-Fi access."
      ]
    }
  ];

  return (
    <section id="campus" className="campus-section py-4">
      <div className="container-fluid px-lg-4">
        {/* HEADER */}
        <div className="section-header text-center mb-4">
          <span className="section-tag text-uppercase fw-bold text-primary">Campus Infrastructure</span>
          <h2 className="display-6 fw-bold mt-2 text-dark">
            World-Class Campus &amp; Student Facilities
          </h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "800px" }}>
            Experience an inspiring 25+ acre serene green campus designed to nurture intellect, 
            creativity, wellness, and cutting-edge innovation.
          </p>
        </div>

        {/* FACILITIES GRID */}
        <div className="row g-4">
          {facilities.map((fac) => (
            <div key={fac.id} className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="position-relative" style={{ height: "220px" }}>
                  <img
                    src={fac.image}
                    alt={fac.title}
                    className="w-100 h-100 object-fit-cover"
                  />
                  <span className="position-absolute top-0 start-0 m-3 badge bg-primary text-white shadow-sm px-3 py-2 rounded-pill">
                    {fac.badge}
                  </span>
                </div>
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold text-dark mb-2">{fac.title}</h5>
                    <p className="text-secondary small mb-3" style={{ lineHeight: "1.6" }}>
                      {fac.summary}
                    </p>
                  </div>
                  <div>
                    <ul className="list-unstyled mb-0">
                      {fac.details.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="small text-muted d-flex align-items-start gap-2 mb-1">
                          <span className="text-success fw-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ECO-FRIENDLY GREEN CAMPUS INITIATIVES & TRANSPORT */}
        <div className="row g-4 mt-2">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-success-subtle border-start border-4 border-success">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="fs-1 bg-white p-2 rounded-circle shadow-sm">🌱</div>
                <div>
                  <h4 className="fw-bold text-success mb-1">Green &amp; Sustainable Campus</h4>
                  <small className="text-muted">Eco-Friendly Initiatives for a Cleaner Future</small>
                </div>
              </div>
              <ul className="text-secondary small mb-0" style={{ lineHeight: "1.8" }}>
                <li><strong>Rooftop Solar Energy Plant:</strong> Clean solar energy generation meeting campus electricity requirements.</li>
                <li><strong>Rainwater Harvesting System:</strong> Extensive interconnected collection ponds replenishing ground water table.</li>
                <li><strong>Sewage Treatment Plant (STP):</strong> Recycled water reused for lush landscape gardening.</li>
                <li><strong>Zero Plastic Policy:</strong> Active campus environmental cleanliness protocols run by NSS students.</li>
              </ul>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-primary-subtle border-start border-4 border-primary">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="fs-1 bg-white p-2 rounded-circle shadow-sm">🚌</div>
                <div>
                  <h4 className="fw-bold text-primary mb-1">Extensive College Transport Fleet</h4>
                  <small className="text-muted">Safe, Punctual Commute Across Districts</small>
                </div>
              </div>
              <ul className="text-secondary small mb-0" style={{ lineHeight: "1.8" }}>
                <li><strong>30+ College Buses:</strong> Dedicated daily transport covering all major routes across Chennai, Thiruvallur, Arakkonam, Tirutani, and Kanchipuram.</li>
                <li><strong>GPS &amp; Speed Governed:</strong> Equipped with real-time tracking and verified experienced drivers.</li>
                <li><strong>Affordable Bus Pass Scheme:</strong> Subsidized transport passes available for all students and staff.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
